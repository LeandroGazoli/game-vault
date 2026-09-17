/**
 * Popula (ou reconstrói) o índice do sitemap a partir de `game_translations`.
 *
 * Roda UMA VEZ. Depois disso o índice se mantém sozinho: `saveGameTranslations` registra
 * cada jogo novo incrementalmente.
 *
 * Antes: o sitemap varria `game_translations` inteira a cada geração — 1 leitura POR JOGO,
 * em todo `next build`. Com 33.249 jogos e vários builds por dia, isso dominava a fatura.
 * Depois: o sitemap lê ~9 documentos agregados.
 *
 * Esta execução custa 1 leitura por jogo (é a última vez) + ~9 escritas.
 *
 * Uso:
 *   FIREBASE_SERVICE_ACCOUNT_KEY="$(cat chave.json)" node scripts/build-sitemap-index.mjs
 *   ... --apply     # sem isso, só simula
 */
import admin from "firebase-admin";

const APPLY = process.argv.includes("--apply");
const CHUNK_SIZE = 4000;

const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!raw) {
  console.error("FIREBASE_SERVICE_ACCOUNT_KEY não definida.");
  process.exit(1);
}
let sa = raw.trim();
if (!sa.startsWith("{")) sa = Buffer.from(sa, "base64").toString("utf8");
const parsed = JSON.parse(sa);
if (typeof parsed.private_key === "string") {
  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
}

admin.initializeApp({ credential: admin.credential.cert(parsed) });
const db = admin.firestore();

console.log(APPLY ? "Reconstruindo índice..." : "SIMULAÇÃO — nada será gravado\n");

// select() traz só os campos necessários: não reduz a cobrança de leituras, mas corta
// drasticamente a banda e o tempo (os docs têm textos traduzidos grandes).
const snap = await db
  .collection("game_translations")
  .select("gameId", "gameName", "updatedAt")
  .get();

const entries = [];
const seen = new Set();
for (const doc of snap.docs) {
  const d = doc.data() || {};
  const i = String(d.gameId || doc.id || "").trim();
  const n = typeof d.gameName === "string" ? d.gameName.trim() : "";
  if (!i || !n || seen.has(i)) continue;
  seen.add(i);
  entries.push({ i, n, u: String(d.updatedAt || "") });
}

// Mais recentes primeiro: se algum dia o sitemap precisar truncar, sobram os relevantes.
entries.sort((a, b) => (b.u || "").localeCompare(a.u || ""));

const chunks = [];
for (let k = 0; k < entries.length; k += CHUNK_SIZE) {
  chunks.push(entries.slice(k, k + CHUNK_SIZE));
}

console.log(`  documentos lidos : ${snap.size}`);
console.log(`  jogos válidos    : ${entries.length}`);
console.log(`  chunks a gravar  : ${chunks.length}`);
console.log(`  leituras futuras do sitemap: ${chunks.length + 1} (antes: ${snap.size})`);

if (!APPLY) {
  console.log("\nNada gravado. Rode com --apply.");
  process.exit(0);
}

const metaRef = db.collection("system").doc("sitemap_index");
// Chunks são gravados na ordem inversa da leitura (readSitemapIndex percorre do fim),
// mas a ordem entre chunks não importa para o sitemap — ele deduplica por URL.
for (let n = 0; n < chunks.length; n++) {
  await metaRef.collection("sitemap_index").doc(String(n)).set({ entries: chunks[n] });
}
await metaRef.set({
  chunkCount: chunks.length,
  entryCount: entries.length,
  updatedAt: new Date().toISOString(),
});

console.log(`\n✓ Índice gravado: ${chunks.length} chunks, ${entries.length} jogos.`);
console.log("  A partir de agora o sitemap custa ~" + (chunks.length + 1) + " leituras por geração.");
