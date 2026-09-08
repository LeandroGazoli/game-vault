import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAdminUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface RevenueSnapshot {
  mrr: number;            // receita recorrente mensal normalizada (BRL)
  activeSubscriptions: number;
  grossTotal: number;     // receita bruta acumulada de cobranças pagas (BRL)
  totalCharges: number;
  refundedTotal: number;
  currency: string;
  approxCharges: boolean; // true se a soma de cobranças foi truncada pelo cap
  computedAt: string;
}

let cache: { data: RevenueSnapshot; ts: number } | null = null;
const TTL_MS = 5 * 60 * 1000;
const CHARGE_CAP = 1000; // limite de cobranças percorridas

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito a administradores." },
        { status: authCheck.status }
      );
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Stripe não configurado." }, { status: 503 });
    }

    if (cache && Date.now() - cache.ts < TTL_MS) {
      return NextResponse.json({ ...cache.data, cached: true });
    }

    // 1) MRR a partir das assinaturas ativas (normaliza anual -> mensal)
    let mrr = 0;
    let activeSubscriptions = 0;
    let currency = "brl";
    for await (const sub of stripe.subscriptions.list({ status: "active", limit: 100 })) {
      const price = sub.items.data[0]?.price;
      if (!price || typeof price.unit_amount !== "number") continue;
      currency = price.currency || currency;
      const amount = price.unit_amount / 100;
      const interval = price.recurring?.interval;
      const count = price.recurring?.interval_count || 1;
      if (interval === "month") mrr += amount / count;
      else if (interval === "year") mrr += amount / (12 * count);
      else if (interval === "week") mrr += (amount * 4.345) / count;
      activeSubscriptions += 1;
    }

    // 2) Receita bruta acumulada (cobranças pagas) — inclui VIP vitalício (one-time)
    let grossTotal = 0;
    let refundedTotal = 0;
    let totalCharges = 0;
    let seen = 0;
    let approxCharges = false;
    for await (const charge of stripe.charges.list({ limit: 100 })) {
      seen += 1;
      if (seen > CHARGE_CAP) {
        approxCharges = true;
        break;
      }
      if (charge.paid && charge.status === "succeeded") {
        grossTotal += (charge.amount || 0) / 100;
        refundedTotal += (charge.amount_refunded || 0) / 100;
        totalCharges += 1;
        currency = charge.currency || currency;
      }
    }

    const data: RevenueSnapshot = {
      mrr: Math.round(mrr * 100) / 100,
      activeSubscriptions,
      grossTotal: Math.round((grossTotal - refundedTotal) * 100) / 100,
      totalCharges,
      refundedTotal: Math.round(refundedTotal * 100) / 100,
      currency,
      approxCharges,
      computedAt: new Date().toISOString(),
    };
    cache = { data, ts: Date.now() };

    return NextResponse.json({ ...data, cached: false });
  } catch (error: any) {
    console.error("[api/admin/stripe/revenue] Erro:", error?.message || error);
    return NextResponse.json({ error: "Não foi possível obter a receita do Stripe." }, { status: 500 });
  }
}
