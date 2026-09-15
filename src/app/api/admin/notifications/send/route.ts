import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyIdToken } from "@/lib/firebaseAdmin";
import {
  sendGroupNotification,
  getAudienceEstimate,
  GroupNotificationInput,
} from "@/lib/notificationsService";

const ADMIN_EMAILS = ["leandro.gazolig@gmail.com"];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const { email } = await verifyIdToken(token);
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const targetType = (searchParams.get("targetType") || "all") as GroupNotificationInput["targetType"];
    const estimate = await getAudienceEstimate(targetType);

    return NextResponse.json({ success: true, targetType, estimate });
  } catch (error: any) {
    console.error("[Admin Notification Estimate Error]:", error);
    return NextResponse.json({ error: "Erro ao calcular estimativa de audiência." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!token) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

    const { email } = await verifyIdToken(token);
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 403 });
    }

    const body = await request.json();
    const { title, message, category, linkUrl, linkLabel, targetType, targetUserIds, sendEmail } = body;

    if (!title?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Título e mensagem são obrigatórios." }, { status: 400 });
    }

    const result = await sendGroupNotification({
      targetType: targetType || "all",
      targetUserIds,
      title: title.trim(),
      message: message.trim(),
      category: category || "general",
      linkUrl: linkUrl?.trim() || null,
      linkLabel: linkLabel?.trim() || null,
      createdBy: email,
      sendEmail: Boolean(sendEmail),
    });

    // Registra na trilha de auditoria
    const db = getAdminDb();
    const logRef = db.collection("audit_logs").doc();
    await logRef.set({
      id: logRef.id,
      adminEmail: email,
      action: `Disparo de Notificação (${targetType})`,
      createdAt: new Date().toISOString(),
      details: {
        title,
        category,
        targetType,
        totalSent: result.totalSent,
        errors: result.errors,
      },
    });

    return NextResponse.json({
      success: true,
      result,
      message: `Notificação despachada para ${result.totalSent} destinatários.`,
    });
  } catch (error: any) {
    console.error("[Admin Notification Dispatch Error]:", error);
    return NextResponse.json({ error: error?.message || "Erro interno ao disparar notificação." }, { status: 500 });
  }
}
