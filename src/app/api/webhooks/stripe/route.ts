import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { saveUserProfile, getUserProfile } from "@/lib/firebase";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event;

  // 1. Validação de assinatura se STRIPE_WEBHOOK_SECRET estiver configurado
  if (process.env.STRIPE_WEBHOOK_SECRET && signature) {
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: any) {
      console.error("Erro na validação do webhook do Stripe:", err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
  } else {
    // Modo direto sem verificação de secret (para desenvolvimento/testes)
    try {
      event = JSON.parse(body) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: "Payload inválido" }, { status: 400 });
    }
  }

  // 2. Processamento dos eventos
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.userId;
        const planId = session.metadata?.planId;

        if (userId) {
          const plan = planId === "vip_lifetime" ? "vip" : "pro";
          await saveUserProfile(userId, {
            plan,
            isPremium: true,
            hideAds: true,
            updatedAt: new Date().toISOString(),
          });
          console.log(`Usuário ${userId} atualizado com sucesso para plano ${plan}!`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
          await saveUserProfile(userId, {
            plan: "free",
            isPremium: false,
            hideAds: false,
            updatedAt: new Date().toISOString(),
          });
          console.log(`Assinatura do usuário ${userId} cancelada.`);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log(`Fatura paga com sucesso: ${invoice.id}`);
        break;
      }

      default:
        console.log(`Evento Stripe não tratado: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Erro ao processar evento Stripe:", error);
    return NextResponse.json(
      { error: "Erro interno no processamento do webhook" },
      { status: 500 }
    );
  }
}
