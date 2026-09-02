import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_PLANS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { planId, userId, userEmail, returnUrl } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "Você precisa estar conectado à sua conta para assinar." },
        { status: 401 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      return NextResponse.json(
        { error: "A chave STRIPE_SECRET_KEY não foi configurada nas variáveis de ambiente." },
        { status: 500 }
      );
    }

    let selectedPlan: typeof STRIPE_PLANS[keyof typeof STRIPE_PLANS] = STRIPE_PLANS.PRO_MONTHLY;
    if (planId === "pro_annual") {
      selectedPlan = STRIPE_PLANS.PRO_ANNUAL;
    } else if (planId === "vip_lifetime") {
      selectedPlan = STRIPE_PLANS.VIP_LIFETIME;
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
    console.error("Erro ao criar Checkout Session do Stripe:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao iniciar checkout no Stripe" },
      { status: 500 }
    );
  }
}
