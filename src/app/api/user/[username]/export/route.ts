import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, doc, getDoc, limit } from "firebase/firestore";
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
    let targetUserId = username;
    let targetProfile: UserProfile | null = null;

    // 1. Tenta buscar o perfil do usuário pelo UID direto ou campo username
    if (db) {
      const raw = username.trim();
      const clean = raw.toLowerCase();

      const userDirectDoc = await getDoc(doc(db, "users", raw));
      if (userDirectDoc.exists()) {
        targetUserId = userDirectDoc.id;
        targetProfile = userDirectDoc.data() as UserProfile;
      } else {
        // Busca por campo username (case-insensitive)
        const qUsers = query(collection(db, "users"), where("username", "==", clean), limit(1));
        let snapUsers = await getDocs(qUsers);
        if (snapUsers.empty && clean !== raw) {
          const qUsersExact = query(collection(db, "users"), where("username", "==", raw), limit(1));
          snapUsers = await getDocs(qUsersExact);
        }
        if (!snapUsers.empty) {
          const first = snapUsers.docs[0];
          targetUserId = first.id;
          targetProfile = first.data() as UserProfile;
        }
      }
    }

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
    let games: UserGame[] = [];
    if (db) {
      const qGames = query(collection(db, "users", targetUserId, "games"));
      const snapGames = await getDocs(qGames);
      snapGames.forEach((docSnap) => {
        games.push(docSnap.data() as UserGame);
      });
    }

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
