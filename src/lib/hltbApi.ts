import { HowLongToBeatService, HowLongToBeatEntry } from "howlongtobeat";
import { HLTBData } from "./types";
import { MOCK_GAMES } from "./mockGames";

const hltbService = new HowLongToBeatService();

const cache = new Map<string, { data: HLTBData | null; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24;

export async function fetchHLTBData(gameName: string): Promise<HLTBData | null> {
  if (!gameName) return null;

  const normalized = gameName.trim().toLowerCase();
  
  // 1. Verifica no Cache
  const cached = cache.get(normalized);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // 2. Verifica se corresponde a algum jogo no catálogo local (fuzzy match)
  const localMatch = MOCK_GAMES.find((g) => {
    const gn = g.name.toLowerCase();
    return (
      gn === normalized ||
      gn.includes(normalized) ||
      normalized.includes(gn) ||
      g.slug.replace(/-/g, " ").includes(normalized)
    );
  });

  if (localMatch && localMatch.hltb) {
    cache.set(normalized, { data: localMatch.hltb, timestamp: Date.now() });
    return localMatch.hltb;
  }

  // 3. Tenta buscar ao vivo no serviço HowLongToBeat
  try {
    const cleanName = gameName
      .replace(/\s*\([^)]*\)/g, "")
      .replace(/\s*\[[^\]]*\]/g, "")
      .replace(/:\s*Definitive Edition/i, "")
      .replace(/:\s*Enhanced Edition/i, "")
      .replace(/:\s*Game of the Year Edition/i, "")
      .replace(/:\s*Special Edition/i, "")
      .trim();

    const results: HowLongToBeatEntry[] = await hltbService.search(cleanName || gameName);

    if (results && results.length > 0) {
      const best = results[0];
      const data: HLTBData = {
        gameTitle: best.name,
        mainStory: best.gameplayMain > 0 ? Math.round(best.gameplayMain) : null,
        mainExtra: best.gameplayMainExtra > 0 ? Math.round(best.gameplayMainExtra) : null,
        completionist: best.gameplayCompletionist > 0 ? Math.round(best.gameplayCompletionist) : null,
        source: "HowLongToBeat",
      };

      cache.set(normalized, { data, timestamp: Date.now() });
      return data;
    }
  } catch (error) {
    console.warn(`Erro ao buscar HLTB para "${gameName}":`, error);
  }

  // 4. Estimativa inteligente baseada em tempo médio se não encontrado
  const fallbackData: HLTBData = {
    gameTitle: gameName,
    mainStory: 25,
    mainExtra: 45,
    completionist: 80,
    source: "Estimativa",
  };

  cache.set(normalized, { data: fallbackData, timestamp: Date.now() });
  return fallbackData;
}
