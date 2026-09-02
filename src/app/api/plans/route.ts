import { NextRequest, NextResponse } from "next/server";
import { getPlansConfig, savePlansConfig, PlansConfig } from "@/lib/plans";
import { ADMIN_EMAILS } from "@/lib/types";

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
    const body = await request.json();
    const { adminEmail, config } = body;

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail.toLowerCase().trim())) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 403 }
      );
    }

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
