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
import { getAdminDb } from "./firebaseAdmin";
import { getGameUrl } from "./routes";

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
    const db = getAdminDb();

    let query: any = db.collection("game_translations");
    if (since) {
      query = query.where("updatedAt", ">", since);
    }
    query = query.orderBy("updatedAt", direction).limit(limit);

    const snapshot = await query.get();
    const pages: RegisteredGamePage[] = [];

    snapshot.forEach((docSnap: any) => {
      const data = docSnap.data() || {};
      const id = String(data.gameId || docSnap.id || "").trim();
      const name = typeof data.gameName === "string" ? data.gameName.trim() : "";
      if (!id || !name) return;

      pages.push({
        path: getGameUrl({ id, name }),
        updatedAt: String(data.updatedAt || ""),
      });
    });

    return pages;
  } catch (error: any) {
    console.warn(
      `[gameRegistry] Registro de jogos indisponível (${error?.message || error}). Seguindo sem ele.`
    );
    return [];
  }
}
