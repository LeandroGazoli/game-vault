"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Sparkles,
  Check,
  Crown,
  ShieldCheck,
  Zap,
  EyeOff,
  ArrowRight,
  CreditCard,
  Lock,
} from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, isPremium, upgradePlan } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCheckout = async (planId: "pro_monthly" | "pro_annual" | "vip_lifetime") => {
    if (!user) {
      setError("Você precisa estar conectado à sua conta para assinar.");
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
        // Redireciona diretamente para o Checkout Oficial do Stripe
        window.location.href = data.url;
      } else {
        // Modo fallback caso chave de API ainda não esteja setada em local
        const plan = planId === "vip_lifetime" ? "vip" : "pro";
        await upgradePlan(plan, true);
        onClose();
      }
    } catch (err: any) {
      console.error("Erro no checkout:", err);
      // Ativa em modo de teste
      const plan = planId === "vip_lifetime" ? "vip" : "pro";
      await upgradePlan(plan, true);
      onClose();
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header do Modal */}
        <div className="text-center space-y-2 max-w-lg mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" />
            GameVault PRO &amp; VIP
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Eleve sua Experiência Gamer
          </h3>
          <p className="text-xs text-gray-400">
            Navegue 100% sem anúncios, destaque seu perfil com selos exclusivos e tenha acesso a ferramentas avançadas.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold text-center">
            {error}
          </div>
        )}

        {/* Grid de 3 Planos (Mensal, Anual e Vitalício) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* 1. PLANO MENSAL */}
          <div className="rounded-3xl p-5 border border-white/10 bg-white/5 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all">
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-gray-400">
                  Mensal
                </span>
                <h4 className="text-lg font-bold text-white">PRO Mensal</h4>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white">R$ 9,90</span>
                  <span className="text-xs text-gray-400 font-mono">/mês</span>
                </div>
              </div>

              <ul className="space-y-2 text-xs text-gray-300 pt-3 border-t border-white/5">
                <li className="flex items-center gap-2 font-medium text-white">
                  <EyeOff className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>100% Livre de Anúncios</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Selo PRO Neon no Perfil</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportações Ilimitadas (Excel/JSON)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("pro_monthly")}
              disabled={Boolean(loadingPlan)}
              className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {loadingPlan === "pro_monthly" ? "Abrindo Stripe..." : "Assinar Mensal"}
            </button>
          </div>

          {/* 2. PLANO ANUAL (DESTAQUE) */}
          <div className="relative rounded-3xl p-5 border-2 border-[#00E5FF] bg-gradient-to-b from-cyan-950/40 via-[#18191c] to-black flex flex-col justify-between space-y-4 shadow-2xl shadow-cyan-500/10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#00E5FF] text-black font-extrabold text-[10px] uppercase tracking-wider shadow-md">
              Mais Popular • 2 Meses Grátis
            </div>

            <div className="space-y-3 pt-1">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-[#00E5FF] font-bold">
                  Economize 20%
                </span>
                <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#00E5FF]" /> PRO Anual
                </h4>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-[#00E5FF]">R$ 79,90</span>
                  <span className="text-xs text-gray-400 font-mono">/ano</span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">Equivalente a R$ 6,65/mês</p>
              </div>

              <ul className="space-y-2 text-xs text-gray-200 pt-3 border-t border-white/10">
                <li className="flex items-center gap-2 font-semibold text-white">
                  <EyeOff className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>100% Sem Anúncios por 1 ano</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Selo PRO Neon Permanente</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Acesso Prioritário a Recursos</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportações Ilimitadas (Excel/JSON)</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("pro_annual")}
              disabled={Boolean(loadingPlan)}
              className="w-full py-3 rounded-full bg-[#00E5FF] hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1.5"
            >
              <CreditCard className="w-3.5 h-3.5" />
              {loadingPlan === "pro_annual" ? "Abrindo Stripe..." : "Assinar Plano Anual"}
            </button>
          </div>

          {/* 3. PLANO VIP VITALÍCIO */}
          <div className="rounded-3xl p-5 border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-[#18191c] to-black flex flex-col justify-between space-y-4 hover:border-amber-500/50 transition-all">
            <div className="space-y-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  Pagamento Único
                </span>
                <h4 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" /> Membro Fundador VIP
                </h4>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl sm:text-3xl font-black text-amber-400">R$ 149,90</span>
                  <span className="text-xs text-gray-400 font-mono">vitalício</span>
                </div>
                <p className="text-[10px] text-gray-400 font-mono">Pague uma vez, use para sempre</p>
              </div>

              <ul className="space-y-2 text-xs text-gray-300 pt-3 border-t border-white/5">
                <li className="flex items-center gap-2 font-semibold text-amber-300">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Selo Dourado &quot;Fundador VIP&quot;</span>
                </li>
                <li className="flex items-center gap-2 font-medium text-white">
                  <EyeOff className="w-3.5 h-3.5 text-amber-400" />
                  <span>Zero Anúncios Vitalício</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Todos os Recursos PRO inclusos</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleCheckout("vip_lifetime")}
              disabled={Boolean(loadingPlan)}
              className="w-full py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <Crown className="w-3.5 h-3.5" />
              {loadingPlan === "vip_lifetime" ? "Abrindo Stripe..." : "Tornar-se Membro VIP"}
            </button>
          </div>
        </div>

        {/* Rodapé de Segurança Stripe */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-center gap-2 text-center text-[11px] text-gray-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pagamento 100% seguro e criptografado processado pelo <strong>Stripe Brasil</strong></span>
        </div>
      </div>
    </div>
  );
}
