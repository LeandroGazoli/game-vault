import { NextRequest, NextResponse } from "next/server";
import { fetchApprovedIndiesServer } from "@/lib/serverData";
import { withSharedCache } from "@/lib/edgeCache";
import { IndieGame, IndieSpotlightLocation } from "@/lib/types/indie.types";

export const revalidate = 1800; // 30 minutos

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const location = searchParams.get("location") as IndieSpotlightLocation | null;
  const isSpotlight = searchParams.get("spotlight") === "true";
  const sortBy = (searchParams.get("sortBy") || "votes") as "votes" | "recent";

  try {
    // Cache de 30 minutos em duas camadas (Cache API local + KV global).
    // Evita que cada visitante faça getDocs() na coleção indie_games pelo navegador.
    const allApproved = await withSharedCache<IndieGame[]>(
      "indies",
      "all-approved",
      1800,
      async () => {
        return await fetchApprovedIndiesServer("votes");
      }
    );

    let result = Array.isArray(allApproved) ? [...allApproved] : [];

    // Filtro de destaque (spotlight) com validação de expiração e localização
    if (isSpotlight) {
      const now = new Date().toISOString();
      result = result
        .filter((g) => {
          if (!g.isSpotlight) return false;
          if (location && g.spotlightLocations && !g.spotlightLocations.includes(location)) {
            return false;
          }
          if (g.spotlightUntil && g.spotlightUntil < now) {
            return false;
          }
          return true;
        })
        .sort((a, b) => (b.spotlightPriority || 0) - (a.spotlightPriority || 0));
    } else if (sortBy === "recent") {
      result.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else {
      result.sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
    }

    return NextResponse.json(
      { indies: result },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("[api/indies] Erro ao listar indies:", error);
    return NextResponse.json({ indies: [] }, { status: 200 });
  }
}
