import { HLTBData } from "./types";

const MAX_HLTB_CACHE = 500;
const cache = new Map<string, { data: HLTBData | null; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 horas

function setHltbCache(key: string, data: HLTBData | null) {
  if (cache.size >= MAX_HLTB_CACHE) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
}

let tokenCache: { token: string; hpKey: string; hpVal: string; timestamp: number } | null = null;

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function getHltbHandshake(force = false) {
  if (tokenCache && !force && Date.now() - tokenCache.timestamp < 1000 * 60 * 15) {
    return tokenCache;
  }

  try {
    const res = await fetch(`https://howlongtobeat.com/api/search/site/init?t=${Date.now()}`, {
      headers: {
        "User-Agent": USER_AGENT,
        Referer: "https://howlongtobeat.com/",
      },
    });

    if (res.ok) {
      const { token, hpKey, hpVal } = await res.json();
      tokenCache = { token, hpKey, hpVal, timestamp: Date.now() };
      return tokenCache;
    }
  } catch (err) {
    console.warn("Erro no handshake do HowLongToBeat:", err);
  }
  return null;
}

export async function fetchHLTBData(gameName: string): Promise<HLTBData | null> {
  if (!gameName) return null;

  const normalized = gameName.trim().toLowerCase();

  // 1. Verifica no Cache
  const cached = cache.get(normalized);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Limpeza de sufixos de edições para maior taxa de acerto
  const cleanName = gameName
    .replace(/\s*\([^)]*\)/g, "")
    .replace(/\s*\[[^\]]*\]/g, "")
    .replace(/:\s*Definitive Edition/i, "")
    .replace(/:\s*Enhanced Edition/i, "")
    .replace(/:\s*Game of the Year Edition/i, "")
    .replace(/:\s*Special Edition/i, "")
    .replace(/:\s*Remastered/i, "")
    .replace(/:\s*Remake/i, "")
    .trim();

  try {
    let handshake = await getHltbHandshake();
    if (!handshake) {
      handshake = await getHltbHandshake(true);
    }

    if (!handshake) return null;

    const searchTerm = cleanName || gameName;
    const searchPayload: Record<string, any> = {
      searchType: "games",
      searchTerms: searchTerm.trim().split(" "),
      searchPage: 1,
      size: 10,
      searchOptions: {
        games: {
          userId: 0,
          platform: "",
          sortCategory: "popular",
          rangeCategory: "main",
          rangeTime: { min: null, max: null },
          gameplay: { perspective: "", flow: "", genre: "", difficulty: "" },
          modifier: "",
        },
        users: { sortCategory: "postcount" },
        lists: { sortCategory: "follows" },
        filter: "",
        sort: 0,
        randomizer: 0,
      },
      useCache: true,
    };

    if (handshake.hpKey && handshake.hpVal) {
      searchPayload[handshake.hpKey] = handshake.hpVal;
    }

    let searchRes = await fetch("https://howlongtobeat.com/api/search/site", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
        Referer: "https://howlongtobeat.com/",
        "x-auth-token": handshake.token,
        ...(handshake.hpKey ? { "x-hp-key": handshake.hpKey, "x-hp-val": handshake.hpVal } : {}),
      },
      body: JSON.stringify(searchPayload),
    });

    // Se 403, tenta renovar o token
    if (searchRes.status === 403) {
      handshake = await getHltbHandshake(true);
      if (handshake) {
        if (handshake.hpKey && handshake.hpVal) {
          searchPayload[handshake.hpKey] = handshake.hpVal;
        }
        searchRes = await fetch("https://howlongtobeat.com/api/search/site", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT,
            Referer: "https://howlongtobeat.com/",
            "x-auth-token": handshake.token,
            ...(handshake.hpKey ? { "x-hp-key": handshake.hpKey, "x-hp-val": handshake.hpVal } : {}),
          },
          body: JSON.stringify(searchPayload),
        });
      }
    }

    if (searchRes.ok) {
      const resultData = await searchRes.json();
      const games = resultData.data || [];

      if (games.length > 0) {
        const best = games[0];
        
        // HLTB retorna tempos em segundos (divide por 3600 para obter horas)
        const mainStoryHours = best.comp_main > 0 ? Math.round(best.comp_main / 3600) : null;
        const mainExtraHours = best.comp_plus > 0 ? Math.round(best.comp_plus / 3600) : null;
        const completionistHours = best.comp_100 > 0 ? Math.round(best.comp_100 / 3600) : null;

        const data: HLTBData = {
          gameTitle: best.game_name,
          mainStory: mainStoryHours,
          mainExtra: mainExtraHours,
          completionist: completionistHours,
          source: "HowLongToBeat",
        };

        setHltbCache(normalized, data);
        return data;
      }
    }
    setHltbCache(normalized, null);
  } catch (error) {
    console.warn(`Aviso HLTB para "${gameName}":`, error);
  }

  return null;
}
