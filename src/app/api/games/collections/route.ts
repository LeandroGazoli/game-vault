import { NextRequest, NextResponse } from "next/server";
import { getGamesByCollectionIGDB } from "@/lib/igdbApi";
import { getCollectionBySlug } from "@/lib/collectionsData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "hall-da-fama";
  const limit = parseInt(searchParams.get("limit") || "40", 10);

  const collection = getCollectionBySlug(slug);
  if (!collection) {
    return NextResponse.json({ error: "Coleção não encontrada", games: [], count: 0 }, { status: 404 });
  }

  try {
    const games = await getGamesByCollectionIGDB(slug, limit);
    return NextResponse.json({
      collection,
      games,
      count: games.length,
    });
  } catch (error) {
    console.error(`Erro ao buscar jogos da coleção ${slug}:`, error);
    return NextResponse.json({ error: "Falha ao buscar jogos da coleção", games: [], count: 0 }, { status: 500 });
  }
}
