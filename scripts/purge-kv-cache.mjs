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
 * Apagar o build ERRADO não derruba o site (as páginas regeneram sob demanda), mas gasta
 * leitura do Firestore e escrita de KV — justamente o orçamento que queremos proteger.
 * Por isso a origem do "build a preservar" importa:
 *
 *   --from-kv  (recomendado, e o que o deploy usa)
 *              lê `deploy/current-build-id`, gravado por `scripts/deploy.sh` DEPOIS de um
 *              deploy bem-sucedido. É o único jeito de saber o que está no ar de verdade,
 *              e funciona de qualquer máquina, sem depender do build local.
 *
 *   (padrão)   usa `.next/BUILD_ID` — o ÚLTIMO BUILD LOCAL, que só coincide com produção
 *              se você deployou logo em seguida. Um build não deployado (ex: de uma branch
 *              de homologação) faria o script tratar produção inteira como órfã.
 *
 *   --keep ID  você assume a responsabilidade.
 *
 * Uso:
 *   node scripts/purge-kv-cache.mjs                        # simula
 *   node scripts/purge-kv-cache.mjs --from-kv --apply      # apaga (o que o deploy faz)
 *   node scripts/purge-kv-cache.mjs --apply --keep ABC123  # preserva um ID específico
 *   node scripts/purge-kv-cache.mjs --env homolog          # age no KV de homologação
 *   node scripts/purge-kv-cache.mjs --apply --max 500      # limita a rodada
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";

const APPLY = process.argv.includes("--apply");
const FROM_KV = process.argv.includes("--from-kv");
const keepIdx = process.argv.indexOf("--keep");
const KEEP_ARG = keepIdx !== -1 ? process.argv[keepIdx + 1] : null;
const BINDING = "NEXT_INC_CACHE_KV";
const envIdx = process.argv.indexOf("--env");
/** Homologação tem namespace próprio; sem isto o script mexeria no KV de produção. */
const ENV_ARGS = envIdx !== -1 ? ["--env", process.argv[envIdx + 1]] : [];

/** Chave onde `scripts/deploy.sh` registra o build que foi para produção. */
const CURRENT_BUILD_KEY = "deploy/current-build-id";

/**
 * Teto de exclusões por execução.
 *
 * No Workers Paid a cota é de 1 milhão de exclusões POR MÊS (era 1.000/dia no gratuito),
 * então o limite que sobra é o da própria API: `kv bulk delete` aceita 10.000 chaves por
 * chamada. Na prática a faxina inteira cabe numa rodada só.
 */
const maxIdx = process.argv.indexOf("--max");
const DELETE_BUDGET = maxIdx !== -1 ? Number(process.argv[maxIdx + 1]) : 10_000;

function wrangler(args) {
  return execFileSync("npx", ["wrangler", ...args, ...ENV_ARGS], {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** Igual ao anterior, mas devolve null em vez de lançar (usado para a chave que pode não existir). */
function wranglerOrNull(args) {
  try {
    return wrangler(args);
  } catch {
    return null;
  }
}

// 1. Qual build preservar
let keep = KEEP_ARG;
let origem = "informado via --keep";

let verificado = false; // true = temos prova de que `keep` está realmente no ar

if (!keep && FROM_KV) {
  const raw = wranglerOrNull(["kv", "key", "get", CURRENT_BUILD_KEY, "--binding", BINDING, "--remote"]);
  keep = (raw || "").trim();
  if (!keep) {
    console.error(`✗ A chave ${CURRENT_BUILD_KEY} não existe no KV.`);
    console.error("  Ela é gravada por scripts/deploy.sh. Faça um deploy por ele, ou informe --keep <buildId>.");
    process.exit(1);
  }
  origem = "do último deploy registrado no KV";
  verificado = true;
}

if (!keep) {
  const buildIdFile = path.resolve(".next/BUILD_ID");
  if (!fs.existsSync(buildIdFile)) {
    console.error("✗ .next/BUILD_ID não existe. Faça um build antes, ou informe --keep <buildId>.");
    process.exit(1);
  }
  keep = fs.readFileSync(buildIdFile, "utf8").trim();
  origem = "do último BUILD LOCAL — só vale se você deployou logo depois";
}

console.log(`Build preservado : ${keep}`);
console.log(`  (${origem})`);
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

// A prova de que o build está no ar pode vir de dois lados: ter chaves no KV (já serviu
// páginas) ou estar registrado em `deploy/current-build-id` por um deploy bem-sucedido.
// A segunda é necessária porque logo após o deploy o cache ainda está vazio — as páginas
// só gravam quando são pedidas pela primeira vez.
if (byBuild.has(keep)) verificado = true;

if (!verificado) {
  console.log();
  console.log(`⚠ Nada confirma que o build ${keep} está no ar: ele não tem chaves no KV`);
  console.log("  nem foi registrado por um deploy. Apagar o resto forçaria o site inteiro a");
  console.log("  regenerar — leitura de Firestore e escrita de KV à toa.");
  if (APPLY && !process.argv.includes("--force-unverified")) {
    console.error("\n✗ Abortado. Se tem certeza: --keep " + keep + " --force-unverified");
    process.exit(1);
  }
}

if (orphanKeys.length === 0) {
  console.log("\n✓ Nada a limpar.");
  process.exit(0);
}

// 3. Respeita o teto diário
const batch = orphanKeys.slice(0, DELETE_BUDGET);
const remaining = orphanKeys.length - batch.length;

console.log();
console.log(`  a apagar agora   : ${batch.length}`);
if (remaining > 0) {
  console.log(`  ficam para depois: ${remaining} (teto de ${DELETE_BUDGET} por rodada — rode de novo)`);
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
  if (remaining > 0) console.log(`  Restam ${remaining}. Rode o script de novo para concluir.`);
} catch (e) {
  const msg = String(e?.stderr || e?.message || e);
  if (msg.includes("10048")) {
    console.error("\n✗ Cota de exclusão esgotada (1 mi/mês no Paid). Confira o uso no painel.");
  } else {
    console.error("\n✗ Falha:", msg.slice(0, 400));
  }
  process.exit(1);
} finally {
  fs.unlinkSync(tmp);
}
