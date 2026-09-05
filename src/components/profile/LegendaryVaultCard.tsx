"use client";

import React from "react";
import { UserProfile, LibraryStats, calculateGamerLevel } from "@/lib/types";
import { Crown, Sparkles, Gamepad2, ArrowRight, ShieldCheck, Trophy } from "lucide-react";

interface LegendaryVaultCardProps {
  user: UserProfile;
  stats?: LibraryStats | null;
  isOwner?: boolean;
  realRank?: string;
  onOpenUpgrade?: () => void;
  onOpenManagePlan?: () => void;
  onOpenXpBreakdown?: () => void;
}

export default function LegendaryVaultCard({
  user,
  stats,
  isOwner,
  realRank,
  onOpenUpgrade,
  onOpenManagePlan,
  onOpenXpBreakdown,
}: LegendaryVaultCardProps) {
  const isVip = user.plan === "vip";
  const isPro = user.plan === "pro";
  const isVipOrPro = isVip || isPro;
  const gamerLevelInfo = calculateGamerLevel(stats, realRank, user.plan);
  const displayLevel = user.gamerLevel || gamerLevelInfo.level;

  const handleAction = () => {
    if (isVipOrPro && onOpenManagePlan) {
      onOpenManagePlan();
    } else if (onOpenUpgrade) {
      onOpenUpgrade();
    }
  };

  return (
    <div className="relative rounded-[28px] sm:rounded-[32px] p-[2px] bg-gradient-to-r from-amber-500 via-purple-600 to-[#00E5FF] shadow-[0_10px_35px_rgba(0,229,255,0.25)] overflow-hidden group">
      {/* Container Interno */}
      <div className="relative rounded-[26px] sm:rounded-[30px] bg-gradient-to-br from-[#10121a] via-[#120f20] to-[#0c1322] p-4 sm:p-6 overflow-hidden">
        {/* Marca d'água gamer com controle e feixes de luz */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 sm:w-56 sm:h-56 opacity-10 text-white pointer-events-none transform -rotate-12 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500">
          <Gamepad2 className="w-full h-full" />
        </div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Lado Esquerdo: Tag VIP, Título e Ação */}
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-md text-black font-black text-[11px] tracking-wider uppercase shadow-md flex items-center gap-1 ${
                  isVip
                    ? "bg-gradient-to-r from-amber-400 to-amber-500"
                    : isPro
                    ? "bg-gradient-to-r from-[#00E5FF] to-cyan-400"
                    : "bg-gray-300"
                }`}
              >
                <Crown className="w-3 h-3 text-black fill-black" />
                <span>{user.plan ? user.plan.toUpperCase() : "FREE"}</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/80">
                #LEGENDARY-VAULT
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>LEGENDARY VAULT</span>
                <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              </h3>
              <p className="text-xs text-gray-300 font-medium">
                {isVip
                  ? "Assinatura VIP Fundador Ativa • XP em Dobro (2.0x), selo dourado e acesso vitalício total."
                  : isPro
                  ? "Assinatura PRO Ativa • Boost de +50% de XP (1.5x), temas exclusivos e sem anúncios."
                  : "Desbloqueie o potencial máximo com Boost de até 2.0x XP, temas neon e zero anúncios."}
              </p>
            </div>

            {/* Botão de Ação Ciano Neon */}
            <div className="pt-1">
              <button
                onClick={handleAction}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00b4d8] hover:from-white hover:to-gray-100 text-black font-extrabold text-xs tracking-tight shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all active:scale-95 cursor-pointer"
              >
                <span>{isVipOrPro ? "Gerenciar Benefícios" : "Ativar Boost de XP"}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Lado Direito: Brasão PRO LEVEL com Nível Dinâmico e Boost Pill */}
          <div className="flex items-center gap-3 sm:flex-col sm:items-end self-start sm:self-center bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/10 sm:border-0">
            {/* Pill do Multiplicador de XP */}
            {isVip ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 shadow-inner">
                <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30" />
                <span className="text-xs font-black text-amber-300 font-mono tracking-wider">
                  2.0x XP BOOST
                </span>
              </div>
            ) : isPro ? (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/20 border border-[#00E5FF]/40 shadow-inner">
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span className="text-xs font-black text-[#00E5FF] font-mono tracking-wider">
                  1.5x XP BOOST
                </span>
              </div>
            ) : (
              <button
                onClick={onOpenUpgrade}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all text-[11px] font-mono font-bold cursor-pointer"
                title="Faça upgrade para ganhar até 2.0x de XP"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>1.0x XP • Ativar Boost</span>
              </button>
            )}

            {/* Badge de Nível Ciano Neon */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <span className="text-[10px] font-mono font-bold text-gray-300 uppercase">
                LEVEL
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-[#00E5FF]">
                {displayLevel}
              </span>
            </div>
          </div>
        </div>

        {/* Barra de Progresso de XP Gamer e Status de Ranking */}
        <div
          onClick={onOpenXpBreakdown}
          className={`mt-4 pt-3.5 border-t border-white/10 space-y-2 rounded-2xl p-2.5 -mx-2.5 transition-all ${
            onOpenXpBreakdown
              ? "cursor-pointer hover:bg-white/[0.05] active:scale-[0.99] group/xp border border-transparent hover:border-[#00E5FF]/20"
              : ""
          }`}
          title={onOpenXpBreakdown ? "Clique para abrir o Extrato de XP Gamer" : undefined}
          role={onOpenXpBreakdown ? "button" : undefined}
          tabIndex={onOpenXpBreakdown ? 0 : undefined}
        >
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-200 font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="text-white">{gamerLevelInfo.rankTitle}</span>
              <span className="text-gray-500">•</span>
              <span className="text-emerald-400">
                {gamerLevelInfo.globalRank.includes("Global")
                  ? gamerLevelInfo.globalRank
                  : `${gamerLevelInfo.globalRank} Global`}
              </span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[#00E5FF] font-black">
                {gamerLevelInfo.xp.toLocaleString("pt-BR")} / {gamerLevelInfo.nextLevelXp.toLocaleString("pt-BR")} XP
                <span className="text-gray-400 font-normal ml-1">({gamerLevelInfo.percentToNext}%)</span>
              </span>
              {onOpenXpBreakdown && (
                <span className="text-[10px] font-mono font-bold text-[#00E5FF] underline underline-offset-2 opacity-80 group-hover/xp:opacity-100 hidden sm:inline">
                  Extrato ↗
                </span>
              )}
            </div>
          </div>

          <div className="h-2.5 w-full rounded-full bg-black/40 border border-white/10 overflow-hidden p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] via-purple-500 to-amber-400 shadow-[0_0_12px_rgba(0,229,255,0.6)] transition-all duration-700"
              style={{ width: `${Math.max(4, gamerLevelInfo.percentToNext)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span>Level {displayLevel}</span>
              {gamerLevelInfo.boostBonusXp > 0 && (
                <span className="text-emerald-400 font-bold">
                  (Bônus {gamerLevelInfo.boostLabel}: +{gamerLevelInfo.boostBonusXp.toLocaleString("pt-BR")} XP)
                </span>
              )}
            </span>
            <span>
              Faltam {gamerLevelInfo.xpToNextLevel.toLocaleString("pt-BR")} XP para o Level {Math.min(99, displayLevel + 1)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
