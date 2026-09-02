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

// Função auxiliar otimizada para enriquecer listas de jogos rapidamente com HowLongToBeat
// OBS: Traduções de sinopse NÃO são executadas em listas para máxima velocidade e zero latência;
// a tradução completa é realizada apenas na página detalhada do jogo (getGameDetailsApi).
async function enrichWithHLTB(games: Game[], maxCount = 4): Promise<Game[]> {
  return await Promise.all(
    games.map(async (game, index) => {
      let hltb = game.hltb;

      // Enriquece apenas os primeiros jogos para exibição de horas no card (ex: Top 3)
      if (index < maxCount && !hltb) {
        try {
          // Timeout de 500ms para nunca bloquear a renderização da página
          const hltbPromise = fetchHLTBData(game.name);
          const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 500));
          hltb = await Promise.race([hltbPromise, timeoutPromise]);
        } catch {}
      }

      return {
        ...game,
        hltb: hltb || null,
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
  const enriched = await enrichWithHLTB(games, 3);
  return {
    games: enriched,
    count: enriched.length,
  };
}

export async function getRecentReleasesApi(limit = 20): Promise<Game[]> {
  const games = await getRecentReleasesIGDB(limit);
  return await enrichWithHLTB(games, 3);
}

export async function getUpcomingGamesApi(limit = 20): Promise<Game[]> {
  const games = await getUpcomingGamesIGDB(limit);
  return await enrichWithHLTB(games, 3);
}

export async function getRankingsApi(
  category: "popular" | "top_rated" | "hyped" = "popular",
  limit = 20
): Promise<Game[]> {
  const games = await getRankingsIGDB(category, limit);
  return await enrichWithHLTB(games, 3);
}

export async function getCalendarGamesApi(
  year: number,
  month: number
): Promise<Record<string, Game[]>> {
  return await getCalendarGamesIGDB(year, month);
}

export async function getPopularGamesApi(limit = 20): Promise<Game[]> {
  const games = await getRankingsIGDB("popular", limit);
  return await enrichWithHLTB(games, 3);
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
