import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/billing/subscription
 * Retorna os detalhes da assinatura recorrente ativa do usuário autenticado (achando o
 * customer pelo e-mail verificado do token, mesmo padrão de /api/billing/portal).
 */
export async function GET(request: NextRequest) {
  try {
    const authCheck = await getAuthenticatedUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Conecte-se para ver sua assinatura." },
        { status: authCheck.status }
      );
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe não configurado." }, { status: 503 });
    }

    const email = authCheck.user.email;
    if (!email) {
      return NextResponse.json({ hasSubscription: false });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({ hasSubscription: false });
    }
    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "all",
      limit: 10,
    });

    // Pega a assinatura mais relevante (ativa/trial/past_due, senão a mais recente)
    const relevant =
      subs.data.find((s) => ["active", "trialing", "past_due", "unpaid"].includes(s.status)) ||
      subs.data[0];

    if (!relevant) {
      return NextResponse.json({ hasSubscription: false, customerId });
    }

    const item = relevant.items.data[0];
    const price = item?.price;
    const amount = typeof price?.unit_amount === "number" ? price.unit_amount / 100 : null;
    const interval = price?.recurring?.interval || null;

    return NextResponse.json({
      hasSubscription: true,
      customerId,
      subscriptionId: relevant.id,
      status: relevant.status,
      currentPeriodEnd: (relevant as any).current_period_end
        ? new Date((relevant as any).current_period_end * 1000).toISOString()
        : null,
      cancelAtPeriodEnd: relevant.cancel_at_period_end,
      canceledAt: relevant.canceled_at ? new Date(relevant.canceled_at * 1000).toISOString() : null,
      amount,
      currency: price?.currency || "brl",
      interval, // "month" | "year"
      planName: (relevant.metadata?.planId as string) || null,
    });
  } catch (error: any) {
    console.error("[api/billing/subscription] Erro:", error?.message || error);
    return NextResponse.json({ error: "Não foi possível carregar sua assinatura." }, { status: 500 });
  }
}
