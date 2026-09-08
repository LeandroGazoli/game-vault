import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyIdToken, adminSaveUserProfile } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/user/reconcile-access
 *
 * Rebaixa o usuário para free quando um acesso CONCEDIDO (grant) expirou (premiumUntil no
 * passado). Idempotente. Concessões de compra (planSource="purchase") NÃO são rebaixadas aqui —
 * elas seguem o webhook do Stripe (customer.subscription.deleted). Admins nunca são rebaixados.
 *
 * Chamado pelo cliente (AuthContext) apenas quando ele detecta expiração — barato e raro.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader =
      request.headers.get("authorization") || request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Token ausente." }, { status: 401 });
    }
    const idToken = authHeader.split(" ")[1]?.trim();
    if (!idToken) return NextResponse.json({ error: "Token inválido." }, { status: 401 });

    let uid: string;
    try {
      ({ uid } = await verifyIdToken(idToken));
    } catch {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    const snap = await getAdminDb().collection("users").doc(uid).get();
    if (!snap.exists) {
      return NextResponse.json({ error: "Perfil não encontrado." }, { status: 404 });
    }
    const u = snap.data() || {};

    if (u.isAdmin) {
      return NextResponse.json({ reconciled: false, reason: "admin" });
    }

    const plan = u.plan || "free";
    const source = u.planSource || null;
    const until = u.premiumUntil ? new Date(u.premiumUntil).getTime() : null;
    const expired = until !== null && !isNaN(until) && until < Date.now();

    // Só rebaixa concessões (não-compras) que realmente expiraram
    if (plan !== "free" && source !== "purchase" && expired) {
      await adminSaveUserProfile(uid, {
        plan: "free",
        isPremium: false,
        hideAds: false,
        premiumUntil: null,
        planSource: null,
        planLabel: null,
      });
      return NextResponse.json({ reconciled: true, plan: "free" });
    }

    return NextResponse.json({ reconciled: false });
  } catch (error: any) {
    console.error("[api/user/reconcile-access] Erro:", error?.message || error);
    if (typeof error?.message === "string" && error.message.includes("FIREBASE_SERVICE_ACCOUNT_KEY")) {
      return NextResponse.json({ error: error.message }, { status: 503 });
    }
    return NextResponse.json({ error: "Erro ao reconciliar acesso." }, { status: 500 });
  }
}
