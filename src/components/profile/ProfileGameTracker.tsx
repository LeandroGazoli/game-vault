"use client";

import React from "react";
import { UserGame, LibraryStats } from "@/lib/types";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import {
  Gamepad2,
  Clock,
  Trophy,
  Bookmark,
  PauseCircle,
  Layers,
  Star,
  Plus,
} from "lucide-react";

export interface ProfileGameTrackerProps {
  games: UserGame[];
  stats: LibraryStats;
  isOwner: boolean;
  activeFilter?: string;
  onSelectFilter?: (status: string) => void;
  onEditGame?: (game: UserGame) => void;
  onAddGame?: () => void;
}

/**
 * Painel Central do Game Tracker (HUD & Métricas Mobile-First).
 * Exibe contadores de status de alto contraste em superfícies sólidas
 * e resumo de horas/conclusão, servindo como navegação rápida para as seções de streaming.
 */
export default function ProfileGameTracker({
  games,
  stats,
  isOwner,
  activeFilter = "all",
  onSelectFilter,
  onAddGame,
}: ProfileGameTrackerProps) {
  const completionRate = stats.totalGames > 0 ? Math.round((stats.completedCount / stats.totalGames) * 100) : 0;

  const handleFilterClick = (status: string) => {
    triggerSelectionHaptic();
    onSelectFilter?.(status);

    // Scroll suave para a seção ou linha correspondente no perfil
    const targetId =
      status === "playing"
        ? "streaming-row-playing"
        : status === "backlog"
        ? "streaming-row-backlog"
        : status === "completed"
        ? "streaming-row-completed"
        : "profile-library-streaming";

    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      id="profile-game-tracker"
      className="profile-game-tracker space-y-3 pt-1"
      aria-label="Central do Game Tracker"
    >
      {/* 1. HUD RESUMO GERAL DO JOGADOR */}
      <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0d222b] border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Game Tracker</span>
                <span className="text-[11px] font-mono text-cyan-400 font-bold bg-[#0d222b] px-2 py-0.5 rounded-full border border-cyan-500/30">
                  HUD
                </span>
              </h2>
            </div>
          </div>

          {isOwner && onAddGame && (
            <button
              type="button"
              onClick={onAddGame}
              className="px-3 py-1.5 rounded-xl bg-[#10291e] hover:bg-[#163829] border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar</span>
            </button>
          )}
        </div>

        {/* Três métricas essenciais em pílulas sólidas */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
          <div className="p-2.5 rounded-2xl bg-[#181d28] border border-white/5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-center gap-1 mb-0.5">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>Horas</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono leading-none">
              {stats.totalPlaytimeHours ?? 0}h
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#181d28] border border-white/5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-center gap-1 mb-0.5">
              <Trophy className="w-3 h-3 text-emerald-400" />
              <span>Taxa Zerados</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono leading-none">
              {completionRate}%
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-[#181d28] border border-white/5 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-center gap-1 mb-0.5">
              <Star className="w-3 h-3 text-amber-400" />
              <span>Nota Média</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white font-mono leading-none">
              {stats.averageRating ? stats.averageRating.toFixed(1) : "—"}
            </div>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE MÉTRICAS RÁPIDAS (TOUCH CARDS SÓLIDOS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {[
          { id: "playing", label: "Jogando", count: stats.playingCount, icon: Gamepad2, color: "text-cyan-400", border: "border-cyan-500/40", bg: "bg-[#0d222b]" },
          { id: "paused", label: "Pausados", count: stats.pausedCount || 0, icon: PauseCircle, color: "text-amber-400", border: "border-amber-500/40", bg: "bg-[#251e12]" },
          { id: "completed", label: "Zerados", count: stats.completedCount, icon: Trophy, color: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-[#0d241a]" },
          { id: "backlog", label: "Quero Jogar", count: stats.backlogCount, icon: Bookmark, color: "text-purple-400", border: "border-purple-500/40", bg: "bg-[#21152d]" },
          { id: "all", label: "Coleção", count: stats.totalGames, icon: Layers, color: "text-gray-300", border: "border-white/15", bg: "bg-[#181d28]" },
        ].map((item) => {
          const Icon = item.icon;
          const isSelected = activeFilter === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleFilterClick(item.id)}
              className={`p-3 rounded-2xl border text-left transition-all active:scale-95 select-none ${
                isSelected
                  ? "bg-[#252f42] border-white shadow-md ring-1 ring-white/40"
                  : `${item.bg} ${item.border} hover:bg-[#1e2535]`
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {item.label}
                </span>
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
              </div>
              <div className="text-lg sm:text-xl font-black text-white font-mono leading-none">
                {item.count}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
