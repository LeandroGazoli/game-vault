import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getAuthenticatedUser } from "@/lib/serverAuth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authCheck = await getAuthenticatedUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Você precisa estar conectado para acessar o portal de assinaturas." },
        { status: authCheck.status }
      );
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "STRIPE_SECRET_KEY não configurada no servidor." },
        { status: 503 }
      );
    }

    const { user } = authCheck;
    const { customerId } = await request.json().catch(() => ({}));

    let targetCustomerId: string | null = null;

    // Se o cliente informou um customerId, valida se pertence de fato ao usuário autenticado
    if (customerId && typeof customerId === "string" && customerId.startsWith("cus_")) {
      try {
        const customer = await stripe.customers.retrieve(customerId);
        if (customer && !customer.deleted && "email" in customer && customer.email?.toLowerCase() === user.email.toLowerCase()) {
          targetCustomerId = customer.id;
        }
      } catch (err) {
        console.warn("[billing/portal] Erro ao validar customerId:", err);
      }
    }

    // Se não encontrou ou não informou, busca na base de clientes pelo e-mail verificado do token
    if (!targetCustomerId && user.email) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (customers.data.length > 0) {
        targetCustomerId = customers.data[0].id;
      }
    }

    if (!targetCustomerId) {
      return NextResponse.json(
        { error: "Nenhuma assinatura recorrente ativa vinculada ao seu e-mail no Stripe." },
        { status: 400 }
      );
    }

    const requestOrigin = request.headers.get("origin");
    const allowedOrigin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (requestOrigin && (requestOrigin.includes("localhost") || requestOrigin.includes("mygameslist.com.br") || requestOrigin.includes("gamevault")) ? requestOrigin : "https://www.mygameslist.com.br");

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: targetCustomerId,
      return_url: `${allowedOrigin}/perfil`,
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
