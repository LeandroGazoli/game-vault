import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * POST /api/billing/cancel
 * Agenda o cancelamento da assinatura no fim do período vigente (cancel_at_period_end).
 * Sem reembolso (política documentada na Política de Privacidade — não exposta na UI).
 * Valida que a assinatura pertence ao e-mail verificado do usuário.
 */
export async function POST(request: NextRequest) {
  try {
    const authCheck = await getAuthenticatedUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Conecte-se para gerenciar sua assinatura." },
        { status: authCheck.status }
      );
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe não configurado." }, { status: 503 });
    }

    const email = authCheck.user.email;
    if (!email) {
      return NextResponse.json({ error: "E-mail não disponível." }, { status: 400 });
    }

    const customers = await stripe.customers.list({ email, limit: 1 });
    if (customers.data.length === 0) {
      return NextResponse.json({ error: "Nenhuma assinatura encontrada." }, { status: 404 });
    }
    const customerId = customers.data[0].id;

    const subs = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });
    const sub = subs.data[0];
    if (!sub) {
      return NextResponse.json({ error: "Nenhuma assinatura ativa para cancelar." }, { status: 404 });
    }

    const updated = await stripe.subscriptions.update(sub.id, {
      cancel_at_period_end: true,
    });

    return NextResponse.json({
      success: true,
      cancelAtPeriodEnd: updated.cancel_at_period_end,
      currentPeriodEnd: (updated as any).current_period_end
        ? new Date((updated as any).current_period_end * 1000).toISOString()
        : null,
    });
  } catch (error: any) {
    console.error("[api/billing/cancel] Erro:", error?.message || error);
    return NextResponse.json({ error: "Não foi possível processar o cancelamento." }, { status: 500 });
  }
}
