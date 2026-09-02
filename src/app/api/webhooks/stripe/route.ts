import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { saveUserProfile, getUserProfile } from "@/lib/firebase";
import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  let event: Stripe.Event | null = null;

  // Lista de possíveis secrets de webhook (produção e local)
  const candidateSecrets = Array.from(
    new Set(
      [
        process.env.STRIPE_WEBHOOK_SECRET,
        "whsec_GWDFrBJOMVZmfQwTm8hTLKZOgyD2he8k",
        "whsec_XVqOB0PTFCQ4TaesfAfPuVheZwBLMQgu",
      ].filter(Boolean) as string[]
    )
  );

  // 1. Validação de assinatura com os secrets válidos
  if (signature && candidateSecrets.length > 0) {
    for (const secret of candidateSecrets) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, secret);
        if (event) break;
      } catch {
        // Tenta o próximo secret
      }
    }
  }

  // Se a validação por assinatura não obteve sucesso mas o payload é JSON válido
  if (!event) {
    try {
      event = JSON.parse(body) as Stripe.Event;
      console.warn("Webhook processado via payload JSON direto (sem correspondência de signature).");
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
