import { NextRequest, NextResponse } from "next/server";
import { getUserGamesServer, resolveUserServer } from "@/lib/serverData";
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
  const limitParam = parseInt(searchParams.get("limit") || "1000", 10);

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

    const isProfilePublic = targetProfile.isPublic !== false && targetProfile.visibility?.isPublic !== false;
    if (!isProfilePublic) {
      return NextResponse.json(
        { error: "Este perfil é privado. A biblioteca não está disponível para exportação pública." },
        { status: 403 }
      );
    }

    // 2. Busca todos os jogos da biblioteca do usuário
    const games: UserGame[] = await getUserGamesServer(targetUserId);

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

    if (limitParam > 0) {
      filteredGames = filteredGames.slice(0, limitParam);
    }

    // 4. Payload com estatísticas resumidas
    const payload = {
      user: {
        username: targetProfile?.username || username,
        displayName: targetProfile?.displayName || username,
        bio: targetProfile?.bio || null,
        favoriteGame: targetProfile?.favoriteGame || null,
      },
      stats: {
        total: filteredGames.length,
        completed: filteredGames.filter((g) => g.status === "completed").length,
        playing: filteredGames.filter((g) => g.status === "playing").length,
        library: filteredGames.filter((g) => g.status === "library").length,
        backlog: filteredGames.filter((g) => g.status === "backlog").length,
        favorites: filteredGames.filter((g) => g.isFavorite).length,
      },
      filtersApplied: {
        status: statusFilter || "all",
        favorite: favoritesOnly,
        platform: platformFilter || "all",
        limit: limitParam,
      },
      exportedAt: new Date().toISOString(),
      games: filteredGames,
    };

    // 5. Retorna com cabeçalhos de cache dinâmico e CORS aberto
    return new NextResponse(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
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
