"use client";

import React, { useState } from "react";
import { LibraryStats, calculateGamerLevel } from "@/lib/types";
import { Sparkles, Trophy, ChevronRight, Zap, Target, Hourglass, Shield } from "lucide-react";

interface GamerScoreboardCardProps {
  stats?: LibraryStats | null;
  onOpenRankings?: () => void;
}

export default function GamerScoreboardCard({
  stats,
  onOpenRankings,
}: GamerScoreboardCardProps) {
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const gamerLevelInfo = calculateGamerLevel(stats);

  const completedScore = (stats?.completedCount || 0) * 120 + (stats?.totalGames || 0) * 10;
  const hoursScore = Math.floor((stats?.totalPlaytimeHours || 0) * 8);
  const prestigeScore = gamerLevelInfo.level * 150 + Math.floor(gamerLevelInfo.xp / 10);

  return (
    <div className="rounded-[28px] sm:rounded-[32px] bg-[#0e1117] border border-white/10 p-4 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
      {/* Luz ambiente neon */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Topo: Título da Seção + Link Ciano "Ver mais >" (Inspirado nas Referências) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-[#00E5FF] flex items-center justify-center">
            <Zap className="w-4 h-4 fill-[#00E5FF]/20" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-1.5">
              <span>Placar de Pontos &amp; XP</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00E5FF]/20 text-[#00E5FF]">
                LIVE HUD
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Pontuação gamer consolidada em tempo real
            </p>
          </div>
        </div>

        <a
          href="/rankings"
          className="text-xs font-bold text-[#00E5FF] hover:text-cyan-300 flex items-center gap-0.5 transition-colors cursor-pointer"
        >
          <span>Ver Ranking</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Display Numérico Digital Neon (2x2 Grid) */}
      {activeSlide === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: XP Gamer Total */}
          <div className="rounded-2xl bg-[#131722] border border-[#00E5FF]/25 p-3.5 sm:p-4 shadow-inner">
            <div className="flex items-center justify-between text-gray-400 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
              <span>XP Total</span>
              <Sparkles className="w-3 h-3 text-[#00E5FF]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#00E5FF] drop-shadow-[0_0_12px_rgba(0,229,255,0.5)]">
              {gamerLevelInfo.xp.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-1">
              <span className="text-emerald-400">+{gamerLevelInfo.percentToNext}%</span>
              <span>para o Nível {Math.min(99, gamerLevelInfo.level + 1)}</span>
            </div>
          </div>

          {/* Card 2: Pontos de Conquistas */}
          <div className="rounded-2xl bg-[#131722] border border-emerald-500/25 p-3.5 sm:p-4 shadow-inner">
            <div className="flex items-center justify-between text-gray-400 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
              <span>Conquistas</span>
              <Trophy className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.5)]">
              {completedScore.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-1">
              <span>{stats?.completedCount || 0} zerados registrados</span>
            </div>
          </div>

          {/* Card 3: Score de Horas */}
          <div className="rounded-2xl bg-[#131722] border border-cyan-500/25 p-3.5 sm:p-4 shadow-inner">
            <div className="flex items-center justify-between text-gray-400 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
              <span>Score Horas</span>
              <Hourglass className="w-3 h-3 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(103,232,249,0.5)]">
              {hoursScore.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-1">
              <span>{stats?.totalPlaytimeHours || 0}h dedicadas</span>
            </div>
          </div>

          {/* Card 4: Score de Prestígio */}
          <div className="rounded-2xl bg-[#131722] border border-amber-500/25 p-3.5 sm:p-4 shadow-inner">
            <div className="flex items-center justify-between text-gray-400 text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
              <span>Prestígio</span>
              <Shield className="w-3 h-3 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]">
              {prestigeScore.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-gray-400 font-mono mt-1">
              <span className="text-amber-400 font-bold">{gamerLevelInfo.rankTitle}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Slide 2: Detalhamento de Como Ganhar Pontos */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-gray-300">Zerar um Jogo</span>
            <span className="font-mono font-bold text-[#00E5FF]">+60 XP</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-gray-300">Platina / 100% Conquistas</span>
            <span className="font-mono font-bold text-amber-300">+120 XP</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-gray-300">Tempo de Jogo Registrado</span>
            <span className="font-mono font-bold text-cyan-300">+8 XP / hora</span>
          </div>
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
            <span className="text-gray-300">Avaliar &amp; Resenhar</span>
            <span className="font-mono font-bold text-emerald-400">+20 XP</span>
          </div>
        </div>
      )}

      {/* Indicadores de Paginação (Estilo das Imagens de Referência) */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <button
          onClick={() => setActiveSlide(0)}
          className={`h-1.5 rounded-full transition-all cursor-pointer ${
            activeSlide === 0
              ? "w-7 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"
              : "w-2 bg-white/20 hover:bg-white/40"
          }`}
          aria-label="Ver placar de pontos"
        />
        <button
          onClick={() => setActiveSlide(1)}
          className={`h-1.5 rounded-full transition-all cursor-pointer ${
            activeSlide === 1
              ? "w-7 bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"
              : "w-2 bg-white/20 hover:bg-white/40"
          }`}
          aria-label="Ver regras de XP"
        />
      </div>
    </div>
  );
}
