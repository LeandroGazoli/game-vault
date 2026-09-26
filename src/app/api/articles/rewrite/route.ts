import { NextRequest, NextResponse } from "next/server";
import { rewriteArticleWithAI, ArticleRewriteInput } from "@/lib/aiArticleService";
import { requireAdminUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authCheck = await requireAdminUser(req);
    if (!authCheck.authenticated) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = (await req.json()) as ArticleRewriteInput;

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "Título e conteúdo são obrigatórios para a reescrita com IA." },
        { status: 400 }
      );
    }

    const rewritten = await rewriteArticleWithAI(body);
    return NextResponse.json(rewritten);
  } catch (error) {
    console.error("Erro na rota /api/articles/rewrite:", error);
    return NextResponse.json(
      { error: "Falha interna ao reescrever matéria com IA." },
      { status: 500 }
    );
  }
}
