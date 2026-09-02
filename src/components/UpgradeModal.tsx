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
  Trophy,
  ArrowRight,
} from "lucide-react";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const { user, isPremium, upgradePlan } = useAuth();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (plan: "free" | "pro" | "vip") => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      await upgradePlan(plan, plan !== "free");
      setSuccessMsg(
        plan === "free"
          ? "Você voltou para o plano Comum (Free)."
          : `Parabéns! Seu plano agora é ${plan.toUpperCase()}! Você está 100% livre de anúncios.`
      );
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (e) {
      console.error("Erro ao alterar plano:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[90vh] overflow-y-auto"
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
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-semibold">
            <Crown className="w-3.5 h-3.5" />
            Níveis de Acesso GameVault
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Escolha a sua Experiência
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Remova 100% dos anúncios, destaque seu perfil com selo VIP e apoie a evolução contínua da plataforma.
          </p>
        </div>

        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Grid de Comparação de Planos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* PLANO COMUM / FREE */}
          <div
            className={`rounded-3xl p-5 sm:p-6 border flex flex-col justify-between space-y-4 transition-all ${
              !isPremium
                ? "bg-white/5 border-white/20 ring-2 ring-white/10"
                : "bg-white/[0.02] border-white/5 opacity-80"
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white">Usuário Comum</h4>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-gray-400">
                  Grátis
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Acesso a todo o catálogo e biblioteca com exibição de anúncios.
              </p>

              <ul className="space-y-2 text-xs text-gray-300 pt-2 border-t border-white/5">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Catálogo de jogos ilimitado</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Notas Metacritic e HowLongToBeat</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sincronização na Nuvem</span>
                </li>
                <li className="flex items-center gap-2 text-gray-500">
                  <span className="w-3.5 h-3.5 text-center font-bold">✕</span>
                  <span>Exibe anúncios Google AdSense</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan("free")}
              disabled={loading || !isPremium}
              className={`w-full py-2.5 rounded-full text-xs font-semibold transition-all ${
                !isPremium
                  ? "bg-white/10 text-gray-400 cursor-default"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              {!isPremium ? "Seu Plano Atual" : "Voltar para Grátis"}
            </button>
          </div>

          {/* PLANO PRO / VIP */}
          <div
            className={`relative rounded-3xl p-5 sm:p-6 border flex flex-col justify-between space-y-4 shadow-xl transition-all ${
              isPremium
                ? "bg-gradient-to-b from-cyan-950/40 via-[#18191c] to-black border-[#00E5FF]/40 ring-2 ring-[#00E5FF]/20"
                : "bg-gradient-to-b from-cyan-950/30 via-[#18191c] to-black border-cyan-500/30"
            }`}
          >
            <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#00E5FF] text-black font-extrabold text-[10px] uppercase tracking-wider shadow-md">
              Recomendado
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-base font-bold text-white flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-[#00E5FF]" /> Usuário PRO / VIP
                </h4>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-[#00E5FF] font-bold">
                  Zero Anúncios
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Experiência ultra rápida, limpa e com benefícios exclusivos.
              </p>

              <ul className="space-y-2 text-xs text-gray-200 pt-2 border-t border-white/10">
                <li className="flex items-center gap-2 font-semibold text-[#00E5FF]">
                  <EyeOff className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>100% Livre de Anúncios (Sem AdSense)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Selo VIP / PRO no Perfil Público</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Exportações Ilimitadas (Excel &amp; JSON)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Carregamento prioritário e temas VIP</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => handleSelectPlan("pro")}
              disabled={loading}
              className="w-full py-3 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all shadow-lg hover:scale-105 flex items-center justify-center gap-1.5"
            >
              {isPremium ? (
                <>
                  <Check className="w-4 h-4" /> Plano PRO Ativo
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4" /> Ativar Plano PRO
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
