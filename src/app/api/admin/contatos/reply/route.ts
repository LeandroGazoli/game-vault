import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { firestoreRestGet } from "@/lib/firestoreRest";
import { sendContactReplyToUser } from "@/lib/contactEmail";
import { ContactMessage } from "@/lib/types/contact.types";

export const dynamic = "force-dynamic";

/**
 * POST: Envia resposta oficial da equipe para o usuário via Resend
 * e registra no histórico da mensagem como "respondido".
 */
export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito." },
        { status: authCheck.status }
      );
    }

    const body: any = await request.json().catch(() => ({}));
    const { id, subject, message } = body;

    if (!id || !message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "ID e mensagem de resposta são obrigatórios." },
        { status: 400 }
      );
    }

    const originalDoc = await firestoreRestGet<ContactMessage>("contact_messages", id);
    if (!originalDoc) {
      return NextResponse.json({ error: "Mensagem original não encontrada." }, { status: 404 });
    }

    const replySubject = subject?.trim() || `Re: Sua mensagem ao MyGameList`;
    const replyMessage = message.trim();

    // Dispara e-mail via Resend
    const sendResult = await sendContactReplyToUser({
      toEmail: originalDoc.email,
      toName: originalDoc.nome,
      originalSubject: originalDoc.assunto,
      originalMessage: originalDoc.mensagem,
      replySubject,
      replyMessage,
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.error || "Falha ao despachar e-mail de resposta." },
        { status: 500 }
      );
    }

    // Atualiza o documento no Firestore
    const db = getAdminDb();
    const nowIso = new Date().toISOString();
    await db.collection("contact_messages").doc(id).set(
      {
        status: "respondido",
        respondedAt: nowIso,
        respondedBy: authCheck.user.email,
        responseSubject: replySubject,
        responseMessage: replyMessage,
        updatedAt: nowIso,
      },
      { merge: true }
    );

    return NextResponse.json({
      success: true,
      message: "Resposta enviada com sucesso para o usuário.",
      respondedAt: nowIso,
    });
  } catch (error: any) {
    console.error("[api/admin/contatos/reply] Erro POST:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar resposta." },
      { status: 500 }
    );
  }
}
