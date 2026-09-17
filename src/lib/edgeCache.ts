/**
 * Camada L2 sobre a Cache API do Cloudflare Workers.
 *
 * Por que existe: o `Map` em nível de módulo (L1) só vale dentro de UM isolate, que o
 * workerd descarta em segundos de inatividade e existe às centenas em paralelo pelo mundo.
 * Na prática a taxa de acerto do L1 é baixa. A Cache API é por datacenter, sobrevive à morte
 * do isolate, é compartilhada entre todas as requisições daquele PoP — e é **gratuita, sem
 * binding e sem cota própria**, diferente de KV.
 *
 * Serve especialmente para chamadas que o Next NUNCA cacheia sozinho: o IGDB é `POST`, e a
 * memoização automática do Next só cobre `fetch` GET.
 *
 * Degrada em silêncio: fora do runtime do Worker (ex.: `next build`), `caches` não existe e
 * tudo vira passthrough.
 */

const CACHE_NAME = "gv-edge";
/** Host sintético: a Cache API exige uma URL válida como chave. */
const KEY_ORIGIN = "https://edge-cache.internal";

function getCache(): Promise<Cache> | null {
  try {
    const c = (globalThis as { caches?: { open?: (n: string) => Promise<Cache> } }).caches;
    if (!c?.open) return null;
    return c.open(CACHE_NAME);
  } catch {
    return null;
  }
}

function toRequest(namespace: string, key: string): Request {
  // encodeURIComponent evita que uma chave com "/" ou "?" vire outro recurso.
  return new Request(`${KEY_ORIGIN}/${namespace}/${encodeURIComponent(key)}`);
}

/**
 * Lê do cache de borda; em caso de miss executa `produce`, guarda e devolve.
 *
 * @param ttlSeconds tempo de vida no PoP (vira `Cache-Control: s-maxage`).
 */
export async function withEdgeCache<T>(
  namespace: string,
  key: string,
  ttlSeconds: number,
  produce: () => Promise<T>
): Promise<T> {
  const cachePromise = getCache();
  if (!cachePromise) return produce();

  let cache: Cache;
  try {
    cache = await cachePromise;
  } catch {
    return produce();
  }

  const request = toRequest(namespace, key);

  try {
    const hit = await cache.match(request);
    if (hit) return (await hit.json()) as T;
  } catch {
    /* cache corrompido não deve derrubar a requisição */
  }

  const value = await produce();

  // Não guarda vazio: evita fixar um resultado ruim de uma falha transitória da origem.
  const isEmpty =
    value == null || (Array.isArray(value) && value.length === 0);

  if (!isEmpty) {
    try {
      await cache.put(
        request,
        new Response(JSON.stringify(value), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, s-maxage=${ttlSeconds}`,
          },
        })
      );
    } catch {
      /* put é best-effort */
    }
  }

  return value;
}
