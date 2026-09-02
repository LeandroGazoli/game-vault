import { NextResponse } from "next/server";
import { getUpcomingGamesApi } from "@/lib/gameApi";

export async function GET() {
  try {
    const games = await getUpcomingGamesApi(24);
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Erro em /api/games/upcoming:", error);
    return NextResponse.json({ games: [] }, { status: 500 });
  }
}
