import { NextRequest, NextResponse } from "next/server";
import { SteamGameItem } from "@/lib/types";

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
  const userApiKey = searchParams.get("apiKey") || process.env.STEAM_API_KEY || "";

  if (!steamInput.trim()) {
    return NextResponse.json(
      {
        success: false,
        totalCount: 0,
        games: [],
        error: "Informe um SteamID64 ou link de perfil da Steam para carregar os jogos.",
      },
      { status: 400 }
    );
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
