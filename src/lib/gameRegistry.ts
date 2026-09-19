/**
 * Registro das páginas de jogos que realmente existem no site.
 *
 * As rotas `/game/[id]/[slug]` são dinâmicas — renderizam sob demanda a partir do IGDB,
 * então não há lista estática de URLs. O índice particionado `system/sitemap_index` do Firestore
 * guarda o catálogo agregado (em blocos de 4.000 entradas) gravado por `sitemapIndex.ts`.
 *
 * Isso dá dois ganhos:
 *  - o `gameName` monta o slug canônico via `getGameUrl`, sem nenhuma chamada ao IGDB;
 *  - a leitura de dezenas de milhares de jogos consome apenas ~9 leituras do Firestore,
 *    eliminando varreduras diretas da coleção `game_translations`.
 *
 * Toda leitura aqui usa o transporte REST do Admin SDK (ignora as Security Rules) e NUNCA
 * lança erro: se a service account não estiver configurada ou o índice estiver vazio,
 * devolve lista vazia para não quebrar o build nem consumir cotas indevidas.
 */
import { getGameUrl } from "./routes";
import { readSitemapIndex, readSitemapRange } from "./sitemapIndex";

/** Teto de segurança: um sitemap único aceita no máximo 50.000 URLs. */
const HARD_CAP = 45_000;

export interface RegisteredGamePage {
  path: string;
  updatedAt: string;
}

export interface RegistryQuery {
  /** Só páginas com `updatedAt` posterior a este ISO (envio incremental). */
  since?: string | null;
  /** Quantidade máxima de documentos lidos. */
  limit?: number;
  /** "desc" traz as mais recentes (sitemap); "asc" percorre a fila do delta. */
  direction?: "asc" | "desc";
  /** Início da faixa. Usado para particionar o sitemap em arquivos de 10.000 URLs. */
  offset?: number;
}

/**
 * Lê o registro e devolve os caminhos canônicos das páginas de jogos a partir do índice agregado.
 */
export async function getRegisteredGamePages(
  options: RegistryQuery = {}
): Promise<RegisteredGamePage[]> {
  const { since = null } = options;
  const limit = Math.min(options.limit ?? 10_000, HARD_CAP);

  try {
    const offset = Math.max(0, options.offset ?? 0);
    const indexed =
      offset > 0
        ? await readSitemapRange(offset, limit)
        : await readSitemapIndex(limit);

    if (indexed.length > 0) {
      const pages: RegisteredGamePage[] = [];
      const seen = new Set<string>();
      for (const e of indexed) {
        const id = String(e.i || "").trim();
        const name = String(e.n || "").trim();
        if (!id || !name || seen.has(id)) continue;
        seen.add(id);
        if (since && e.u && e.u <= since) continue;
        pages.push({ path: getGameUrl({ id, name }), updatedAt: String(e.u || "") });
      }
      return pages;
    }

    // Índice não encontrado ou vazio: nunca varrer a coleção game_translations!
    // Varrer a coleção causava 34.000+ leituras por build ou consulta.
    console.warn(
      "[gameRegistry] Índice agregado do sitemap vazio ou inacessível. " +
        "Varredura direta da coleção game_translations foi permanentemente desativada para proteção de cotas do Firestore. " +
        "Execute 'scripts/build-sitemap-index.mjs' com --apply se precisar reconstruir o índice."
    );
    return [];
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.warn(`[gameRegistry] Registro de jogos indisponível (${msg}). Seguindo sem ele.`);
    return [];
  }
}
