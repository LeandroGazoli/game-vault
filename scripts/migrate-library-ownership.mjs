#!/usr/bin/env node
/**
 * Script de Migração da Biblioteca do Firebase (Zero Data Loss)
 * 
 * Atualiza os jogos de todos os usuários em `users/{uid}/games/{gameId}` para:
 * 1. Garantir que a Biblioteca seja a fonte central de propriedade (`owned: true`).
 * 2. Normalizar o `status` para os sub-estados válidos (playing | backlog | paused | completed | dropped | library).
 * 3. Preservar 100% dos dados pré-existentes, notas, reviews, histórico de datas e DLCs.
 * 4. Realizar backup integral automático em formato JSON antes de qualquer alteração física.
 * 
 * Suporta:
 *   - Firebase Admin SDK (com FIREBASE_SERVICE_ACCOUNT_KEY)
 *   - Firebase Client SDK (com as credenciais do projeto para dry-run e leitura)
 * 
 * Uso:
 *   node scripts/migrate-library-ownership.mjs            # DRY-RUN (simulação segura, sem escritas)
 *   node scripts/migrate-library-ownership.mjs --apply    # EXECUTA a migração real com backup prévio
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, join } from "node:path";

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const p = resolve(process.cwd(), file);
    if (!existsSync(p)) continue;
    for (const line of readFileSync(p, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx > 0) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

loadEnv();

const isApply = process.argv.includes("--apply");
const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCBeWB14tmyQZZddMia62SpzQ5iTRio8TI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "gamevault-profile.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gamevault-profile",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "gamevault-profile.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "310412819391",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:310412819391:web:b61a5616735ef4c3fdbf0a",
};

async function initDb() {
  if (rawServiceAccount) {
    try {
      let parsedStr = rawServiceAccount.trim();
      if (!parsedStr.startsWith("{")) {
        parsedStr = Buffer.from(parsedStr, "base64").toString("utf8");
      }
      const sa = JSON.parse(parsedStr);
      if (sa.private_key) {
        sa.private_key = sa.private_key.replace(/\\n/g, "\n");
      }
      const { initializeApp, cert, getApps } = await import("firebase-admin/app");
      const { getFirestore } = await import("firebase-admin/firestore");
      if (!getApps().length) {
        initializeApp({ credential: cert(sa), projectId: sa.project_id });
      }
      return { mode: "admin", db: getFirestore() };
    } catch (e) {
      console.warn("⚠️ Não foi possível usar service account, tentando client SDK:", e.message);
    }
  }

  // Fallback: Client SDK
  const { initializeApp, getApps, getApp } = await import("firebase/app");
  const { getFirestore } = await import("firebase/firestore");
  const app = getApps().length > 0 ? getApp() : initializeApp(firebaseClientConfig);
  const db = getFirestore(app);
  return { mode: "client", db };
}

async function runMigration() {
  console.log("=================================================================");
  console.log(`🚀 INICIANDO MIGRAÇÃO: BIBLIOTECA COMO FONTE CENTRAL DE PROPRIEDADE`);
  console.log(`MODO: ${isApply ? "⚠️ EXECUÇÃO REAL (--apply)" : "🔍 SIMULAÇÃO SEGURA (DRY-RUN)"}`);
  console.log("=================================================================\n");

  const { mode, db } = await initDb();
  console.log(`📡 Conectado ao Firestore via modo: [${mode.toUpperCase()}]`);

  let usersSnapDocs = [];
  let fetchUserGames;
  let batchWriter;

  if (mode === "admin") {
    const usersSnap = await db.collection("users").get();
    usersSnapDocs = usersSnap.docs.map((d) => ({ id: d.id, data: d.data() }));
    fetchUserGames = async (uid) => {
      const snap = await db.collection("users").doc(uid).collection("games").get();
      return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
    };
  } else {
    const { collection, getDocs, doc } = await import("firebase/firestore");
    const usersSnap = await getDocs(collection(db, "users"));
    usersSnapDocs = usersSnap.docs.map((d) => ({ id: d.id, data: d.data() }));
    fetchUserGames = async (uid) => {
      const snap = await getDocs(collection(db, "users", uid, "games"));
      return snap.docs.map((d) => ({ id: d.id, data: d.data() }));
    };
  }

  console.log(`📋 Total de usuários no Firestore: ${usersSnapDocs.length}`);

  const backupData = {
    timestamp: new Date().toISOString(),
    totalUsers: usersSnapDocs.length,
    users: {},
  };

  let totalGamesScanned = 0;
  let totalGamesNeedingUpdate = 0;
  let totalUsersWithGames = 0;
  const statusDistribution = {
    completed: 0,
    playing: 0,
    paused: 0,
    backlog: 0,
    dropped: 0,
    library: 0,
    inconsistent: 0,
  };

  const usersToMigrate = [];

  for (const user of usersSnapDocs) {
    const uid = user.id;
    const games = await fetchUserGames(uid);

    if (games.length === 0) continue;

    totalUsersWithGames++;
    const userBackup = {
      userData: user.data,
      games: {},
    };

    const userUpdates = [];

    for (const game of games) {
      totalGamesScanned++;
      const gameData = game.data;
      userBackup.games[game.id] = gameData;

      const currentOwned = gameData.owned;
      const currentStatus = gameData.status;

      let normalizedStatus = currentStatus;
      if (!["completed", "playing", "paused", "backlog", "dropped", "library"].includes(currentStatus)) {
        normalizedStatus = "library";
        statusDistribution.inconsistent++;
      } else {
        statusDistribution[currentStatus] = (statusDistribution[currentStatus] || 0) + 1;
      }

      const needsOwned = currentOwned !== true;
      const needsStatusFix = currentStatus !== normalizedStatus;

      if (needsOwned || needsStatusFix) {
        totalGamesNeedingUpdate++;
        userUpdates.push({
          docId: game.id,
          patch: {
            owned: true,
            status: normalizedStatus,
            migratedAt: new Date().toISOString(),
          },
        });
      }
    }

    backupData.users[uid] = userBackup;
    if (userUpdates.length > 0) {
      usersToMigrate.push({ uid, updates: userUpdates });
    }
  }

  console.log("\n📊 RELATÓRIO PRÉ-MIGRAÇÃO (AUDITORIA ANTES):");
  console.log(`- Usuários com jogos: ${totalUsersWithGames}`);
  console.log(`- Total de jogos escaneados: ${totalGamesScanned}`);
  console.log(`- Jogos necessitando atualização (owned: true / status): ${totalGamesNeedingUpdate}`);
  console.log("- Distribuição atual de status:", JSON.stringify(statusDistribution, null, 2));

  // Salva Backup
  const backupDir = resolve(process.cwd(), "backups");
  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true });
  }
  const backupFileName = `library-backup-${Date.now()}.json`;
  const backupPath = join(backupDir, backupFileName);
  writeFileSync(backupPath, JSON.stringify(backupData, null, 2), "utf8");
  console.log(`\n💾 BACKUP DE SEGURANÇA CRIADO EM: ${backupPath}`);

  if (!isApply) {
    console.log("\n✨ DRY-RUN CONCLUÍDO COM SUCESSO!");
    console.log("Nenhum dado foi alterado no banco.");
    console.log("Para aplicar as alterações com escrita real:");
    console.log("  node scripts/migrate-library-ownership.mjs --apply\n");
    return;
  }

  if (mode !== "admin") {
    console.error("❌ ERRO: Para --apply é necessário FIREBASE_SERVICE_ACCOUNT_KEY configurada para ter permissão de escrita em lote de outros usuários.");
    process.exit(1);
  }

  console.log("\n⏳ Gravando alterações no Firestore em batches seguros...");
  let batch = db.batch();
  let batchCount = 0;
  let totalCommitted = 0;

  for (const userItem of usersToMigrate) {
    for (const update of userItem.updates) {
      const docRef = db.collection("users").doc(userItem.uid).collection("games").doc(update.docId);
      batch.set(docRef, update.patch, { merge: true });
      batchCount++;
      totalCommitted++;

      if (batchCount >= 400) {
        await batch.commit();
        console.log(`  ✓ Lote de ${batchCount} documentos gravado.`);
        batch = db.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`  ✓ Lote final de ${batchCount} documentos gravado.`);
  }

  console.log(`\n✅ SUCESSO: ${totalCommitted} jogos migrados para owned: true no Firestore!`);
}

runMigration().catch((err) => {
  console.error("❌ ERRO FATAL:", err);
  process.exit(1);
});
