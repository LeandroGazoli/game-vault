import { NextRequest, NextResponse } from "next/server";
import { fetchHLTBData } from "@/lib/hltbApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get("name");

  if (!name) {
    return NextResponse.json({ error: "Nome do jogo é obrigatório" }, { status: 400 });
  }

  try {
    const hltb = await fetchHLTBData(name);
    return NextResponse.json({ hltb });
  } catch (error) {
    console.error("Erro na rota HLTB:", error);
    return NextResponse.json({ hltb: null });
  }
}
