/**
 * Remove gerações ANTIGAS do cache incremental no KV.
 *
 * POR QUE EXISTE: cada `wrangler deploy` grava as páginas sob um build ID novo e **nunca
 * apaga o anterior**. Medido em 17/09: 1.392 chaves em 23 build IDs, só 1 em uso, ~190 MB
 * de 1 GB — crescendo ~9 MB por deploy. No teto, a escrita falha e isso trava tanto o
 * deploy quanto o toggle de manutenção.
 *
 * O QUE ESTE SCRIPT **NÃO** FAZ: não devolve cota de ESCRITA. O limite de 1.000/dia é de
 * operações, não de espaço. Isto aqui recupera ESPAÇO.
 *
 * SEGURANÇA — leia antes de usar:
 * O build ID preservado é o de `.open-next/cache/`, ou seja, o do ÚLTIMO BUILD LOCAL.
 * Rode logo APÓS um deploy, quando o build local é exatamente o que está em produção.
 * Se você buildou mas não deployou, o script apagaria as chaves da versão viva — não
 * derruba o site (as páginas regeneram sob demanda), mas gasta leitura do Firestore e
 * escrita de KV justamente do orçamento que queremos proteger.
 *
 * Uso:
 *   node scripts/purge-kv-cache.mjs                 # simula
 *   node scripts/purge-kv-cache.mjs --apply         # apaga
 *   node scripts/purge-kv-cache.mjs --apply --keep ABC123   # preserva um ID específico
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const APPLY = process.argv.includes("--apply");
const keepIdx = process.argv.indexOf("--keep");
const KEEP_ARG = keepIdx !== -1 ? process.argv[keepIdx + 1] : null;
const BINDING = "NEXT_INC_CACHE_KV";

/** Teto diário de exclusões no plano gratuito. Margem para não travar outras operações. */
const DAILY_DELETE_BUDGET = 900;

function wrangler(args) {
  return execFileSync("npx", ["wrangler", ...args], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

// 1. Qual build preservar
let keep = KEEP_ARG;
if (!keep) {
  const cacheDir = path.resolve(".open-next/cache");
  if (!fs.existsSync(cacheDir)) {
    console.error("✗ .open-next/cache não existe. Faça um build antes, ou informe --keep <buildId>.");
    process.exit(1);
  }
  const ids = fs.readdirSync(cacheDir).filter((d) => d !== "__fetch");
  if (ids.length !== 1) {
    console.error(`✗ Esperava 1 build ID em .open-next/cache, achei ${ids.length}: ${ids.join(", ")}`);
    console.error("  Informe explicitamente com --keep <buildId>.");
    process.exit(1);
  }
  keep = ids[0];
}

console.log(`Build preservado : ${keep}`);
console.log(KEEP_ARG ? "  (informado via --keep)" : "  (do último build local — rode logo APÓS um deploy)");
console.log();

// 2. Inventário
const all = JSON.parse(wrangler(["kv", "key", "list", "--binding", BINDING, "--remote"]));
const byBuild = new Map();
for (const { name } of all) {
  const parts = name.split("/");
  if (parts[0] !== "incremental-cache" || parts.length < 2) continue;
  const id = parts[1];
  if (!byBuild.has(id)) byBuild.set(id, []);
  byBuild.get(id).push(name);
}

const orphanIds = [...byBuild.keys()].filter((id) => id !== keep);
const orphanKeys = orphanIds.flatMap((id) => byBuild.get(id));

console.log(`  chaves totais    : ${all.length}`);
console.log(`  build IDs        : ${byBuild.size}`);
console.log(`  órfãos           : ${orphanIds.length} builds, ${orphanKeys.length} chaves`);

if (!byBuild.has(keep)) {
  console.log();
  console.log(`⚠ O build ${keep} NÃO tem chaves no KV.`);
  console.log("  Ou ele ainda não foi deployado, ou você está preservando o ID errado.");
  console.log("  Confira antes de usar --apply: apagar tudo forçaria regeneração completa.");
}

if (orphanKeys.length === 0) {
  console.log("\n✓ Nada a limpar.");
  process.exit(0);
}

// 3. Respeita o teto diário
const batch = orphanKeys.slice(0, DAILY_DELETE_BUDGET);
const remaining = orphanKeys.length - batch.length;

console.log();
console.log(`  a apagar agora   : ${batch.length}`);
if (remaining > 0) {
  console.log(`  ficam para depois: ${remaining} (teto de ${DAILY_DELETE_BUDGET}/dia; rode de novo após as 21h)`);
}

if (!APPLY) {
  console.log("\nSIMULAÇÃO — nada foi apagado. Rode com --apply.");
  process.exit(0);
}

// 4. Exclusão em lote
const tmp = path.join(os.tmpdir(), `kv-purge-${Date.now()}.json`);
fs.writeFileSync(tmp, JSON.stringify(batch));
try {
  wrangler(["kv", "bulk", "delete", tmp, "--binding", BINDING, "--remote", "--force"]);
  console.log(`\n✓ ${batch.length} chaves apagadas.`);
  if (remaining > 0) console.log(`  Restam ${remaining}. Rode novamente amanhã (reset 00:00 UTC = 21h de Brasília).`);
} catch (e) {
  const msg = String(e?.stderr || e?.message || e);
  if (msg.includes("10048")) {
    console.error("\n✗ Cota diária de exclusão esgotada. Tente após as 21h (reset 00:00 UTC).");
  } else {
    console.error("\n✗ Falha:", msg.slice(0, 400));
  }
  process.exit(1);
} finally {
  fs.unlinkSync(tmp);
}
