import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { ContactSubject } from "@/lib/types/contact.types";

export const dynamic = "force-dynamic";

const VALID_SUBJECTS: ContactSubject[] = ["duvida", "sugestao", "bug", "imprensa", "privacidade"];

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json().catch(() => ({}));
    const { nome, email, assunto, mensagem, honeypot } = body;

    // Proteção anti-bot simples via honeypot (campo oculto preenchido por robôs)
    if (honeypot) {
      return NextResponse.json({ success: true, message: "Mensagem recebida." });
    }

    if (!nome || typeof nome !== "string" || !nome.trim()) {
      return NextResponse.json({ error: "O nome é obrigatório." }, { status: 400 });
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
    }

    if (!mensagem || typeof mensagem !== "string" || mensagem.trim().length < 5) {
      return NextResponse.json({ error: "Mensagem muito curta ou vazia." }, { status: 400 });
    }

    const safeAssunto: ContactSubject = VALID_SUBJECTS.includes(assunto) ? assunto : "duvida";
    const cleanNome = nome.trim().slice(0, 100);
    const cleanEmail = email.trim().toLowerCase().slice(0, 120);
    const cleanMensagem = mensagem.trim().slice(0, 4000);

    const nowIso = new Date().toISOString();
    const userAgent = request.headers.get("user-agent") || undefined;
    const ip = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || undefined;

    // Salva a mensagem no Cloud Firestore
    const db = getAdminDb();
    const docRef = db.collection("contact_messages").doc();
    const messageId = docRef.id;

    const contactData = {
      id: messageId,
      nome: cleanNome,
      email: cleanEmail,
      assunto: safeAssunto,
      mensagem: cleanMensagem,
      status: "novo",
      canal: "formulario",
      createdAt: nowIso,
      userAgent: userAgent ? userAgent.slice(0, 200) : undefined,
      ip: ip ? ip.split(",")[0].trim() : undefined,
    };

    await docRef.set(contactData);

    return NextResponse.json({
      success: true,
      messageId,
      message: "Sua mensagem foi enviada com sucesso! Responderemos em breve.",
    });
  } catch (error: any) {
    console.error("[api/contato] Erro ao processar mensagem de contato:", error);
    return NextResponse.json(
      { error: "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
