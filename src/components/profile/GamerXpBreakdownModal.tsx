"use client";

import React from "react";
import Link from "next/link";
import { LibraryStats, calculateGamerLevel, UserPlan } from "@/lib/types";
import { getSteamLevelTier } from "@/lib/steamUtils";
import AdaptiveModal from "@/components/ui/AdaptiveModal";
import {
  Trophy,
  Clock,
  Gamepad2,
  Bookmark,
  Star,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Info,
  Users,
  Crown,
  Zap,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface GamerXpBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: LibraryStats | null;
  gamerLevel?: number;
  realRank?: string;
  plan?: UserPlan;
  onOpenUpgrade?: () => void;
}

export default function GamerXpBreakdownModal({
  isOpen,
  onClose,
  stats,
  gamerLevel,
  realRank,
  plan,
  onOpenUpgrade,
}: GamerXpBreakdownModalProps) {
  const gamerLevelInfo = calculateGamerLevel(stats, realRank, plan);
  const displayLevel = gamerLevel || gamerLevelInfo.level;
  const steamTier = getSteamLevelTier(displayLevel);
  const { breakdown } = gamerLevelInfo;

  const completedCount = stats?.completedCount || 0;
  const totalHours = stats?.totalPlaytimeHours || 0;
  const playingCount = stats?.playingCount || 0;
  const libraryTotal = (stats?.libraryCount ?? 0) + (stats?.totalGames || 0);
  const ratedCount = stats?.averageRating ? Math.min(stats.totalGames || 0, 20) : 0;

  const sources = [
    {
      id: "completed",
      title: "Jogos Zerados / Concluídos",
      description: `${completedCount} ${completedCount === 1 ? "jogo finalizado" : "jogos finalizados"}`,
      rate: "+60 XP por jogo",
      xp: breakdown.completedXp,
      icon: Trophy,
      iconColor: "text-amber-400",
      bgIcon: "bg-amber-500/10 border-amber-500/30",
    },
    {
      id: "hours",
      title: "Horas Jogadas Registradas",
      description: `${totalHours.toLocaleString("pt-BR")}h registradas na biblioteca`,
      rate: "+0.2 XP por hora",
      xp: breakdown.hoursXp,
      icon: Clock,
      iconColor: "text-[#66c0f4]",
      bgIcon: "bg-blue-500/10 border-[#2a475e]",
    },
    {
      id: "playing",
      title: "Jogos em Andamento",
      description: `${playingCount} ${playingCount === 1 ? "jogo ativo" : "jogos ativos"} no status Jogando`,
      rate: "+20 XP por jogo",
      xp: breakdown.playingXp,
      icon: Gamepad2,
      iconColor: "text-emerald-400",
      bgIcon: "bg-emerald-500/10 border-emerald-500/30",
    },
    {
      id: "library",
      title: "Catálogo da Biblioteca",
      description: `${libraryTotal} ${libraryTotal === 1 ? "título adicionado" : "títulos adicionados"}`,
      rate: "+10 XP por jogo",
      xp: breakdown.libraryXp,
      icon: Bookmark,
      iconColor: "text-purple-400",
      bgIcon: "bg-purple-500/10 border-purple-500/30",
    },
    {
      id: "reviews",
      title: "Avaliações & Críticas",
      description: `${ratedCount} ${ratedCount === 1 ? "título avaliado com nota" : "títulos avaliados com nota"}`,
      rate: "+20 XP por nota",
      xp: breakdown.ratingXp,
      icon: Star,
      iconColor: "text-rose-400",
      bgIcon: "bg-rose-500/10 border-rose-500/30",
    },
  ];

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        {/* Header do Extrato com Círculo de Nível Steam */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#2a475e]">
          <div className="flex items-center gap-3">
            {/* Círculo de Nível Steam Autêntico */}
            <div
              className={`w-12 h-12 rounded-full flex flex-col items-center justify-center border-[2.5px] bg-[#101822] shrink-0 ${steamTier.ringBorderClass}`}
              style={{ borderColor: steamTier.borderColor }}
            >
              <span className="text-[7px] font-mono uppercase tracking-wider text-gray-400 font-bold leading-none">
                NÍVEL
              </span>
              <span className={`text-base font-black font-mono leading-none ${steamTier.textColor}`}>
                {displayLevel}
              </span>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase flex items-center gap-2 font-sans">
                <span>Extrato de XP Gamer</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#2a475e] text-[#66c0f4]">
                  STEAM
                </span>
              </h3>
              <p className="text-xs text-[#8a9eaf] font-mono">
                MyGameList Leveling Engine • {steamTier.tierName}
              </p>
            </div>
          </div>

          {/* Badge de Nível Top Right */}
          <div className="px-2.5 py-1 rounded-lg bg-[#101822] border border-[#2a475e] text-right hidden sm:block">
            <span className="text-[9px] font-mono text-gray-400 uppercase block leading-none">
              Nível Atual
            </span>
            <span className={`text-sm font-black font-mono leading-tight ${steamTier.textColor}`}>
              LV. {displayLevel}
            </span>
          </div>
        </div>

        {/* Card de Progresso do Próximo Nível Steam */}
        <div className="rounded-xl bg-[#101822] border border-[#2a475e] p-4 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: steamTier.borderColor }}
              />
              <span className="font-bold text-white">{gamerLevelInfo.rankTitle}</span>
              <span className="text-gray-500">•</span>
              <span className="text-[#66c0f4] font-medium">{gamerLevelInfo.globalRank}</span>
            </div>
            <span className="text-xs font-bold text-[#66c0f4]">
              {gamerLevelInfo.percentToNext}%
            </span>
          </div>

          {/* Barra de Progresso Steam */}
          <div className="h-3 w-full rounded-sm bg-[#0a0f16] border border-[#2a475e] overflow-hidden p-[1px]">
            <div
              className="h-full rounded-sm bg-gradient-to-r from-[#1b88d4] via-[#3878a8] to-[#66c0f4] shadow-[0_0_8px_rgba(102,192,244,0.5)] transition-all duration-500"
              style={{ width: `${Math.max(4, gamerLevelInfo.percentToNext)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#8a9eaf]">
            <span>
              Total: <strong className="text-white font-bold">{gamerLevelInfo.xp.toLocaleString("pt-BR")} XP</strong>
            </span>
            <span>
              Meta: <strong className="text-gray-200">{gamerLevelInfo.nextLevelXp.toLocaleString("pt-BR")} XP</strong>
            </span>
          </div>

          {gamerLevelInfo.xpToNextLevel > 0 && (
            <div className="text-[11px] text-center pt-1 border-t border-[#2a475e]/60 font-mono text-gray-300">
              Faltam <strong className="text-[#66c0f4]">{gamerLevelInfo.xpToNextLevel.toLocaleString("pt-BR")} XP</strong> para o <strong className="text-white">Level {Math.min(99, displayLevel + 1)}</strong>
            </div>
          )}
        </div>


        {/* Lista Detalhada de Fontes de XP */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider">
              Fontes de Pontuação Ativas
            </span>
            <span className="text-xs font-mono text-gray-400">
              Valor
            </span>
          </div>

          <div className="space-y-2">
            {sources.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#101822] border border-[#2a475e]/60 hover:border-[#2a475e] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-lg border flex items-center justify-center shrink-0 ${item.bgIcon}`}>
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-[#8a9eaf] truncate">
                        {item.description} • <span className="text-gray-400 font-mono">{item.rate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                      +{item.xp.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-[10px] font-mono text-[#8a9eaf] block">
                      XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Multiplicador e Bônus do Plano (XP Boost) */}
          <div
            className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
              plan === "vip"
                ? "bg-gradient-to-r from-amber-500/15 to-yellow-500/10 border-amber-500/40"
                : plan === "pro"
                ? "bg-gradient-to-r from-[#66c0f4]/15 to-blue-500/10 border-[#66c0f4]/40"
                : "bg-[#101822] border-[#2a475e]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {plan === "vip" ? (
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                ) : plan === "pro" ? (
                  <Zap className="w-4 h-4 text-[#66c0f4] fill-[#66c0f4]/20" />
                ) : (
                  <Zap className="w-4 h-4 text-gray-400" />
                )}
                <div>
                  <span className="text-xs font-bold text-white block">
                    {plan === "vip"
                      ? "Boost VIP Fundador (2.0x XP em Dobro)"
                      : plan === "pro"
                      ? "Boost PRO Ativo (+50% de XP / 1.5x)"
                      : "Multiplicador de XP do Plano Free (1.0x)"}
                  </span>
                  <span className="text-[10px] text-[#8a9eaf] font-mono">
                    {plan === "vip"
                      ? "Evolução máxima ativada em toda a plataforma"
                      : plan === "pro"
                      ? "+50% de bônus em zeramentos, horas e catálogo"
                      : "Ganho na taxa padrão sem aceleração"}
                  </span>
                </div>
              </div>

              <span
                className={`text-xs font-mono font-black px-2 py-0.5 rounded-md ${
                  plan === "vip"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : plan === "pro"
                    ? "bg-[#66c0f4]/20 text-[#66c0f4] border border-[#66c0f4]/40"
                    : "bg-[#1b2838] text-gray-300 border border-[#2a475e]"
                }`}
              >
                {gamerLevelInfo.boostLabel} BOOST
              </span>
            </div>

            {/* Valores de Base vs Bônus */}
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#2a475e]/60 text-[11px] font-mono">
              <div className="text-[#8a9eaf]">
                <span>XP Base Conquistado: </span>
                <strong className="text-white font-bold">{breakdown.baseXp.toLocaleString("pt-BR")} XP</strong>
              </div>
              <div className="text-right">
                {breakdown.boostBonusXp > 0 ? (
                  <span className="text-emerald-400 font-bold">
                    +{breakdown.boostBonusXp.toLocaleString("pt-BR")} XP ({gamerLevelInfo.boostPercent}%)
                  </span>
                ) : (
                  <span className="text-gray-500">0 XP bônus</span>
                )}
              </div>
            </div>

            {/* Se for FREE: Card de incentivo / Upgrade */}
            {(!plan || plan === "free") && (
              <div className="pt-2 border-t border-[#2a475e]/60 space-y-2">
                <div className="p-2.5 rounded-lg bg-black/40 border border-amber-500/20 text-[11px] text-amber-200/90 leading-relaxed">
                  💡 <strong className="text-white">Quer disparar no Ranking Global?</strong> Com o plano <strong>PRO</strong> você teria agora <strong className="text-[#66c0f4]">+{Math.floor(breakdown.baseXp * 0.5).toLocaleString("pt-BR")} XP</strong> e no <strong>VIP</strong> seriam <strong className="text-amber-300">+{breakdown.baseXp.toLocaleString("pt-BR")} XP adicionais</strong>!
                </div>
                {onOpenUpgrade && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenUpgrade();
                    }}
                    className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-110 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 fill-black" />
                    <span>Ativar Boost de XP (PRO 1.5x / VIP 2.0x)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Linha de Total Somado */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#101822] border border-[#2a475e]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#66c0f4]" />
              <span className="text-xs font-extrabold text-white uppercase tracking-wider font-sans">
                Total Acumulado de XP
              </span>
            </div>
            <span className="text-base font-black font-mono text-[#66c0f4]">
              {gamerLevelInfo.xp.toLocaleString("pt-BR")} XP
            </span>
          </div>
        </div>

        {/* Dicas Rápidas de Como Farmar XP */}
        <div className="p-3.5 rounded-xl bg-[#101822] border border-[#2a475e] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Como subir de nível mais rápido?</span>
          </div>
          <ul className="text-[11px] text-[#8a9eaf] space-y-1 pl-5 list-disc marker:text-[#66c0f4]">
            <li>Zere jogos da sua lista para ganhar uma recompensa gorda de <strong className="text-white">+60 XP</strong>.</li>
            <li>Registre suas horas jogadas: cada hora adicionada rende <strong className="text-white">+0.2 XP</strong>.</li>
            <li>Avalie seus jogos favoritos com notas e resenhas para ganhar <strong className="text-white">+20 XP</strong> cada.</li>
          </ul>
        </div>

        {/* Botão de Navegação para o Hall da Fama */}
        <div className="pt-2 border-t border-[#2a475e] flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/rankings/comunidade"
            onClick={() => {
              triggerSelectionHaptic();
              onClose();
            }}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#2a475e] hover:bg-[#345975] text-[#66c0f4] hover:text-white border border-[#66c0f4]/40 font-bold text-xs transition-all active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>Ver Hall da Fama da Comunidade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-[#1b2838] hover:bg-[#2a475e] text-[#8a9eaf] hover:text-white border border-[#2a475e] font-bold text-xs transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </AdaptiveModal>
  );
}
