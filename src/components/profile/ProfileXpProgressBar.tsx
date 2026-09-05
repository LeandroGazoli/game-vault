"use client";

import React from "react";
import { UserProfile, LibraryStats, calculateGamerLevel } from "@/lib/types";
import { getSteamLevelTier } from "@/lib/steamUtils";
import { Trophy, ChevronRight, Sparkles, Zap } from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface ProfileXpProgressBarProps {
  user: UserProfile;
  stats?: LibraryStats | null;
  realRank?: string;
  onOpenGamification: () => void;
  onOpenXpBreakdown?: () => void;
  onOpenUpgrade?: () => void;
}

export default function ProfileXpProgressBar({
  user,
  stats,
  realRank,
  onOpenGamification,
  onOpenXpBreakdown,
  onOpenUpgrade,
}: ProfileXpProgressBarProps) {
  const isVip = user.plan === "vip";
  const isPro = user.plan === "pro";
  const gamerLevelInfo = calculateGamerLevel(stats, realRank, user.plan);
  const displayLevel = user.gamerLevel || gamerLevelInfo.level;
  const tier = getSteamLevelTier(displayLevel);

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-[#2a475e] bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#111923] p-3 sm:p-4 shadow-xl overflow-hidden transition-all hover:border-[#66c0f4]/50">
      {/* Luz ambiente sutil com a cor do tier */}
      <div
        className="absolute top-0 right-1/4 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: tier.borderColor }}
      />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Lado Esquerdo: Mini Círculo de Nível + Informações de Nível & Boost */}
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex flex-col items-center justify-center border-2 bg-[#101822] shrink-0 ${tier.ringBorderClass}`}
            style={{ borderColor: tier.borderColor }}
          >
            <span className="text-[7px] font-mono uppercase tracking-wider text-gray-400 font-bold leading-none">
              NÍVEL
            </span>
            <span className={`text-base sm:text-lg font-black font-mono leading-none ${tier.textColor}`}>
              {displayLevel}
            </span>
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-black text-white uppercase tracking-wider font-sans truncate">
                Nível Gamer {displayLevel}
              </h4>
              <span
                className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                  isVip
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                    : isPro
                    ? "bg-[#66c0f4]/20 text-[#66c0f4] border-[#66c0f4]/40"
                    : "bg-white/10 text-gray-300 border-white/10"
                }`}
              >
                {gamerLevelInfo.boostLabel} BOOST
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] font-mono text-[#8a9eaf]">
              <span className="text-white font-semibold">{gamerLevelInfo.rankTitle}</span>
              <span>•</span>
              <span className="text-[#66c0f4] font-medium">
                {gamerLevelInfo.globalRank.includes("Global")
                  ? gamerLevelInfo.globalRank
                  : `${gamerLevelInfo.globalRank} Global`}
              </span>
            </div>
          </div>
        </div>

        {/* Centro/Barra: Progresso em Linha */}
        <div className="flex-1 sm:max-w-md space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-300">
              <strong className="text-[#66c0f4]">{gamerLevelInfo.xp.toLocaleString("pt-BR")}</strong>
              <span className="text-gray-500 mx-1">/</span>
              <span className="text-gray-400">{gamerLevelInfo.nextLevelXp.toLocaleString("pt-BR")} XP</span>
            </span>
            <span className="text-gray-400 text-[10px]">
              Faltam <strong className="text-white">{gamerLevelInfo.xpToNextLevel.toLocaleString("pt-BR")} XP</strong> ({gamerLevelInfo.percentToNext}%)
            </span>
          </div>

          {/* Barra de Progresso Estilo Vault Slate & Blue */}
          <div className="h-2 w-full rounded-sm bg-[#0a0f16] border border-[#2a475e] overflow-hidden p-[1px]">
            <div
              className="h-full rounded-sm bg-gradient-to-r from-[#1b88d4] via-[#3878a8] to-[#66c0f4] shadow-[0_0_6px_rgba(102,192,244,0.5)] transition-all duration-500"
              style={{ width: `${Math.max(3, gamerLevelInfo.percentToNext)}%` }}
            />
          </div>
        </div>

        {/* Lado Direito: Botão CTA para Área de Conquistas & Nível */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {onOpenXpBreakdown && (
            <button
              onClick={() => {
                triggerSelectionHaptic();
                onOpenXpBreakdown();
              }}
              className="text-[11px] font-mono text-[#8a9eaf] hover:text-white transition-colors cursor-pointer hidden md:inline px-2 py-1"
            >
              Extrato ↗
            </button>
          )}

          <button
            onClick={() => {
              triggerSelectionHaptic();
              onOpenGamification();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2a475e] hover:bg-[#345975] text-xs font-bold text-[#66c0f4] hover:text-white border border-[#66c0f4]/40 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Conquistas &amp; Nível</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#66c0f4]" />
          </button>
        </div>
      </div>
    </div>
  );
}
