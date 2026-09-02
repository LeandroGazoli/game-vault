import Stripe from "stripe";

// Fallback para build estático do Next.js caso as variáveis ainda não tenham sido injetadas
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_for_build_environment";

export const stripe = new Stripe(
  stripeSecretKey,
  {
    apiVersion: "2025-02-24.acacia" as any,
    appInfo: {
      name: "GameVault",
      version: "0.1.0",
    },
  }
);

export const STRIPE_PLANS = {
  PRO_MONTHLY: {
    id: "pro_monthly",
    name: "GameVault PRO (Mensal)",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_1UBHDW2Kf2AAuQLblxkNUioG",
    price: 9.9,
    formattedPrice: "R$ 9,90",
    interval: "mês",
    mode: "subscription" as const,
  },
  PRO_ANNUAL: {
    id: "pro_annual",
    name: "GameVault PRO (Anual)",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || "price_1UBHDW2Kf2AAuQLblBdLv8op",
    price: 79.9,
    formattedPrice: "R$ 79,90",
    interval: "ano",
    monthlyEquivalent: "R$ 6,65/mês",
    mode: "subscription" as const,
  },
  VIP_LIFETIME: {
    id: "vip_lifetime",
    name: "GameVault VIP (Membro Fundador)",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP_LIFETIME || "price_1UBHDX2Kf2AAuQLbsbuoD6ll",
    price: 149.9,
    formattedPrice: "R$ 149,90",
    interval: "vitalício",
    mode: "payment" as const,
  },
};
