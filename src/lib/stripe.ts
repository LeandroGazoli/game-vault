import Stripe from "stripe";

export const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY || "sk_test_placeholder_key",
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
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_1UBGD42Kf2AAuQLbjW9GBXPq",
    price: 9.9,
    formattedPrice: "R$ 9,90",
    interval: "mês",
    mode: "subscription" as const,
  },
  PRO_ANNUAL: {
    id: "pro_annual",
    name: "GameVault PRO (Anual)",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || "price_1UBGDG2Kf2AAuQLbXp9jvmtM",
    price: 79.9,
    formattedPrice: "R$ 79,90",
    interval: "ano",
    monthlyEquivalent: "R$ 6,65/mês",
    mode: "subscription" as const,
  },
  VIP_LIFETIME: {
    id: "vip_lifetime",
    name: "GameVault VIP (Membro Fundador)",
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_VIP_LIFETIME || "price_1UBGDS2Kf2AAuQLbv7nrE1QJ",
    price: 149.9,
    formattedPrice: "R$ 149,90",
    interval: "vitalício",
    mode: "payment" as const,
  },
};
