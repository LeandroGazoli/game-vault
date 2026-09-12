import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import { generateEmailHtml } from "@/lib/email";
import { EmailTemplateConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito a administradores." },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const {
      userName = "Jogador Master",
      plan = "vip",
      customMessage = "",
      template,
    }: {
      userName?: string;
      plan?: "vip" | "pro";
      customMessage?: string;
      template?: EmailTemplateConfig;
    } = body;

    const { html, subject } = generateEmailHtml({
      userName,
      plan,
      customMessage,
      templateOverride: template,
    });

    return NextResponse.json({ html, subject });
  } catch (error: any) {
    console.error("Erro na rota /api/admin/emails/preview:", error);
    return NextResponse.json(
      { error: error?.message || "Erro ao renderizar preview do e-mail." },
      { status: 500 }
    );
  }
}
