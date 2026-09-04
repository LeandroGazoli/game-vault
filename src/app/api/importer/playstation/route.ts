import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const psnId = searchParams.get("psnId")?.trim();
    const npsso = searchParams.get("npsso")?.trim() || process.env.PSN_NPSSO?.trim();

    if (!psnId) {
      return NextResponse.json(
        { success: false, error: "PSN Online ID é obrigatório." },
        { status: 400 }
      );
    }

    // Se houver token NPSSO configurado, pode consultar a API da Sony
    if (!npsso) {
      return NextResponse.json({
        success: false,
        requiresToken: true,
        error:
          "A PlayStation Network não possui API pública aberta sem autenticação. Para importar seus jogos de PS4/PS5, você pode colar os nomes dos seus jogos ou enviar um arquivo CSV exportado de apps de troféus.",
      });
    }

    return NextResponse.json({
      success: true,
      psnId,
      games: [],
    });
  } catch (error: any) {
    console.error("Erro na rota /api/importer/playstation:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Erro interno ao processar PlayStation." },
      { status: 500 }
    );
  }
}
