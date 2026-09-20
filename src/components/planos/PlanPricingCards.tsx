"use client";

import React from "react";
import { PlansConfig, PlanKey } from "@/lib/plans.types";
import { Check, X, Sparkles, Crown, Zap, EyeOff, CreditCard, Star, ArrowRight } from "lucide-react";

export type BillingCycle = "annual" | "monthly" | "single_month";

interface PlanPricingCardsProps {
  plansConfig: PlansConfig;
  billingCycle: BillingCycle;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  onSelectPlan: (planId: PlanKey) => void;
  loadingPlan: string | null;
  isAuthenticated: boolean;
  onOpenAuth: () => void;
}

export default function PlanPricingCards({
  plansConfig,
  billingCycle,
  onBillingCycleChange,
  onSelectPlan,
  loadingPlan,
  isAuthenticated,
  onOpenAuth,
}: PlanPricingCardsProps) {
  const currentProPlanKey: PlanKey =
    billingCycle === "annual"
      ? "pro_annual"
      : billingCycle === "monthly"
      ? "pro_monthly"
      : "pro_single_month";

  const currentProConfig = plansConfig[currentProPlanKey];

  return (
    <div className="space-y-8">
      {/* Seletor de Faturamento Centralizado */}
      <div className="flex flex-col items-center gap-2.5">
        <div className="p-1 rounded-2xl bg-[#141822] border border-white/10 flex items-center gap-1 shadow-lg max-w-md w-full">
          <button
            type="button"
            onClick={() => onBillingCycleChange("annual")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              billingCycle === "annual"
                ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-black shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <span>Anual</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                billingCycle === "annual"
                  ? "bg-black/25 text-black"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              }`}
            >
              -33%
            </span>
          </button>

          <button
            type="button"
            onClick={() => onBillingCycleChange("monthly")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
              billingCycle === "monthly"
                ? "bg-white/20 text-white shadow-md"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Mensal
          </button>

          <button
            type="button"
            onClick={() => onBillingCycleChange("single_month")}
            className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
              billingCycle === "single_month"
                ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            1 Mês Avulso
          </button>
        </div>

        <p className="text-[11px] text-neutral-400 font-mono">
          {billingCycle === "annual"
            ? "Economize R$ 38,90 no plano anual (apenas R$ 6,65/mês)"
            : billingCycle === "monthly"
            ? "Cancele quando quiser com apenas 1 clique"
            : "Pagamento único sem cobrança recorrente no cartão"}
        </p>
      </div>

      {/* Grid de 3 Cards: Free, PRO e VIP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* 1. MODO GRATUITO (FREE TIER) */}
        <div className="rounded-3xl p-6 sm:p-7 bg-[#141822] border border-white/10 flex flex-col justify-between space-y-6 shadow-xl hover:border-white/20 transition-all">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/5 text-neutral-400 border border-white/5">
                Plano Básico
              </span>
              <h3 className="text-xl font-bold text-white tracking-tight">Modo Gratuito</h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-white">R$ 0</span>
                <span className="text-xs text-neutral-400 font-mono">/ para sempre</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tudo o que você precisa para registrar seus jogos e acompanhar notas da comunidade.
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-white/5 text-xs">
              <p className="text-[11px] font-mono text-neutral-400 uppercase font-bold tracking-wider">
                O que está incluso:
              </p>
              <ul className="space-y-2.5 text-neutral-300">
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Catálogo ilimitado (+150.000 títulos)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Status: Jogando, Zerado, Backlog e Drop</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Notas 1 a 10 e estimativas de HLTB</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Sincronização na nuvem em tempo real</span>
                </li>
              </ul>

              <p className="text-[11px] font-mono text-neutral-500 uppercase font-bold tracking-wider pt-2">
                Limitações do Modo Free:
              </p>
              <ul className="space-y-2 text-neutral-500">
                <li className="flex items-center gap-2.5">
                  <X className="w-4 h-4 text-neutral-600 shrink-0" />
                  <span>Contém anúncios patrocinados</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <X className="w-4 h-4 text-neutral-600 shrink-0" />
                  <span>Ganho de XP padrão (1.0x)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <X className="w-4 h-4 text-neutral-600 shrink-0" />
                  <span>Sem selos exclusivos no perfil</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            {isAuthenticated ? (
              <div className="w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-neutral-300 font-bold text-xs text-center">
                Seu Plano Atual
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAuth}
                className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <span>Criar Conta Gratuita</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. PLANO PRO (DESTAQUE PRINCIPAL) */}
        <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-[#16222f] via-[#121622] to-[#0d0f15] border-2 border-emerald-400 flex flex-col justify-between space-y-6 shadow-2xl shadow-emerald-500/15 lg:-translate-y-2 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-black font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-black" />
            <span>Mais Escolhido • Economize 33%</span>
          </div>

          <div className="space-y-5 pt-1">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {billingCycle === "annual" ? "Assinatura Anual" : billingCycle === "monthly" ? "Assinatura Mensal" : "Mês Avulso"}
              </span>
              <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <span>MyGameList PRO</span>
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-emerald-400">
                  {currentProConfig.formattedPrice}
                </span>
                <span className="text-xs text-neutral-400 font-mono">
                  {billingCycle === "annual" ? "/ano" : billingCycle === "monthly" ? "/mês" : " único"}
                </span>
              </div>
              <p className="text-xs text-neutral-300">
                {billingCycle === "annual"
                  ? "Equivalente a R$ 6,65 por mês cobrado anualmente."
                  : currentProConfig.description}
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-white/10 text-xs">
              <p className="text-[11px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                Tudo do Free + Benefícios PRO:
              </p>
              <ul className="space-y-2.5 text-neutral-200">
                <li className="flex items-center gap-2.5 font-bold text-white">
                  <EyeOff className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>100% Livre de Anúncios e Banners</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-emerald-300">
                  <Zap className="w-4 h-4 text-emerald-400 shrink-0 fill-emerald-400/20" />
                  <span>Boost de +50% no Ganho de XP (1.5x)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#00E5FF] shrink-0" />
                  <span>Selo PRO Neon exclusivo no perfil</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Crie até 10 títulos e insígnias próprias</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exportação completa (Excel, CSV e JSON)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Roleta de backlog com filtros avançados</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => onSelectPlan(currentProPlanKey)}
              disabled={Boolean(loadingPlan)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm transition-all shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {loadingPlan === currentProPlanKey
                  ? "Conectando ao Stripe..."
                  : billingCycle === "annual"
                  ? "Assinar PRO Anual"
                  : billingCycle === "monthly"
                  ? "Assinar PRO Mensal"
                  : "Pagar 1 Mês Avulso"}
              </span>
            </button>
          </div>
        </div>

        {/* 3. PLANO VIP FUNDADOR */}
        <div className="rounded-3xl p-6 sm:p-7 bg-gradient-to-b from-amber-950/25 via-[#141822] to-[#0e1017] border border-amber-500/30 flex flex-col justify-between space-y-6 shadow-xl hover:border-amber-500/50 transition-all">
          <div className="space-y-5">
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Acesso Vitalício Eterno
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span>VIP Fundador</span>
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-400">
                  {plansConfig.vip_lifetime.formattedPrice}
                </span>
                <span className="text-xs text-neutral-400 font-mono">/ pagamento único</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Pague uma única vez e torne-se apoiador VIP permanente do Game Vault.
              </p>
            </div>

            <div className="space-y-2.5 pt-3 border-t border-white/5 text-xs">
              <p className="text-[11px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                Exclusividades VIP Vitalício:
              </p>
              <ul className="space-y-2.5 text-neutral-200">
                <li className="flex items-center gap-2.5 font-black text-amber-300">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0 fill-amber-400/30" />
                  <span>👑 Boost Supremo: 2.0x XP Vitalício</span>
                </li>
                <li className="flex items-center gap-2.5 font-bold text-amber-200">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Selo Dourado &quot;Fundador VIP&quot;</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Capa Obsidian Gold VIP exclusiva</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Todos os recursos PRO inclusos para sempre</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Nome eternizado no mural de apoiadores</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Todas as futuras ferramentas sem custo extra</span>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => onSelectPlan("vip_lifetime")}
              disabled={Boolean(loadingPlan)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black text-sm transition-all shadow-xl shadow-amber-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Crown className="w-4 h-4" />
              <span>
                {loadingPlan === "vip_lifetime"
                  ? "Conectando ao Stripe..."
                  : "Tornar-se Membro Fundador VIP"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
