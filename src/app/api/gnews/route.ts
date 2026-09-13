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

    const data = await fetchGNewsArticles({
      q,
      lang,
      country,
      max,
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Erro na rota /api/gnews:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao consultar GNews API" },
      { status: 500 }
    );
  }
}
