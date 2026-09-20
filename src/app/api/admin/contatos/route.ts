import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { firestoreRestQuery } from "@/lib/firestoreRest";
import { ContactMessage } from "@/lib/types/contact.types";

export const dynamic = "force-dynamic";

/**
 * GET: Lista as mensagens de contato para a visão do administrador.
 */
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
    const status = searchParams.get("status");
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "100", 10), 1), 200);

    const messages = await firestoreRestQuery<ContactMessage>("contact_messages", {
      limit,
    });

    // Ordena em memória por data decrescente (mais recente primeiro)
    let filtered = (messages || []).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );

    if (status && status !== "all") {
      filtered = filtered.filter((m) => m.status === status);
    }

    return NextResponse.json({ messages: filtered });
  } catch (error: any) {
    console.error("[api/admin/contatos] Erro GET:", error);
    return NextResponse.json(
      { error: "Erro interno ao carregar mensagens de contato." },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Atualiza o status ou anotações de uma mensagem (lido, arquivado, etc).
 */
export async function PATCH(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito." },
        { status: authCheck.status }
      );
    }

    const body: any = await request.json().catch(() => ({}));
    const { id, status } = body;

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID da mensagem é obrigatório." }, { status: 400 });
    }

    const db = getAdminDb();
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
      if (status === "lido") {
        updateData.readAt = new Date().toISOString();
      }
    }

    await db.collection("contact_messages").doc(id).set(updateData, { merge: true });

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("[api/admin/contatos] Erro PATCH:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar mensagem de contato." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove uma mensagem do histórico.
 */
export async function DELETE(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito." },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID da mensagem não informado." }, { status: 400 });
    }

    const db = getAdminDb();
    await db.collection("contact_messages").doc(id).delete();

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error("[api/admin/contatos] Erro DELETE:", error);
    return NextResponse.json(
      { error: "Erro interno ao remover mensagem." },
      { status: 500 }
    );
  }
}
