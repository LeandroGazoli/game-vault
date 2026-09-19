import { NextResponse } from "next/server";
import { getRankingsApi, getRecentReleasesApi, getUpcomingGamesApi, searchGamesApi } from "@/lib/gameApi";
import { getPtBrDubbedGamesIGDB, getShortGamesIGDB } from "@/lib/igdbApi";
import { withSharedCache } from "@/lib/edgeCache";
import { Game } from "@/lib/types";

export interface HomeCatalogData {
  popular: Game[];
  releases: Game[];
  upcoming: Game[];
  ptbr: Game[];
  short: Game[];
  gta: Game[];
}

export async function GET() {
  try {
    const data = await withSharedCache<HomeCatalogData>(
      "home-catalog",
      "v1",
      3600, // 1 hora de TTL no Edge e no KV
      async () => {
        const [popular, releases, upcoming, ptbr, short, gtaSearch] = await Promise.all([
          getRankingsApi("popular", 10).catch(() => [] as Game[]),
          getRecentReleasesApi(10).catch(() => [] as Game[]),
          getUpcomingGamesApi(10).catch(() => [] as Game[]),
          getPtBrDubbedGamesIGDB(10).catch(() => [] as Game[]),
          getShortGamesIGDB(10).catch(() => [] as Game[]),
          searchGamesApi({ query: "Grand Theft Auto", pageSize: 10 }).catch(() => ({ games: [] as Game[] })),
        ]);

        return {
          popular: popular || [],
          releases: releases || [],
          upcoming: upcoming || [],
          ptbr: ptbr || [],
          short: short || [],
          gta: gtaSearch.games || [],
        };
      }
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Erro em /api/games/home-catalog:", error);
    return NextResponse.json(
      {
        popular: [],
        releases: [],
        upcoming: [],
        ptbr: [],
        short: [],
        gta: [],
      },
      { status: 500 }
    );
  }
}
