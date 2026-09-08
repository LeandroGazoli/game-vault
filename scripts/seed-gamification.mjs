#!/usr/bin/env node
/**
 * Grava o plano de gamificação (scripts/gamification-plan.mjs) no Firestore:
 *   system/gamification/achievements/{id}
 *   system/gamification/missions/{id}
 *   system/gamification            (dailyRotationCount, seasonName, seasonEndsAt)
 *
 * Uso:
 *   node scripts/seed-gamification.mjs                      # DRY-RUN: só mostra o que faria
 *   node scripts/seed-gamification.mjs --apply              # grava tudo
 *   node scripts/seed-gamification.mjs --apply --only=daily # só o pool diário
 *   node scripts/seed-gamification.mjs --apply --season-days=120
 *   node scripts/seed-gamification.mjs --apply --prune      # desativa defs fora do plano
 *
 * Flags:
 *   --apply             executa as escritas (sem ela, nada é gravado)
 *   --only=<lista>      achievements | season | daily | config  (separados por vírgula)
 *   --season-days=N     janela da temporada a partir de hoje (default 90)
 *   --prune             marca isActive:false nas defs que existem no Firestore mas não no plano.
 *                       NÃO deleta: o id fica registrado em users/{uid}.claimedRewards e apagar
 *                       o doc faria a recompensa ser paga de novo se o id voltasse.
 *
 * Autenticação — o script tenta, nesta ordem:
 *   1. FIREBASE_SERVICE_ACCOUNT_KEY  (Admin SDK; ignora as Security Rules)
 *      Firebase Console -> Configurações do projeto -> Contas de serviço -> Gerar nova chave privada.
 *      Cole o JSON inteiro (uma linha) ou em base64 no .env.local. É SEGREDO: nunca commitar.
 *   2. GV_ADMIN_EMAIL + GV_ADMIN_PASSWORD  (SDK cliente logado como admin verificado)
 *      Precisa ser um e-mail da allowlist de isVerifiedAdmin() em firestore.rules.
 *
 * Os ids são determinísticos (`ach-`/`s1-`/`daily-` + metric + alvo), então re-rodar
 * ATUALIZA em vez de duplicar.
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import {
  ACHIEVEMENTS,
  SEASON_MISSIONS,
  DAILY_MISSIONS,
  SEASON_SLUG,
  SEASON_NAME,
  DAILY_ROTATION_COUNT,
} from "./gamification-plan.mjs";

// ==========================================
// .env local (o Next carrega sozinho; um script node, não)
// ==========================================

function loadEnvFiles() {
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path)) continue;
    for (const rawLine of readFileSync(path, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq < 1) continue;
      const key = line.slice(0, eq).trim();
      let value = line.slice(eq + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) process.env[key] = value;
    }
  }
}

loadEnvFiles();

// ==========================================
// CLI
// ==========================================

const argv = process.argv.slice(2);
const hasFlag = (name) => argv.includes(`--${name}`);
const flagValue = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(name.length + 3) : fallback;
};

const APPLY = hasFlag("apply") || hasFlag("write");
const PRUNE = hasFlag("prune");
const SEASON_DAYS = Math.max(1, Number(flagValue("season-days", 90)) || 90);
const ONLY = String(flagValue("only", "achievements,season,daily,config"))
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const wants = (part) => ONLY.includes(part);

const VALID_METRICS = new Set(["completed", "hours", "library", "rated", "playing", "level"]);
const VALID_ICONS = new Set([
  "Trophy", "Award", "Star", "Flame", "Clock", "Crown", "Sparkles", "Gamepad2", "Bookmark",
  "Zap", "Shield", "Target", "Rocket", "Medal", "Heart", "Gem", "Swords", "Skull", "Ghost",
  "Bomb", "Compass", "Map", "Dices", "Joystick", "Puzzle", "CheckCircle2",
]);

// ==========================================
// Monta as definições com id determinístico
// ==========================================

const now = new Date();
const nowIso = now.toISOString();

const seasonStartsAt = new Date(now);
seasonStartsAt.setHours(0, 0, 0, 0);
const seasonEndsAt = new Date(seasonStartsAt);
seasonEndsAt.setDate(seasonEndsAt.getDate() + SEASON_DAYS);
seasonEndsAt.setHours(23, 59, 59, 999);

function buildAchievements() {
  return ACHIEVEMENTS.map((a) => ({
    id: `ach-${a.metric}-${a.targetValue}`,
    data: {
      title: a.title,
      description: a.description,
      iconName: a.iconName,
      metric: a.metric,
      targetValue: a.targetValue,
      globalRarity: a.globalRarity,
      rewardXp: a.rewardXp,
      isSecret: a.isSecret === true,
      isActive: true,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "seed-gamification",
    },
  }));
}

function buildSeasonMissions() {
  return SEASON_MISSIONS.map((m) => ({
    id: `${SEASON_SLUG}-${m.metric}-${m.targetValue}`,
    data: {
      title: m.title,
      description: m.description,
      iconName: m.iconName,
      type: "season",
      metric: m.metric,
      targetValue: m.targetValue,
      rewardXp: m.rewardXp,
      isActive: true,
      startsAt: seasonStartsAt.toISOString(),
      endsAt: seasonEndsAt.toISOString(),
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "seed-gamification",
    },
  }));
}

function buildDailyMissions() {
  return DAILY_MISSIONS.map((m) => ({
    id: `daily-${m.metric}-${m.targetValue}`,
    data: {
      title: m.title,
      description: m.description,
      iconName: m.iconName,
      type: "daily",
      metric: m.metric,
      targetValue: m.targetValue,
      rewardXp: m.rewardXp,
      isActive: true,
      startsAt: null,
      endsAt: null,
      createdAt: nowIso,
      updatedAt: nowIso,
      createdBy: "seed-gamification",
    },
  }));
}

// ==========================================
// Validação — barra o seed antes de sujar o Firestore
// ==========================================

function validate(achievements, missions) {
  const problems = [];
  const seen = new Map();

  for (const { id, data } of [...achievements, ...missions]) {
    if (seen.has(id)) problems.push(`id duplicado: ${id} ("${data.title}" x "${seen.get(id)}")`);
    else seen.set(id, data.title);

    if (!VALID_METRICS.has(data.metric)) problems.push(`${id}: métrica inválida "${data.metric}"`);
    if (!VALID_ICONS.has(data.iconName)) problems.push(`${id}: ícone inexistente "${data.iconName}"`);
    if (!Number.isFinite(data.targetValue) || data.targetValue < 1) {
      problems.push(`${id}: targetValue inválido (${data.targetValue})`);
    }
    if (!Number.isFinite(data.rewardXp) || data.rewardXp < 0) {
      problems.push(`${id}: rewardXp inválido (${data.rewardXp})`);
    }
    if (!data.title?.trim()) problems.push(`${id}: título vazio`);
    if (!data.description?.trim()) problems.push(`${id}: descrição vazia`);
  }
  return problems;
}

// ==========================================
// Backends de escrita: Admin SDK ou SDK cliente autenticado
// ==========================================

async function connectAdminSdk() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw || !raw.trim()) return null;

  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  const { getFirestore } = await import("firebase-admin/firestore");

  let jsonStr = raw.trim();
  if (!jsonStr.startsWith("{")) jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
  const sa = JSON.parse(jsonStr);
  if (typeof sa.private_key === "string") sa.private_key = sa.private_key.replace(/\\n/g, "\n");

  const app = getApps().length ? getApps()[0] : initializeApp({ credential: cert(sa), projectId: sa.project_id });
  const db = getFirestore(app);

  return {
    label: `Admin SDK (service account ${sa.client_email})`,
    async listIds(collectionPath) {
      const snap = await db.collection(collectionPath).get();
      return snap.docs.map((d) => d.id);
    },
    async commit(writes) {
      for (let i = 0; i < writes.length; i += 400) {
        const batch = db.batch();
        for (const w of writes.slice(i, i + 400)) {
          batch.set(db.doc(w.path), w.data, { merge: true });
        }
        await batch.commit();
      }
    },
  };
}

async function connectClientSdk() {
  const email = process.env.GV_ADMIN_EMAIL;
  const password = process.env.GV_ADMIN_PASSWORD;
  if (!email || !password) return null;

  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getAuth, signInWithEmailAndPassword } = await import("firebase/auth");
  const fs = await import("firebase/firestore");

  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCBeWB14tmyQZZddMia62SpzQ5iTRio8TI",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gamevault-profile.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gamevault-profile",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gamevault-profile.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "310412819391",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:310412819391:web:b61a5616735ef4c3fdbf0a",
  };

  const app = getApps().length ? getApp() : initializeApp(config);
  const cred = await signInWithEmailAndPassword(getAuth(app), email, password);
  if (!cred.user.emailVerified) {
    throw new Error(
      `A conta ${email} não tem e-mail verificado — isVerifiedAdmin() em firestore.rules vai recusar a escrita.`
    );
  }
  const db = fs.getFirestore(app);

  return {
    label: `SDK cliente autenticado como ${email}`,
    async listIds(collectionPath) {
      const snap = await fs.getDocs(fs.collection(db, collectionPath));
      return snap.docs.map((d) => d.id);
    },
    async commit(writes) {
      for (let i = 0; i < writes.length; i += 400) {
        const batch = fs.writeBatch(db);
        for (const w of writes.slice(i, i + 400)) {
          const parts = w.path.split("/");
          batch.set(fs.doc(db, ...parts), w.data, { merge: true });
        }
        await batch.commit();
      }
    },
  };
}

async function connect() {
  const backend = (await connectAdminSdk()) || (await connectClientSdk());
  if (backend) return backend;
  console.error(
    [
      "Nenhuma credencial de escrita encontrada. Configure UMA das duas no .env.local:",
      "",
      "  1) FIREBASE_SERVICE_ACCOUNT_KEY=<JSON da service account, ou o mesmo JSON em base64>",
      "     Firebase Console -> Configurações do projeto -> Contas de serviço -> Gerar nova chave privada.",
      "     É a opção recomendada: ignora as Security Rules e não depende de senha.",
      "",
      "  2) GV_ADMIN_EMAIL=<e-mail da allowlist em firestore.rules>",
      "     GV_ADMIN_PASSWORD=<senha dessa conta>",
      "     Grava passando pelas rules, como admin verificado.",
      "",
      "O config web (NEXT_PUBLIC_FIREBASE_*) é público e NÃO autoriza escrita em system/**.",
    ].join("\n")
  );
  process.exit(1);
}

// ==========================================
// Execução
// ==========================================

const ACH_PATH = "system/gamification/achievements";
const MIS_PATH = "system/gamification/missions";

async function main() {
  const achievements = wants("achievements") ? buildAchievements() : [];
  const seasonMissions = wants("season") ? buildSeasonMissions() : [];
  const dailyMissions = wants("daily") ? buildDailyMissions() : [];
  const missions = [...seasonMissions, ...dailyMissions];

  const problems = validate(achievements, missions);
  if (problems.length > 0) {
    console.error("Plano inválido — nada foi gravado:\n" + problems.map((p) => `  - ${p}`).join("\n"));
    process.exit(1);
  }

  const totalXp = [...achievements, ...missions].reduce((sum, d) => sum + d.data.rewardXp, 0);

  console.log("Plano de gamificação");
  console.log(`  conquistas ......... ${achievements.length}`);
  console.log(`  missões temporada .. ${seasonMissions.length}  (${SEASON_NAME})`);
  console.log(`  missões diárias .... ${dailyMissions.length}  (${DAILY_ROTATION_COUNT} sorteadas por dia)`);
  console.log(`  XP bônus total ..... ${totalXp.toLocaleString("pt-BR")}`);
  if (seasonMissions.length > 0) {
    console.log(
      `  janela temporada ... ${seasonStartsAt.toISOString().slice(0, 10)} -> ${seasonEndsAt
        .toISOString()
        .slice(0, 10)} (${SEASON_DAYS} dias)`
    );
  }
  console.log("");

  const writes = [
    ...achievements.map((d) => ({ path: `${ACH_PATH}/${d.id}`, data: d.data })),
    ...missions.map((d) => ({ path: `${MIS_PATH}/${d.id}`, data: d.data })),
  ];

  if (wants("config")) {
    writes.push({
      path: "system/gamification",
      data: {
        dailyRotationCount: DAILY_ROTATION_COUNT,
        seasonName: SEASON_NAME,
        seasonEndsAt: seasonMissions.length > 0 ? seasonEndsAt.toISOString() : null,
        updatedAt: nowIso,
        updatedBy: "seed-gamification",
      },
    });
  }

  if (!APPLY) {
    console.log(`DRY-RUN — ${writes.length} documentos seriam gravados. Nada foi alterado.`);
    for (const w of writes) console.log(`  ${w.path}`);
    console.log("\nPara gravar de verdade: node scripts/seed-gamification.mjs --apply");
    return;
  }

  const backend = await connect();
  console.log(`Conectado: ${backend.label}\n`);

  if (PRUNE) {
    const planned = new Set(writes.map((w) => w.path));
    for (const [path, keep] of [
      [ACH_PATH, achievements.length > 0],
      [MIS_PATH, missions.length > 0],
    ]) {
      if (!keep) continue;
      const existing = await backend.listIds(path);
      const orphans = existing.filter((id) => !planned.has(`${path}/${id}`));
      for (const id of orphans) {
        console.log(`  prune -> isActive:false em ${path}/${id}`);
        writes.push({
          path: `${path}/${id}`,
          data: { isActive: false, updatedAt: nowIso, updatedBy: "seed-gamification (prune)" },
        });
      }
      if (orphans.length === 0) console.log(`  prune -> nada fora do plano em ${path}`);
    }
    console.log("");
  }

  await backend.commit(writes);
  console.log(`OK — ${writes.length} documentos gravados.`);
  console.log("Confira em Admin -> Gamificação. O XP é concedido no próximo sync de cada usuário.");
}

main().catch((err) => {
  console.error("Falha no seed:", err?.message || err);
  process.exit(1);
});
