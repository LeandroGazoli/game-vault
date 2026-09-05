import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import { getSystemSettings, updateSystemSettings, recordAuditLog } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito a administradores." },
        { status: authCheck.status }
      );
    }

    const settings = await getSystemSettings();
    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error("Erro na API /api/admin/settings [GET]:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar configurações." },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito a administradores." },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const adminEmail = authCheck.user.email;
    const adminUid = authCheck.user.uid;

    await updateSystemSettings(body, adminEmail);

    await recordAuditLog({
      adminEmail,
      adminUid,
      action: "Configurações do Sistema Atualizadas",
      category: "settings",
      details: body,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro na API /api/admin/settings [PUT]:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar configurações." },
      { status: 500 }
    );
  }
}
