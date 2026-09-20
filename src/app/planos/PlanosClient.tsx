"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { PlansConfig, PlanKey, DEFAULT_PLANS_CONFIG } from "@/lib/plans.types";
import { getProfileUrl } from "@/lib/routes";
import AuthModal from "@/components/AuthModal";
import PlanPricingCards, { BillingCycle } from "@/components/planos/PlanPricingCards";
import PlanComparisonTable from "@/components/planos/PlanComparisonTable";
import PlanBenefitsGrid from "@/components/planos/PlanBenefitsGrid";
import PlanFaqAccordion from "@/components/planos/PlanFaqAccordion";
import { Crown, Sparkles, Lock, ShieldCheck } from "lucide-react";

export default function PlanosClient() {
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const [plansConfig, setPlansConfig] = useState<PlansConfig>(DEFAULT_PLANS_CONFIG);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("annual");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    fetch("/api/plans")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setPlansConfig((prev) => ({ ...prev, ...data }));
      })
      .catch((e) => console.error("Erro ao carregar planos:", e));
  }, []);

  const handleCheckout = async (planId: PlanKey) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setLoadingPlan(planId);
    setError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId,
          userId: user.uid,
          userEmail: user.email,
          returnUrl: window.location.origin,
        }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(data.error || "Não foi possível iniciar o checkout do Stripe.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro de comunicação com o servidor.";
      setError(msg);
    } finally {
      setLoadingPlan(null);
    }
  };

  if (isPremium) {
    return (
      <div className="max-w-md mx-auto my-16 rounded-3xl p-8 border border-emerald-500/30 bg-[#141822] text-center space-y-4 shadow-2xl animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Você já é um Assinante Ativo!
        </h2>
        <p className="text-xs text-neutral-400 leading-relaxed">
          Sua conta já possui todos os recursos PRO e multiplicadores liberados. Você pode gerenciar seu plano a qualquer momento no seu perfil.
        </p>
        <button
          type="button"
          onClick={() => router.push(user?.username ? getProfileUrl(user.username) : "/perfil")}
          className="rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-6 py-2.5 text-xs transition-all shadow-md cursor-pointer"
        >
          Ir para Meu Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 sm:space-y-14 pb-20 pt-4 max-w-5xl mx-auto px-3 sm:px-4">
      {/* Header Principal com Proposta de Valor */}
      <div className="text-center space-y-3.5 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Planos &amp; Assinaturas Game Vault</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Sua Coleção Gamer no <span className="text-emerald-400">Nível Máximo</span>
        </h1>

        <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
          Navegue 100% sem anúncios, acelere seu ganho de XP com multiplicadores exclusivos, personalize seu perfil com temas épicos e apoie o acervo independente.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center max-w-lg mx-auto">
          {error}
        </div>
      )}

      {/* 1. Grid de Planos (Gratuito, PRO e VIP) */}
      <PlanPricingCards
        plansConfig={plansConfig}
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
        onSelectPlan={handleCheckout}
        loadingPlan={loadingPlan}
        isAuthenticated={Boolean(user)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* 2. Destaques Visuais de Benefícios */}
      <PlanBenefitsGrid />

      {/* 3. Tabela Comparativa 'O Que Tem e O Que Não Tem' */}
      <PlanComparisonTable />

      {/* 4. Perguntas Frequentes (FAQ) */}
      <PlanFaqAccordion />

      {/* Selo de Segurança Stripe */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-xs text-neutral-400 pt-2">
        <div className="flex items-center gap-1.5">
          <Lock className="w-4 h-4 text-emerald-400" />
          <span>Pagamentos criptografados de ponta a ponta</span>
        </div>
        <span className="hidden sm:inline text-neutral-600">•</span>
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Processado com segurança pelo <strong>Stripe Brasil</strong></span>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
