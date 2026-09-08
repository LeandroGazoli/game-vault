import { NextRequest, NextResponse } from "next/server";
import { getAdminApp, getAdminDb, verifyIdToken } from "@/lib/firebaseAdmin";
import {
  computeLibraryStats,
  evaluateDef,
  getActiveSeasonMissions,
  getDailyMissions,
  getDateKey,
} from "@/lib/gamificationCore";
import {
  calculateGamerLevel,
  DEFAULT_GAMIFICATION_CONFIG,
  setRankTiers,
  type UserGame,
  type UserPlan,
  type GamificationAchievementDef,
  type GamificationMissionDef,
  type GamificationConfig,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/gamification/sync — health check (sem auth, sem tocar no Firestore).
 * Serve para verificar, ANTES de publicar as Security Rules, se a service account
 * (FIREBASE_SERVICE_ACCOUNT_KEY) está configurada e o Admin SDK inicializa.
 * { ok: true } => pronto para publicar as rules. { ok: false } => corrigir o env antes.
 */
export async function GET() {
  try {
    getAdminApp();
    return NextResponse.json({ ok: true, adminSdk: "initialized" });
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, error: error?.message || "Falha ao inicializar o Admin SDK." },
      { status: 503 }
    );
  }
}

/**
 * POST /api/gamification/sync
 *
 * Fonte de verdade do XP/nível. Autentica o usuário, RECALCULA as estatísticas a partir da
 * subcoleção users/{uid}/games no servidor (à prova de forja), concede XP das conquistas/
 * missões efetivamente desbloqueadas (idempotente via claimedRewards) e persiste
 * gamerXp / gamerLevel / bonusXp / claimedRewards via Admin SDK (ignora as Security Rules).
 *
 * O cliente nunca escreve esses campos — as regras os bloqueiam.
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Autenticação
    const authHeader =
      request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autenticação ausente." }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1]?.trim();
    if (!idToken) {
      return NextResponse.json({ error: "Token inválido." }, { status: 401 });
    }

    let uid: string;
    try {
      ({ uid } = await verifyIdToken(idToken));
    } catch {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const db = getAdminDb();

    // 2. Lê perfil + jogos + definições de gamificação
    const userRef = db.collection("users").doc(uid);
    const [userSnap, gamesSnap, achSnap, misSnap, cfgSnap] = await Promise.all([
      userRef.get(),
      userRef.collection("games").get(),
      db.collection("system").doc("gamification").collection("achievements").get(),
      db.collection("system").doc("gamification").collection("missions").get(),
      db.collection("system").doc("gamification").get(),
    ]);

    if (!userSnap.exists) {
      return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
    }

    const userData = userSnap.data() || {};
    const plan: UserPlan = (userData.plan as UserPlan) || "free";
    const existingBonusXp = Math.max(0, Math.floor(Number(userData.bonusXp) || 0));
    const claimed = new Set<string>(
      Array.isArray(userData.claimedRewards) ? userData.claimedRewards : []
    );

    // 3. Recalcula as estatísticas a partir dos jogos reais
    const games: UserGame[] = gamesSnap.docs.map((d) => d.data() as UserGame);
    const stats = computeLibraryStats(games);

    // Nível ANTES de novas concessões (usado para avaliar métrica "level")
    const levelBefore = calculateGamerLevel(stats, undefined, plan, existingBonusXp).level;

    // 4. Coleta definições ativas
    const achievements: GamificationAchievementDef[] = achSnap.docs
      .map((d) => ({ ...(d.data() as GamificationAchievementDef), id: d.id }))
      .filter((a) => a.isActive !== false);
    const missions: GamificationMissionDef[] = misSnap.docs
      .map((d) => ({ ...(d.data() as GamificationMissionDef), id: d.id }))
      .filter((m) => m.isActive !== false);

    const config: GamificationConfig = {
      ...DEFAULT_GAMIFICATION_CONFIG,
      ...((cfgSnap.data() as GamificationConfig) || {}),
    };
    // Escada de títulos cadastrada pelo admin (config global, não por usuário).
    setRankTiers(config.rankTiers);

    const now = new Date();
    const seasonMissions = getActiveSeasonMissions(missions, now);
    const dailyMissions = getDailyMissions(
      missions,
      config.dailyRotationCount ?? 3,
      getDateKey(now)
    );

    // 5. Concede XP das definições desbloqueadas ainda não pagas (idempotente)
    const ctx = { stats, level: levelBefore };
    const newlyUnlocked: { id: string; title: string; rewardXp: number }[] = [];
    let bonusXp = existingBonusXp;

    const considerReward = (
      id: string,
      title: string,
      metric: GamificationAchievementDef["metric"],
      targetValue: number,
      rewardXp: number
    ) => {
      if (!rewardXp || rewardXp <= 0) return;
      if (claimed.has(id)) return;
      const ev = evaluateDef({ metric, targetValue }, ctx);
      if (ev.isUnlocked) {
        claimed.add(id);
        bonusXp += Math.floor(rewardXp);
        newlyUnlocked.push({ id, title, rewardXp: Math.floor(rewardXp) });
      }
    };

    for (const a of achievements) {
      considerReward(a.id, a.title, a.metric, a.targetValue, a.rewardXp);
    }
    for (const m of [...seasonMissions, ...dailyMissions]) {
      considerReward(m.id, m.title, m.metric, m.targetValue, m.rewardXp);
    }

    // 6. Recalcula nível/XP finais e persiste via Admin SDK
    const finalInfo = calculateGamerLevel(stats, undefined, plan, bonusXp);

    await userRef.set(
      {
        gamerXp: finalInfo.xp,
        gamerLevel: finalInfo.level,
        bonusXp,
        claimedRewards: Array.from(claimed),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      gamerXp: finalInfo.xp,
      gamerLevel: finalInfo.level,
      bonusXp,
      newlyUnlocked,
    });
  } catch (error: any) {
    console.error("[api/gamification/sync] Erro:", error?.message || error);
    // Erro de configuração da service account vira 503 explícito
    if (typeof error?.message === "string" && error.message.includes("FIREBASE_SERVICE_ACCOUNT_KEY")) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Erro ao sincronizar gamificação." }, { status: 500 });
  }
}
