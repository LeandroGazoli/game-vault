import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import { getAuditLogs, recordAuditLog } from "@/lib/firebase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito." },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const safeLimit = Math.min(Math.max(limit, 1), 100);

    const logs = await getAuditLogs(safeLimit);
    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error("Erro na API /api/admin/audit [GET]:", error);
    return NextResponse.json(
      { error: "Erro interno ao buscar logs de auditoria." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito." },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { action, category, targetId, targetName, details } = body;

    if (!action || typeof action !== "string") {
      return NextResponse.json(
        { error: "Ação é obrigatória." },
        { status: 400 }
      );
    }

    await recordAuditLog({
      adminEmail: authCheck.user.email,
      adminUid: authCheck.user.uid,
      action: action.slice(0, 100),
      category: category || "security",
      targetId,
      targetName,
      details,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro na API /api/admin/audit [POST]:", error);
    return NextResponse.json(
      { error: "Erro interno ao registrar log." },
      { status: 500 }
    );
  }
}
