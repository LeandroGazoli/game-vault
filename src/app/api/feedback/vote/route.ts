import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyIdToken } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/feedback/vote
 * Body: { feedbackId: string, targetVote: 1 | -1 }
 *
 * Contagem de votos à prova de forja: roda a transação (ledger votes/{uid} + contadores
 * upvotesCount/downvotesCount/score) via Admin SDK. O uid vem do token (não do corpo).
 * As Security Rules bloqueiam o cliente de escrever os contadores e o ledger diretamente.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader =
      request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token de autenticação ausente." }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1]?.trim();
    if (!idToken) return NextResponse.json({ error: "Token inválido." }, { status: 401 });

    let uid: string;
    try {
      ({ uid } = await verifyIdToken(idToken));
    } catch {
      return NextResponse.json({ error: "Sessão inválida ou expirada." }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const feedbackId = typeof body.feedbackId === "string" ? body.feedbackId : "";
    const targetVote = body.targetVote === 1 || body.targetVote === -1 ? body.targetVote : null;

    if (!feedbackId || targetVote === null) {
      return NextResponse.json(
        { error: "Parâmetros inválidos (feedbackId, targetVote)." },
        { status: 400 }
      );
    }

    const db = getAdminDb();
    const feedbackRef = db.collection("feedback").doc(feedbackId);
    const voteRef = feedbackRef.collection("votes").doc(uid);

    const result = await db.runTransaction(async (tx) => {
      const feedbackSnap = await tx.get(feedbackRef);
      if (!feedbackSnap.exists) {
        throw new Error("NOT_FOUND");
      }
      const data = feedbackSnap.data() || {};
      let upvotes = data.upvotesCount || 0;
      let downvotes = data.downvotesCount || 0;

      const voteSnap = await tx.get(voteRef);
      let newUserVote: 1 | -1 | 0 = targetVote;

      if (!voteSnap.exists) {
        if (targetVote === 1) upvotes += 1;
        else downvotes += 1;
        tx.set(voteRef, { vote: targetVote, userId: uid, updatedAt: new Date().toISOString() });
      } else {
        const existingVote = voteSnap.data()?.vote as 1 | -1;
        if (existingVote === targetVote) {
          // Clicou de novo no mesmo botão -> cancela o voto
          newUserVote = 0;
          if (targetVote === 1) upvotes = Math.max(0, upvotes - 1);
          else downvotes = Math.max(0, downvotes - 1);
          tx.delete(voteRef);
        } else {
          // Trocou o voto
          if (targetVote === 1) {
            upvotes += 1;
            downvotes = Math.max(0, downvotes - 1);
          } else {
            downvotes += 1;
            upvotes = Math.max(0, upvotes - 1);
          }
          tx.set(voteRef, { vote: targetVote, userId: uid, updatedAt: new Date().toISOString() });
        }
      }

      const newScore = upvotes - downvotes;
      tx.update(feedbackRef, {
        upvotesCount: upvotes,
        downvotesCount: downvotes,
        score: newScore,
        updatedAt: new Date().toISOString(),
      });

      return { userVote: newUserVote, score: newScore, upvotes, downvotes };
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    if (error?.message === "NOT_FOUND") {
      return NextResponse.json({ error: "Feedback não encontrado." }, { status: 404 });
    }
    console.error("[api/feedback/vote] Erro:", error?.message || error);
    if (typeof error?.message === "string" && error.message.includes("FIREBASE_SERVICE_ACCOUNT_KEY")) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Erro ao registrar voto." }, { status: 500 });
  }
}
