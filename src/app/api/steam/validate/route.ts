import { NextRequest, NextResponse } from "next/server";
import {
  resolveSteamId64,
  getSteamPlayerSummary,
  getSteamOwnedGames,
  getSteamApiKey,
} from "@/lib/steam";

/**
 * Endpoint de Pré-Validação de Conta Steam.
 * Executa checagem preventiva em tempo real antes da vinculação definitiva:
 * - Existência do SteamID64 / Vanity URL
 * - Consulta cadastral do perfil (avatar, personaname)
 * - Verificação de privacidade da biblioteca de jogos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const steamInput = (body?.steamInput || body?.steamId || "").trim();

    if (!steamInput) {
      return NextResponse.json(
        {
          valid: false,
          code: "EMPTY_INPUT",
          error: "Informe um SteamID64, link de perfil ou apelido personalizado.",
        },
        { status: 400 }
      );
    }

    const apiKey = getSteamApiKey();

    // 1. Resolve o SteamID64
    const steamId64 = await resolveSteamId64(steamInput, apiKey);
    if (!steamId64) {
      return NextResponse.json(
        {
          valid: false,
          code: "NOT_FOUND",
          error: "Perfil Steam não encontrado. Verifique o link ou username informado.",
        },
        { status: 404 }
      );
    }

    // 2. Consulta os dados do perfil e a biblioteca em paralelo
    const [profile, gamesResult] = await Promise.all([
      getSteamPlayerSummary(steamId64, apiKey),
      getSteamOwnedGames(steamId64, apiKey),
    ]);

    if (!profile.personaname && !profile.avatarUrl) {
      return NextResponse.json(
        {
          valid: false,
          code: "PROFILE_UNAVAILABLE",
          error: "Não foi possível obter dados cadastrais deste perfil na Steam Web API.",
        },
        { status: 422 }
      );
    }

    // 3. Avalia visibilidade da biblioteca
    const isPrivate = Boolean(gamesResult.isPrivate);

    return NextResponse.json({
      valid: true,
      steamId64,
      isPrivate,
      gamesCount: gamesResult.totalCount || 0,
      profile: {
        personaname: profile.personaname || `Steam Gamer (${steamId64})`,
        avatarUrl: profile.avatarUrl,
        profileUrl: profile.profileUrl,
      },
      warning: isPrivate
        ? "Seu perfil foi localizado, porém seus Detalhes do Jogo estão definidos como Privados na Steam. Para importar o catálogo automaticamente, configure-os como Públicos."
        : null,
    });
  } catch (error: any) {
    console.error("[Steam Validate API] Erro na pré-validação:", error);
    return NextResponse.json(
      {
        valid: false,
        code: "SERVER_ERROR",
        error: "A Steam Web API está temporariamente instável ou indisponível.",
      },
      { status: 500 }
    );
  }
}
