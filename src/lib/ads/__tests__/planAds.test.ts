import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldDisplayAd, calculateAdSlots } from "../useRandomPlanAdSlot";
import { getSyncedPriceNote, getLowestMonthlyPrice, formatCurrencyBrl } from "../priceSync";
import { DEFAULT_PLAN_ADS_CONFIG, PlanAdsConfig } from "../planAds.types";
import { DEFAULT_PLANS_CONFIG, PlansConfig } from "../../plans.types";

describe("Sistema de Anúncios de Planos (Plan Ads System)", () => {
  describe("1. Lógica de Probabilidade (shouldDisplayAd)", () => {
    it("deve sempre retornar falso quando a probabilidade for 0%", () => {
      assert.equal(shouldDisplayAd(0, 0), false);
      assert.equal(shouldDisplayAd(0, 0.5), false);
      assert.equal(shouldDisplayAd(0, 0.99), false);
    });

    it("deve sempre retornar verdadeiro quando a probabilidade for 100%", () => {
      assert.equal(shouldDisplayAd(100, 0), true);
      assert.equal(shouldDisplayAd(100, 0.5), true);
      assert.equal(shouldDisplayAd(100, 0.99), true);
    });

    it("deve respeitar a probabilidade intermediária", () => {
      // 50% de probabilidade: random <= 0.5 é true, > 0.5 é false
      assert.equal(shouldDisplayAd(50, 0.49), true);
      assert.equal(shouldDisplayAd(50, 0.50), true);
      assert.equal(shouldDisplayAd(50, 0.51), false);
    });
  });

  describe("2. Inserção Randômica de Slots (calculateAdSlots)", () => {
    it("não deve inserir anúncios se ads estiverem desativados", () => {
      const config: PlanAdsConfig = { ...DEFAULT_PLAN_ADS_CONFIG, enabled: false };
      const slots = calculateAdSlots(20, config);
      assert.deepEqual(slots, []);
    });

    it("não deve inserir anúncios se total de itens for menor que minItemsBeforeAd", () => {
      const config: PlanAdsConfig = { ...DEFAULT_PLAN_ADS_CONFIG, enabled: true, minItemsBeforeAd: 5 };
      const slots = calculateAdSlots(4, config, () => 0.1);
      assert.deepEqual(slots, []);
    });

    it("deve inserir slot de anúncio em posição válida quando aprovado pela probabilidade", () => {
      const config: PlanAdsConfig = {
        ...DEFAULT_PLAN_ADS_CONFIG,
        enabled: true,
        displayProbability: 100,
        minItemsBeforeAd: 3,
        maxAdsPerList: 1,
      };

      // Simula randomSeedFn constante retornando 0.5
      const slots = calculateAdSlots(15, config, () => 0.5);
      assert.equal(slots.length, 1);
      assert.ok(slots[0].index >= config.minItemsBeforeAd);
      assert.ok(slots[0].index < 15);
    });

    it("não deve alterar ou prejudicar a integridade dos itens originais da lista", () => {
      const originalGames = [
        { id: 1, name: "Game 1" },
        { id: 2, name: "Game 2" },
        { id: 3, name: "Game 3" },
        { id: 4, name: "Game 4" },
        { id: 5, name: "Game 5" },
        { id: 6, name: "Game 6" },
      ];

      const config: PlanAdsConfig = {
        ...DEFAULT_PLAN_ADS_CONFIG,
        enabled: true,
        displayProbability: 100,
        minItemsBeforeAd: 2,
      };

      const slots = calculateAdSlots(originalGames.length, config, () => 0.5);
      assert.ok(slots.length >= 1);

      // Garante que o array original permanece inalterado
      assert.equal(originalGames.length, 6);
      assert.equal(originalGames[0].name, "Game 1");
      assert.equal(originalGames[5].name, "Game 6");
    });
  });

  describe("3. Sincronização Dinâmica de Preços (priceSync)", () => {
    it("deve calcular o menor preço mensal a partir do plano anual", () => {
      const mockPlans: PlansConfig = {
        ...DEFAULT_PLANS_CONFIG,
        pro_annual: {
          ...DEFAULT_PLANS_CONFIG.pro_annual,
          price: 79.9,
          enabled: true,
        },
      };

      const result = getLowestMonthlyPrice(mockPlans);
      assert.ok(Math.abs(result.monthlyRate - 79.9 / 12) < 0.01);
      assert.equal(result.formattedText, "A partir de R$ 6,66/mês");
    });

    it("deve atualizar dinamicamente o anúncio se o preço do plano for alterado", () => {
      const customPlans: PlansConfig = {
        ...DEFAULT_PLANS_CONFIG,
        pro_annual: {
          ...DEFAULT_PLANS_CONFIG.pro_annual,
          price: 120.0, // R$ 120/ano = R$ 10,00/mês
          enabled: true,
        },
      };

      const creative = DEFAULT_PLAN_ADS_CONFIG.creatives.find((c) => c.id === "no-ads")!;
      const syncedPrice = getSyncedPriceNote(creative, customPlans);
      assert.equal(syncedPrice, "A partir de R$ 10,00/mês");
    });

    it("deve sincronizar o plano VIP Vitalício", () => {
      const customPlans: PlansConfig = {
        ...DEFAULT_PLANS_CONFIG,
        vip_lifetime: {
          ...DEFAULT_PLANS_CONFIG.vip_lifetime,
          formattedPrice: "R$ 199,90",
        },
      };

      const vipCreative = DEFAULT_PLAN_ADS_CONFIG.creatives.find((c) => c.id === "vip-lifetime")!;
      const syncedPrice = getSyncedPriceNote(vipCreative, customPlans);
      assert.equal(syncedPrice, "R$ 199,90");
    });

    it("deve formatar valores em reais corretamente", () => {
      assert.equal(formatCurrencyBrl(9.9), "R$ 9,90");
      assert.equal(formatCurrencyBrl(149.9), "R$ 149,90");
      assert.equal(formatCurrencyBrl(6.6583), "R$ 6,66");
    });
  });
});
