import { useMemo } from "react";
import { PlanAdsConfig, DEFAULT_PLAN_ADS_CONFIG } from "./planAds.types";

export interface AdInsertionSlot {
  index: number;
  variantIndex: number;
}

/**
 * Determina deterministicamente ou com base em probabilidade se um anúncio deve ser exibido.
 * @param probability 0 a 100
 * @param randomValue Opcional para testes unitários determinísticos (0 a 1)
 */
export function shouldDisplayAd(probability: number, randomValue = Math.random()): boolean {
  if (probability <= 0) return false;
  if (probability >= 100) return true;
  return randomValue * 100 <= probability;
}

/**
 * Calcula posições aleatórias seguras para inserção de anúncios em uma lista de itens.
 * Não altera ou remove itens da lista original.
 */
export function calculateAdSlots(
  totalItems: number,
  config: PlanAdsConfig = DEFAULT_PLAN_ADS_CONFIG,
  randomSeedFn = Math.random
): AdInsertionSlot[] {
  if (!config.enabled || totalItems < config.minItemsBeforeAd) {
    return [];
  }

  // Avalia a probabilidade configurada
  if (!shouldDisplayAd(config.displayProbability, randomSeedFn())) {
    return [];
  }

  const slots: AdInsertionSlot[] = [];
  const maxAds = Math.max(1, config.maxAdsPerList || 1);

  // 1º slot: entre minItemsBeforeAd e min(minItemsBeforeAd + 4, totalItems - 1)
  const minFirst = config.minItemsBeforeAd;
  const maxFirst = Math.min(totalItems - 1, minFirst + 4);
  const firstIndex = Math.floor(randomSeedFn() * (maxFirst - minFirst + 1)) + minFirst;

  slots.push({
    index: firstIndex,
    variantIndex: Math.floor(randomSeedFn() * (config.creatives?.length || 4)),
  });

  // 2º slot se houver itens suficientes (pelo menos 8 itens após o primeiro)
  if (maxAds > 1 && totalItems >= firstIndex + 8) {
    const minSecond = firstIndex + 6;
    const maxSecond = Math.min(totalItems - 1, minSecond + 6);
    if (minSecond <= maxSecond) {
      const secondIndex = Math.floor(randomSeedFn() * (maxSecond - minSecond + 1)) + minSecond;
      slots.push({
        index: secondIndex,
        variantIndex: Math.floor(randomSeedFn() * (config.creatives?.length || 4)),
      });
    }
  }

  return slots;
}

/**
 * Hook do React para manter estáveis as posições de anúncios calculadas aleatoriamente
 * durante re-renderizações da mesma página/lista de jogos, prevenindo layout shifts indesejados.
 */
export function useRandomPlanAdSlots(
  totalItems: number,
  customConfig?: Partial<PlanAdsConfig>,
  dependencyKey?: string | number
): AdInsertionSlot[] {
  return useMemo(() => {
    const mergedConfig: PlanAdsConfig = {
      ...DEFAULT_PLAN_ADS_CONFIG,
      ...(customConfig || {}),
    };
    return calculateAdSlots(totalItems, mergedConfig);
    // Recalcula apenas quando totalItems ou a chave de dependência mudar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalItems, dependencyKey, customConfig?.enabled, customConfig?.displayProbability]);
}
