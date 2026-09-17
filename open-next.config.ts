import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";

/**
 * Sem `incrementalCache` configurado, o @opennextjs/cloudflare resolve para o override
 * "dummy" (dist/api/config.js: `resolveIncrementalCache(value = "dummy")`), cujo get/set
 * LANÇA IgnorableError — ou seja, todo `export const revalidate` e todo
 * `fetch(..., { next: { revalidate } })` do projeto era letra morta, e cada requisição
 * re-renderizava a página refazendo todas as leituras do Firestore.
 *
 * KV é o backend que cabe no plano gratuito do Workers (R2 é produto à parte).
 * Atenção ao teto de 1.000 ESCRITAS/dia do KV no free: cada regeneração de página é 1
 * escrita, por isso os `revalidate` das rotas foram alongados (nada abaixo de 1800s).
 *
 * `withRegionalCache` põe a Cache API do Worker (gratuita, sem binding) na frente do KV,
 * absorvendo a maior parte das leituras.
 */
export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
});
