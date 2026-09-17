import { NextRequest, NextResponse } from "next/server";
import { fetchGNewsArticles } from "@/lib/gnewsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const lang = searchParams.get("lang") || undefined;
    const country = searchParams.get("country") || undefined;
    const max = searchParams.get("max") ? parseInt(searchParams.get("max")!, 10) : undefined;
    const customApiKey = searchParams.get("apiKey") || undefined;

    const data = await fetchGNewsArticles({
      q,
      lang,
      country,
      max,
      customApiKey,
    });

    // Sem header, cada chamada queima cota da GNews (chave de terceiro com limite diário).
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    console.error("Erro na rota /api/gnews:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao consultar GNews API" },
      { status: 500 }
    );
  }
}
