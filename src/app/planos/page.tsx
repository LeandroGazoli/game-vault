"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
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
} from "lucide-react";

export default function PlanosPage() {
  const { user, isPremium, upgradePlan } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleCheckout = async (planId: "pro_monthly" | "pro_annual" | "vip_lifetime") => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setLoadingPlan(planId);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        const plan = planId === "vip_lifetime" ? "vip" : "pro";
        await upgradePlan(plan, true);
        window.location.href = "/profile?upgraded=true";
      }
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      const plan = planId === "vip_lifetime" ? "vip" : "pro";
      await upgradePlan(plan, true);
      window.location.href = "/profile?upgraded=true";
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-12 pb-16 pt-4 max-w-5xl mx-auto">
      {/* Header com Destaque */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-semibold">
          <Crown className="w-4 h-4 text-amber-400" />
          Planos &amp; Assinaturas GameVault
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
        {/* 1. PLANO MENSAL */}
        <div className="rounded-[32px] p-6 sm:p-7 border border-white/10 bg-[#18191c] flex flex-col justify-between space-y-6 hover:border-white/20 transition-all shadow-xl">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-gray-400 font-bold">
                Mensal
              </span>
              <h3 className="text-xl font-bold text-white">PRO Mensal</h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-white">R$ 9,90</span>
                <span className="text-xs text-gray-400 font-mono">/mês</span>
              </div>
              <p className="text-xs text-gray-400">Cancele a qualquer momento sem taxas.</p>
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
            onClick={() => handleCheckout("pro_monthly")}
            disabled={Boolean(loadingPlan)}
            className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
          >
            <CreditCard className="w-4 h-4" />
            {loadingPlan === "pro_monthly" ? "Conectando ao Stripe..." : "Assinar Plano Mensal"}
          </button>
        </div>

        {/* 2. PLANO ANUAL (DESTAQUE) */}
        <div className="relative rounded-[32px] p-6 sm:p-7 border-2 border-[#00E5FF] bg-gradient-to-b from-cyan-950/40 via-[#18191c] to-black flex flex-col justify-between space-y-6 shadow-2xl shadow-cyan-500/15 scale-105 z-10">
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#00E5FF] text-black font-extrabold text-[11px] uppercase tracking-wider shadow-lg flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-black" /> Mais Popular • 2 Meses Grátis
          </div>

          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-[#00E5FF] font-bold">
                Economize 20%
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#00E5FF]" /> PRO Anual
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-[#00E5FF]">R$ 79,90</span>
                <span className="text-xs text-gray-400 font-mono">/ano</span>
              </div>
              <p className="text-xs text-gray-300 font-mono">Equivalente a apenas R$ 6,65/mês</p>
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
                Pagamento Único
              </span>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" /> Membro VIP
              </h3>
              <div className="flex items-baseline gap-1 pt-1">
                <span className="text-3xl sm:text-4xl font-black text-amber-400">R$ 149,90</span>
                <span className="text-xs text-gray-400 font-mono">vitalício</span>
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
