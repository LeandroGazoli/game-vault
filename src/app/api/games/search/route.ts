import { NextRequest, NextResponse } from "next/server";
import { searchGamesApi, getPopularGamesApi } from "@/lib/gameApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const type = searchParams.get("type");

  try {
    if (!q || type === "popular") {
      const games = await getPopularGamesApi();
      return NextResponse.json({ games, count: games.length });
    }

    const result = await searchGamesApi(q, page);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na busca de jogos:", error);
    return NextResponse.json({ error: "Falha ao buscar jogos", games: [], count: 0 }, { status: 500 });
  }
}
