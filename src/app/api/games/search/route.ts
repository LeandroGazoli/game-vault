import { NextRequest, NextResponse } from "next/server";
import { searchGamesApi } from "@/lib/gameApi";
import { findGenreFilter, findPlatformFilter } from "@/lib/filterConstants";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || searchParams.get("limit") || "36", 10);
  const genreParam = searchParams.get("genre") || "";
  const platformParam = searchParams.get("platform") || searchParams.get("console") || "";
  const minRatingParam = searchParams.get("minRating") || searchParams.get("rating") || "0";
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

    const minRating = parseInt(minRatingParam, 10) || 0;

    const result = await searchGamesApi({
      query: q,
      genreId,
      genreIds,
      themeId,
      platformId,
      platformIds,
      minRating,
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
