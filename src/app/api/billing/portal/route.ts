import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { customerId, returnUrl } = await request.json();

    if (!customerId) {
      return NextResponse.json(
        { error: "ID de cliente Stripe não encontrado." },
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
    console.error("Erro ao criar Portal do Stripe:", error);
    return NextResponse.json(
      { error: error.message || "Falha ao abrir portal de assinaturas" },
      { status: 500 }
    );
  }
}
