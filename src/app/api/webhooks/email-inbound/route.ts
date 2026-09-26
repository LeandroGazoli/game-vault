import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { ContactSubject } from "@/lib/types/contact.types";

export const dynamic = "force-dynamic";

/**
 * Webhook que recebe o e-mail parseado pelo Cloudflare Email Worker
 * e salva diretamente na coleção `contact_messages` do Firestore.
 */
export async function POST(request: NextRequest) {
  try {
    const incomingSecret = request.headers.get("x-email-worker-secret");
    const configuredSecret = process.env.EMAIL_WORKER_SECRET?.trim();

    if (!configuredSecret) {
      console.error("[api/webhooks/email-inbound] EMAIL_WORKER_SECRET não configurado.");
      return NextResponse.json({ error: "Webhook indisponível." }, { status: 503 });
    }

    if (incomingSecret !== configuredSecret) {
      return NextResponse.json({ error: "Acesso não autorizado." }, { status: 401 });
    }

    const body: any = await request.json().catch(() => ({}));
    const { from, to, subject, text, html } = body;

    if (!from || !to) {
      return NextResponse.json({ error: "Campos 'from' e 'to' são obrigatórios." }, { status: 400 });
    }

    // Extrai nome e e-mail de strings no formato "Nome <email@dominio.com>" ou "email@dominio.com"
    const fromStr = String(from);
    const match = fromStr.match(/^(.*?)\s*<(.+?)>$/);
    const nome = match ? match[1].replace(/["']/g, "").trim() : fromStr.split("@")[0];
    const email = match ? match[2].trim().toLowerCase() : fromStr.trim().toLowerCase();

    const cleanSubject = String(subject || "Sem assunto").trim();
    const cleanMessage = String(text || html || "Mensagem sem conteúdo textual.").trim();
    const toAddress = String(to).toLowerCase();

    // Determina o assunto padrão de acordo com o destinatário
    let assunto: ContactSubject = "duvida";
    if (toAddress.includes("parcerias@")) {
      assunto = "imprensa";
    }

    const nowIso = new Date().toISOString();
    const db = getAdminDb();
    const docRef = db.collection("contact_messages").doc();
    const messageId = docRef.id;

    const contactData = {
      id: messageId,
      nome: nome || "Remetente",
      email,
      assunto,
      mensagem: cleanMessage.slice(0, 10000),
      status: "novo",
      canal: "email_direto",
      destinatario: toAddress,
      createdAt: nowIso,
    };

    await docRef.set(contactData);

    return NextResponse.json({
      success: true,
      messageId,
      status: "saved_to_admin_inbox",
    });
  } catch (error: any) {
    console.error("[api/webhooks/email-inbound] Erro ao processar e-mail:", error);
    return NextResponse.json({ error: "Erro interno no processamento do e-mail." }, { status: 500 });
  }
}
