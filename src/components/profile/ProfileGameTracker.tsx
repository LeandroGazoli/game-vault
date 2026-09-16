"use client";

import React from "react";
import { UserGame, LibraryStats } from "@/lib/types";
import {
  Gamepad2,
  Clock,
  Trophy,
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
 * Exibe o resumo de horas, taxa de conclusão e nota média do jogador em superfícies sólidas de alto contraste,
 * integrando-se diretamente às seções e abas de streaming da biblioteca.
 */
export default function ProfileGameTracker({
  stats,
  isOwner,
  onAddGame,
}: ProfileGameTrackerProps) {
  const completionRate = stats.totalGames > 0 ? Math.round((stats.completedCount / stats.totalGames) * 100) : 0;

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
    </section>
  );
}
