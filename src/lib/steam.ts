import { SteamGameItem } from "./types";

export interface ResolvedSteamProfile {
  steamId64: string | null;
  personaname?: string;
  avatarUrl?: string;
  profileUrl?: string;
  customURL?: string;
  isPrivate?: boolean;
}

/**
 * Obtém a chave da Steam Web API configurada nas variáveis de ambiente
 */
export function getSteamApiKey(userProvidedKey?: string): string {
  return (userProvidedKey || process.env.STEAM_API_KEY || "").trim();
}

/**
 * Extrai o identificador ou vanity name a partir de uma entrada do usuário
 * (URL completa, SteamID64 ou apelido customizado)
 */
export function parseSteamInput(input: string): {
  steamId64: string | null;
  vanity: string | null;
} {
  const clean = input.trim();
  if (!clean) return { steamId64: null, vanity: null };

  // 1. Se já for puramente 17 dígitos (formato SteamID64 padrão)
  if (/^\d{17}$/.test(clean)) {
    return { steamId64: clean, vanity: null };
  }

  // 2. Se for uma URL completa /profiles/7656119...
  const profilesMatch = clean.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profilesMatch && profilesMatch[1]) {
    return { steamId64: profilesMatch[1], vanity: null };
  }

  // 3. Se for uma URL /id/vanity_name
  const idMatch = clean.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  if (idMatch && idMatch[1]) {
    return { steamId64: null, vanity: idMatch[1] };
  }

  // 4. Caso contrário, trata a string limpa como possível vanity URL
  const sanitizedVanity = clean
    .replace(/^https?:\/\//i, "")
    .replace(/^steamcommunity\.com\/?/i, "")
    .replace(/^\/?(id|profiles)\/?/i, "")
    .replace(/\/$/, "")
    .trim();

  if (/^\d{17}$/.test(sanitizedVanity)) {
    return { steamId64: sanitizedVanity, vanity: null };
  }

  return { steamId64: null, vanity: sanitizedVanity || null };
}

/**
 * Resolve qualquer entrada (URL ou apelido) para um SteamID64 usando a Steam Web API oficial
 * com fallback para o XML da comunidade.
 */
export async function resolveSteamId64(
  input: string,
  apiKey?: string
): Promise<string | null> {
  const parsed = parseSteamInput(input);
  if (parsed.steamId64) {
    return parsed.steamId64;
  }

  if (!parsed.vanity) {
    return null;
  }

  const key = getSteamApiKey(apiKey);

  // 1. Tenta a API Oficial da Valve: ISteamUser/ResolveVanityURL/v0001/
  if (key) {
    try {
      const url = new URL("https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/");
      url.searchParams.set("key", key);
      url.searchParams.set("vanityurl", parsed.vanity);

      const res = await fetch(url.toString(), {
        next: { revalidate: 3600 },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.response?.success === 1 && data.response.steamid) {
          return String(data.response.steamid);
        }
      }
    } catch (err) {
      console.warn("[Steam API] Falha no ResolveVanityURL oficial:", err);
    }
  }

  // 2. Fallback: Consulta endpoint XML público da Comunidade Steam
  try {
    const xmlUrl = `https://steamcommunity.com/id/${encodeURIComponent(parsed.vanity)}/?xml=1`;
    const res = await fetch(xmlUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const xml = await res.text();
      const steamIdMatch = xml.match(/<steamID64>(\d{17})<\/steamID64>/);
      if (steamIdMatch && steamIdMatch[1]) {
        return steamIdMatch[1];
      }
    }
  } catch (err) {
    console.error("[Steam XML] Erro ao resolver vanity URL:", err);
  }

  return null;
}

/**
 * Obtém resumo e avatar do jogador usando ISteamUser/GetPlayerSummaries/v0002/
 */
export async function getSteamPlayerSummary(
  steamId64: string,
  apiKey?: string
): Promise<ResolvedSteamProfile> {
  const key = getSteamApiKey(apiKey);

  // 1. Tenta a API Oficial da Valve: ISteamUser/GetPlayerSummaries/v0002/
  if (key) {
    try {
      const url = new URL("https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/");
      url.searchParams.set("key", key);
      url.searchParams.set("steamids", steamId64);

      const res = await fetch(url.toString(), {
        next: { revalidate: 1800 },
      });

      if (res.ok) {
        const data = await res.json();
        const player = data.response?.players?.[0];
        if (player) {
          // communityvisibilitystate: 1 = Private, 3 = Public
          const isPrivate = player.communityvisibilitystate !== 3;
          return {
            steamId64,
            personaname: player.personaname || `Steam Gamer (${steamId64})`,
            avatarUrl: player.avatarfull || player.avatarmedium || player.avatar,
            profileUrl: player.profileurl || `https://steamcommunity.com/profiles/${steamId64}`,
            isPrivate,
          };
        }
      }
    } catch (err) {
      console.warn("[Steam API] Falha no GetPlayerSummaries:", err);
    }
  }

  // 2. Fallback: Perfil XML público
  try {
    const xmlUrl = `https://steamcommunity.com/profiles/${steamId64}/?xml=1`;
    const res = await fetch(xmlUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 1800 },
    });

    if (res.ok) {
      const xml = await res.text();
      const personaMatch = xml.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
      const avatarMatch = xml.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
      const customUrlMatch = xml.match(/<customURL><!\[CDATA\[(.*?)\]\]><\/customURL>/);
      const isPrivate = xml.includes("<privacyState>private</privacyState>");

      return {
        steamId64,
        personaname: personaMatch?.[1] || `Steam Gamer (${steamId64})`,
        avatarUrl: avatarMatch?.[1],
        customURL: customUrlMatch?.[1],
        profileUrl: customUrlMatch?.[1]
          ? `https://steamcommunity.com/id/${customUrlMatch[1]}`
          : `https://steamcommunity.com/profiles/${steamId64}`,
        isPrivate,
      };
    }
  } catch (err) {
    console.error("[Steam XML] Erro ao buscar dados do perfil:", err);
  }

  return {
    steamId64,
    profileUrl: `https://steamcommunity.com/profiles/${steamId64}`,
  };
}

/**
 * Obtém todos os jogos da conta Steam via IPlayerService/GetOwnedGames/v0001/
 */
export async function getSteamOwnedGames(
  steamId64: string,
  apiKey?: string
): Promise<{
  games: SteamGameItem[];
  totalCount: number;
  isPrivate?: boolean;
  error?: string;
}> {
  const key = getSteamApiKey(apiKey);

  // 1. Via Steam Web API oficial
  if (key) {
    try {
      const url = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/");
      url.searchParams.set("key", key);
      url.searchParams.set("steamid", steamId64);
      url.searchParams.set("include_appinfo", "1");
      url.searchParams.set("include_played_free_games", "1");
      url.searchParams.set("format", "json");

      const res = await fetch(url.toString(), {
        next: { revalidate: 1800 },
      });

      if (res.ok) {
        const data = await res.json();
        const gamesList = data.response?.games;

        if (Array.isArray(gamesList)) {
          const games: SteamGameItem[] = gamesList.map((g: any) => {
            const appId = g.appid;
            const iconUrl = g.img_icon_url
              ? `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${g.img_icon_url}.jpg`
              : undefined;

            // Capa oficial widescreen de alta definição fornecida pela CDN da Valve
            const headerUrl = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

            return {
              appId,
              name: g.name || `Game ${appId}`,
              playtimeForeverHours: Math.round(((g.playtime_forever || 0) / 60) * 10) / 10,
              playtime2WeeksHours: g.playtime_2weeks
                ? Math.round((g.playtime_2weeks / 60) * 10) / 10
                : 0,
              iconUrl,
              logoUrl: headerUrl,
            };
          });

          // Ordena por tempo de jogo decrescente
          games.sort((a, b) => b.playtimeForeverHours - a.playtimeForeverHours);

          return {
            games,
            totalCount: data.response?.game_count || games.length,
          };
        } else if (data.response && Object.keys(data.response).length === 0) {
          // Perfil existe mas os detalhes dos jogos estão privados
          return {
            games: [],
            totalCount: 0,
            isPrivate: true,
            error: "A biblioteca de jogos deste perfil está oculta ou privada na Steam. Para importar, defina 'Detalhes dos jogos' como Público nas opções de privacidade da Steam.",
          };
        }
      }
    } catch (err) {
      console.warn("[Steam API] Falha no GetOwnedGames oficial:", err);
    }
  }

  // 2. Fallback: Página XML da comunidade Steam
  try {
    const xmlUrl = `https://steamcommunity.com/profiles/${steamId64}/games?tab=all&xml=1`;
    const res = await fetch(xmlUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 1800 },
    });

    if (res.ok) {
      const xml = await res.text();
      if (!xml.includes("<games>") || xml.includes("/login/")) {
        return {
          games: [],
          totalCount: 0,
          isPrivate: true,
          error: "A biblioteca de jogos deste perfil está configurada como privada na Steam.",
        };
      }

      const gameMatches = xml.match(/<game>([\s\S]*?)<\/game>/g);
      if (gameMatches && gameMatches.length > 0) {
        const games: SteamGameItem[] = [];

        for (const block of gameMatches) {
          const appMatch = block.match(/<appID>(\d+)<\/appID>/);
          const nameMatch = block.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/);
          const logoMatch = block.match(/<logo><!\[CDATA\[(.*?)\]\]><\/logo>/);
          const hoursMatch = block.match(/<hoursOnRecord>([\d.,]+)<\/hoursOnRecord>/);

          if (appMatch && nameMatch) {
            const appId = parseInt(appMatch[1], 10);
            const hoursStr = hoursMatch ? hoursMatch[1].replace(",", ".") : "0";
            const headerUrl = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appId}/header.jpg`;

            games.push({
              appId,
              name: nameMatch[1],
              playtimeForeverHours: parseFloat(hoursStr) || 0,
              iconUrl: logoMatch ? logoMatch[1] : undefined,
              logoUrl: headerUrl,
            });
          }
        }

        games.sort((a, b) => b.playtimeForeverHours - a.playtimeForeverHours);

        return {
          games,
          totalCount: games.length,
        };
      }
    }
  } catch (err) {
    console.error("[Steam XML] Erro ao carregar jogos por XML:", err);
  }

  return {
    games: [],
    totalCount: 0,
    error: "Não foi possível carregar a lista de jogos da Steam. Verifique se o perfil e os detalhes dos jogos estão configurados como públicos.",
  };
}
