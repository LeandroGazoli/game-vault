import { NextRequest, NextResponse } from "next/server";
import { getRankingsApi } from "@/lib/gameApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") || "popular") as
    | "popular"
    | "top_rated"
    | "hyped"
    | "ptbr"
    | "retro"
    | "short";
  const rawLimit = parseInt(searchParams.get("limit") || "20", 10);
  const limit = Math.min(Math.max(isNaN(rawLimit) ? 20 : rawLimit, 5), 100);

  try {
    const games = await getRankingsApi(category, limit);
    return NextResponse.json({ games, total: games.length });
  } catch (error) {
    console.error("Erro em /api/games/rankings:", error);
    return NextResponse.json({ games: [], total: 0 }, { status: 500 });
  }
}
