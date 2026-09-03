/**
 * Utilitários centralizados para geração de URLs semânticas no GameVault.
 */

/**
 * Converte qualquer texto ou título em slug amigável para URLs.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // remove caracteres especiais
    .trim()
    .replace(/\s+/g, "-") // substitui espaços por hífens
    .replace(/-+/g, "-"); // remove hífens duplicados
}

export interface GameLinkParams {
  id: number | string;
  slug?: string | null;
  name?: string | null;
  title?: string | null;
}

/**
 * Retorna a URL canônica e semântica de um jogo no formato: /game/[id]/[slug]
 * Exemplo: /game/1942/the-witcher-3-wild-hunt
 */
export function getGameUrl(game: GameLinkParams): string {
  const id = String(game.id).trim();
  const slug = game.slug
    ? String(game.slug).trim()
    : game.name
    ? slugify(game.name)
    : game.title
    ? slugify(game.title)
    : "jogo";

  return `/game/${id}/${slug}`;
}

/**
 * Retorna a URL canônica e semântica de perfil de usuário.
 * Se nenhum username for fornecido, retorna a rota do próprio perfil /perfil.
 * Exemplo: /perfil/leandrogazoli
 */
export function getProfileUrl(username?: string | null): string {
  if (!username) {
    return "/perfil";
  }
  return `/perfil/${encodeURIComponent(username.trim())}`;
}
