import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY não configurada no servidor." },
        { status: 503 }
      );
    }

    const { customerId, userEmail, returnUrl } = await request.json();

    let targetCustomerId = customerId;

    if (!targetCustomerId && userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      if (customers.data.length > 0) {
        targetCustomerId = customers.data[0].id;
      }
    }

    if (!targetCustomerId) {
      return NextResponse.json(
        { error: "Nenhuma assinatura recorrente ativa vinculada ao seu e-mail no Stripe." },
        { status: 400 }
      );
    }

    const origin =
      returnUrl ||
      request.headers.get("origin") ||
      "https://mygameslist.com.br";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/profile`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error: any) {
    console.error("Erro interno ao criar Portal do Stripe:", error);
    return NextResponse.json(
      { error: "Não foi possível abrir o portal de assinaturas no momento. Tente novamente mais tarde." },
      { status: 500 }
    );
  }
}
