"use client";

import React from "react";
import Link from "next/link";
import { LibraryStats, calculateGamerLevel } from "@/lib/types";
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
  CheckCircle2,
  Users,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface GamerXpBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats?: LibraryStats | null;
  gamerLevel?: number;
}

export default function GamerXpBreakdownModal({
  isOpen,
  onClose,
  stats,
  gamerLevel,
}: GamerXpBreakdownModalProps) {
  const gamerLevelInfo = calculateGamerLevel(stats);
  const displayLevel = gamerLevel || gamerLevelInfo.level;
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
      iconColor: "text-[#00E5FF]",
      bgIcon: "bg-cyan-500/10 border-cyan-500/30",
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
      <div className="space-y-6">
        {/* Header do Extrato */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#00E5FF]/20 to-purple-500/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_15px_rgba(0,229,255,0.25)]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>Extrato de XP Gamer</span>
                <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                MyGameList Leveling Engine v2.5
              </p>
            </div>
          </div>

          {/* Badge de Nível Top Right */}
          <div className="px-3 py-1 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-right">
            <span className="text-[10px] font-mono text-gray-400 uppercase block leading-none">
              Nível Atual
            </span>
            <span className="text-base font-black font-mono text-[#00E5FF] leading-tight">
              LV. {displayLevel}
            </span>
          </div>
        </div>

        {/* Card de Progresso do Próximo Nível */}
        <div className="rounded-2xl bg-gradient-to-br from-[#12151c] to-[#181d28] border border-white/10 p-4 space-y-3 shadow-inner">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]" />
              <span className="font-bold text-white">{gamerLevelInfo.rankTitle}</span>
              <span className="text-gray-500">•</span>
              <span className="text-emerald-400 font-mono font-medium">{gamerLevelInfo.globalRank}</span>
            </div>
            <span className="font-mono text-xs font-bold text-[#00E5FF]">
              {gamerLevelInfo.percentToNext}%
            </span>
          </div>

          {/* Barra de Progresso com Brilho Neon */}
          <div className="h-3 w-full rounded-full bg-black/50 border border-white/10 overflow-hidden p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] via-purple-500 to-amber-400 shadow-[0_0_12px_rgba(0,229,255,0.6)] transition-all duration-500"
              style={{ width: `${Math.max(4, gamerLevelInfo.percentToNext)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
            <span>
              Total: <strong className="text-white font-bold">{gamerLevelInfo.xp.toLocaleString("pt-BR")} XP</strong>
            </span>
            <span>
              Meta: <strong className="text-gray-200">{gamerLevelInfo.nextLevelXp.toLocaleString("pt-BR")} XP</strong>
            </span>
          </div>

          {gamerLevelInfo.xpToNextLevel > 0 && (
            <div className="text-[11px] text-center pt-1 border-t border-white/5 font-mono text-gray-300">
              Faltam <strong className="text-[#00E5FF]">{gamerLevelInfo.xpToNextLevel.toLocaleString("pt-BR")} XP</strong> para o <strong className="text-white">Level {Math.min(99, displayLevel + 1)}</strong>
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
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${item.bgIcon}`}>
                      <Icon className={`w-4 h-4 ${item.iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">
                        {item.description} • <span className="text-gray-500 font-mono">{item.rate}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-black font-mono text-emerald-400">
                      +{item.xp.toLocaleString("pt-BR")}
                    </span>
                    <span className="text-[10px] font-mono text-gray-500 block">
                      XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Linha de Total Somado */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-[#00E5FF]/30">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                Total Acumulado de XP
              </span>
            </div>
            <span className="text-base font-black font-mono text-[#00E5FF]">
              {gamerLevelInfo.xp.toLocaleString("pt-BR")} XP
            </span>
          </div>
        </div>

        {/* Dicas Rápidas de Como Farmar XP */}
        <div className="p-3.5 rounded-xl bg-[#13161f] border border-[#242a36] space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Info className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Como subir de nível mais rápido?</span>
          </div>
          <ul className="text-[11px] text-gray-300 space-y-1 pl-5 list-disc marker:text-[#00E5FF]">
            <li>Zere jogos da sua lista para ganhar uma recompensa gorda de <strong className="text-white">+60 XP</strong>.</li>
            <li>Registre suas horas jogadas: cada hora adicionada rende <strong className="text-white">+0.2 XP</strong>.</li>
            <li>Avalie seus jogos favoritos com notas e resenhas para ganhar <strong className="text-white">+20 XP</strong> cada.</li>
          </ul>
        </div>

        {/* Botão de Navegação para o Hall da Fama */}
        <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/rankings/comunidade"
            onClick={() => {
              triggerSelectionHaptic();
              onClose();
            }}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00E5FF]/20 to-cyan-500/20 hover:from-[#00E5FF]/30 hover:to-cyan-500/30 border border-[#00E5FF]/40 text-[#00E5FF] font-bold text-xs transition-all active:scale-95"
          >
            <Users className="w-4 h-4" />
            <span>Ver Hall da Fama da Comunidade</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </AdaptiveModal>
  );
}
