import { NextResponse } from "next/server";
import { getCombinedArticles } from "@/lib/articlesService";

/**
 * Últimos artigos para a home — servidos por rota CACHEADA.
 *
 * Antes, `HomeEditorialSection` (componente client) chamava `getCombinedArticles()` direto do
 * navegador, lendo a coleção `articles` INTEIRA a cada visita à home: 32 leituras por
 * visitante. E como é browser→Firestore direto, não aparece em nenhum log do Worker — foi
 * por isso que passou despercebido mesmo com o site monitorado.
 *
 * Aqui a leitura acontece uma vez por janela de cache, no servidor, e é compartilhada por
 * todos os visitantes.
 */
export const revalidate = 3600;

export async function GET() {
  try {
    const articles = await getCombinedArticles();
    const latest = articles.slice(0, 6);

    return NextResponse.json(
      { articles: latest },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("[api/articles/latest] Erro:", error);
    return NextResponse.json({ articles: [] }, { status: 200 });
  }
}
