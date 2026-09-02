import { Game, GenreItem, PlatformItem } from "./types";
import { fetchHLTBData } from "./hltbApi";
import { MOCK_GAMES } from "./mockGames";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "dxjpoch3xjlzlunilwk63u9wtyc304";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";
const IGDB_API_URL = "https://api.igdb.com/v4";

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Obtém o Access Token da Twitch OAuth (Client Credentials Flow)
 */
async function getTwitchAccessToken(): Promise<string | null> {
  if (!TWITCH_CLIENT_ID) return null;

  // Retorna token em cache se ainda válido
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  // Se tiver o client_secret configurado, gera o token automaticamente
  if (TWITCH_CLIENT_SECRET) {
    try {
      const res = await fetch(
        `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
        { method: "POST" }
      );

      if (res.ok) {
        const data = await res.json();
        cachedToken = {
          token: data.access_token,
          expiresAt: Date.now() + (data.expires_in * 1000),
        };
        return cachedToken.token;
      } else {
        console.warn("Falha ao autenticar na Twitch:", await res.text());
      }
    } catch (err) {
      console.error("Erro na requisição OAuth da Twitch:", err);
    }
  }

  return null;
}

/**
 * Converte ID de imagem do IGDB em URL de alta resolução
 */
function getIGDBImageUrl(imageId: string | undefined, size: "cover_big" | "1080p" | "screenshot_huge" = "cover_big"): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

/**
 * Mapeia um objeto retornado pelo IGDB para o formato unificado Game
 */
function mapIGDBGameToGame(item: any): Game {
  const coverUrl = item.cover?.image_id
    ? getIGDBImageUrl(item.cover.image_id, "1080p")
    : (item.screenshots && item.screenshots[0]?.image_id)
    ? getIGDBImageUrl(item.screenshots[0].image_id, "1080p")
    : null;

  const genres: GenreItem[] = item.genres?.map((g: any) => ({
    id: g.id,
    name: g.name,
    slug: g.name.toLowerCase().replace(/\s+/g, "-"),
  })) || [];

  const platforms: PlatformItem[] = item.platforms?.map((p: any) => ({
    platform: {
      id: p.id,
      name: p.name,
      slug: p.name.toLowerCase().replace(/\s+/g, "-"),
    },
  })) || [];

  const releaseDate = item.first_release_date
    ? new Date(item.first_release_date * 1000).toISOString().split("T")[0]
    : null;

  // A nota agregada (aggregated_rating) no IGDB é a média da crítica (Metacritic/OpenCritic)
  const metacriticScore = item.aggregated_rating
    ? Math.round(item.aggregated_rating)
    : item.total_rating
    ? Math.round(item.total_rating)
    : null;

  return {
    id: item.id,
    slug: item.slug || String(item.id),
    name: item.name,
    released: releaseDate,
    background_image: coverUrl,
    rating: item.rating ? Number((item.rating / 20).toFixed(2)) : 4.0, // Converte 0-100 para 0-5
    metacritic: metacriticScore,
    playtime: 25,
    description_raw: item.summary || item.storyline || "Sem descrição disponível.",
    genres,
    platforms,
    hltb: null,
  };
}

/**
 * Busca jogos na API do IGDB
 */
export async function searchGamesIGDB(query: string, limit = 20): Promise<Game[]> {
  const token = await getTwitchAccessToken();

  if (token) {
    try {
      const escapedQuery = query.replace(/"/g, "");
      const body = `
        fields name, slug, summary, storyline, cover.image_id, first_release_date, 
               genres.name, platforms.name, aggregated_rating, total_rating, rating, 
               screenshots.image_id;
        search "${escapedQuery}";
        limit ${limit};
      `;

      const res = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body,
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        return data.map(mapIGDBGameToGame);
      } else {
        console.warn("Erro ao buscar no IGDB:", await res.text());
      }
    } catch (err) {
      console.error("Exceção na busca do IGDB:", err);
    }
  }

  // Fallback para o catálogo local
  const q = query.toLowerCase().trim();
  return MOCK_GAMES.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.genres.some((genre) => genre.name.toLowerCase().includes(q))
  );
}

/**
 * Retorna jogos populares / aclamados pelo IGDB
 */
export async function getPopularGamesIGDB(limit = 24): Promise<Game[]> {
  const token = await getTwitchAccessToken();

  if (token) {
    try {
      const body = `
        fields name, slug, summary, storyline, cover.image_id, first_release_date, 
               genres.name, platforms.name, aggregated_rating, total_rating, rating, 
               screenshots.image_id;
        where aggregated_rating != null & cover != null & total_rating_count > 50;
        sort aggregated_rating desc;
        limit ${limit};
      `;

      const res = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body,
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const data = await res.json();
        return data.map(mapIGDBGameToGame);
      }
    } catch (err) {
      console.error("Erro ao buscar populares no IGDB:", err);
    }
  }

  return MOCK_GAMES;
}

/**
 * Obtém detalhes completos de um jogo pelo ID no IGDB
 */
export async function getGameDetailsIGDB(id: string | number): Promise<Game | null> {
  const token = await getTwitchAccessToken();

  if (token && !isNaN(Number(id))) {
    try {
      const body = `
        fields name, slug, summary, storyline, cover.image_id, first_release_date, 
               genres.name, platforms.name, aggregated_rating, total_rating, rating, 
               screenshots.image_id, involved_companies.company.name;
        where id = ${id};
        limit 1;
      `;

      const res = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body,
        next: { revalidate: 86400 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          return mapIGDBGameToGame(data[0]);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar jogo no IGDB:", err);
    }
  }

  return MOCK_GAMES.find((g) => String(g.id) === String(id) || g.slug === String(id)) || null;
}
