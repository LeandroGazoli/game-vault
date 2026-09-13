import { NextRequest, NextResponse } from "next/server";
import { rewriteArticleWithAI, ArticleRewriteInput } from "@/lib/aiArticleService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ArticleRewriteInput;

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios para a reescrita com IA." },
        { status: 400 }
      );
    }

    const rewritten = await rewriteArticleWithAI(body);
    return NextResponse.json(rewritten);
  } catch (error: any) {
    console.error("Erro na rota /api/articles/rewrite:", error);
    return NextResponse.json(
      { error: error.message || "Falha interna ao reescrever matéria com IA." },
      { status: 500 }
    );
  }
}
