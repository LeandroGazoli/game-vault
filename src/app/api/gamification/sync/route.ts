import { NextRequest, NextResponse } from "next/server";
import { getAdminApp, getAdminDb, verifyIdToken } from "@/lib/firebaseAdmin";
import {
  computeLibraryStats,
  evaluateDef,
  getActiveSeasonMissions,
  getDailyMissions,
  getDateKey,
} from "@/lib/gamificationCore";
import { withSharedCache } from "@/lib/edgeCache";
import {
  calculateGamerLevel,
  DEFAULT_GAMIFICATION_CONFIG,
  setRankTiers,
  getEffectiveAccess,
  ADMIN_EMAILS,
  type UserGame,
  type UserPlan,
  type LibraryStats,
  type GamificationAchievementDef,
  type GamificationMissionDef,
  type GamificationConfig,
  type UserProfile,
} from "@/lib/types";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Cache de 1h para as definições de gamificação do sistema (achievements, missions, config).
 * Evita 3 leituras no Firestore a cada sync de qualquer usuário.
 */
async function getSystemGamificationDefs() {
  return withSharedCache<{
    achievements: GamificationAchievementDef[];
    missions: GamificationMissionDef[];
    config: GamificationConfig;
  }>("gamification", "system-defs", 3600, async () => {
    const db = getAdminDb();
    const [achSnap, misSnap, cfgSnap] = await Promise.all([
      db.collection("system").doc("gamification").collection("achievements").get(),
      db.collection("system").doc("gamification").collection("missions").get(),
      db.collection("system").doc("gamification").get(),
    ]);

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

    return { achievements, missions, config };
  });
}

/**
 * GET /api/gamification/sync — health check (sem auth, sem tocar no Firestore).
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
 * Concede XP de conquistas e missões dinâmicas de forma idempotente.
 * Otimizado: reutiliza stats agregadas (cliente ou doc do usuário) e cache de sistema,
 * eliminando a varredura da subcoleção users/{uid}/games na esmagadora maioria dos casos.
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

    // Lê payload opcional com stats pré-calculadas e timestamp da biblioteca
    let body: { stats?: LibraryStats; libraryUpdatedAt?: string } = {};
    try {
      body = await request.json();
    } catch {}

    const db = getAdminDb();
    const userRef = db.collection("users").doc(uid);

    // 2. Lê perfil do usuário e definições globais em paralelo (definições vêm do Edge Cache)
    const [userSnap, sysDefs] = await Promise.all([
      userRef.get(),
      getSystemGamificationDefs(),
    ]);

    if (!userSnap.exists) {
      return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
    }

    const userData = userSnap.data() || {};
    const isAdmin = Boolean(
      userData.isAdmin ||
        (userData.email && ADMIN_EMAILS.includes(String(userData.email).toLowerCase()))
    );
    const effectivePlan = getEffectiveAccess({
      plan: userData.plan,
      isPremium: userData.isPremium,
      hideAds: userData.hideAds,
      premiumUntil: userData.premiumUntil,
      planSource: userData.planSource,
      planLabel: userData.planLabel,
      isAdmin,
    }).plan;
    const plan: UserPlan = effectivePlan;
    const existingBonusXp = Math.max(0, Math.floor(Number(userData.bonusXp) || 0));
    const claimed = new Set<string>(
      Array.isArray(userData.claimedRewards) ? userData.claimedRewards : []
    );

    const now = new Date();
    const todayKey = getDateKey(now);

    // Verificação de curto-circuito: se biblioteca não mudou e missões diárias já rodaram hoje
    const libUpdated = body.libraryUpdatedAt || userData.libraryUpdatedAt;
    const lastSync = userData.gamificationSyncedAt;
    const lastMissionKey = userData.lastMissionDateKey;

    if (
      libUpdated &&
      lastSync &&
      libUpdated <= lastSync &&
      lastMissionKey === todayKey &&
      userData.gamerXp !== undefined
    ) {
      return NextResponse.json({
        success: true,
        skipped: true,
        gamerXp: userData.gamerXp,
        gamerLevel: userData.gamerLevel ?? 1,
        bonusXp: existingBonusXp,
        newlyUnlocked: [],
      });
    }

    // 3. Resolve as estatísticas sem varrer subcoleção quando possível
    let stats: LibraryStats;
    if (body.stats && typeof body.stats.totalGames === "number") {
      stats = body.stats;
    } else if (userData.libraryStats && typeof userData.libraryStats.totalGames === "number") {
      stats = userData.libraryStats as LibraryStats;
    } else {
      // Fallback único para usuários legados sem sumário
      const gamesSnap = await userRef.collection("games").get();
      const games: UserGame[] = gamesSnap.docs.map((d) => d.data() as UserGame);
      stats = computeLibraryStats(games);
    }

    // Nível ANTES de novas concessões (usado para avaliar métrica "level")
    const levelBefore = calculateGamerLevel(stats, undefined, plan, existingBonusXp).level;

    // 4. Definições ativas
    const { achievements, missions, config } = sysDefs;
    setRankTiers(config.rankTiers);

    const seasonMissions = getActiveSeasonMissions(missions, now);
    const dailyMissions = getDailyMissions(
      missions,
      config.dailyRotationCount ?? 3,
      todayKey
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
        libraryStats: stats,
        gamificationSyncedAt: now.toISOString(),
        lastMissionDateKey: todayKey,
        updatedAt: now.toISOString(),
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
