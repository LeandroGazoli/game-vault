import { PlansConfig, DEFAULT_PLANS_CONFIG } from "../plans.types";
import { PromoCreativeConfig } from "./planAds.types";

/**
 * Formata um valor numérico em reais (ex: 6.65 -> "R$ 6,65")
 */
export function formatCurrencyBrl(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

/**
 * Calcula a melhor precificação mensal de planos (ex: plano anual dividido por 12 meses)
 */
export function getLowestMonthlyPrice(plansConfig: PlansConfig): {
  monthlyRate: number;
  formattedText: string;
} {
  const annual = plansConfig.pro_annual || DEFAULT_PLANS_CONFIG.pro_annual;
  const monthly = plansConfig.pro_monthly || DEFAULT_PLANS_CONFIG.pro_monthly;

  // Se houver plano anual ativo, o menor valor mensal é o anual / 12
  let lowestRate = monthly.price;
  if (annual.enabled && annual.price > 0) {
    const annualMonthlyRate = annual.price / 12;
    if (annualMonthlyRate < lowestRate) {
      lowestRate = annualMonthlyRate;
    }
  }

  return {
    monthlyRate: lowestRate,
    formattedText: `A partir de ${formatCurrencyBrl(lowestRate)}/mês`,
  };
}

/**
 * Retorna a nota de preço dinâmica sincronizada para um determinado criativo,
 * impedindo desincronização entre os anúncios e os preços reais cadastrados no Stripe/Firestore.
 */
export function getSyncedPriceNote(
  creative: PromoCreativeConfig,
  plansConfig: PlansConfig
): string {
  // Se o criativo tem um plano especificamente vinculado
  if (creative.linkedPlanKey) {
    const plan = plansConfig[creative.linkedPlanKey] || DEFAULT_PLANS_CONFIG[creative.linkedPlanKey];

    if (creative.linkedPlanKey === "pro_annual") {
      const monthlyRate = plan.price / 12;
      return `A partir de ${formatCurrencyBrl(monthlyRate)}/mês`;
    }

    if (creative.linkedPlanKey === "vip_lifetime") {
      return plan.formattedPrice || "Pagamento Único";
    }

    if (creative.linkedPlanKey === "pro_monthly" || creative.linkedPlanKey === "pro_single_month") {
      if (creative.id === "xp-boost") {
        return "Multiplicador 1.5x";
      }
      if (creative.id === "profile-pro") {
        return "Selo PRO Neon";
      }
      return `${plan.formattedPrice}${plan.intervalText}`;
    }
  }

  // Fallback: se houver priceNote customizado no criativo, usa-o, senão pega a menor taxa mensal
  if (creative.priceNote && creative.priceNote.trim().length > 0) {
    return creative.priceNote;
  }

  return getLowestMonthlyPrice(plansConfig).formattedText;
}
