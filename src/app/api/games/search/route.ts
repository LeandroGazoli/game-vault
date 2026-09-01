import { NextRequest, NextResponse } from "next/server";
import { searchGamesApi } from "@/lib/gameApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  try {
    const result = await searchGamesApi(q, page);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Falha ao buscar jogos", games: [], count: 0 }, { status: 500 });
  }
}
