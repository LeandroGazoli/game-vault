import { NextRequest, NextResponse } from "next/server";
import { getPtBrDubbedGamesIGDB, getShortGamesIGDB } from "@/lib/igdbApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "ptbr";
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    if (type === "short") {
      const games = await getShortGamesIGDB(limit);
      return NextResponse.json(
        { games, count: games.length },
        {
          headers: {
            "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
          },
        }
      );
    }

    // Padrão: Jogos Dublados em Português do Brasil
    const games = await getPtBrDubbedGamesIGDB(limit);
    return NextResponse.json(
      { games, count: games.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Erro na rota de jogos curados:", error);
    return NextResponse.json({ error: "Falha ao buscar jogos curados", games: [], count: 0 }, { status: 500 });
  }
}
