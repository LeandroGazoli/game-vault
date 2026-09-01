import { NextRequest, NextResponse } from "next/server";
import { getGameDetailsApi } from "@/lib/gameApi";
import { fetchHLTBData } from "@/lib/hltbApi";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const game = await getGameDetailsApi(id);
    if (!game) {
      return NextResponse.json({ error: "Jogo não encontrado" }, { status: 404 });
    }

    // Se ainda não tiver os tempos do HLTB, busca sob demanda
    if (!game.hltb) {
      const hltb = await fetchHLTBData(game.name);
      game.hltb = hltb;
    }

    return NextResponse.json(game);
  } catch (error) {
    return NextResponse.json({ error: "Erro ao buscar detalhes do jogo" }, { status: 500 });
  }
}
