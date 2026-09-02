import { NextRequest, NextResponse } from "next/server";
import { getRankingsApi } from "@/lib/gameApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = (searchParams.get("category") || "popular") as "popular" | "top_rated" | "hyped";
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const games = await getRankingsApi(category, limit);
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Erro em /api/games/rankings:", error);
    return NextResponse.json({ games: [] }, { status: 500 });
  }
}
