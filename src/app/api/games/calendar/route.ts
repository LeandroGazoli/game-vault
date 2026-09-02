import { NextRequest, NextResponse } from "next/server";
import { getCalendarGamesApi } from "@/lib/gameApi";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const now = new Date();
  const year = parseInt(searchParams.get("year") || String(now.getFullYear()), 10);
  const month = parseInt(searchParams.get("month") || String(now.getMonth() + 1), 10);

  try {
    const grouped = await getCalendarGamesApi(year, month);
    return NextResponse.json({ calendar: grouped, year, month });
  } catch (error) {
    console.error("Erro em /api/games/calendar:", error);
    return NextResponse.json({ calendar: {}, year, month }, { status: 500 });
  }
}
