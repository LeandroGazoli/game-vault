import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { customerId, returnUrl } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "Identificador de assinatura não encontrado." },
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
