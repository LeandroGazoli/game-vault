import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { saveUserProfile, getUserProfile } from "@/lib/firebase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId || !sessionId.startsWith("cs_")) {
    return NextResponse.json(
      { error: "ID de sessão do checkout inválido ou ausente." },
      { status: 400 }
    );
  }

  try {
    // 1. Consulta a sessão diretamente na API do Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Sessão não encontrada no Stripe." }, { status: 404 });
    }

    const isPaid = session.payment_status === "paid" || session.status === "complete";
    if (!isPaid) {
      return NextResponse.json({
        paid: false,
        status: session.status,
        paymentStatus: session.payment_status,
        message: "O pagamento ainda está sendo processado.",
      });
    }

    // 2. Extrai dados do usuário e plano
    const userId = session.client_reference_id || session.metadata?.userId;
    const planId = session.metadata?.planId;

    if (!userId) {
      return NextResponse.json({
        paid: true,
        activated: false,
        message: "Sessão paga, mas nenhum ID de usuário associado.",
      });
    }

    const plan = planId === "vip_lifetime" ? "vip" : "pro";
    const isSingleMonth = planId === "pro_single_month";
    const premiumUntil = isSingleMonth
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    // 3. Atualiza perfil no Firestore
    await saveUserProfile(userId, {
      plan,
      isPremium: true,
      hideAds: true,
      premiumUntil,
      updatedAt: new Date().toISOString(),
    });

    console.log(
      `[checkout/verify] Sucesso! Usuário ${userId} ativado como ${plan} (avulso: ${isSingleMonth}) via verificação de checkout.`
    );

    return NextResponse.json({
      success: true,
      paid: true,
      activated: true,
      plan,
      isPremium: true,
      premiumUntil,
      planName: session.metadata?.planName || (plan === "vip" ? "GameVault VIP" : "GameVault PRO"),
    });
  } catch (error: any) {
    console.error("[checkout/verify] Erro ao verificar sessão do Stripe:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao verificar sessão do checkout." },
      { status: 500 }
    );
  }
}
