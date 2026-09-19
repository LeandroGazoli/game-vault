import { NextRequest, NextResponse } from "next/server";
import { getUserGamesServer, resolveUserServer } from "@/lib/serverData";
import { withSharedCache, getEdgeCacheHeaders } from "@/lib/edgeCache";
import { UserGame, UserProfile } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;
  const { searchParams } = new URL(request.url);

  const statusFilter = searchParams.get("status");
  const favoritesOnly = searchParams.get("favorite") === "true" || searchParams.get("favorites") === "true";
  const platformFilter = searchParams.get("platform");
  const limitParamRaw = searchParams.get("limit");
  const pageParamRaw = searchParams.get("page");

  if (!username) {
    return NextResponse.json({ error: "Nome de usuário não informado" }, { status: 400 });
  }

  try {
    // 1. Resolve o perfil pelo UID direto ou pelo campo username
    const resolved = await resolveUserServer(username);
    const targetUserId = resolved?.userId || username;
    const targetProfile: UserProfile | null = resolved?.profile || null;

    if (!targetProfile) {
      return NextResponse.json({ error: "Perfil não encontrado" }, { status: 404 });
    }

    // 1.1 Se o perfil estiver configurado como PRIVADO, retorna status com biblioteca protegida
    const isProfilePublic = targetProfile.isPublic !== false && targetProfile.visibility?.isPublic !== false;
    if (!isProfilePublic) {
      return NextResponse.json(
        {
          isPrivate: true,
          user: {
            username: targetProfile.username || username,
            displayName: targetProfile.displayName || username,
            photoURL: targetProfile.photoURL || null,
            bannerURL: targetProfile.bannerURL || null,
            theme: targetProfile.theme || "cyan",
            plan: targetProfile.plan || "free",
          },
          games: [],
          stats: null,
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // 2. Busca jogos com cache de borda (L2 Cache API + L3 KV global).
    // A chave inclui a versão (libraryUpdatedAt), invalidando instantaneamente quando o usuário edita a biblioteca.
    const versionKey = targetProfile.libraryUpdatedAt || targetProfile.updatedAt || "v1";
    const cacheKey = `user-games:${targetUserId}:${versionKey}`;

    const games: UserGame[] = await withSharedCache<UserGame[]>(
      "user-library",
      cacheKey,
      1800,
      () => getUserGamesServer(targetUserId)
    );

    // 3. Aplica filtros da URL
    let filteredGames = games;

    if (statusFilter && statusFilter !== "all") {
      filteredGames = filteredGames.filter((g) => g.status === statusFilter);
    }

    if (favoritesOnly) {
      filteredGames = filteredGames.filter((g) => g.isFavorite);
    }

    if (platformFilter && platformFilter !== "all") {
      filteredGames = filteredGames.filter((g) => {
        const plats = g.platformsPlayed && g.platformsPlayed.length > 0
          ? g.platformsPlayed
          : g.platformPlayed ? [g.platformPlayed] : [];
        return plats.some((p) => p.toLowerCase() === platformFilter.toLowerCase());
      });
    }

    // 4. Paginação controlada
    const isAll = limitParamRaw === "all" || limitParamRaw === "1000";
    const totalFiltered = filteredGames.length;
    let paginatedGames = filteredGames;
    let page = 1;
    let limit = totalFiltered;
    let totalPages = 1;
    let hasMore = false;

    if (!isAll) {
      page = Math.max(1, parseInt(pageParamRaw || "1", 10) || 1);
      limit = Math.min(Math.max(1, parseInt(limitParamRaw || "50", 10) || 50), 250);
      totalPages = Math.max(1, Math.ceil(totalFiltered / limit));
      const offset = (page - 1) * limit;
      paginatedGames = filteredGames.slice(offset, offset + limit);
      hasMore = offset + limit < totalFiltered;
    }

    // 5. Payload com metadados de paginação e estatísticas
    const payload = {
      user: {
        username: targetProfile?.username || username,
        displayName: targetProfile?.displayName || username,
        photoURL: targetProfile?.photoURL || null,
        bannerURL: targetProfile?.bannerURL || null,
        bio: targetProfile?.bio || null,
        favoriteGame: targetProfile?.favoriteGame || null,
        plan: targetProfile?.plan || "free",
        customTitles: targetProfile?.customTitles || (targetProfile?.customTitle ? [targetProfile.customTitle] : []),
        theme: targetProfile?.theme || "cyan",
        profileLayout: targetProfile?.profileLayout || "default",
        customMarkdown: targetProfile?.customMarkdown || null,
        customHtml: targetProfile?.customHtml || null,
        customBioMode: targetProfile?.customBioMode || null,
        showcaseGameId: targetProfile?.showcaseGameId || null,
        socialLinks: targetProfile?.socialLinks || null,
        isPublic: true,
        visibility: targetProfile?.visibility || null,
      },
      stats: {
        total: games.length,
        completed: games.filter((g) => g.status === "completed").length,
        playing: games.filter((g) => g.status === "playing").length,
        library: games.filter((g) => g.status === "library").length,
        backlog: games.filter((g) => g.status === "backlog").length,
        favorites: games.filter((g) => g.isFavorite).length,
      },
      pagination: {
        page,
        limit,
        total: totalFiltered,
        totalPages,
        hasMore,
      },
      filtersApplied: {
        status: statusFilter || "all",
        favorite: favoritesOnly,
        platform: platformFilter || "all",
        limit: isAll ? "all" : limit,
      },
      exportedAt: new Date().toISOString(),
      games: paginatedGames,
    };

    // 6. Retorna com cabeçalhos de borda Cloudflare (SWR + Cache-Tags)
    const edgeHeaders = getEdgeCacheHeaders({
      sMaxAge: 300,
      swr: 3600,
      tags: ["user-library", `user-${targetUserId}`],
    });

    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...edgeHeaders,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
      },
    });
  } catch (error: any) {
    console.error("Erro na exportação de jogos:", error);
    return NextResponse.json(
      { error: "Falha ao exportar biblioteca", details: error.message },
      { status: 500 }
    );
  }
}
