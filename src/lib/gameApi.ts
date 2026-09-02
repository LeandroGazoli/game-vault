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

export async function searchGamesApi(
  query: string,
  page = 1,
  pageSize = 24
): Promise<{ games: Game[]; count: number }> {
  const games = await searchGamesIGDB(query, pageSize);

  // Enriquece os primeiros 6 jogos com dados do HowLongToBeat
  const enrichedGames = await Promise.all(
    games.map(async (game, index) => {
      if (index < 6 && !game.hltb) {
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

  return {
    games: enrichedGames,
    count: enrichedGames.length,
  };
}

export async function getRecentReleasesApi(limit = 20): Promise<Game[]> {
  const games = await getRecentReleasesIGDB(limit);
  return games;
}

export async function getUpcomingGamesApi(limit = 20): Promise<Game[]> {
  const games = await getUpcomingGamesIGDB(limit);
  return games;
}

export async function getRankingsApi(category: "popular" | "top_rated" | "hyped" = "popular", limit = 20): Promise<Game[]> {
  const games = await getRankingsIGDB(category, limit);
  return games;
}

export async function getCalendarGamesApi(year: number, month: number): Promise<Record<string, Game[]>> {
  return await getCalendarGamesIGDB(year, month);
}

export async function getPopularGamesApi(limit = 20): Promise<Game[]> {
  const games = await getRankingsIGDB("popular", limit);
  return games;
}

export async function getGameDetailsApi(id: string | number): Promise<Game | null> {
  const game = await getGameDetailsIGDB(id);
  if (!game) return null;

  if (!game.hltb) {
    try {
      const hltb = await fetchHLTBData(game.name);
      game.hltb = hltb;
    } catch {
      // Ignora erro no HLTB se offline
    }
  }

  return game;
}
