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

import { getCloudflareContext } from "@opennextjs/cloudflare";

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

// =========================================================================
// CACHE EM DUAS CAMADAS: Cache API (por datacenter) + KV (global)
// =========================================================================

interface IgdbCacheKV {
  get: (key: string, options?: { cacheTtl?: number }) => Promise<string | null>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<void>;
}

function getIgdbKV(): IgdbCacheKV | null {
  try {
    const { env } = getCloudflareContext();
    return ((env as Record<string, unknown>).IGDB_CACHE as IgdbCacheKV) || null;
  } catch {
    return null;
  }
}

/**
 * Como `withEdgeCache`, mas com o KV atrás da Cache API.
 *
 * POR QUE DUAS CAMADAS: a Cache API vive **por datacenter**. Com tráfego espalhado, cada
 * ponto de presença paga sua própria primeira visita a cada jogo — e o IGDB aceita só
 * 3 requisições por segundo. O KV é global: o jogo buscado uma vez em São Paulo já serve
 * qualquer outro colo. Assim o consumo do IGDB passa a depender de quantos jogos DISTINTOS
 * existem, não de quantas visitas o site recebe.
 *
 * Ordem de custo: Cache API (µs, local) → KV (ms, global) → origem (rede + cota).
 *
 * Igual à versão de uma camada, **resultado vazio nunca é gravado**: fixar um vazio vindo
 * de falha transitória é como um jogo válido vira "não encontrado" para sempre.
 */
export async function withSharedCache<T>(
  namespace: string,
  key: string,
  ttlSeconds: number,
  produce: () => Promise<T>
): Promise<T> {
  const kv = getIgdbKV();
  const kvKey = `${namespace}:${key}`;

  return withEdgeCache(namespace, key, ttlSeconds, async () => {
    if (kv) {
      try {
        // `cacheTtl` faz o próprio KV guardar a leitura no colo, evitando ida ao storage
        // a cada requisição. 300s é curto perto do TTL do dado e já corta a maior parte.
        const bruto = await kv.get(kvKey, { cacheTtl: 300 });
        if (bruto) return JSON.parse(bruto) as T;
      } catch {
        /* KV indisponível não pode derrubar a requisição — segue para a origem */
      }
    }

    const valor = await produce();

    const vazio = valor == null || (Array.isArray(valor) && valor.length === 0);
    if (kv && !vazio) {
      try {
        await kv.put(kvKey, JSON.stringify(valor), { expirationTtl: ttlSeconds });
      } catch {
        /* falha ao gravar é perda de desempenho, não de correção */
      }
    }

    return valor;
  });
}
