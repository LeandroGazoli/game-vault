import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPlansConfig, PlanKey } from "@/lib/plans";
import { getAuthenticatedUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY não configurada no servidor." },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { planId, returnUrl } = body;

    // Tenta obter o usuário autenticado via ID Token
    let effectiveUserId: string = body.userId;
    let effectiveUserEmail: string | undefined = body.userEmail;

    const authCheck = await getAuthenticatedUser(request);
    if (authCheck.authenticated && authCheck.user) {
      effectiveUserId = authCheck.user.uid;
      effectiveUserEmail = authCheck.user.email || effectiveUserEmail;
    }

    if (!effectiveUserId) {
      return NextResponse.json(
        { error: "Você precisa estar conectado à sua conta para assinar." },
        { status: 401 }
      );
    }

    // Carrega configurações dinâmicas de planos do Firestore
    const plansConfig = await getPlansConfig();
    const validPlanKey = (planId as PlanKey) in plansConfig ? (planId as PlanKey) : "pro_monthly";
    const selectedPlan = plansConfig[validPlanKey];

    if (!selectedPlan || !selectedPlan.priceId) {
      return NextResponse.json(
        { error: "Plano ou preço do Stripe não configurado." },
        { status: 400 }
      );
    }

    const requestOrigin = request.headers.get("origin");
    const allowedOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (requestOrigin && (requestOrigin.includes("localhost") || requestOrigin.includes("mygameslist.com.br") || requestOrigin.includes("gamevault"))
        ? requestOrigin
        : "https://www.mygameslist.com.br");

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: selectedPlan.mode,
      customer_email: effectiveUserEmail || undefined,
      client_reference_id: effectiveUserId,
      metadata: {
        userId: effectiveUserId,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
      },
      subscription_data:
        selectedPlan.mode === "subscription"
          ? {
              metadata: {
                userId: effectiveUserId,
                planId: selectedPlan.id,
              },
            }
          : undefined,
      success_url: `${allowedOrigin}/perfil?session_id={CHECKOUT_SESSION_ID}&upgraded=true&plan=${selectedPlan.id}`,
      cancel_url: `${allowedOrigin}/perfil?canceled=true`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: any) {
    // Log detalhado APENAS no servidor (nunca vaza para o cliente)
    console.error("Erro interno ao criar Checkout Session do Stripe:", error);
    return NextResponse.json(
      { error: "Não foi possível iniciar o checkout de pagamento. Verifique as configurações ou tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
