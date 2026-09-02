import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getPlansConfig, PlanKey } from "@/lib/plans";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY não configurada no servidor." },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { planId, userId, userEmail, returnUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Você precisa estar conectado à sua conta para assinar." },
        { status: 401 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("STRIPE_SECRET_KEY não configurada.");
      return NextResponse.json(
        { error: "O gateway de pagamento está em manutenção. Por favor, tente novamente em alguns instantes." },
        { status: 503 }
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

    const origin =
      returnUrl ||
      request.headers.get("origin") ||
      "https://mygameslist.com.br";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPlan.priceId,
          quantity: 1,
        },
      ],
      mode: selectedPlan.mode,
      customer_email: userEmail || undefined,
      client_reference_id: userId,
      metadata: {
        userId,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
      },
      subscription_data:
        selectedPlan.mode === "subscription"
          ? {
              metadata: {
                userId,
                planId: selectedPlan.id,
              },
            }
          : undefined,
      success_url: `${origin}/profile?session_id={CHECKOUT_SESSION_ID}&upgraded=true&plan=${selectedPlan.id}`,
      cancel_url: `${origin}/profile?canceled=true`,
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
