/**
 * Camada L2 (Cache API Workers) + L3 (KV global) com Request Coalescing.
 * Cache API sobrevive ao isolate por PoP (sem custo/binding). KV global cobre PoPs frios.
 * Degrada em silêncio fora do Worker (ex.: next build).
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

// Mapa de promessas em trânsito dentro do mesmo isolate (Single-Flight/Coalescing).
// Se dezenas de conexões chegarem no mesmo milissegundo em cache miss, apenas 1 ida à origem é feita.
const inFlightRequests = new Map<string, Promise<unknown>>();

export async function withCoalescing<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing as Promise<T>;
  }

  const promise = (async () => {
    try {
      return await fn();
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
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
  if (!cachePromise) return withCoalescing(`${namespace}:${key}`, produce);

  let cache: Cache;
  try {
    cache = await cachePromise;
  } catch {
    return withCoalescing(`${namespace}:${key}`, produce);
  }

  const request = toRequest(namespace, key);

  try {
    const hit = await cache.match(request);
    if (hit) return (await hit.json()) as T;
  } catch {
    /* cache corrompido não deve derrubar a requisição */
  }

  const value = await withCoalescing(`${namespace}:${key}`, produce);

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
 * Como `withEdgeCache`, mas com KV global atrás da Cache API local do PoP.
 * Ordem de busca: Cache API local (µs) → KV global (ms) → produce() na origem.
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

/**
 * Grava proativamente um valor no cache compartilhado (Cache API + KV),
 * evitando ida à origem na próxima leitura.
 */
export async function setSharedCache<T>(
  namespace: string,
  key: string,
  ttlSeconds: number,
  value: T
): Promise<void> {
  if (value == null) return;
  const kv = getIgdbKV();
  const kvKey = `${namespace}:${key}`;

  if (kv) {
    try {
      await kv.put(kvKey, JSON.stringify(value), { expirationTtl: ttlSeconds });
    } catch {}
  }

  const cachePromise = getCache();
  if (cachePromise) {
    try {
      const cache = await cachePromise;
      const request = toRequest(namespace, key);
      await cache.put(
        request,
        new Response(JSON.stringify(value), {
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": `public, s-maxage=${ttlSeconds}`,
          },
        })
      );
    } catch {}
  }
}

/**
 * Invalida proativamente uma chave no cache compartilhado (Cache API + KV).
 */
export async function invalidateSharedCache(namespace: string, key: string): Promise<void> {
  const kv = getIgdbKV();
  const kvKey = `${namespace}:${key}`;

  if (kv) {
    try {
      await kv.put(kvKey, "", { expirationTtl: 1 });
    } catch {}
  }

  const cachePromise = getCache();
  if (cachePromise) {
    try {
      const cache = await cachePromise;
      const request = toRequest(namespace, key);
      await cache.delete(request);
    } catch {}
  }
}

/**
 * Retorna cabeçalhos padronizados de cache para borda Cloudflare (SWR + Cache-Tags).
 */
export function getEdgeCacheHeaders(options: {
  sMaxAge?: number;
  swr?: number;
  tags?: string[];
}): Record<string, string> {
  const sMaxAge = options.sMaxAge ?? 300;
  const swr = options.swr ?? 3600;
  const headers: Record<string, string> = {
    "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
  };
  if (options.tags && options.tags.length > 0) {
    headers["Cache-Tag"] = options.tags.join(",");
  }
  return headers;
}
