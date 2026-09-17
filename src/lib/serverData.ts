/**
 * Leituras de dados para páginas renderizadas no SERVIDOR — via Firestore REST API.
 *
 * Por que este módulo existe: as páginas de servidor liam o Firestore pelo SDK
 * *cliente* (`@/lib/firebase`, `@/lib/indieService`), e isso não funciona em
 * nenhuma das duas pontas do deploy no Cloudflare:
 *
 *   - resolvido pela condição "node", o SDK usa gRPC + protobufjs, que chamam
 *     `new Function` — proibido no workerd ("Code generation from strings
 *     disallowed") e causa de HTTP 500 em produção;
 *   - resolvido para o build de browser, ele usa WebChannel (long-polling), que
 *     trava durante `next build` e estoura o timeout de 60s da geração estática.
 *
 * O transporte REST funciona nos dois ambientes e falha rápido (sem retry) quando
 * o Firestore devolve 429, em vez de segurar o build.
 *
 * As funções do SDK cliente seguem intactas para os componentes client — este
 * módulo NÃO deve ser importado de nenhum componente com "use client", porque
 * depende de APIs de servidor (Buffer) no caminho da service account.
 */
import { firestoreRestGet, firestoreRestQuery } from "./firestoreRest";
import type { IndieGame } from "./types/indie.types";
import type { UserProfile } from "./types";

const INDIES_COLLECTION = "indie_games";

/** Filtro de igualdade por string, no formato da structuredQuery. */
function equals(fieldPath: string, value: string) {
  return {
    fieldFilter: {
      field: { fieldPath },
      op: "EQUAL",
      value: { stringValue: value },
    },
  };
}

/**
 * Indies aprovados, ordenados por votos ou por data.
 * Espelha `fetchApprovedIndies` de indieService (inclusive a ordenação em JS,
 * que evita exigir índice composto no Firestore).
 */
export async function fetchApprovedIndiesServer(
  sortBy: "votes" | "recent" = "votes"
): Promise<IndieGame[]> {
  const games = await firestoreRestQuery<IndieGame>(INDIES_COLLECTION, {
    where: equals("status", "approved"),
  });

  if (sortBy === "votes") {
    return games.sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
  }
  return games.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Indie por id do documento ou por slug.
 * Espelha `fetchIndieBySlug`: tenta o id direto e, não achando, consulta o campo slug.
 */
export async function fetchIndieBySlugServer(slugOrId: string): Promise<IndieGame | null> {
  const direct = await firestoreRestGet<IndieGame>(INDIES_COLLECTION, slugOrId);
  if (direct) return direct;

  const bySlug = await firestoreRestQuery<IndieGame>(INDIES_COLLECTION, {
    where: equals("slug", slugOrId),
    limit: 1,
  });
  return bySlug[0] || null;
}

/**
 * Perfil público por username.
 * Espelha `getUserProfileByUsername` de firebase.ts, incluindo o fallback para
 * usernames antigos gravados com maiúsculas.
 */
export async function getUserProfileByUsernameServer(
  username: string
): Promise<UserProfile | null> {
  if (!username || !username.trim()) return null;

  const raw = username.trim();
  const clean = raw.toLowerCase();

  const found = await firestoreRestQuery<UserProfile>("users", {
    where: equals("username", clean),
    limit: 1,
  });
  if (found[0]) return found[0];

  if (clean !== raw) {
    const exact = await firestoreRestQuery<UserProfile>("users", {
      where: equals("username", raw),
      limit: 1,
    });
    if (exact[0]) return exact[0];
  }

  return null;
}
