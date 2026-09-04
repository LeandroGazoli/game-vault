import { NextRequest, NextResponse } from "next/server";
import { SteamGameItem } from "@/lib/types";

// Jogos populares de demonstração para teste imediato do importador
const DEMO_STEAM_GAMES: SteamGameItem[] = [
  {
    appId: 730,
    name: "Counter-Strike 2",
    playtimeForeverHours: 428.5,
    playtime2WeeksHours: 14.2,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/730/81e51c890a1961448b1d406fed6eb42b31a5477b.jpg",
  },
  {
    appId: 1091500,
    name: "Cyberpunk 2077",
    playtimeForeverHours: 92.4,
    playtime2WeeksHours: 0,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/1091500/8d8dbdd1752b04f1a2efccb8529f864834e5699a.jpg",
  },
  {
    appId: 1245620,
    name: "ELDEN RING",
    playtimeForeverHours: 135.0,
    playtime2WeeksHours: 5.6,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/1245620/e86544faaa0d23588da9142f36f966141a4a4066.jpg",
  },
  {
    appId: 1086940,
    name: "Baldur's Gate 3",
    playtimeForeverHours: 84.2,
    playtime2WeeksHours: 0,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/1086940/27361a4ec41a27e7703816a75f89ae798c1dd08f.jpg",
  },
  {
    appId: 292030,
    name: "The Witcher 3: Wild Hunt",
    playtimeForeverHours: 110.8,
    playtime2WeeksHours: 0,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/292030/1e0427848417fe2880c507cfa29a1f26fa17c067.jpg",
  },
  {
    appId: 440,
    name: "Team Fortress 2",
    playtimeForeverHours: 260.0,
    playtime2WeeksHours: 0,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/440/e3f595a92552da3d664ad00277fad2107345f743.jpg",
  },
  {
    appId: 252490,
    name: "Rust",
    playtimeForeverHours: 180.3,
    playtime2WeeksHours: 0,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/252490/47622f6d2f347b59e7464a85702213abec80357f.jpg",
  },
  {
    appId: 1145360,
    name: "Hades",
    playtimeForeverHours: 58.6,
    playtime2WeeksHours: 0,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/1145360/f201dd08a1c97f480327fbc16b34cfdbdc8ca0e6.jpg",
  },
  {
    appId: 105600,
    name: "Terraria",
    playtimeForeverHours: 76.1,
    playtime2WeeksHours: 0,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/105600/858961e95f6681f005377f985926014d18308bc2.jpg",
  },
  {
    appId: 620,
    name: "Portal 2",
    playtimeForeverHours: 22.0,
    playtime2WeeksHours: 0,
    iconUrl: "https://media.steampowered.com/steamcommunity/public/images/apps/620/26c5457fce293c834cbfa18f192b678c187be7b6.jpg",
  },
];

/**
 * Resolve qualquer entrada do usuário para um SteamID64
 */
async function resolveSteamProfile(input: string): Promise<{
  steamId64: string | null;
  personaname?: string;
  avatarUrl?: string;
  customURL?: string;
}> {
  const clean = input.trim();
  if (!clean) return { steamId64: null };

  if (/^\d{17}$/.test(clean)) {
    return { steamId64: clean };
  }

  const profilesMatch = clean.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profilesMatch && profilesMatch[1]) {
    return { steamId64: profilesMatch[1] };
  }

  let vanity = clean;
  const idMatch = clean.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  if (idMatch && idMatch[1]) {
    vanity = idMatch[1];
  } else {
    vanity = vanity.replace(/https?:\/\//, "").replace(/\/$/, "");
  }

  try {
    const res = await fetch(`https://steamcommunity.com/id/${encodeURIComponent(vanity)}/?xml=1`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const xml = await res.text();
      const steamIdMatch = xml.match(/<steamID64>(\d{17})<\/steamID64>/);
      const personaMatch = xml.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
      const avatarMatch = xml.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
      const customUrlMatch = xml.match(/<customURL><!\[CDATA\[(.*?)\]\]><\/customURL>/);

      if (steamIdMatch && steamIdMatch[1]) {
        return {
          steamId64: steamIdMatch[1],
          personaname: personaMatch?.[1] || vanity,
          avatarUrl: avatarMatch?.[1],
          customURL: customUrlMatch?.[1] || vanity,
        };
      }
    }
  } catch (e) {
    console.error("[Steam Games Resolve] Erro:", e);
  }

  return { steamId64: null };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const steamInput = searchParams.get("steamId") || searchParams.get("id") || "";
  const isDemo = searchParams.get("demo") === "true";
  const userApiKey = searchParams.get("apiKey") || process.env.STEAM_API_KEY || "";

  if (isDemo || (!steamInput && searchParams.get("load") !== "true")) {
    return NextResponse.json({
      success: true,
      totalCount: DEMO_STEAM_GAMES.length,
      games: DEMO_STEAM_GAMES,
      isDemo: true,
      profile: {
        personaname: "Gamer Demo (Steam)",
        avatarUrl: "https://avatars.fastly.steamstatic.com/c8582f8478cffe910a2fe196c32ff2e5ed34b1a9_full.jpg",
      },
    });
  }

  const resolved = await resolveSteamProfile(steamInput);
  if (!resolved.steamId64) {
    return NextResponse.json(
      {
        success: false,
        totalCount: 0,
        games: [],
        error: "Perfil Steam não encontrado. Verifique seu SteamID64 ou link de perfil.",
      },
      { status: 404 }
    );
  }

  const steamId64 = resolved.steamId64;

  // 1. Se possuir API Key (da aplicação ou fornecida pelo usuário)
  if (userApiKey) {
    try {
      const apiUrl = new URL("https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/");
      apiUrl.searchParams.set("key", userApiKey);
      apiUrl.searchParams.set("steamid", steamId64);
      apiUrl.searchParams.set("include_appinfo", "1");
      apiUrl.searchParams.set("include_played_free_games", "1");
      apiUrl.searchParams.set("format", "json");

      const res = await fetch(apiUrl.toString(), { next: { revalidate: 1800 } });
      if (res.ok) {
        const data = await res.json();
        const gamesList = data.response?.games || [];

        const games: SteamGameItem[] = gamesList.map((g: any) => ({
          appId: g.appid,
          name: g.name,
          playtimeForeverHours: Math.round(((g.playtime_forever || 0) / 60) * 10) / 10,
          playtime2WeeksHours: g.playtime_2weeks ? Math.round((g.playtime_2weeks / 60) * 10) / 10 : 0,
          iconUrl: g.img_icon_url
            ? `https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`
            : undefined,
        }));

        // Ordena por mais jogados primeiro
        games.sort((a, b) => b.playtimeForeverHours - a.playtimeForeverHours);

        return NextResponse.json({
          success: true,
          totalCount: games.length,
          games,
          profile: {
            personaname: resolved.personaname || `Steam Gamer (${steamId64})`,
            avatarUrl: resolved.avatarUrl,
          },
        });
      }
    } catch (err) {
      console.error("[Steam Web API] Erro ao buscar jogos:", err);
    }
  }

  // 2. Fallback: Tentativa via perfil XML público da Steam
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
      // Checa se foi redirecionado para login (perfil com detalhes privados)
      if (!xml.includes("<games>") || xml.includes("/login/")) {
        return NextResponse.json({
          success: false,
          isPrivate: true,
          totalCount: 0,
          games: [],
          error: "A lista de jogos deste perfil está oculta ou privada na Steam. Para importar automaticamente, defina 'Detalhes dos jogos' como Público nas configurações de privacidade da sua Steam, ou use a aba 'Lista Rápida' para colar seus jogos.",
        });
      }

      // Faz parsing das tags <game>
      const gameMatches = xml.match(/<game>([\s\S]*?)<\/game>/g);
      if (gameMatches && gameMatches.length > 0) {
        const games: SteamGameItem[] = [];

        for (const block of gameMatches) {
          const appMatch = block.match(/<appID>(\d+)<\/appID>/);
          const nameMatch = block.match(/<name><!\[CDATA\[(.*?)\]\]><\/name>/);
          const logoMatch = block.match(/<logo><!\[CDATA\[(.*?)\]\]><\/logo>/);
          const hoursMatch = block.match(/<hoursOnRecord>([\d.,]+)<\/hoursOnRecord>/);

          if (appMatch && nameMatch) {
            const hoursStr = hoursMatch ? hoursMatch[1].replace(",", ".") : "0";
            games.push({
              appId: parseInt(appMatch[1], 10),
              name: nameMatch[1],
              playtimeForeverHours: parseFloat(hoursStr) || 0,
              iconUrl: logoMatch ? logoMatch[1] : undefined,
            });
          }
        }

        games.sort((a, b) => b.playtimeForeverHours - a.playtimeForeverHours);

        return NextResponse.json({
          success: true,
          totalCount: games.length,
          games,
          profile: {
            personaname: resolved.personaname || `Steam Gamer (${steamId64})`,
            avatarUrl: resolved.avatarUrl,
          },
        });
      }
    }
  } catch (err) {
    console.error("[Steam XML Games] Erro:", err);
  }

  // Se nenhuma forma pública funcionou, orienta o usuário
  return NextResponse.json({
    success: false,
    isPrivate: true,
    totalCount: 0,
    games: [],
    error: "Não foi possível ler a lista de jogos automaticamente. A Steam exige que 'Detalhes dos Jogos' esteja configurado como Público no perfil, ou você pode usar o importador por Lista Rápida colando os nomes dos jogos!",
  });
}
