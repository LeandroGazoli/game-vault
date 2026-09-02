import { NextRequest, NextResponse } from "next/server";
import { getGameDetailsApi, getPopularGamesApi } from "@/lib/gameApi";
import { fetchHLTBData } from "@/lib/hltbApi";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Se a rota for popular, retorna a lista de populares
  if (id === "popular") {
    try {
      const games = await getPopularGamesApi();
      return NextResponse.json(games);
    } catch (e) {
      return NextResponse.json([], { status: 500 });
    }
  }

  try {
    const game = await getGameDetailsApi(id);
    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    if (!game.hltb) {
      const hltb = await fetchHLTBData(game.name);
      game.hltb = hltb;
    }

    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar detalhes do jogo" }, { status: 500 });
  }
}
