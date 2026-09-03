import { NextRequest, NextResponse } from "next/server";
import { getPlansConfig, savePlansConfig, PlansConfig } from "@/lib/plans";
import { requireAdminUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const config = await getPlansConfig();
    return NextResponse.json(config);
  } catch (error: any) {
    console.error("Erro ao obter planos:", error);
    return NextResponse.json({ error: "Erro ao obter planos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso não autorizado." },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { config } = body;

    if (!config) {
      return NextResponse.json(
        { error: "Configuração inválida." },
        { status: 400 }
      );
    }

    await savePlansConfig(config as PlansConfig);
    return NextResponse.json({ success: true, message: "Planos atualizados com sucesso!" });
  } catch (error: any) {
    console.error("Erro ao salvar planos:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao salvar planos" },
      { status: 500 }
    );
  }
}
