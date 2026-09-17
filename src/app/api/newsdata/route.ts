import { NextRequest, NextResponse } from "next/server";
import { fetchNewsDataArticles } from "@/lib/newsDataService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q") || undefined;
    const country = searchParams.get("country") || undefined;
    const language = searchParams.get("language") || undefined;
    const category = searchParams.get("category") || undefined;
    const page = searchParams.get("page") || undefined;
    const customApiKey = searchParams.get("apiKey") || undefined;

    const data = await fetchNewsDataArticles({
      q,
      country,
      language,
      category,
      page,
      customApiKey,
    });

    // Sem header, cada chamada queima cota do NewsData (chave de terceiro com limite diário).
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=900, stale-while-revalidate=3600",
      },
    });
  } catch (error: any) {
    console.error("Erro na rota /api/newsdata:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao consultar NewsData.io" },
      { status: 500 }
    );
  }
}
