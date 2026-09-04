import { NextRequest, NextResponse } from "next/server";
import { searchGamesApi } from "@/lib/gameApi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const titles: string[] = Array.isArray(body?.titles) ? body.titles.slice(0, 50) : [];

    if (titles.length === 0) {
      return NextResponse.json({ matches: {} });
    }

    const matches: Record<
      string,
      {
        gameId: number;
        slug: string;
        title: string;
        cover: string | null;
        metacritic: number | null;
        releaseYear: string;
        genres: string[];
      }
    > = {};

    // Processa em fatias paralelas de até 6 requisições simultâneas para não sobrecarregar
    const CHUNK_SIZE = 6;
    for (let i = 0; i < titles.length; i += CHUNK_SIZE) {
      const chunk = titles.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (title) => {
          const cleanTitle = title.trim();
          if (!cleanTitle) return;

          try {
            // Busca rápida limitando a 1 resultado
            const searchRes = await searchGamesApi({
              query: cleanTitle,
              pageSize: 1,
            });

            if (searchRes.games && searchRes.games.length > 0) {
              const bestMatch = searchRes.games[0];
              const releaseYear = bestMatch.released ? bestMatch.released.substring(0, 4) : "";

              matches[cleanTitle] = {
                gameId: bestMatch.id,
                slug: bestMatch.slug || String(bestMatch.id),
                title: bestMatch.name,
                cover: bestMatch.background_image || null,
                metacritic: bestMatch.metacritic || null,
                releaseYear,
                genres: bestMatch.genres ? bestMatch.genres.map((g) => g.name) : [],
              };
            }
          } catch (err) {
            console.warn(`[Batch Match] Falha ao buscar título "${cleanTitle}":`, err);
          }
        })
      );
    }

    return NextResponse.json({ success: true, matches });
  } catch (error) {
    console.error("[Batch Match API] Erro:", error);
    return NextResponse.json({ success: false, matches: {}, error: "Falha ao analisar títulos" }, { status: 500 });
  }
}
