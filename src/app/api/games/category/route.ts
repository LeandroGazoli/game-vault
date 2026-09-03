import { NextRequest, NextResponse } from "next/server";
import { getGamesByCategoryIGDB } from "@/lib/igdbApi";
import { getCategoryBySlug } from "@/lib/categoriesData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "mundo-aberto";
  const sort = searchParams.get("sort") || "popular";
  const platform = searchParams.get("platform") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "40", 10);
  const offset = Math.max(0, (page - 1) * limit);

  const category = getCategoryBySlug(slug);
  if (!category) {
    return NextResponse.json({ error: "Categoria não encontrada", games: [], count: 0 }, { status: 404 });
  }

  try {
    const games = await getGamesByCategoryIGDB(slug, sort, platform, limit, offset);
    return NextResponse.json({
      category,
      games,
      count: games.length,
      page,
      hasMore: games.length >= limit,
    });
  } catch (error) {
    console.error(`Erro ao buscar jogos da categoria ${slug}:`, error);
    return NextResponse.json({ error: "Falha ao buscar jogos da categoria", games: [], count: 0 }, { status: 500 });
  }
}
