import { Game, GenreItem, PlatformItem } from "./types";
import { MOCK_GAMES } from "./mockGames";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "nn3y51ox7m6a7knczssqz8j593y7dd";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "ggfnhzk9cjm0wc8lubdh31s7bl2ud6";
const IGDB_API_URL = "https://api.igdb.com/v4";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getTwitchAccessToken(): Promise<string | null> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

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

  return null;
}

function getIGDBImageUrl(imageId: string | undefined, size: "cover_big" | "1080p" | "720p" = "cover_big"): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

function mapIGDBGameToGame(item: any): Game {
  const coverUrl = item.cover?.image_id
    ? getIGDBImageUrl(item.cover.image_id, "cover_big")
    : (item.screenshots && item.screenshots[0]?.image_id)
    ? getIGDBImageUrl(item.screenshots[0].image_id, "720p")
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

  const metacriticScore = item.aggregated_rating
    ? Math.round(item.aggregated_rating)
    : item.total_rating
    ? Math.round(item.total_rating)
    : item.rating
    ? Math.round(item.rating)
    : null;

  return {
    id: item.id,
    slug: item.slug || String(item.id),
    name: item.name,
    released: releaseDate,
    background_image: coverUrl,
    rating: item.rating ? Number((item.rating / 20).toFixed(2)) : 4.0,
    metacritic: metacriticScore,
    playtime: 30,
    description_raw: item.summary || item.storyline || "Sem sinopse disponível no momento.",
    genres,
    platforms,
    hltb: null,
  };
}

export async function searchGamesIGDB(query: string, limit = 20): Promise<Game[]> {
  const token = await getTwitchAccessToken();

  if (token) {
    try {
      const escapedQuery = query.replace(/"/g, "").trim();
      const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id; search "${escapedQuery}"; limit ${limit};`;

      const res = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(mapIGDBGameToGame);
        }
      } else {
        console.warn("Erro no status IGDB:", res.status, await res.text());
      }
    } catch (err) {
      console.error("Exceção na busca do IGDB:", err);
    }
  }

  const q = query.toLowerCase().trim();
  return MOCK_GAMES.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.genres.some((genre) => genre.name.toLowerCase().includes(q))
  );
}

export async function getPopularGamesIGDB(limit = 24): Promise<Game[]> {
  const token = await getTwitchAccessToken();

  if (token) {
    try {
      const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id; where aggregated_rating != null & cover != null & total_rating_count > 20; sort aggregated_rating desc; limit ${limit};`;

      const res = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return data.map(mapIGDBGameToGame);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar populares no IGDB:", err);
    }
  }

  return MOCK_GAMES;
}

export async function getGameDetailsIGDB(id: string | number): Promise<Game | null> {
  const token = await getTwitchAccessToken();

  if (token && !isNaN(Number(id))) {
    try {
      const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id, involved_companies.company.name; where id = ${id}; limit 1;`;

      const res = await fetch(`${IGDB_API_URL}/games`, {
        method: "POST",
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body,
        cache: "no-store",
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          return mapIGDBGameToGame(data[0]);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar jogo no IGDB:", err);
    }
  }

  return MOCK_GAMES.find((g) => String(g.id) === String(id) || g.slug === String(id)) || null;
}
