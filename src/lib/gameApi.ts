import { Game } from "./types";
import {
  searchGamesIGDB,
  searchAndFilterGamesIGDB,
  getFilteredGamesCountIGDB,
  SearchFilterOptions,
  getRecentReleasesIGDB,
  getUpcomingGamesIGDB,
  getRankingsIGDB,
  getCalendarGamesIGDB,
  getGameDetailsIGDB,
  getGamesCountIGDB,
} from "./igdbApi";
import { fetchHLTBData } from "./hltbApi";
import { translateToPortuguese } from "./translate";
import { getStoredGameTranslations, saveGameTranslations } from "./translationsDb";

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

export interface SearchGamesApiOptions {
  query?: string;
  genreId?: number;
  genreIds?: number[];
  themeId?: number;
  platformId?: number;
  platformIds?: number[];
  minRating?: number;
  perspectiveId?: number;
  gameModeId?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export async function searchGamesApi(
  queryOrOptions: string | SearchGamesApiOptions,
  pageArg = 1,
  pageSizeArg = 36
): Promise<{ games: Game[]; count: number; total: number; page: number; hasMore: boolean }> {
  const options: SearchFilterOptions =
    typeof queryOrOptions === "string"
      ? { query: queryOrOptions }
      : {
          query: queryOrOptions.query || "",
          genreId: queryOrOptions.genreId,
          genreIds: queryOrOptions.genreIds,
          themeId: queryOrOptions.themeId,
          platformId: queryOrOptions.platformId,
          platformIds: queryOrOptions.platformIds,
          minRating: queryOrOptions.minRating,
          perspectiveId: queryOrOptions.perspectiveId,
          gameModeId: queryOrOptions.gameModeId,
          sort: queryOrOptions.sort,
        };

  const page = typeof queryOrOptions === "string" ? pageArg : queryOrOptions.page || 1;
  const pageSize = typeof queryOrOptions === "string" ? pageSizeArg : queryOrOptions.pageSize || 36;
  const offset = Math.max(0, (page - 1) * pageSize);

  const filterOpts: SearchFilterOptions = {
    ...options,
    limit: pageSize,
    offset,
  };

  const [games, totalCount] = await Promise.all([
    searchAndFilterGamesIGDB(filterOpts),
    page === 1 ? getFilteredGamesCountIGDB(filterOpts) : Promise.resolve(0),
  ]);
  const enriched = await enrichWithHLTB(games, 3);
  return {
    games: enriched,
    count: enriched.length,
    total: totalCount,
    page,
    hasMore: games.length >= pageSize,
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
  category: "popular" | "top_rated" | "hyped" | "ptbr" | "retro" | "short" = "popular",
  limit = 20
): Promise<Game[]> {
  const games = await getRankingsIGDB(category, limit);
  return await enrichWithHLTB(games, Math.min(limit, 5));
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

  // Tradução sob demanda persistida no banco (100% gratuita no Firestore para Sinopse e Enredo/Narrativa)
  try {
    const stored = await getStoredGameTranslations(id);

    // 1. Tradução da Sinopse / Sobre o Jogo (description_raw)
    if (stored.description) {
      game.description_raw = stored.description;
    } else if (game.description_raw) {
      const originalDesc = game.description_raw;
      const translatedDesc = await translateToPortuguese(originalDesc);
      if (translatedDesc) {
        game.description_raw = translatedDesc;
        if (translatedDesc !== originalDesc) {
          saveGameTranslations(id, {
            originalDescription: originalDesc,
            translatedDescription: translatedDesc,
            gameName: game.name,
          }).catch((err) =>
            console.warn("Aviso ao salvar tradução da sinopse no Firestore:", err)
          );
        }
      }
    }

    // 2. Tradução do Enredo & Narrativa (storyline)
    if (stored.storyline) {
      game.storyline = stored.storyline;
    } else if (game.storyline) {
      const originalStory = game.storyline;
      const translatedStory = await translateToPortuguese(originalStory);
      if (translatedStory) {
        game.storyline = translatedStory;
        if (translatedStory !== originalStory) {
          saveGameTranslations(id, {
            originalStoryline: originalStory,
            translatedStoryline: translatedStory,
            gameName: game.name,
          }).catch((err) =>
            console.warn("Aviso ao salvar tradução do enredo no Firestore:", err)
          );
        }
      }
    }
  } catch (e) {
    console.warn("Aviso na tradução do jogo:", e);
  }

  if (!game.hltb) {
    try {
      const hltb = await fetchHLTBData(game.name);
      game.hltb = hltb;
    } catch {}
  }

  return game;
}
