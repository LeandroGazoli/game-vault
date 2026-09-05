"use client";

import React, { useState } from "react";
import { LibraryStats, calculateGamerLevel, UserPlan } from "@/lib/types";
import {
  Trophy,
  Gamepad2,
  XCircle,
  Clock,
  Hourglass,
  Star,
  Flame,
  Layers,
  Check,
  Sparkles,
} from "lucide-react";

interface StatsOverviewProps {
  stats: LibraryStats;
  activeTab?: string;
  onSelectTab?: (tab: string) => void;
  realRank?: string;
  plan?: UserPlan;
}

export default function StatsOverview({
  stats,
  activeTab = "all",
  onSelectTab,
  realRank,
  plan,
}: StatsOverviewProps) {
  const [metricMode, setMetricMode] = useState<"standard" | "prestige">("standard");

  const completionRate =
    stats.totalGames > 0
      ? Math.round((stats.completedCount / stats.totalGames) * 100)
      : 0;

  const gamerLevelInfo = calculateGamerLevel(stats, realRank, plan);

  // Meta estimada de zerados para o ano atual (ex: 20 jogos)
  const annualTarget = 20;
  const annualProgressPercent = Math.min(
    100,
    Math.round((stats.completedCount / annualTarget) * 100)
  );

  // Progresso do backlog (jogos em andamento vs backlog)
  const totalBacklogPool = (stats.backlogCount || 0) + (stats.playingCount || 0);
  const backlogActivePercent =
    totalBacklogPool > 0
      ? Math.min(100, Math.round((stats.playingCount / totalBacklogPool) * 100))
      : 0;

  return (
    <div className="space-y-3.5 sm:space-y-6">
      {/* =========================================================================
          1. MODO MOBILE-FIRST: CARD ÚNICO EM 3 COLUNAS LIMPAS (ESTILO REFERÊNCIAS)
      ========================================================================= */}
      <div className="block sm:hidden space-y-3">
        <div className="rounded-[28px] bg-[#12141a] border border-white/10 p-4 shadow-xl space-y-3">
          {/* Seletor sutil de visualização (Padrão vs Prestígio Gamer) */}
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400">
              {metricMode === "prestige" ? "Métricas de Prestígio" : "Resumo da Biblioteca"}
            </span>
            <button
              onClick={() =>
                setMetricMode(metricMode === "standard" ? "prestige" : "standard")
              }
              className="text-[10px] font-mono font-bold text-[#00E5FF] hover:underline cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>{metricMode === "standard" ? "Ver Prestígio" : "Ver Biblioteca"}</span>
            </button>
          </div>

          {/* 3 Colunas Limpas com Números em Destaque */}
          {metricMode === "standard" ? (
            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/5">
              {/* Coluna 1: Zerados */}
              <div
                onClick={() => onSelectTab && onSelectTab("completed")}
                className="cursor-pointer active:scale-95 transition-transform"
              >
                <div className="text-2xl font-black text-white font-mono">
                  {stats.completedCount}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">
                  Zerados
                </div>
              </div>

              {/* Coluna 2: Jogando */}
              <div
                onClick={() => onSelectTab && onSelectTab("playing")}
                className="cursor-pointer active:scale-95 transition-transform pl-1"
              >
                <div className="text-2xl font-black text-[#00E5FF] font-mono">
                  {stats.playingCount}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">
                  Jogando
                </div>
              </div>

              {/* Coluna 3: Biblioteca */}
              <div
                onClick={() => onSelectTab && onSelectTab("library")}
                className="cursor-pointer active:scale-95 transition-transform pl-1"
              >
                <div className="text-2xl font-black text-indigo-300 font-mono">
                  {stats.libraryCount ?? stats.totalGames}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">
                  Biblioteca
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 text-center divide-x divide-white/5">
              {/* Coluna 1: Platinas / Zerados 100% */}
              <div className="cursor-pointer active:scale-95 transition-transform">
                <div className="text-2xl font-black text-amber-300 font-mono">
                  {stats.completedCount}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">
                  Platinas
                </div>
              </div>

              {/* Coluna 2: Horas Registradas */}
              <div className="cursor-pointer active:scale-95 transition-transform pl-1">
                <div className="text-2xl font-black text-[#00E5FF] font-mono">
                  {stats.totalPlaytimeHours > 0 ? `${stats.totalPlaytimeHours}h` : "0h"}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">
                  Tempo Jogo
                </div>
              </div>

              {/* Coluna 3: Ranking Global */}
              <div className="cursor-pointer active:scale-95 transition-transform pl-1">
                <div
                  className="text-base sm:text-2xl font-black text-emerald-400 font-mono truncate"
                  title={gamerLevelInfo.globalRank}
                >
                  {gamerLevelInfo.globalRank}
                </div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-0.5">
                  Rank Global
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2 Mini-Cards de Metas com Barra de Progresso Ciano Neon (Inspirado nas Imagens) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Mini-Card 1: Meta de Jogos Zerados */}
          <div className="rounded-2xl bg-[#12141a] border border-[#00E5FF]/20 p-3 shadow-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-[#00E5FF] flex items-center gap-1 uppercase tracking-tight">
                <span>META ANUAL</span>
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
              <span className="text-[9px] font-mono font-bold text-gray-400">
                {stats.completedCount}/{annualTarget}
              </span>
            </div>
            <div className="text-sm font-black text-white font-mono">
              {stats.completedCount}{" "}
              <span className="text-[10px] font-normal text-gray-400 font-sans">zerados</span>
            </div>
            {/* Barra Neon Ciano */}
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#00E5FF] to-emerald-400 shadow-[0_0_8px_#00E5FF] transition-all duration-500"
                style={{ width: `${Math.max(8, annualProgressPercent)}%` }}
              />
            </div>
          </div>

          {/* Mini-Card 2: Quero Jogar / Fila */}
          <div className="rounded-2xl bg-[#12141a] border border-amber-500/20 p-3 shadow-md space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-black text-amber-400 flex items-center gap-1 uppercase tracking-tight">
                <span>QUERO JOGAR</span>
                <Flame className="w-3 h-3 fill-amber-400" />
              </span>
              <span className="text-[9px] font-mono font-bold text-gray-400">
                {stats.playingCount} ativos
              </span>
            </div>
            <div className="text-sm font-black text-white font-mono">
              {stats.backlogCount}{" "}
              <span className="text-[10px] font-normal text-gray-400 font-sans">na fila</span>
            </div>
            {/* Barra Neon Ouro/Laranja */}
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_8px_rgba(251,191,36,0.5)] transition-all duration-500"
                style={{ width: `${Math.max(8, backlogActivePercent || 35)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MODO DESKTOP & TABLET: CARDS COMPLETOS DE TODAS AS CATEGORIAS
      ========================================================================= */}
      <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
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

        {/* Total Biblioteca */}
        <div
          onClick={() => onSelectTab && onSelectTab("library")}
          className={`cursor-pointer rounded-2xl sm:rounded-3xl border p-4 sm:p-5 transition-all duration-200 select-none ${
            activeTab === "library"
              ? "bg-indigo-500/15 border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.02]"
              : "bg-[#141518]/90 border-white/10 hover:border-indigo-500/40 hover:bg-indigo-500/5"
          }`}
        >
          <div className="flex items-center justify-between text-indigo-400 mb-1">
            <span className="text-[11px] sm:text-xs font-bold uppercase font-mono tracking-wider">Biblioteca</span>
            <Layers className="w-4 h-4" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {stats.libraryCount ?? 0}
          </div>
          <div className="text-[10px] sm:text-[11px] text-gray-400 mt-1">Coleção / Na Estante</div>
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
