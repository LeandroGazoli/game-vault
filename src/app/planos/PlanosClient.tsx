"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { DEFAULT_PLANS_CONFIG, PlansConfig, PlanKey } from "@/lib/plans";
import AuthModal from "@/components/AuthModal";
import {
  Crown,
  Sparkles,
  Check,
  ShieldCheck,
  Zap,
  EyeOff,
  CreditCard,
  Lock,
  ArrowRight,
  Star,
  HelpCircle,
  RefreshCw,
} from "lucide-react";

export default function PlanosClient() {
  const { user, isPremium, upgradePlan } = useAuth();
  const router = useRouter();
  const [plansConfig, setPlansConfig] = useState<PlansConfig>(DEFAULT_PLANS_CONFIG);
  const [proBillingType, setProBillingType] = useState<"recurring" | "single_month">("recurring");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    if (isPremium) {
      router.replace("/perfil");
    }
  }, [isPremium, router]);

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
        setError(data.error || "Não foi possível abrir o checkout do Stripe. Verifique suas chaves de API.");
      }
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      setError(err.message || "Erro de comunicação com o servidor.");
    } finally {
      setLoadingPlan(null);
    }
  };

  if (isPremium) {
    return (
      <div className="max-w-md mx-auto my-16 rounded-[32px] p-8 border border-[#00E5FF]/30 bg-[#18191c] text-center space-y-4 shadow-2xl animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-[#00E5FF] flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
          <Sparkles className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Você já é um Assinante Ativo!
        </h2>
        <p className="text-xs text-gray-400">
          Sua conta já possui todos os recursos liberados. Redirecionando para o seu perfil para gerenciar seu plano...
        </p>
        <button
          onClick={() => router.replace("/perfil")}
          className="rounded-full bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold px-6 py-2.5 text-xs transition-all shadow-md"
        >
          Ir para Meu Perfil
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-16 pt-4 max-w-5xl mx-auto">
      {/* Header com Destaque */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-semibold">
          <Crown className="w-4 h-4 text-amber-400" />
          Planos &amp; Assinaturas MyGameList
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Sua Biblioteca Gamer no <span className="text-[#00E5FF]">Nível Máximo</span>
        </h1>
        <p className="text-sm sm:text-base text-gray-400 leading-relaxed">
          Navegue 100% sem anúncios, desbloqueie personalização completa do seu perfil, exportações ilimitadas e apoie a plataforma independente.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center max-w-lg mx-auto">
          {error}
        </div>
      )}

      {/* Grid de Planos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. PLANO MENSAL / AVULSO COM SELETOR */}
        <div className="rounded-[32px] p-6 sm:p-7 border border-white/10 bg-[#18191c] flex flex-col justify-between space-y-6 hover:border-white/20 transition-all shadow-xl">
          <div className="space-y-4">
            {/* Seletor Recorrente vs 1 Mês Avulso */}
            <div className="p-1 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setProBillingType("recurring")}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  proBillingType === "recurring"
                    ? "bg-white/20 text-white shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                Assinatura Mensal
              </button>
              <button
                type="button"
                onClick={() => setProBillingType("single_month")}
                className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-bold transition-all text-center ${
                  proBillingType === "single_month"
                    ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                1 Mês Avulso
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-gray-400 font-bold">
                  {proBillingType === "recurring" ? "Mensal Recorrente" : "Pagamento Único"}
                </span>
                {proBillingType === "single_month" && (
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold">
                    Sem Renovação
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white">
                {proBillingType === "recurring" ? plansConfig.pro_monthly.name : plansConfig.pro_single_month.name}
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-white">
                  {proBillingType === "recurring"
                    ? plansConfig.pro_monthly.formattedPrice
                    : plansConfig.pro_single_month.formattedPrice}
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  {proBillingType === "recurring" ? plansConfig.pro_monthly.intervalText : " único"}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {proBillingType === "recurring"
                  ? "Cancele a qualquer momento sem taxas ou carência."
                  : "Pague apenas 1 único mês (30 dias de acesso completo sem cobranças automáticas)."}
              </p>
            </div>

            <ul className="space-y-3 text-xs text-gray-300 pt-4 border-t border-white/5">
              <li className="flex items-center gap-2.5 font-semibold text-white">
                <EyeOff className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                <span>100% Livre de Anúncios</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Selo PRO Neon no Perfil Público</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Exportações Ilimitadas (Excel &amp; JSON)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Sincronização Ilimitada na Nuvem</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout(proBillingType === "recurring" ? "pro_monthly" : "pro_single_month")}
            disabled={Boolean(loadingPlan)}
            className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
          >
            <CreditCard className="w-4 h-4" />
            {loadingPlan === "pro_monthly" || loadingPlan === "pro_single_month"
              ? "Conectando ao Stripe..."
              : proBillingType === "recurring"
              ? "Assinar Plano Mensal"
              : "Pagar 1 Mês (Avulso)"}
          </button>
        </div>

        {/* 2. PLANO ANUAL (DESTAQUE) */}
        <div className="relative rounded-[32px] p-6 sm:p-7 border-2 border-[#00E5FF] bg-gradient-to-b from-cyan-950/40 via-[#18191c] to-black flex flex-col justify-between space-y-6 shadow-2xl shadow-cyan-500/15 scale-105 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00E5FF] text-black font-extrabold text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-black" /> {plansConfig.pro_annual.badge || "Mais Popular • Economize 33%"}
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-[#00E5FF] font-bold">
                Economize 33%
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00E5FF]" /> {plansConfig.pro_annual.name}
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-[#00E5FF]">
                  {plansConfig.pro_annual.formattedPrice}
                </span>
                <span className="text-xs text-gray-400 font-mono">{plansConfig.pro_annual.intervalText}</span>
              </div>
              <p className="text-xs text-gray-300 font-mono">
                Equivalente a apenas R$ {(plansConfig.pro_annual.price / 12).toFixed(2).replace(".", ",")}/mês
              </p>
            </div>

            <ul className="space-y-3 text-xs text-gray-200 pt-4 border-t border-white/10">
              <li className="flex items-center gap-2.5 font-bold text-white">
                <EyeOff className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
                <span>100% Sem Anúncios por 1 ano</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Selo PRO Neon no Perfil</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-yellow-400 flex-shrink-0" />
                <span>Acesso Prioritário a Novos Recursos</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Exportações Ilimitadas (Excel, JSON, API)</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout("pro_annual")}
            disabled={Boolean(loadingPlan)}
            className="w-full py-3.5 rounded-full bg-[#00E5FF] hover:bg-cyan-400 text-black font-extrabold text-xs sm:text-sm transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {loadingPlan === "pro_annual" ? "Conectando ao Stripe..." : "Assinar PRO Anual"}
          </button>
        </div>

        {/* 3. PLANO VIP VITALÍCIO */}
        <div className="rounded-[32px] p-6 sm:p-7 border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-[#18191c] to-black flex flex-col justify-between space-y-6 hover:border-amber-500/50 transition-all shadow-xl">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                {plansConfig.vip_lifetime.badge || "Pagamento Único"}
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> {plansConfig.vip_lifetime.name}
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-400">
                  {plansConfig.vip_lifetime.formattedPrice}
                </span>
                <span className="text-xs text-gray-400 font-mono">{plansConfig.vip_lifetime.intervalText}</span>
              </div>
              <p className="text-xs text-gray-400">Pague uma única vez e tenha acesso para sempre.</p>
            </div>

            <ul className="space-y-3 text-xs text-gray-300 pt-4 border-t border-white/5">
              <li className="flex items-center gap-2.5 font-bold text-amber-300">
                <Crown className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Selo Dourado &quot;Fundador VIP&quot;</span>
              </li>
              <li className="flex items-center gap-2.5 font-medium text-white">
                <EyeOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Zero Anúncios Vitalício</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Todos os Recursos PRO inclusos</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Agradecimento especial nos créditos</span>
              </li>
            </ul>
          </div>

          <button
            onClick={() => handleCheckout("vip_lifetime")}
            disabled={Boolean(loadingPlan)}
            className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105"
          >
            <Crown className="w-4 h-4" />
            {loadingPlan === "vip_lifetime" ? "Conectando ao Stripe..." : "Tornar-se Membro VIP"}
          </button>
        </div>
      </div>

      {/* Seção de Dúvidas Frequentes (FAQ) */}
      <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-8 space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-[#00E5FF]" /> Perguntas Frequentes
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
          <div className="space-y-1.5">
            <h4 className="font-bold text-white">Como funciona o cancelamento?</h4>
            <p className="text-gray-400 leading-relaxed">
              Você pode cancelar sua assinatura a qualquer momento com apenas 1 clique no seu painel de perfil. Não há contratos nem multas.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-white">Quais formas de pagamento são aceitas?</h4>
            <p className="text-gray-400 leading-relaxed">
              Aceitamos cartões de crédito (Visa, Mastercard, Elo, American Express, etc.) processados pelo Stripe Brasil.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-white">Quando meu plano PRO é ativado?</h4>
            <p className="text-gray-400 leading-relaxed">
              Instantaneamente! Assim que o pagamento for aprovado pelo Stripe, seu perfil recebe o selo e todos os anúncios são desativados no mesmo segundo.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="font-bold text-white">O que acontece com meus jogos se eu cancelar?</h4>
            <p className="text-gray-400 leading-relaxed">
              Todos os seus jogos cadastrados, notas e histórico continuam 100% salvos e seguros na sua conta para sempre.
            </p>
          </div>
        </div>
      </div>

      {/* Selo de Segurança */}
      <div className="flex items-center justify-center gap-2 text-center text-xs text-gray-400">
        <Lock className="w-4 h-4 text-emerald-400" />
        <span>Pagamentos processados com criptografia bancária de ponta a ponta pelo <strong>Stripe Brasil</strong></span>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
