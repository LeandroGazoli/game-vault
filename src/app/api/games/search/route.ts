import { NextRequest, NextResponse } from "next/server";
import { searchGamesApi } from "@/lib/gameApi";
import {
  findGenreFilter,
  findPlatformFilter,
  findPerspectiveFilter,
  findGameModeFilter,
} from "@/lib/filterConstants";
import { getAuthenticatedUser } from "@/lib/serverAuth";
import { getUserProfile } from "@/lib/firebase";
import { isUserAdult } from "@/lib/gameUtils";

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
  const adultParam = searchParams.get("adult") === "true" || searchParams.get("onlyAdult") === "true";

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

    const isAdultRequested = Boolean(
      adultParam ||
      genreParam === "adult" ||
      themeId === 42
    );

    // Validação estrita de maioridade para acesso a jogos +18
    if (isAdultRequested) {
      let isAuthorized = false;
      try {
        const authResult = await getAuthenticatedUser(request);
        if (authResult.authenticated && authResult.user?.uid) {
          const profile = await getUserProfile(authResult.user.uid);
          if (profile?.birthDate && isUserAdult(profile.birthDate)) {
            isAuthorized = true;
          }
        }
      } catch (authErr) {
        console.warn("[/api/games/search] Falha na verificação de autenticação adulta:", authErr);
      }

      if (!isAuthorized) {
        return NextResponse.json({
          games: [],
          count: 0,
          total: 0,
          page,
          hasMore: false,
          adultRestricted: true,
          message: "Acesso a jogos +18 restrito. Faça login e informe sua data de nascimento comprovando maioridade.",
        });
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
      onlyAdult: isAdultRequested,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na busca de jogos:", error);
    return NextResponse.json({ error: "Falha ao buscar jogos", games: [], count: 0, total: 0 }, { status: 500 });
  }
}
