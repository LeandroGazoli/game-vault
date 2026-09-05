"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { LibraryStats, UserProfile, calculateGamerLevel } from "@/lib/types";
import {
  Target,
  Trophy,
  Clock,
  Star,
  Bookmark,
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  Flame,
  Zap,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface GamerQuestsCardProps {
  stats?: LibraryStats | null;
  user: UserProfile;
  isOwner?: boolean;
  onOpenCustomizer?: () => void;
}

export default function GamerQuestsCard({
  stats,
  user,
  isOwner,
  onOpenCustomizer,
}: GamerQuestsCardProps) {
  const completed = stats?.completedCount || 0;
  const hours = stats?.totalPlaytimeHours || 0;
  const totalGames = (stats?.libraryCount ?? 0) + (stats?.totalGames || 0);
  const rated = stats?.averageRating ? Math.min(stats.totalGames || 0, 20) : 0;
  const hasShowcase = Boolean(user.showcaseGameId || user.customMarkdown || user.customHtml);

  const quests = useMemo(() => {
    return [
      {
        id: "quest_complete",
        title: "Conquistador de Histórias",
        description: "Zere pelo menos 1 jogo na sua biblioteca de jogos",
        target: 1,
        current: Math.min(completed, 1),
        progressLabel: `${Math.min(completed, 1)} / 1 jogo`,
        isCompleted: completed >= 1,
        rewardXp: 100,
        icon: Trophy,
        color: "text-amber-400",
        border: "border-amber-500/30",
        actionText: "Ir para Biblioteca",
        actionHref: "#library-tabs",
      },
      {
        id: "quest_hours",
        title: "Maratona Gamer",
        description: "Acumule pelo menos 5 horas totais de jogatina registradas",
        target: 5,
        current: Math.min(Math.floor(hours), 5),
        progressLabel: `${Math.min(Math.floor(hours), 5)} / 5 horas`,
        isCompleted: hours >= 5,
        rewardXp: 25,
        icon: Clock,
        color: "text-[#00E5FF]",
        border: "border-cyan-500/30",
        actionText: "Registrar Horas",
        actionHref: "#library-tabs",
      },
      {
        id: "quest_review",
        title: "Voz da Comunidade",
        description: "Avalie pelo menos 1 título atribuindo uma nota sincera",
        target: 1,
        current: rated >= 1 ? 1 : 0,
        progressLabel: `${rated >= 1 ? 1 : 0} / 1 avaliação`,
        isCompleted: rated >= 1,
        rewardXp: 30,
        icon: Star,
        color: "text-rose-400",
        border: "border-rose-500/30",
        actionText: "Avaliar Jogo",
        actionHref: "#library-tabs",
      },
      {
        id: "quest_library",
        title: "Curador do Vault",
        description: "Adicione e organize pelo menos 5 jogos na sua lista",
        target: 5,
        current: Math.min(totalGames, 5),
        progressLabel: `${Math.min(totalGames, 5)} / 5 títulos`,
        isCompleted: totalGames >= 5,
        rewardXp: 20,
        icon: Bookmark,
        color: "text-purple-400",
        border: "border-purple-500/30",
        actionText: "Explorar Jogos",
        actionHref: "/",
      },
      {
        id: "quest_showcase",
        title: "Identidade Lendária",
        description: "Configure um jogo em destaque ou bio personalizada no seu perfil",
        target: 1,
        current: hasShowcase ? 1 : 0,
        progressLabel: hasShowcase ? "Configurado ✓" : "Pendente",
        isCompleted: hasShowcase,
        rewardXp: 40,
        icon: Sparkles,
        color: "text-emerald-400",
        border: "border-emerald-500/30",
        actionText: "Personalizar",
        onAction: onOpenCustomizer,
      },
    ];
  }, [completed, hours, totalGames, rated, hasShowcase, onOpenCustomizer]);

  const completedCount = quests.filter((q) => q.isCompleted).length;
  const totalEarnedXp = quests
    .filter((q) => q.isCompleted)
    .reduce((acc, q) => acc + q.rewardXp, 0);
  const totalPotentialXp = quests.reduce((acc, q) => acc + q.rewardXp, 0);

  const percentComplete = Math.round((completedCount / quests.length) * 100);

  return (
    <div className="rounded-[28px] sm:rounded-[32px] bg-[#0e1117] border border-white/10 p-4 sm:p-6 shadow-xl space-y-5 relative overflow-hidden">
      {/* Luz Ambiente Holográfica */}
      <div className="absolute top-0 right-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho do Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 shadow-sm">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Missões Gamers da Temporada</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                {completedCount} / {quests.length} Concluídas
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Cumpra objetivos na sua biblioteca e acelere seu ganho de XP
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 self-start sm:self-auto font-mono text-xs">
          <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          <span className="text-gray-300">
            XP Ganho: <strong className="text-emerald-400">+{totalEarnedXp}</strong> / {totalPotentialXp} XP
          </span>
        </div>
      </div>

      {/* Barra de Progresso Geral */}
      <div className="space-y-1.5 bg-[#131620] border border-white/5 rounded-2xl p-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Maestria Semanal</span>
          </span>
          <span className="text-emerald-400 font-bold">
            {percentComplete}% Concluído
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-black/50 border border-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-[#00E5FF] to-amber-400 transition-all duration-500"
            style={{ width: `${percentComplete}%` }}
          />
        </div>
      </div>

      {/* Lista de Missões */}
      <div className="space-y-2.5">
        {quests.map((quest) => {
          const Icon = quest.icon;
          const isDone = quest.isCompleted;

          return (
            <div
              key={quest.id}
              className={`rounded-2xl border p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                isDone
                  ? "bg-emerald-950/20 border-emerald-500/30 text-white"
                  : "bg-white/[0.02] border-white/5 hover:border-white/15"
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                    isDone
                      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      : "bg-white/5 border-white/10 text-gray-400"
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Icon className={`w-4 h-4 ${quest.color}`} />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className={`text-xs font-bold ${isDone ? "text-white line-through decoration-emerald-500/50" : "text-gray-200"}`}>
                      {quest.title}
                    </h4>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      +{quest.rewardXp} XP
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    {quest.description}
                  </p>
                </div>
              </div>

              {/* Status e Ação */}
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                <span className={`text-[11px] font-mono font-bold ${isDone ? "text-emerald-400" : "text-gray-400"}`}>
                  {quest.progressLabel}
                </span>

                {isOwner && !isDone && (
                  quest.onAction ? (
                    <button
                      onClick={() => {
                        triggerSelectionHaptic();
                        quest.onAction?.();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-[#00E5FF] transition-all cursor-pointer"
                    >
                      {quest.actionText}
                    </button>
                  ) : (
                    <a
                      href={quest.actionHref}
                      className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-bold text-[#00E5FF] transition-all cursor-pointer"
                    >
                      {quest.actionText}
                    </a>
                  )
                )}

                {isDone && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-[10px] font-mono font-bold text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Concluída</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
