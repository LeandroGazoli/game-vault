import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import { sendVipWelcomeEmail } from "@/lib/email";
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
      to,
      userName = "Jogador Teste",
      plan = "vip",
      customMessage = "",
      template,
    }: {
      to: string;
      userName?: string;
      plan?: "vip" | "pro";
      customMessage?: string;
      template?: EmailTemplateConfig;
    } = body;

    if (!to || !to.includes("@")) {
      return NextResponse.json(
        { error: "Informe um endereço de e-mail de teste válido." },
        { status: 400 }
      );
    }

    const result = await sendVipWelcomeEmail({
      to,
      userName,
      plan,
      customMessage,
      templateOverride: template,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Falha ao enviar e-mail de teste pelo Resend." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: result.id,
      message: `E-mail de teste enviado com sucesso para ${to}!`,
    });
  } catch (error: any) {
    console.error("Erro na rota /api/admin/emails/test:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao processar disparo de teste." },
      { status: 500 }
    );
  }
}
