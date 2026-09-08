#!/usr/bin/env node
/**
 * Envia URLs ao IndexNow (Bing, Yandex, Seznam, Naver...) pela linha de comando.
 *
 * Uso:
 *   node scripts/indexnow.mjs                       # lê o sitemap.xml publicado e envia tudo
 *   node scripts/indexnow.mjs /game/1942/the-witcher-3-wild-hunt /rankings
 *   node scripts/indexnow.mjs https://www.mygameslist.com.br/calendar
 *
 * Variáveis de ambiente:
 *   INDEXNOW_KEY         chave (default: a chave publicada em public/<chave>.txt)
 *   NEXT_PUBLIC_SITE_URL origem do site (default: https://www.mygameslist.com.br)
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br").replace(/\/$/, "");
const KEY = (process.env.INDEXNOW_KEY || "48fc588eda9f43cbb2e5d4e272fe41d2").trim();
const ENDPOINT = "https://api.indexnow.org/indexnow";
const HOST = new URL(SITE_URL).host;
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;

async function urlsFromSitemap() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`, { headers: { "User-Agent": "mygameslist-indexnow" } });
  if (!res.ok) {
    throw new Error(`Não foi possível ler ${SITE_URL}/sitemap.xml (HTTP ${res.status})`);
  }
  const xml = await res.text();
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

function normalize(list) {
  const seen = new Set();
  for (const raw of list) {
    try {
      const parsed = new URL(String(raw).trim(), SITE_URL);
      if (parsed.host === HOST) seen.add(parsed.toString());
    } catch {
      /* ignora entradas inválidas */
    }
  }
  return [...seen];
}

async function main() {
  const args = process.argv.slice(2);
  const urlList = normalize(args.length > 0 ? args : await urlsFromSitemap());

  if (urlList.length === 0) {
    console.error("Nenhuma URL válida para enviar.");
    process.exit(1);
  }

  // Verifica antes que o arquivo de chave está no ar — é a causa nº 1 de HTTP 403.
  const keyCheck = await fetch(KEY_LOCATION).catch(() => null);
  if (!keyCheck || !keyCheck.ok) {
    console.error(`Arquivo de verificação inacessível: ${KEY_LOCATION} (faça o deploy antes de enviar).`);
    process.exit(1);
  }

  console.log(`Enviando ${urlList.length} URL(s) de ${HOST} ao IndexNow...`);

  for (let i = 0; i < urlList.length; i += 10000) {
    const batch = urlList.slice(i, i + 10000);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: batch }),
    });
    console.log(`  lote ${batch.length} URL(s) → HTTP ${res.status} ${res.statusText}`);
    if (!res.ok) {
      console.error(await res.text().catch(() => ""));
      process.exitCode = 1;
    }
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
