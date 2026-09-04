import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gamertag = searchParams.get("gamertag")?.trim();
    const apiKey = searchParams.get("apiKey")?.trim() || process.env.XBL_API_KEY?.trim();

    if (!gamertag) {
      return NextResponse.json(
        { success: false, error: "Gamertag do Xbox é obrigatória." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        requiresApiKey: true,
        error:
          "Para buscar a biblioteca automaticamente da nuvem Xbox, configure a chave XBL_API_KEY (gratuita em xbl.io) ou utilize a importação por texto ou arquivo CSV.",
      });
    }

    // Consulta OpenXBL REST API
    const response = await fetch("https://api.xbl.io/v2/player/title-history", {
      headers: {
        "X-Authorization": apiKey,
        Accept: "application/json",
      },
      next: { revalidate: 120 },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return NextResponse.json(
          {
            success: false,
            error: "Chave da API OpenXBL inválida ou sem permissão.",
          },
          { status: 401 }
        );
      }
      return NextResponse.json(
        {
          success: false,
          error: `Erro ao consultar Xbox Live API (Status ${response.status}).`,
        },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawTitles = data?.titles || data?.xblList || [];

    if (!Array.isArray(rawTitles) || rawTitles.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Nenhum jogo encontrado no histórico da conta Xbox "${gamertag}".`,
      });
    }

    const games = rawTitles.map((t: any) => ({
      name: t.name || t.titleName || "Jogo Xbox",
      titleId: t.titleId,
      logoUrl: t.displayImage || null,
      platform: "Xbox Series",
      playtimeForeverHours: 0,
      source: "xbox",
    }));

    return NextResponse.json({
      success: true,
      gamertag,
      count: games.length,
      games,
    });
  } catch (error: any) {
    console.error("Erro na rota /api/importer/xbox:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno ao processar Xbox." },
      { status: 500 }
    );
  }
}
