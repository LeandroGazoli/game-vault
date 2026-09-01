import { Game } from "./types";
import { MOCK_GAMES } from "./mockGames";

const RAWG_BASE_URL = "https://api.rawg.io/api";
const RAWG_API_KEY = process.env.NEXT_PUBLIC_RAWG_API_KEY || "";

export async function searchGamesApi(query: string, page = 1): Promise<{ games: Game[]; count: number }> {
  if (!query || query.trim().length === 0) {
    return { games: MOCK_GAMES, count: MOCK_GAMES.length };
  }

  const q = query.trim().toLowerCase();

  // Se tiver chave do RAWG válida, tenta buscar da API externa
  if (RAWG_API_KEY && RAWG_API_KEY !== "your_rawg_api_key_here") {
    try {
      const res = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&search=${encodeURIComponent(query)}&page=${page}&page_size=20&search_precise=true`,
        { next: { revalidate: 3600 } }
      );

      if (res.ok) {
        const data = await res.json();
        const games: Game[] = data.results.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          released: item.released,
          background_image: item.background_image,
          rating: item.rating,
          rating_top: item.rating_top,
          metacritic: item.metacritic,
          playtime: item.playtime,
          genres: item.genres?.map((g: any) => ({ id: g.id, name: g.name, slug: g.slug })) || [],
          platforms: item.platforms?.map((p: any) => ({
            platform: { id: p.platform.id, name: p.platform.name, slug: p.platform.slug },
          })) || [],
        }));

        return { games, count: data.count };
      }
    } catch (err) {
      console.warn("Erro ao buscar na API do RAWG, usando catálogo local:", err);
    }
  }

  // Fallback para filtro local na base de dados simulada
  const filtered = MOCK_GAMES.filter(
    (g) =>
      g.name.toLowerCase().includes(q) ||
      g.genres.some((genre) => genre.name.toLowerCase().includes(q))
  );

  return { games: filtered, count: filtered.length };
}

export async function getPopularGamesApi(): Promise<Game[]> {
  if (RAWG_API_KEY && RAWG_API_KEY !== "your_rawg_api_key_here") {
    try {
      const res = await fetch(
        `${RAWG_BASE_URL}/games?key=${RAWG_API_KEY}&ordering=-metacritic&page_size=24`,
        { next: { revalidate: 86400 } }
      );
      if (res.ok) {
        const data = await res.json();
        return data.results.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          name: item.name,
          released: item.released,
          background_image: item.background_image,
          rating: item.rating,
          metacritic: item.metacritic,
          playtime: item.playtime,
          genres: item.genres?.map((g: any) => ({ id: g.id, name: g.name, slug: g.slug })) || [],
          platforms: item.platforms?.map((p: any) => ({
            platform: { id: p.platform.id, name: p.platform.name, slug: p.platform.slug },
          })) || [],
        }));
      }
    } catch (err) {
      console.warn("Falha ao buscar populares do RAWG:", err);
    }
  }

  return MOCK_GAMES;
}

export async function getGameDetailsApi(idOrSlug: string | number): Promise<Game | null> {
  // Procura primeiro no mock
  const local = MOCK_GAMES.find(
    (g) => String(g.id) === String(idOrSlug) || g.slug === String(idOrSlug)
  );

  if (RAWG_API_KEY && RAWG_API_KEY !== "your_rawg_api_key_here") {
    try {
      const res = await fetch(
        `${RAWG_BASE_URL}/games/${idOrSlug}?key=${RAWG_API_KEY}`,
        { next: { revalidate: 86400 } }
      );
      if (res.ok) {
        const item = await res.json();
        const game: Game = {
          id: item.id,
          slug: item.slug,
          name: item.name,
          released: item.released,
          background_image: item.background_image,
          rating: item.rating,
          metacritic: item.metacritic,
          metacritic_url: item.metacritic_url,
          playtime: item.playtime,
          description_raw: item.description_raw || item.description,
          genres: item.genres?.map((g: any) => ({ id: g.id, name: g.name, slug: g.slug })) || [],
          platforms: item.platforms?.map((p: any) => ({
            platform: { id: p.platform.id, name: p.platform.name, slug: p.platform.slug },
          })) || [],
          developers: item.developers?.map((d: any) => ({ id: d.id, name: d.name })) || [],
          publishers: item.publishers?.map((p: any) => ({ id: p.id, name: p.name })) || [],
          hltb: local?.hltb || null,
        };
        return game;
      }
    } catch (err) {
      console.warn("Erro ao buscar detalhes no RAWG:", err);
    }
  }

  return local || null;
}
