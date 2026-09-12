"use client";

import React from "react";
import { Sparkles, Gamepad2, Trophy, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { trackSignUpClick } from "@/lib/analytics";

interface HomeConversionBannerProps {
  onOpenAuth: () => void;
}

export default function HomeConversionBanner({ onOpenAuth }: HomeConversionBannerProps) {
  const handleCtaClick = () => {
    trackSignUpClick("hero_conversion_banner");
    onOpenAuth();
  };

  return (
    <section 
      aria-label="Crie sua conta no MyGameList"
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#121620] via-[#10131b] to-[#0c0d12] border border-emerald-500/25 shadow-[0_10px_40px_rgba(16,185,129,0.1)] p-5 sm:p-7 md:p-8"
    >
      {/* Luzes de fundo sutis em Verde Esmeralda */}
      <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Lado Esquerdo: Proposta de Valor Direta */}
        <div className="space-y-3 text-center lg:text-left max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>100% Gratuito • Feito para Colecionadores de Jogos</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white leading-snug">
            Sua estante gamer definitiva: registre jogos, horas e zere seu backlog.
          </h2>

          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-normal">
            Acompanhe tempos do <strong>HowLongToBeat</strong>, notas do <strong>Metacritic</strong>, dublagens em PT-BR e descubra novos títulos em um catálogo de mais de 150.000 jogos.
          </p>

          {/* Micro-benefícios em pílulas */}
          <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2.5 text-[11px] text-neutral-400 font-medium">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <Clock className="w-3 h-3 text-[#00E5FF]" /> Horas e HLTB
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <Trophy className="w-3 h-3 text-yellow-400" /> Notas Metacritic
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <Gamepad2 className="w-3 h-3 text-emerald-400" /> Sincronia Steam
            </span>
          </div>
        </div>

        {/* Lado Direito: Botão de Ação Imediata (CTA de Alto Impacto) */}
        <div className="w-full sm:w-auto flex flex-col items-center gap-2.5 shrink-0">
          <button
            onClick={handleCtaClick}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_0_30px_rgba(16,185,129,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.55)] active:scale-95 transition-all cursor-pointer group"
          >
            <span>Criar Conta Grátis em 1 Clique</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Login instantâneo e seguro com o Google</span>
          </div>
        </div>
      </div>
    </section>
  );
}
