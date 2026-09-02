import { Game } from "./types";
import {
  searchGamesIGDB,
  getRecentReleasesIGDB,
  getUpcomingGamesIGDB,
  getRankingsIGDB,
  getCalendarGamesIGDB,
  getGameDetailsIGDB,
} from "./igdbApi";
import { fetchHLTBData } from "./hltbApi";

// Função auxiliar para enriquecer uma lista de jogos com dados reais do HowLongToBeat em paralelo
async function enrichWithHLTB(games: Game[], maxCount = 12): Promise<Game[]> {
  return await Promise.all(
    games.map(async (game, index) => {
      if (index < maxCount && !game.hltb) {
        try {
          const hltb = await fetchHLTBData(game.name);
          return { ...game, hltb };
        } catch {
          return game;
        }
      }
      return game;
    })
  );
}

export async function searchGamesApi(
  query: string,
  page = 1,
  pageSize = 24
): Promise<{ games: Game[]; count: number }> {
  const games = await searchGamesIGDB(query, pageSize);
  const enriched = await enrichWithHLTB(games, 12);
  return {
    games: enriched,
    count: enriched.length,
  };
}

export async function getRecentReleasesApi(limit = 20): Promise<Game[]> {
  const games = await getRecentReleasesIGDB(limit);
  return await enrichWithHLTB(games, 12);
}

export async function getUpcomingGamesApi(limit = 20): Promise<Game[]> {
  const games = await getUpcomingGamesIGDB(limit);
  return await enrichWithHLTB(games, 12);
}

export async function getRankingsApi(
  category: "popular" | "top_rated" | "hyped" = "popular",
  limit = 20
): Promise<Game[]> {
  const games = await getRankingsIGDB(category, limit);
  return await enrichWithHLTB(games, 12);
}

export async function getCalendarGamesApi(
  year: number,
  month: number
): Promise<Record<string, Game[]>> {
  return await getCalendarGamesIGDB(year, month);
}

export async function getPopularGamesApi(limit = 20): Promise<Game[]> {
  const games = await getRankingsIGDB("popular", limit);
  return await enrichWithHLTB(games, 12);
}

export async function getGameDetailsApi(id: string | number): Promise<Game | null> {
  const game = await getGameDetailsIGDB(id);
  if (!game) return null;

  if (!game.hltb) {
    try {
      const hltb = await fetchHLTBData(game.name);
      game.hltb = hltb;
    } catch {
      // Ignora erro
    }
  }

  return game;
}
