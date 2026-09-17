/**
 * Registro das páginas de jogos que realmente existem no site.
 *
 * As rotas `/game/[id]/[slug]` são dinâmicas — renderizam sob demanda a partir do IGDB,
 * então não há lista estática de URLs. A coleção `game_translations` do Firestore acaba
 * funcionando como esse cadastro: ela é gravada por `gameApi.ts` sempre que uma página
 * de jogo renderiza e gera tradução, guardando `gameId`, `gameName` e `updatedAt`.
 *
 * Isso dá dois ganhos:
 *  - o `gameName` monta o slug canônico via `getGameUrl`, sem nenhuma chamada ao IGDB;
 *  - ter tradução é um filtro de qualidade: a página tem sinopse em PT-BR própria, e não
 *    apenas o texto em inglês espelhado da API — que é o conteúdo que vale indexar.
 *
 * Toda leitura aqui usa o Admin SDK (ignora as Security Rules) e NUNCA lança erro: se a
 * service account não estiver configurada, devolve lista vazia para não quebrar o build
 * do sitemap nem o endpoint do IndexNow.
 */
// Transporte: Firestore REST API v1 (fetch nativo) — sem gRPC/protobufjs, que quebram no workerd.
import { getGameUrl } from "./routes";
import { firestoreRestQuery } from "./firestoreRest";
import { readSitemapIndex } from "./sitemapIndex";

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
}

/**
 * Lê o registro e devolve os caminhos canônicos das páginas de jogos.
 * Documentos sem `gameName` são descartados: sem o nome o slug sairia diferente do
 * canônico e a URL responderia 301, o que não deve entrar em sitemap nem no IndexNow.
 */
export async function getRegisteredGamePages(
  options: RegistryQuery = {}
): Promise<RegisteredGamePage[]> {
  const { since = null, direction = "desc" } = options;
  const limit = Math.min(options.limit ?? 10_000, HARD_CAP);

  try {
    const structuredQuery: Record<string, any> = {
      limit,
      orderBy: [
        {
          field: { fieldPath: "updatedAt" },
          direction: direction === "asc" ? "ASCENDING" : "DESCENDING",
        },
      ],
    };

    if (since) {
      structuredQuery.where = {
        fieldFilter: {
          field: { fieldPath: "updatedAt" },
          op: "GREATER_THAN",
          value: { stringValue: since },
        },
      };
    }

    // Caminho normal: índice agregado (~9 leituras). A varredura de `game_translations`
    // custava 1 leitura POR JOGO — 33.249 delas, em todo build e toda regeneração.
    const indexed = await readSitemapIndex(limit);
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

    // Fallback: índice ainda não populado (rodar scripts/build-sitemap-index.mjs).
    // Mantido para não deixar o sitemap vazio, mas é o caminho CARO.
    console.warn(
      "[gameRegistry] Índice do sitemap vazio — caindo na varredura completa de game_translations. " +
        "Rode scripts/build-sitemap-index.mjs para popular o índice."
    );
    const docs = await firestoreRestQuery<{ gameId?: string; gameName?: string; updatedAt?: string }>(
      "game_translations",
      structuredQuery
    );

    const pages: RegisteredGamePage[] = [];

    for (const data of docs) {
      const id = String(data.gameId || data.id || "").trim();
      const name = typeof data.gameName === "string" ? data.gameName.trim() : "";
      if (!id || !name) continue;

      pages.push({
        path: getGameUrl({ id, name }),
        updatedAt: String(data.updatedAt || ""),
      });
    }

    return pages;
  } catch (error: any) {
    console.warn(
      `[gameRegistry] Registro de jogos indisponível (${error?.message || error}). Seguindo sem ele.`
    );
    return [];
  }
}
