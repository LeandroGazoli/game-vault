import { Game } from "./types";
import { searchGamesIGDB, getPopularGamesIGDB, getGameDetailsIGDB } from "./igdbApi";
import { fetchHLTBData } from "./hltbApi";
import { MOCK_GAMES } from "./mockGames";

export async function searchGamesApi(query: string, page = 1): Promise<{ games: Game[]; count: number }> {
  if (!query || query.trim().length === 0) {
    return { games: MOCK_GAMES, count: MOCK_GAMES.length };
  }

  const igdbResults = await searchGamesIGDB(query, 20);

  // Enriquece com tempos do HowLongToBeat sob demanda
  const enrichedGames = await Promise.all(
    igdbResults.map(async (game) => {
      if (!game.hltb) {
        const hltb = await fetchHLTBData(game.name);
        return { ...game, hltb };
      }
      return game;
    })
  );

  return { games: enrichedGames, count: enrichedGames.length };
}

export async function getPopularGamesApi(): Promise<Game[]> {
  const games = await getPopularGamesIGDB(24);
  
  // Enriquece os primeiros com tempos do HLTB
  const enriched = await Promise.all(
    games.slice(0, 12).map(async (game) => {
      if (!game.hltb) {
        const hltb = await fetchHLTBData(game.name);
        return { ...game, hltb };
      }
      return game;
    })
  );

  return [...enriched, ...games.slice(12)];
}

export async function getGameDetailsApi(idOrSlug: string | number): Promise<Game | null> {
  const game = await getGameDetailsIGDB(idOrSlug);
  if (!game) return null;

  if (!game.hltb) {
    const hltb = await fetchHLTBData(game.name);
    game.hltb = hltb;
  }

  return game;
}
