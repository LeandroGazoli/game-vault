import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { ADMIN_EMAILS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminEmail = request.nextUrl.searchParams.get("adminEmail");

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail.toLowerCase().trim())) {
      return NextResponse.json(
        { error: "Acesso não autorizado. Apenas administradores podem gerenciar o Stripe." },
        { status: 403 }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY não configurada no servidor." },
        { status: 503 }
      );
    }

    // Busca produtos e preços ativos no Stripe
    const productsRes = await stripe.products.list({ active: true, limit: 50 });
    const pricesRes = await stripe.prices.list({
      active: true,
      limit: 100,
      expand: ["data.product"],
    });

    const products = productsRes.data.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description || "",
      active: p.active,
    }));

    const prices = pricesRes.data.map((pr) => {
      const prod = typeof pr.product === "object" && pr.product && !("deleted" in pr.product) ? pr.product : null;
      const amountInReais = pr.unit_amount ? (pr.unit_amount / 100).toFixed(2) : "0.00";
      const formattedPrice = `R$ ${amountInReais.replace(".", ",")}`;

      return {
        id: pr.id,
        productId: prod ? prod.id : typeof pr.product === "string" ? pr.product : "",
        productName: prod ? prod.name : "Produto",
        unit_amount: pr.unit_amount,
        amountInReais: Number(amountInReais),
        formattedPrice,
        currency: pr.currency,
        type: pr.type, // 'recurring' | 'one_time'
        interval: pr.recurring ? pr.recurring.interval : null, // 'month' | 'year' | null
        intervalCount: pr.recurring ? pr.recurring.interval_count : null,
        active: pr.active,
      };
    });

    return NextResponse.json({ products, prices });
  } catch (error: any) {
    console.error("Erro ao listar preços e produtos do Stripe:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao consultar API do Stripe." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { adminEmail, productId, amount, type, interval } = body;

    if (!adminEmail || !ADMIN_EMAILS.includes(adminEmail.toLowerCase().trim())) {
      return NextResponse.json(
        { error: "Acesso não autorizado." },
        { status: 403 }
      );
    }

    if (!productId || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Produto e valor válido (maior que zero) são obrigatórios." },
        { status: 400 }
      );
    }

    const unitAmountInCents = Math.round(amount * 100);

    const priceParams: any = {
      product: productId,
      unit_amount: unitAmountInCents,
      currency: "brl",
    };

    if (type === "recurring") {
      priceParams.recurring = {
        interval: interval === "year" ? "year" : "month",
      };
    }

    const newPrice = await stripe.prices.create(priceParams);

    return NextResponse.json({
      success: true,
      price: {
        id: newPrice.id,
        productId: newPrice.product,
        unit_amount: newPrice.unit_amount,
        formattedPrice: `R$ ${(amount).toFixed(2).replace(".", ",")}`,
        type: newPrice.type,
        interval: newPrice.recurring?.interval || null,
      },
    });
  } catch (error: any) {
    console.error("Erro ao criar preço no Stripe:", error);
    return NextResponse.json(
      { error: error.message || "Erro ao criar novo preço no Stripe." },
      { status: 500 }
    );
  }
}
