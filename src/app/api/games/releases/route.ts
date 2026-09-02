import { NextResponse } from "next/server";
import { getRecentReleasesApi } from "@/lib/gameApi";

export async function GET() {
  try {
    const games = await getRecentReleasesApi(24);
    return NextResponse.json({ games });
  } catch (error) {
    console.error("Erro em /api/games/releases:", error);
    return NextResponse.json({ games: [] }, { status: 500 });
  }
}
