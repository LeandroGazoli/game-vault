#!/usr/bin/env node
/**
 * Script de Rollback da Biblioteca do Firebase
 * Restaura os documentos da biblioteca para o estado capturado em um arquivo de backup JSON.
 * 
 * Uso:
 *   node scripts/rollback-library-ownership.mjs --backup=backups/library-backup-12345.json
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

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

const backupArg = process.argv.find((a) => a.startsWith("--backup="));
if (!backupArg) {
  console.error("❌ ERRO: Informe o caminho do backup usando --backup=<caminho>");
  process.exit(1);
}

const backupPath = resolve(process.cwd(), backupArg.slice("--backup=".length));
if (!existsSync(backupPath)) {
  console.error(`❌ ERRO: Arquivo de backup não encontrado em: ${backupPath}`);
  process.exit(1);
}

const backupData = JSON.parse(readFileSync(backupPath, "utf8"));

const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
let serviceAccount;
let parsedStr = rawServiceAccount.trim();
if (!parsedStr.startsWith("{")) {
  parsedStr = Buffer.from(parsedStr, "base64").toString("utf8");
}
serviceAccount = JSON.parse(parsedStr);
if (serviceAccount.private_key) {
  serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
}

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.project_id,
  });
}

const db = getFirestore();

async function runRollback() {
  console.log(`⏪ INICIANDO ROLLBACK A PARTIR DE: ${backupPath}`);
  console.log(`Data do backup: ${backupData.timestamp}`);

  let restoredCount = 0;
  let batch = db.batch();
  let batchCount = 0;

  for (const [uid, userItem] of Object.entries(backupData.users)) {
    for (const [gameId, originalGameData] of Object.entries(userItem.games)) {
      const docRef = db.collection("users").doc(uid).collection("games").doc(gameId);
      batch.set(docRef, originalGameData, { merge: false });
      batchCount++;
      restoredCount++;

      if (batchCount >= 400) {
        await batch.commit();
        console.log(`  ✓ Restaurado lote de ${batchCount} jogos.`);
        batch = db.batch();
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    await batch.commit();
    console.log(`  ✓ Restaurado lote final de ${batchCount} jogos.`);
  }

  console.log(`✅ ROLLBACK CONCLUÍDO! ${restoredCount} jogos restaurados.`);
}

runRollback().catch((err) => {
  console.error("❌ ERRO NO ROLLBACK:", err);
  process.exit(1);
});
