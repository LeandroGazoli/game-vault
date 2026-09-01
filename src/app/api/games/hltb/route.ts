import { NextRequest, NextResponse } from "next/server";
import { fetchHLTBData } from "@/lib/hltbApi";
import { MOCK_GAMES } from "@/lib/mockGames";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Nome do jogo é obrigatório" }, { status: 400 });
  }

  // Primeiro checa se temos no mock predefinido
  const localMatch = MOCK_GAMES.find(
    (g) => g.name.toLowerCase() === name.toLowerCase() || g.slug === name.toLowerCase()
  );

  if (localMatch && localMatch.hltb) {
    return NextResponse.json({ hltb: localMatch.hltb });
  }

  try {
    const hltb = await fetchHLTBData(name);
    return NextResponse.json({ hltb });
  } catch (error) {
    console.error("Erro na rota HLTB:", error);
    return NextResponse.json({ hltb: null });
  }
}
