import { NextRequest, NextResponse } from "next/server";
import { searchGamesApi } from "@/lib/gameApi";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { titles?: unknown };
    const titles: string[] = Array.isArray(body?.titles)
      ? (body.titles.filter((t): t is string => typeof t === "string")).slice(0, 500)
      : [];

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

    // Helper de limpeza de títulos de consoles (Xbox, Steam, PSN)
    const sanitizeTitle = (raw: string): string => {
      return raw
        .replace(/[™®©]/g, "")
        .replace(/\s+para\s+Xbox\s+(Series\s+[XS]|One)/gi, "")
        .replace(/\s+para\s+(PS4|PS5|PlayStation\s+[45])/gi, "")
        .replace(/\s*[-–—]\s*(PC|Windows)\s+Edition/gi, "")
        .replace(/\s*\((Retired|Game Preview|Beta|Alpha|Test Server)\)/gi, "")
        .replace(/\s+-\s+Test Server/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Processa em fatias paralelas de 8 requisições simultâneas
    const CHUNK_SIZE = 8;
    for (let i = 0; i < titles.length; i += CHUNK_SIZE) {
      const chunk = titles.slice(i, i + CHUNK_SIZE);
      await Promise.all(
        chunk.map(async (rawTitle) => {
          const cleanTitle = (rawTitle || "").trim();
          if (!cleanTitle) return;

          try {
            // 1ª tentativa: busca direta pelo título informado
            let searchRes = await searchGamesApi({
              query: cleanTitle,
              pageSize: 1,
            });

            // 2ª tentativa: se falhar, tenta com o título sanitizado de ruídos de plataforma
            if (!searchRes.games || searchRes.games.length === 0) {
              const sanitized = sanitizeTitle(cleanTitle);
              if (sanitized && sanitized.toLowerCase() !== cleanTitle.toLowerCase()) {
                searchRes = await searchGamesApi({
                  query: sanitized,
                  pageSize: 1,
                });
              }
            }

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
