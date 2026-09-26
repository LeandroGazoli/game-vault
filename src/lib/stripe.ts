import Stripe from "stripe";

// Valor deliberadamente inválido, usado somente para permitir a avaliação do módulo durante
// o build sem carregar um segredo embutido. Em produção STRIPE_SECRET_KEY é obrigatória.
const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || "invalid-stripe-key";

export const stripe = new Stripe(
  stripeSecretKey,
  {
    apiVersion: "2025-02-24.acacia" as any,
    appInfo: {
      name: "MyGameList",
      version: "0.1.0",
    },
  }
);

export const STRIPE_PLANS = {
  PRO_MONTHLY: {
    id: "pro_monthly",
    name: "MyGameList PRO (Mensal)",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_1UBHDW2Kf2AAuQLblxkNUioG",
    price: 9.9,
    formattedPrice: "R$ 9,90",
    interval: "mês",
    mode: "subscription" as const,
  },
  PRO_ANNUAL: {
    id: "pro_annual",
    name: "MyGameList PRO (Anual)",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || "price_1UBHDW2Kf2AAuQLblBdLv8op",
    price: 79.9,
    formattedPrice: "R$ 79,90",
    interval: "ano",
    monthlyEquivalent: "R$ 6,65/mês",
    mode: "subscription" as const,
  },
  VIP_LIFETIME: {
    id: "vip_lifetime",
    name: "MyGameList VIP (Membro Fundador)",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP_LIFETIME || "price_1UBHDX2Kf2AAuQLbsbuoD6ll",
    price: 149.9,
    formattedPrice: "R$ 149,90",
    interval: "vitalício",
    mode: "payment" as const,
  },
};
