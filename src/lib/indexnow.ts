/**
 * IndexNow — notificação instantânea de URLs novas/atualizadas para Bing, Yandex,
 * Seznam, Naver e demais mecanismos participantes.
 *
 * Como funciona:
 *  1. A chave fica publicada em texto puro em `https://<host>/<chave>.txt`
 *     (arquivo em `public/48fc588eda9f43cbb2e5d4e272fe41d2.txt`) — é assim que o
 *     mecanismo confirma que quem envia realmente controla o domínio.
 *  2. Enviamos as URLs para `https://api.indexnow.org/indexnow`, que replica o aviso
 *     para todos os buscadores do consórcio (não é preciso chamar cada um).
 *
 * A chave NÃO é segredo (ela é servida publicamente por definição), por isso o
 * fallback embutido é seguro. O que protege o endpoint interno é `INDEXNOW_SECRET`
 * / autenticação de admin, definidos em `src/app/api/indexnow/route.ts`.
 */

/** Endpoint agnóstico do consórcio IndexNow (replica para Bing, Yandex, Seznam, Naver...). */
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/** Limite oficial de URLs por requisição. */
const MAX_URLS_PER_REQUEST = 10_000;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export function getIndexNowKey(): string {
  return (process.env.INDEXNOW_KEY || "48fc588eda9f43cbb2e5d4e272fe41d2").trim();
}

/** URL pública do arquivo de verificação da chave. */
export function getKeyLocation(): string {
  return `${SITE_URL.replace(/\/$/, "")}/${getIndexNowKey()}.txt`;
}

export interface IndexNowBatchResult {
  status: number;
  ok: boolean;
  count: number;
  message: string;
}

export interface IndexNowResult {
  ok: boolean;
  submitted: number;
  skipped: string[];
  batches: IndexNowBatchResult[];
  keyLocation: string;
}

/**
 * O IndexNow rejeita o lote inteiro se qualquer URL for de outro host, então
 * normalizamos e descartamos as que não pertencem ao domínio do site.
 */
export function normalizeIndexNowUrls(urls: string[]): { valid: string[]; skipped: string[] } {
  const host = new URL(SITE_URL).host;
  const valid = new Set<string>();
  const skipped: string[] = [];

  for (const raw of urls) {
    const candidate = String(raw || "").trim();
    if (!candidate) continue;

    try {
      // Aceita caminho relativo ("/game/123/slug") ou URL absoluta.
      const parsed = new URL(candidate, SITE_URL);
      if (parsed.host !== host || !/^https?:$/.test(parsed.protocol)) {
        skipped.push(candidate);
        continue;
      }
      valid.add(parsed.toString());
    } catch {
      skipped.push(candidate);
    }
  }

  return { valid: Array.from(valid), skipped };
}

/** Mensagens dos códigos de resposta documentados pelo IndexNow. */
function describeStatus(status: number): string {
  switch (status) {
    case 200:
      return "URLs recebidas.";
    case 202:
      return "URLs recebidas, mas a chave ainda está em validação.";
    case 400:
      return "Formato inválido no envio.";
    case 403:
      return "Chave inválida ou arquivo de verificação inacessível.";
    case 422:
      return "URLs não pertencem ao host da chave (ou o schema está incorreto).";
    case 429:
      return "Excesso de requisições — envie em lotes maiores e com menos frequência.";
    default:
      return `Resposta inesperada (${status}).`;
  }
}

/**
 * Envia as URLs ao IndexNow em lotes de até 10.000.
 * Não lança erro por resposta HTTP ruim — devolve o resultado de cada lote.
 */
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const keyLocation = getKeyLocation();
  const { valid, skipped } = normalizeIndexNowUrls(urls);

  if (valid.length === 0) {
    return { ok: false, submitted: 0, skipped, batches: [], keyLocation };
  }

  const key = getIndexNowKey();
  const host = new URL(SITE_URL).host;
  const batches: IndexNowBatchResult[] = [];

  for (let i = 0; i < valid.length; i += MAX_URLS_PER_REQUEST) {
    const urlList = valid.slice(i, i + MAX_URLS_PER_REQUEST);

    try {
      const response = await fetch(INDEXNOW_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        body: JSON.stringify({ host, key, keyLocation, urlList }),
        cache: "no-store",
      });

      batches.push({
        status: response.status,
        ok: response.ok,
        count: urlList.length,
        message: describeStatus(response.status),
      });
    } catch (error: any) {
      batches.push({
        status: 0,
        ok: false,
        count: urlList.length,
        message: `Falha de rede ao contatar o IndexNow: ${error?.message || error}`,
      });
    }
  }

  return {
    ok: batches.every((b) => b.ok),
    submitted: batches.filter((b) => b.ok).reduce((sum, b) => sum + b.count, 0),
    skipped,
    batches,
    keyLocation,
  };
}

/** Extrai os <loc> de um sitemap XML já publicado. */
function parseSitemapXml(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

/**
 * Reaproveita o `sitemap.ts` como fonte única de verdade das URLs indexáveis,
 * evitando divergência entre o que está no sitemap e o que é notificado.
 * Se o módulo não puder ser importado, cai para o `sitemap.xml` publicado.
 */
export async function collectSitemapUrls(): Promise<string[]> {
  try {
    const { default: sitemap } = await import("@/app/sitemap");
    const entries = await sitemap();
    if (entries.length > 0) {
      return entries.map((entry) => String(entry.url));
    }
  } catch (error) {
    console.warn("[indexnow] Falha ao importar o sitemap; usando o XML publicado.", error);
  }

  const response = await fetch(`${SITE_URL.replace(/\/$/, "")}/sitemap.xml`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Não foi possível obter o sitemap.xml (HTTP ${response.status}).`);
  }
  return parseSitemapXml(await response.text());
}

/* ------------------------------------------------------------------ *
 * Envio incremental (delta)
 * ------------------------------------------------------------------ */

/**
 * O IndexNow existe para avisar sobre conteúdo novo ou atualizado — reenviar as mesmas
 * URLs a cada execução é desperdício e leva a `429`. Guardamos então o `updatedAt` da
 * última página enviada e, na execução seguinte, só sobem as páginas mais novas que isso.
 *
 * O estado mora em um único documento (`system/indexnow`), lido/escrito pelo Admin SDK.
 */
const STATE_DOC = { collection: "system", doc: "indexnow" };

export interface IndexNowState {
  lastSubmittedAt: string | null;
  lastRunAt?: string | null;
  lastSubmittedCount?: number;
}

export async function getIndexNowState(): Promise<IndexNowState> {
  try {
    const { getAdminDb } = await import("./firebaseAdmin");
    const snap = await getAdminDb()
      .collection(STATE_DOC.collection)
      .doc(STATE_DOC.doc)
      .get();

    const data = snap.exists ? snap.data() || {} : {};
    return {
      lastSubmittedAt: data.lastSubmittedAt ? String(data.lastSubmittedAt) : null,
      lastRunAt: data.lastRunAt ? String(data.lastRunAt) : null,
      lastSubmittedCount: Number(data.lastSubmittedCount || 0),
    };
  } catch (error: any) {
    console.warn(`[indexnow] Estado indisponível (${error?.message || error}).`);
    return { lastSubmittedAt: null };
  }
}

async function saveIndexNowState(state: IndexNowState): Promise<void> {
  try {
    const { getAdminDb } = await import("./firebaseAdmin");
    await getAdminDb()
      .collection(STATE_DOC.collection)
      .doc(STATE_DOC.doc)
      .set({ ...state, lastRunAt: new Date().toISOString() }, { merge: true });
  } catch (error: any) {
    console.warn(`[indexnow] Não foi possível salvar o estado (${error?.message || error}).`);
  }
}

export interface DeltaResult extends IndexNowResult {
  mode: "delta";
  since: string | null;
  cursor: string | null;
  /** true quando o lote encheu — ainda há fila, vale rodar de novo. */
  hasMore: boolean;
  /** Amostra do que seria enviado; preenchida apenas em `dryRun`. */
  sample?: string[];
}

/**
 * Envia apenas as páginas de jogos registradas depois do último envio bem-sucedido.
 * O cursor só avança se o IndexNow aceitar o lote — falha significa reenviar na próxima.
 */
export async function submitDeltaToIndexNow(
  options: { limit?: number; dryRun?: boolean } = {}
): Promise<DeltaResult> {
  const limit = options.limit ?? 2_000;
  const { getRegisteredGamePages } = await import("./gameRegistry");
  const state = await getIndexNowState();

  const pages = await getRegisteredGamePages({
    since: state.lastSubmittedAt,
    limit,
    direction: "asc",
  });

  const base = {
    mode: "delta" as const,
    since: state.lastSubmittedAt,
    keyLocation: getKeyLocation(),
    hasMore: pages.length >= limit,
  };

  if (pages.length === 0) {
    return { ...base, ok: true, submitted: 0, skipped: [], batches: [], cursor: state.lastSubmittedAt };
  }

  // `updatedAt` é ISO em UTC, então a ordem lexicográfica é a ordem cronológica.
  const cursor = pages.reduce(
    (max, p) => (p.updatedAt > max ? p.updatedAt : max),
    pages[0].updatedAt
  );

  if (options.dryRun) {
    const { valid, skipped } = normalizeIndexNowUrls(pages.map((p) => p.path));
    return {
      ...base,
      ok: true,
      submitted: 0,
      skipped,
      batches: [],
      cursor,
      count: valid.length,
      sample: valid.slice(0, 20),
    } as DeltaResult & { count: number };
  }

  const result = await submitToIndexNow(pages.map((p) => p.path));

  if (result.ok && cursor) {
    await saveIndexNowState({ lastSubmittedAt: cursor, lastSubmittedCount: result.submitted });
  }

  return { ...base, ...result, mode: "delta", since: state.lastSubmittedAt, cursor };
}
