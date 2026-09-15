"use client";

import React from "react";
import Link from "next/link";
import { UserGame, LibraryStats, GameStatus } from "@/lib/types";
import GamePosterCover from "@/components/common/GamePosterCover";
import StatusBadge from "@/components/StatusBadge";
import MetacriticBadge from "@/components/MetacriticBadge";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import { getGameUrl } from "@/lib/routes";
import {
  Gamepad2,
  Clock,
  Trophy,
  Bookmark,
  PauseCircle,
  Layers,
  ChevronRight,
  Plus,
  Play,
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
 * Componente central do Perfil com foco no Game Tracker (Mobile-First).
 * Prioriza jogos em andamento ("Jogando Agora"), progresso, metas e filtros rápidos.
 */
export default function ProfileGameTracker({
  games,
  stats,
  isOwner,
  activeFilter = "all",
  onSelectFilter,
  onEditGame,
  onAddGame,
}: ProfileGameTrackerProps) {
  // Jogos atualmente em andamento
  const playingGames = games.filter((g) => g.status === "playing");
  // Jogos pausados
  const pausedGames = games.filter((g) => g.status === "paused");

  const handleFilterClick = (status: string) => {
    triggerSelectionHaptic();
    onSelectFilter?.(status);
  };

  return (
    <section
      id="profile-game-tracker"
      className="profile-game-tracker space-y-4 pt-1"
      aria-label="Central do Game Tracker"
    >
      {/* 1. SEÇÃO PRINCIPAL: JOGOS EM ANDAMENTO ("JOGANDO AGORA") */}
      <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Jogando Agora</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {playingGames.length}
                </span>
              </h2>
            </div>
          </div>

          {playingGames.length > 0 && onSelectFilter && (
            <button
              type="button"
              onClick={() => handleFilterClick("playing")}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-0.5 font-bold transition-colors"
            >
              <span>Ver todos</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Lista de Jogos em Andamento (Carrossel Horizontal no Mobile) */}
        {playingGames.length > 0 ? (
          <div className="flex items-stretch gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory py-1 -mx-1 px-1">
            {playingGames.map((game) => (
              <div
                key={game.gameId}
                className="snap-start shrink-0 w-64 sm:w-72 rounded-2xl bg-[#181d28] border border-white/10 hover:border-cyan-500/40 p-2.5 flex gap-3 transition-all group"
              >
                {/* Capa em Proporção de Poster */}
                <div className="w-20 shrink-0">
                  <GamePosterCover
                    src={game.gameCover}
                    alt={game.gameTitle}
                    aspectRatio="3/4"
                    className="rounded-xl shadow-md group-hover:scale-105 transition-transform"
                    overlayContent={
                      game.metacritic ? (
                        <div className="absolute top-1 left-1">
                          <MetacriticBadge score={game.metacritic} size="sm" />
                        </div>
                      ) : null
                    }
                  />
                </div>

                {/* Dados e Progresso do Jogo */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div className="space-y-1">
                    <Link
                      href={getGameUrl({ id: game.gameId, slug: game.gameSlug, name: game.gameTitle })}
                      className="text-xs sm:text-sm font-bold text-white hover:text-cyan-300 transition-colors line-clamp-2 leading-tight"
                    >
                      {game.gameTitle}
                    </Link>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
                      <span>{game.platformPlayed || "Multiplataforma"}</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1 text-cyan-300">
                        <Clock className="w-3 h-3" />
                        <span className="font-bold">{game.userPlaytimeHours ?? 0}h</span>
                      </div>
                      {game.userRating !== null && game.userRating !== undefined && (
                        <span className="text-amber-400 font-bold">★ {game.userRating.toFixed(1)}</span>
                      )}
                    </div>

                    {isOwner && onEditGame && (
                      <button
                        type="button"
                        onClick={() => onEditGame(game)}
                        className="w-full py-1 rounded-xl bg-white/5 hover:bg-cyan-500/20 text-gray-200 hover:text-cyan-300 text-[11px] font-bold transition-all border border-white/10 active:scale-95 text-center"
                      >
                        Atualizar Progresso
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Estado Vazio de Jogos em Andamento */
          <div className="p-5 rounded-2xl bg-[#181d28]/60 border border-dashed border-white/10 text-center space-y-2">
            <p className="text-xs text-gray-400">Nenhum jogo marcado como &quot;Jogando Agora&quot;.</p>
            {isOwner && (
              <div className="flex items-center justify-center gap-2 pt-1">
                {stats.backlogCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => handleFilterClick("backlog")}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Play className="w-3 h-3" />
                    <span>Iniciar do Backlog ({stats.backlogCount})</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => onAddGame?.()}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-transform"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Explorar Catálogo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. BARRA DE MÉTRICAS RÁPIDAS DO TRACKER (TOUCH CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
        {[
          { id: "playing", label: "Jogando", count: stats.playingCount, icon: Gamepad2, color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-950/20" },
          { id: "paused", label: "Pausados", count: stats.pausedCount || pausedGames.length, icon: PauseCircle, color: "text-amber-400", border: "border-amber-500/30", bg: "bg-amber-950/20" },
          { id: "completed", label: "Zerados", count: stats.completedCount, icon: Trophy, color: "text-emerald-400", border: "border-emerald-500/30", bg: "bg-emerald-950/20" },
          { id: "backlog", label: "Quero Jogar", count: stats.backlogCount, icon: Bookmark, color: "text-purple-400", border: "border-purple-500/30", bg: "bg-purple-950/20" },
          { id: "all", label: "Coleção", count: stats.totalGames, icon: Layers, color: "text-gray-300", border: "border-white/15", bg: "bg-white/5" },
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
                  ? "bg-white/15 border-white shadow-md ring-1 ring-white/30"
                  : `${item.bg} ${item.border} hover:bg-white/10`
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
