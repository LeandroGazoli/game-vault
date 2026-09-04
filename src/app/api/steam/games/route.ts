import { NextRequest, NextResponse } from "next/server";
import {
  resolveSteamId64,
  getSteamPlayerSummary,
  getSteamOwnedGames,
  getSteamApiKey,
} from "@/lib/steam";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const steamInput = searchParams.get("steamId") || searchParams.get("id") || "";
  const apiKey = getSteamApiKey(searchParams.get("apiKey") || undefined);

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

  // 1. Resolve o SteamID64 usando a Steam Web API oficial (ou fallback comunitário)
  const steamId64 = await resolveSteamId64(steamInput, apiKey);
  if (!steamId64) {
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

  // 2. Busca resumo do perfil e lista de jogos em paralelo
  const [profile, gamesResult] = await Promise.all([
    getSteamPlayerSummary(steamId64, apiKey),
    getSteamOwnedGames(steamId64, apiKey),
  ]);

  if (gamesResult.error && gamesResult.games.length === 0) {
    return NextResponse.json(
      {
        success: false,
        isPrivate: gamesResult.isPrivate,
        totalCount: 0,
        games: [],
        error: gamesResult.error,
        profile: {
          personaname: profile.personaname || `Steam Gamer (${steamId64})`,
          avatarUrl: profile.avatarUrl,
          profileUrl: profile.profileUrl,
        },
      },
      { status: gamesResult.isPrivate ? 403 : 200 }
    );
  }

  return NextResponse.json({
    success: true,
    totalCount: gamesResult.totalCount,
    games: gamesResult.games,
    profile: {
      personaname: profile.personaname || `Steam Gamer (${steamId64})`,
      avatarUrl: profile.avatarUrl,
      profileUrl: profile.profileUrl,
    },
  });
}
