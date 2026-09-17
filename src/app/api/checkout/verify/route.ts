import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { adminSaveUserProfile } from "@/lib/firebaseAdmin";
import { getAuthenticatedUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Esta rota concede acesso premium via Admin SDK (ignora as Security Rules), então
  // exige identidade. Sem isso, qualquer um que obtivesse um `cs_...` — que trafega na
  // barra de endereço, no histórico e em scripts de terceiros da página de retorno —
  // poderia reaplicar a concessão sem estar logado.
  const authCheck = await getAuthenticatedUser(request);
  if (!authCheck.authenticated || !authCheck.user) {
    return NextResponse.json(
      { error: authCheck.error || "Autenticação necessária." },
      { status: authCheck.status || 401 }
    );
  }

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

    // `status === "complete"` sozinho aceitaria sessão sem pagamento efetivo
    // (payment_status "no_payment_required", caso de cupom de 100%).
    const isPaid = session.payment_status === "paid";
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

    // A sessão precisa pertencer a quem está chamando — senão um `cs_...` vazado
    // concederia premium à conta embutida nele, seja ela de quem for.
    if (userId && userId !== authCheck.user.uid) {
      return NextResponse.json(
        { error: "Esta sessão de checkout não pertence à sua conta." },
        { status: 403 }
      );
    }

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

    // 3. Atualiza perfil no Firestore via Admin SDK (ignora Security Rules; campos travados no cliente)
    await adminSaveUserProfile(userId, {
      plan,
      isPremium: true,
      hideAds: true,
      premiumUntil,
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
      planName: session.metadata?.planName || (plan === "vip" ? "MyGameList VIP" : "MyGameList PRO"),
    });
  } catch (error: any) {
    console.error("[checkout/verify] Erro ao verificar sessão do Stripe:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao verificar sessão do checkout." },
      { status: 500 }
    );
  }
}
