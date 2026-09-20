import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { requireAdminUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export interface MonthlyRevenue {
  monthName: string;
  year: number;
  gross: number;
  fees: number;
  net: number;
  refunds: number;
  chargesCount: number;
  netMarginPercentage: number;
}

export interface RevenueSnapshot {
  mrr: number; // receita recorrente mensal normalizada do Stripe (BRL)
  activeSubscriptions: number;
  grossTotal: number; // receita bruta acumulada de cobranças pagas (BRL)
  netTotal: number; // receita líquida acumulada (BRL)
  feesTotal: number; // taxas acumuladas da Stripe (BRL)
  totalCharges: number;
  refundedTotal: number;
  currency: string;
  isTestMode: boolean;
  currentMonth: MonthlyRevenue;
  recentTransactions: Array<{
    id: string;
    amount: number;
    fee: number;
    net: number;
    currency: string;
    created: string;
    description: string | null;
    status: string;
  }>;
  computedAt: string;
}

let cache: { data: RevenueSnapshot; ts: number } | null = null;
const TTL_MS = 2 * 60 * 1000; // 2 minutos para manter sincronizado e rápido

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito a administradores." },
        { status: authCheck.status }
      );
    }

    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Stripe não configurado no servidor." },
        { status: 503 }
      );
    }

    const isTestMode = secretKey.startsWith("sk_test_");

    if (cache && Date.now() - cache.ts < TTL_MS) {
      return NextResponse.json({ ...cache.data, cached: true });
    }

    // 1) MRR e Assinaturas Ativas reais do Stripe
    let mrr = 0;
    let activeSubscriptions = 0;
    let currency = "brl";

    for await (const sub of stripe.subscriptions.list({
      status: "active",
      limit: 100,
    })) {
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

    // 2) Detalhamento Financeiro do Mês Vigente e Histórico usando Balance Transactions
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfMonthUnix = Math.floor(startOfMonth.getTime() / 1000);

    const monthName = now.toLocaleDateString("pt-BR", { month: "long" });
    const formattedMonthName =
      monthName.charAt(0).toUpperCase() + monthName.slice(1);

    let monthGross = 0;
    let monthFees = 0;
    let monthNet = 0;
    let monthRefunds = 0;
    let monthChargesCount = 0;

    let allTimeGross = 0;
    let allTimeFees = 0;
    let allTimeNet = 0;
    let allTimeRefunds = 0;
    let totalChargesCount = 0;

    const recentTransactions: RevenueSnapshot["recentTransactions"] = [];

    // Busca transações de saldo do Stripe (contém gross, fee e net oficiais)
    try {
      for await (const txn of stripe.balanceTransactions.list({ limit: 100 })) {
        const amount = (txn.amount || 0) / 100;
        const fee = (txn.fee || 0) / 100;
        const net = (txn.net || 0) / 100;
        const isThisMonth = (txn.created || 0) >= startOfMonthUnix;
        currency = txn.currency || currency;

        if (recentTransactions.length < 10) {
          recentTransactions.push({
            id: txn.id,
            amount: Math.round(amount * 100) / 100,
            fee: Math.round(fee * 100) / 100,
            net: Math.round(net * 100) / 100,
            currency: txn.currency,
            created: new Date(txn.created * 1000).toISOString(),
            description: txn.description || txn.type,
            status: txn.status,
          });
        }

        if (txn.type === "charge" || txn.type === "payment") {
          allTimeGross += amount;
          allTimeFees += fee;
          allTimeNet += net;
          totalChargesCount += 1;

          if (isThisMonth) {
            monthGross += amount;
            monthFees += fee;
            monthNet += net;
            monthChargesCount += 1;
          }
        } else if (txn.type === "refund") {
          // No Stripe, estorno tem amount negativo
          const absAmount = Math.abs(amount);
          allTimeRefunds += absAmount;
          allTimeFees += fee;
          allTimeNet += net;

          if (isThisMonth) {
            monthRefunds += absAmount;
            monthFees += fee;
            monthNet += net;
          }
        } else {
          // Outros ajustes de saldo
          allTimeFees += fee;
          allTimeNet += net;
          if (isThisMonth) {
            monthFees += fee;
            monthNet += net;
          }
        }
      }
    } catch (txnError) {
      console.warn("[api/admin/stripe/revenue] Falha ao listar balanceTransactions, tentando fallback charges:", txnError);
      // Fallback gracioso para charges caso balanceTransactions tenha restrição de permissão
      for await (const charge of stripe.charges.list({ limit: 100 })) {
        if (charge.paid && charge.status === "succeeded") {
          const amt = (charge.amount || 0) / 100;
          const ref = (charge.amount_refunded || 0) / 100;
          allTimeGross += amt;
          allTimeRefunds += ref;
          totalChargesCount += 1;
          const isThisMonth = (charge.created || 0) >= startOfMonthUnix;
          if (isThisMonth) {
            monthGross += amt;
            monthRefunds += ref;
            monthChargesCount += 1;
          }
        }
      }
      // Estimativa padrão de taxa Stripe Brasil (aprox 3.99% + R$ 0.39) no fallback
      monthFees = monthGross > 0 ? monthGross * 0.04 + monthChargesCount * 0.39 : 0;
      monthNet = monthGross - monthFees - monthRefunds;
      allTimeFees = allTimeGross > 0 ? allTimeGross * 0.04 + totalChargesCount * 0.39 : 0;
      allTimeNet = allTimeGross - allTimeFees - allTimeRefunds;
    }

    const netMargin = monthGross > 0 ? Math.round((monthNet / monthGross) * 100) : 0;

    const currentMonth: MonthlyRevenue = {
      monthName: formattedMonthName,
      year: now.getFullYear(),
      gross: Math.round(monthGross * 100) / 100,
      fees: Math.round(monthFees * 100) / 100,
      net: Math.round(monthNet * 100) / 100,
      refunds: Math.round(monthRefunds * 100) / 100,
      chargesCount: monthChargesCount,
      netMarginPercentage: netMargin,
    };

    const data: RevenueSnapshot = {
      mrr: Math.round(mrr * 100) / 100,
      activeSubscriptions,
      grossTotal: Math.round(allTimeGross * 100) / 100,
      netTotal: Math.round(allTimeNet * 100) / 100,
      feesTotal: Math.round(allTimeFees * 100) / 100,
      totalCharges: totalChargesCount,
      refundedTotal: Math.round(allTimeRefunds * 100) / 100,
      currency,
      isTestMode,
      currentMonth,
      recentTransactions,
      computedAt: new Date().toISOString(),
    };

    cache = { data, ts: Date.now() };

    return NextResponse.json({ ...data, cached: false });
  } catch (error: any) {
    console.error("[api/admin/stripe/revenue] Erro:", error?.message || error);
    return NextResponse.json(
      { error: "Não foi possível obter os dados financeiros do Stripe." },
      { status: 500 }
    );
  }
}
