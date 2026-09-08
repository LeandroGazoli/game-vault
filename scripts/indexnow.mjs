#!/usr/bin/env node
/**
 * Envia URLs ao IndexNow (Bing, Yandex, Seznam, Naver...) pela linha de comando.
 *
 * Uso:
 *   node scripts/indexnow.mjs                       # lê o sitemap.xml publicado e envia tudo
 *   node scripts/indexnow.mjs --delta               # só o que mudou desde o último envio
 *   node scripts/indexnow.mjs /game/1942/the-witcher-3-wild-hunt /rankings
 *   node scripts/indexnow.mjs https://www.mygameslist.com.br/calendar
 *
 * `--delta` é a forma indicada para rotina/cron: ele chama a API do site, que consulta o
 * registro de jogos e mantém o cursor do último envio — evita reenviar as mesmas URLs
 * (o que rende `429`). Exige INDEXNOW_SECRET, a mesma configurada no host.
 *
 * Variáveis de ambiente:
 *   INDEXNOW_KEY         chave (default: a chave publicada em public/<chave>.txt)
 *   INDEXNOW_SECRET      obrigatória para --delta (autoriza a chamada à API do site)
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

/**
 * Delegado à API do site: só ela tem acesso ao registro de jogos no Firestore e ao
 * cursor do último envio.
 */
async function runDelta(dryRun) {
  const secret = process.env.INDEXNOW_SECRET;
  if (!secret) {
    console.error("--delta exige INDEXNOW_SECRET (a mesma definida no host).");
    process.exit(1);
  }

  const res = await fetch(`${SITE_URL}/api/indexnow`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-indexnow-secret": secret },
    body: JSON.stringify({ mode: "delta", dryRun }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`HTTP ${res.status}:`, data?.error || data);
    process.exit(1);
  }

  if (data.submitted === 0 && !dryRun) {
    console.log(`Nada novo desde ${data.since || "o início"} — nenhum envio necessário.`);
  } else {
    console.log(
      `${dryRun ? "[dry-run] " : ""}${dryRun ? data.count : data.submitted} URL(s) | desde: ${
        data.since || "início"
      } | novo cursor: ${data.cursor || "-"}`
    );
    (data.sample || []).forEach((u) => console.log("  ", u));
  }

  if (data.hasMore) {
    console.log("Ainda há fila (lote cheio) — rode novamente para continuar.");
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  if (args.includes("--delta")) {
    return runDelta(dryRun);
  }

  const positional = args.filter((a) => !a.startsWith("--"));
  const urlList = normalize(positional.length > 0 ? positional : await urlsFromSitemap());

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
