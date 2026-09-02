import { Game, GenreItem, PlatformItem } from "./types";

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

export function getIGDBImageUrl(imageId: string | undefined, size: "cover_big" | "1080p" | "720p" | "screenshot_big" = "cover_big"): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

export function mapIGDBGameToGame(item: any): Game {
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

  const scoreFormatted = item.rating
    ? Number((item.rating / 10).toFixed(1))
    : item.aggregated_rating
    ? Number((item.aggregated_rating / 10).toFixed(1))
    : 8.0;

  return {
    id: item.id,
    slug: item.slug || String(item.id),
    name: item.name,
    released: releaseDate,
    background_image: coverUrl,
    rating: scoreFormatted,
    metacritic: metacriticScore,
    playtime: item.total_rating_count || item.hypes || 30,
    description_raw: item.summary || item.storyline || "Sem sinopse disponível no momento.",
    genres,
    platforms,
    hltb: null,
  };
}

async function fetchIGDB(endpoint: string, body: string, revalidate = 1800): Promise<any[]> {
  const token = await getTwitchAccessToken();
  if (!token) return [];

  try {
    const res = await fetch(`${IGDB_API_URL}/${endpoint}`, {
      method: "POST",
      headers: {
        "Client-ID": TWITCH_CLIENT_ID,
        "Authorization": `Bearer ${token}`,
        "Content-Type": "text/plain",
      },
      body,
      next: { revalidate },
    });

    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } else {
      console.warn(`Erro IGDB (${endpoint}):`, res.status, await res.text());
    }
  } catch (err) {
    console.error(`Exceção IGDB (${endpoint}):`, err);
  }

  return [];
}

// 1. Busca Geral no IGDB
export async function searchGamesIGDB(query: string, limit = 20): Promise<Game[]> {
  const escapedQuery = query.replace(/"/g, "").trim();
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id; search "${escapedQuery}"; limit ${limit};`;
  const data = await fetchIGDB("games", body, 0);
  return data.map(mapIGDBGameToGame);
}

// 2. Lançamentos Recentes (Últimos 60 dias)
export async function getRecentReleasesIGDB(limit = 24): Promise<Game[]> {
  const nowSec = Math.floor(Date.now() / 1000);
  const sixtyDaysAgo = nowSec - (60 * 24 * 60 * 60);
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id; where first_release_date <= ${nowSec} & first_release_date >= ${sixtyDaysAgo} & cover != null; sort first_release_date desc; limit ${limit};`;
  const data = await fetchIGDB("games", body, 1800);
  return data.map(mapIGDBGameToGame);
}

// 3. Em Breve (Próximos Lançamentos)
export async function getUpcomingGamesIGDB(limit = 24): Promise<Game[]> {
  const nowSec = Math.floor(Date.now() / 1000);
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, hypes, screenshots.image_id; where first_release_date > ${nowSec} & cover != null; sort first_release_date asc; limit ${limit};`;
  const data = await fetchIGDB("games", body, 1800);
  return data.map(mapIGDBGameToGame);
}

// 4. Rankings MGL (Mais Populares, Mais Bem Avaliados, Mais Desejados)
export async function getRankingsIGDB(category: "popular" | "top_rated" | "hyped" = "popular", limit = 20): Promise<Game[]> {
  let body = "";
  const nowSec = Math.floor(Date.now() / 1000);

  if (category === "top_rated") {
    body = `fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating; where aggregated_rating != null & total_rating_count > 40 & cover != null; sort aggregated_rating desc; limit ${limit};`;
  } else if (category === "hyped") {
    body = `fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, hypes, rating; where hypes != null & hypes > 0 & cover != null & first_release_date > ${nowSec}; sort hypes desc; limit ${limit};`;
  } else {
    // Mais populares por contagem total de avaliações e relevância
    body = `fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, total_rating_count, rating, aggregated_rating; where total_rating_count > 100 & cover != null; sort total_rating_count desc; limit ${limit};`;
  }

  const data = await fetchIGDB("games", body, 3600);
  return data.map(mapIGDBGameToGame);
}

// 5. Calendário de Lançamentos (Jogos de um mês específico agrupados por dia)
export async function getCalendarGamesIGDB(year: number, month: number): Promise<Record<string, Game[]>> {
  // month: 1 a 12
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  const startSec = Math.floor(startDate.getTime() / 1000);
  const endSec = Math.floor(endDate.getTime() / 1000);

  const body = `fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, hypes, aggregated_rating; where first_release_date >= ${startSec} & first_release_date <= ${endSec} & cover != null; sort first_release_date asc; limit 100;`;
  const data = await fetchIGDB("games", body, 3600);

  const grouped: Record<string, Game[]> = {};

  data.forEach((item) => {
    if (item.first_release_date) {
      const dateKey = new Date(item.first_release_date * 1000).toISOString().split("T")[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(mapIGDBGameToGame(item));
    }
  });

  return grouped;
}

// 6. Detalhes de um Jogo por ID
export async function getGameDetailsIGDB(id: string | number): Promise<Game | null> {
  if (isNaN(Number(id))) return null;
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id, involved_companies.company.name; where id = ${id}; limit 1;`;
  const data = await fetchIGDB("games", body, 86400);
  if (data.length > 0) return mapIGDBGameToGame(data[0]);
  return null;
}
