import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { saveUserProfile, getUserProfile } from "@/lib/firebase";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    return NextResponse.json(
      { error: "Cabeçalho stripe-signature ausente." },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error("[webhook/stripe] STRIPE_WEBHOOK_SECRET não configurada no servidor.");
    return NextResponse.json(
      { error: "Webhook secret não configurado no servidor." },
      { status: 500 }
    );
  }

  let event: Stripe.Event;
  // 1. Validação estrita de assinatura criptográfica
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("[webhook/stripe] Assinatura do Stripe inválida:", err.message);
    return NextResponse.json(
      { error: "Assinatura de webhook inválida." },
      { status: 400 }
    );
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
          const isSingleMonth = planId === "pro_single_month";
          const premiumUntil = isSingleMonth
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            : null;

          await saveUserProfile(userId, {
            plan,
            isPremium: true,
            hideAds: true,
            premiumUntil,
            updatedAt: new Date().toISOString(),
          });
          console.log(`Usuário ${userId} atualizado com sucesso para plano ${plan} (avulso: ${isSingleMonth})!`);
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
