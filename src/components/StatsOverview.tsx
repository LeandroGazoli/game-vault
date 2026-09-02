"use client";

import React from "react";
import { LibraryStats } from "@/lib/types";
import { Trophy, Gamepad2, XCircle, Clock, Hourglass, Star, Flame } from "lucide-react";

interface StatsOverviewProps {
  stats: LibraryStats;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
}

export default function StatsOverview({
  stats,
  activeTab = "all",
  onSelectTab,
}: StatsOverviewProps) {
  const completionRate =
    stats.totalGames > 0
      ? Math.round((stats.completedCount / stats.totalGames) * 100)
      : 0;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Cards de Métricas Principais (2 colunas no mobile, 4 no desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Zerados */}
        <div
          onClick={() => onSelectTab && onSelectTab("completed")}
          className={`cursor-pointer rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-200 select-none ${
            activeTab === "completed"
              ? "bg-emerald-500/15 border-emerald-500 ring-2 ring-emerald-500/30 scale-[1.02]"
              : "bg-[#141518]/90 border-white/10 hover:border-emerald-500/40 hover:bg-emerald-500/5"
          }`}
        >
          <div className="flex items-center justify-between text-emerald-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase font-mono tracking-wider">Zerados</span>
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.completedCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-400 mt-1 flex items-center justify-between">
            <span>Conclusão:</span>
            <strong className="text-emerald-400 font-mono">{completionRate}%</strong>
          </div>
        </div>

        {/* Total Jogando */}
        <div
          onClick={() => onSelectTab && onSelectTab("playing")}
          className={`cursor-pointer rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-200 select-none ${
            activeTab === "playing"
              ? "bg-cyan-500/15 border-[#00E5FF] ring-2 ring-cyan-500/30 scale-[1.02]"
              : "bg-[#141518]/90 border-white/10 hover:border-cyan-500/40 hover:bg-cyan-500/5"
          }`}
        >
          <div className="flex items-center justify-between text-[#00E5FF] mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase font-mono tracking-wider">Jogando</span>
            <Gamepad2 className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.playingCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-400 mt-1">Em progresso ativo</div>
        </div>

        {/* Total Quero Jogar / Backlog */}
        <div
          onClick={() => onSelectTab && onSelectTab("backlog")}
          className={`cursor-pointer rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-200 select-none ${
            activeTab === "backlog"
              ? "bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 scale-[1.02]"
              : "bg-[#141518]/90 border-white/10 hover:border-amber-500/40 hover:bg-amber-500/5"
          }`}
        >
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase font-mono tracking-wider">Quero Jogar</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.backlogCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-400 mt-1">Fila de espera</div>
        </div>

        {/* Total Dropados */}
        <div
          onClick={() => onSelectTab && onSelectTab("dropped")}
          className={`cursor-pointer rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-200 select-none ${
            activeTab === "dropped"
              ? "bg-rose-500/15 border-rose-500 ring-2 ring-rose-500/30 scale-[1.02]"
              : "bg-[#141518]/90 border-white/10 hover:border-rose-500/40 hover:bg-rose-500/5"
          }`}
        >
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase font-mono tracking-wider">Dropados</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.droppedCount}
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-400 mt-1">Interrompidos</div>
        </div>
      </div>

      {/* Barra de Destaques: Horas Totais, Média de Nota e Gêneros */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 rounded-2xl sm:rounded-3xl bg-[#141518]/90 border border-white/10 p-4 sm:p-5">
        {/* Horas Totais */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-[#00E5FF] flex-shrink-0">
            <Hourglass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-gray-400">Tempo Total Registrado</div>
            <div className="text-lg sm:text-xl font-black text-white font-mono">
              {stats.totalPlaytimeHours} <span className="text-xs font-normal text-gray-400 font-sans">horas</span>
            </div>
          </div>
        </div>

        {/* Nota Média Pessoal */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 flex-shrink-0">
            <Star className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="text-[11px] text-gray-400">Sua Nota Média</div>
            <div className="text-lg sm:text-xl font-black text-amber-300 font-mono">
              {stats.averageRating > 0 ? `${stats.averageRating} / 10` : "Sem avaliações"}
            </div>
          </div>
        </div>

        {/* Gêneros Favoritos */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 flex-shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[11px] text-gray-400">Gêneros Mais Jogados</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {stats.topGenres.length > 0 ? (
                stats.topGenres.slice(0, 3).map((g) => (
                  <span
                    key={g.name}
                    className="text-[10px] font-medium px-2.5 py-0.5 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 truncate"
                  >
                    {g.name} ({g.count})
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">Nenhum ainda</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
