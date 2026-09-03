import { NextRequest, NextResponse } from "next/server";
import { searchGamesApi } from "@/lib/gameApi";
import {
  findGenreFilter,
  findPlatformFilter,
  findPerspectiveFilter,
  findGameModeFilter,
} from "@/lib/filterConstants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || searchParams.get("limit") || "36", 10);
  const genreParam = searchParams.get("genre") || "";
  const platformParam = searchParams.get("platform") || searchParams.get("console") || "";
  const minRatingParam = searchParams.get("minRating") || searchParams.get("rating") || "0";
  const perspectiveParam = searchParams.get("perspective") || "";
  const gameModeParam = searchParams.get("gameMode") || searchParams.get("mode") || "";
  const sort = searchParams.get("sort") || "popular";

  try {
    let genreId: number | undefined;
    let genreIds: number[] | undefined;
    let themeId: number | undefined;

    if (genreParam && genreParam !== "all" && genreParam !== "Todos") {
      const genreFilter = findGenreFilter(genreParam);
      if (genreFilter) {
        genreId = genreFilter.igdbId;
        genreIds = genreFilter.igdbIds;
        themeId = genreFilter.igdbThemeId;
      } else if (!isNaN(Number(genreParam))) {
        genreId = parseInt(genreParam, 10);
      }
    }

    let platformId: number | undefined;
    let platformIds: number[] | undefined;

    if (platformParam && platformParam !== "all" && platformParam !== "Todas") {
      const platformFilter = findPlatformFilter(platformParam);
      if (platformFilter) {
        platformId = platformFilter.igdbId;
        platformIds = platformFilter.igdbIds;
      } else if (!isNaN(Number(platformParam))) {
        platformId = parseInt(platformParam, 10);
      }
    }

    let perspectiveId: number | undefined;
    if (perspectiveParam && perspectiveParam !== "all") {
      const pFilter = findPerspectiveFilter(perspectiveParam);
      if (pFilter && pFilter.igdbId > 0) {
        perspectiveId = pFilter.igdbId;
      } else if (!isNaN(Number(perspectiveParam))) {
        perspectiveId = parseInt(perspectiveParam, 10);
      }
    }

    let gameModeId: number | undefined;
    if (gameModeParam && gameModeParam !== "all") {
      const mFilter = findGameModeFilter(gameModeParam);
      if (mFilter && mFilter.igdbId > 0) {
        gameModeId = mFilter.igdbId;
      } else if (!isNaN(Number(gameModeParam))) {
        gameModeId = parseInt(gameModeParam, 10);
      }
    }

    const minRating = parseInt(minRatingParam, 10) || 0;

    const result = await searchGamesApi({
      query: q,
      genreId,
      genreIds,
      themeId,
      platformId,
      platformIds,
      minRating,
      perspectiveId,
      gameModeId,
      sort,
      page,
      pageSize,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na busca de jogos:", error);
    return NextResponse.json({ error: "Falha ao buscar jogos", games: [], count: 0, total: 0 }, { status: 500 });
  }
}
