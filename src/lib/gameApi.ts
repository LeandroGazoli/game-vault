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
import { translateToPortuguese } from "./translate";

// Função auxiliar para enriquecer uma lista de jogos com dados reais do HowLongToBeat e tradução
async function enrichWithHLTBAndTranslation(games: Game[], maxCount = 12): Promise<Game[]> {
  return await Promise.all(
    games.map(async (game, index) => {
      let hltb = game.hltb;
      let description_raw = game.description_raw;

      if (index < maxCount) {
        if (!hltb) {
          try {
            hltb = await fetchHLTBData(game.name);
          } catch {}
        }
        if (description_raw && description_raw.length > 0) {
          try {
            description_raw = await translateToPortuguese(description_raw);
          } catch {}
        }
      }

      return {
        ...game,
        hltb: hltb || null,
        description_raw: description_raw || game.description_raw,
      };
    })
  );
}

export async function searchGamesApi(
  query: string,
  page = 1,
  pageSize = 24
): Promise<{ games: Game[]; count: number }> {
  const games = await searchGamesIGDB(query, pageSize);
  const enriched = await enrichWithHLTBAndTranslation(games, 12);
  return {
    games: enriched,
    count: enriched.length,
  };
}

export async function getRecentReleasesApi(limit = 20): Promise<Game[]> {
  const games = await getRecentReleasesIGDB(limit);
  return await enrichWithHLTBAndTranslation(games, 12);
}

export async function getUpcomingGamesApi(limit = 20): Promise<Game[]> {
  const games = await getUpcomingGamesIGDB(limit);
  return await enrichWithHLTBAndTranslation(games, 12);
}

export async function getRankingsApi(
  category: "popular" | "top_rated" | "hyped" = "popular",
  limit = 20
): Promise<Game[]> {
  const games = await getRankingsIGDB(category, limit);
  return await enrichWithHLTBAndTranslation(games, 12);
}

export async function getCalendarGamesApi(
  year: number,
  month: number
): Promise<Record<string, Game[]>> {
  return await getCalendarGamesIGDB(year, month);
}

export async function getPopularGamesApi(limit = 20): Promise<Game[]> {
  const games = await getRankingsIGDB("popular", limit);
  return await enrichWithHLTBAndTranslation(games, 12);
}

export async function getGameDetailsApi(id: string | number): Promise<Game | null> {
  const game = await getGameDetailsIGDB(id);
  if (!game) return null;

  // Tradução em tempo real da sinopse e detalhes para Português (PT-BR)
  if (game.description_raw) {
    try {
      game.description_raw = await translateToPortuguese(game.description_raw);
      
    } catch (e) {
      console.warn("Aviso na tradução do jogo:", e);
    }
  }

  if (!game.hltb) {
    try {
      const hltb = await fetchHLTBData(game.name);
      game.hltb = hltb;
    } catch {}
  }

  return game;
}
