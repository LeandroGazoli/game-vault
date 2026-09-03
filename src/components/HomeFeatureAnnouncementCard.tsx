"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lightbulb,
  Sparkles,
  Trophy,
  ArrowRight,
  Bell,
  X,
  ChevronRight,
  Gift,
  Check,
} from "lucide-react";
import {
  requestNotificationPermission,
  getNotificationPermission,
  isNotificationSupported,
} from "@/lib/notifications";

const DISMISS_STORAGE_KEY = "mgl_dismiss_feature_card_v1";

export default function HomeFeatureAnnouncementCard() {
  const [isDismissed, setIsDismissed] = useState(true);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já dispensou o card
    const dismissed = localStorage.getItem(DISMISS_STORAGE_KEY);
    if (!dismissed) {
      setIsDismissed(false);
    }

    // Verifica status de push
    if (isNotificationSupported()) {
      setIsPushEnabled(getNotificationPermission() === "granted");
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(DISMISS_STORAGE_KEY, "true");
  };

  const handleEnablePush = async () => {
    setPushLoading(true);
    try {
      const res = await requestNotificationPermission();
      if (res === "granted") {
        setIsPushEnabled(true);
      }
    } finally {
      setPushLoading(false);
    }
  };

  if (isDismissed) {
    // Pill compacta no canto ou fechada
    return null;
  }

  return (
    <section
      aria-label="Aviso de Novo Recurso"
      className="relative rounded-3xl overflow-hidden border border-cyan-500/40 bg-gradient-to-br from-[#10141f] via-[#12151e] to-[#0a0c10] p-5 sm:p-7 shadow-[0_10px_40px_rgba(0,229,255,0.08)] transition-all animate-fadeIn"
    >
      {/* Luz ambiente de fundo neon */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Botão de Fechar no Canto */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
        title="Dispensar aviso"
        aria-label="Dispensar aviso"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Lado Esquerdo: Badges, Título e Explicação */}
        <div className="space-y-3 max-w-3xl pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 text-[#00E5FF] text-xs font-black uppercase tracking-wider font-mono shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Novo Recurso Disponível</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Programa de Recompensas</span>
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
            Central de Ideias, Votação Comunitária &amp; Report de Bugs
          </h3>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Agora <strong>você</strong> decide o futuro do MyGameList! Submeta sugestões de melhorias ou relate erros. Toda a comunidade vota (Upvote e Downvote), o que tiver mais votos é priorizado no desenvolvimento e contribuidores ganham <strong className="text-amber-300 font-bold">Acesso VIP Vitalício</strong>, <strong className="text-[#00E5FF] font-bold">Plano PRO</strong> e <strong className="text-purple-300 font-bold">Tags Customizadas de Bug Hunter</strong>!
          </p>

          {/* Destaques Rápidos em Chips */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap text-xs text-neutral-400 pt-1 font-mono">
            <div className="flex items-center gap-1 text-cyan-300">
              <Lightbulb className="w-3.5 h-3.5 text-cyan-400" />
              <span>Envie Sugestões</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-emerald-300">
              <span className="text-[#00E5FF] font-bold">▲▼</span>
              <span>Votação Pública</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1 text-amber-300">
              <Gift className="w-3.5 h-3.5 text-amber-400" />
              <span>Ganhe Benefícios Reais</span>
            </div>
          </div>
        </div>

        {/* Lado Direito: Ações Principais */}
        <div className="shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2.5">
          <Link
            href="/feedback"
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-[#00E5FF] to-blue-500 hover:from-cyan-300 hover:to-cyan-200 text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/20 active:scale-95 text-center"
          >
            <span>Conhecer Central &amp; Votar</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Botão de Ativar Notificações Push */}
          {!isPushEnabled ? (
            <button
              onClick={handleEnablePush}
              disabled={pushLoading}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/30 text-neutral-300 hover:text-white text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>{pushLoading ? "Ativando..." : "Ativar Avisos Push"}</span>
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 font-mono">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Notificações Ativas</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
