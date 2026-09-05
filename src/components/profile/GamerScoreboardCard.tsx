"use client";

import React, { useState } from "react";
import { LibraryStats, calculateGamerLevel, UserPlan } from "@/lib/types";
import { Sparkles, Trophy, ChevronRight, Zap, Target, Hourglass, Shield } from "lucide-react";

interface GamerScoreboardCardProps {
  stats?: LibraryStats | null;
  plan?: UserPlan;
  onOpenRankings?: () => void;
  onOpenXpBreakdown?: () => void;
}

export default function GamerScoreboardCard({
  stats,
  plan,
  onOpenRankings,
  onOpenXpBreakdown,
}: GamerScoreboardCardProps) {
  const [activeSlide, setActiveSlide] = useState<0 | 1>(0);
  const gamerLevelInfo = calculateGamerLevel(stats, undefined, plan);

  const completedScore = (stats?.completedCount || 0) * 120 + (stats?.totalGames || 0) * 10;
  const hoursScore = gamerLevelInfo.breakdown.hoursXp;
  const prestigeScore = gamerLevelInfo.level * 150 + Math.floor(gamerLevelInfo.xp / 10);

  return (
    <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#111923] border border-[#2a475e] p-4 sm:p-6 shadow-2xl space-y-4 relative overflow-hidden">
      {/* Luz ambiente suave Steam */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#1b88d4]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Topo: Título da Seção + Link Steam Blue "Ver mais >" */}
      <div className="flex items-center justify-between border-b border-[#2a475e] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#101822] border border-[#2a475e] text-[#66c0f4] flex items-center justify-center shadow-inner">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white tracking-wide uppercase flex items-center gap-1.5 font-sans">
              <span>Placar de Pontos &amp; XP</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#2a475e] text-[#66c0f4] border border-[#66c0f4]/30">
                HUD GAMER
              </span>
            </h3>
            <p className="text-[11px] text-[#8a9eaf]">
              Pontuação gamer consolidada em tempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onOpenXpBreakdown && (
            <button
              onClick={onOpenXpBreakdown}
              className="text-xs font-mono font-bold text-[#8a9eaf] hover:text-white transition-colors cursor-pointer hidden sm:inline"
            >
              Extrato de XP ↗
            </button>
          )}
          <a
            href="/rankings/comunidade"
            className="text-xs font-bold text-[#66c0f4] hover:text-white flex items-center gap-0.5 transition-colors cursor-pointer"
          >
            <span>Ver Ranking</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Display Numérico Digital Estilo Steam (2x2 Grid) */}
      {activeSlide === 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Card 1: XP Gamer Total */}
          <div
            onClick={onOpenXpBreakdown}
            className={`rounded-xl bg-[#101822] border border-[#2a475e] p-3.5 sm:p-4 shadow-inner transition-all ${
              onOpenXpBreakdown
                ? "cursor-pointer hover:border-[#66c0f4]/70 hover:bg-[#131d2a] active:scale-[0.98] group/card"
                : ""
            }`}
            title={onOpenXpBreakdown ? "Clique para abrir o extrato detalhado de XP" : undefined}
          >
            <div className="flex items-center justify-between text-[#8a9eaf] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
              <span className="flex items-center gap-1.5">
                <span>XP Total</span>
                {gamerLevelInfo.boostMultiplier > 1 && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#66c0f4]/20 text-[#66c0f4] font-bold border border-[#66c0f4]/30">
                    {gamerLevelInfo.boostLabel}
                  </span>
                )}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-[#66c0f4]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-[#66c0f4]">
              {gamerLevelInfo.xp.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-[#8a9eaf] font-mono mt-1 flex items-center gap-1">
              <span className="text-emerald-400">+{gamerLevelInfo.percentToNext}%</span>
              <span>para o Nível {Math.min(99, gamerLevelInfo.level + 1)}</span>
            </div>
          </div>

          {/* Card 2: Pontos de Conquistas */}
          <div className="rounded-xl bg-[#101822] border border-[#2a475e] p-3.5 sm:p-4 shadow-inner">
            <div className="flex items-center justify-between text-[#8a9eaf] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
              <span>Conquistas</span>
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400">
              {completedScore.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-[#8a9eaf] font-mono mt-1">
              <span>{stats?.completedCount || 0} zerados registrados</span>
            </div>
          </div>

          {/* Card 3: Score de Horas */}
          <div className="rounded-xl bg-[#101822] border border-[#2a475e] p-3.5 sm:p-4 shadow-inner">
            <div className="flex items-center justify-between text-[#8a9eaf] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
              <span>Score Horas</span>
              <Hourglass className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-cyan-300">
              {hoursScore.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-[#8a9eaf] font-mono mt-1">
              <span>{stats?.totalPlaytimeHours || 0}h dedicadas</span>
            </div>
          </div>

          {/* Card 4: Score de Prestígio */}
          <div className="rounded-xl bg-[#101822] border border-[#2a475e] p-3.5 sm:p-4 shadow-inner">
            <div className="flex items-center justify-between text-[#8a9eaf] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider mb-1">
              <span>Prestígio</span>
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-300">
              {prestigeScore.toLocaleString("pt-BR")}
            </div>
            <div className="text-[10px] text-[#8a9eaf] font-mono mt-1">
              <span className="text-amber-400 font-bold">{gamerLevelInfo.rankTitle}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Slide 2: Detalhamento de Como Ganhar Pontos */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-[#101822] border border-[#2a475e] flex items-center justify-between">
            <span className="text-gray-300">Zerar um Jogo</span>
            <span className="font-mono font-bold text-[#66c0f4]">+60 XP</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101822] border border-[#2a475e] flex items-center justify-between">
            <span className="text-gray-300">Platina / 100% Conquistas</span>
            <span className="font-mono font-bold text-amber-300">+120 XP</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101822] border border-[#2a475e] flex items-center justify-between">
            <span className="text-gray-300">Tempo de Jogo Registrado</span>
            <span className="font-mono font-bold text-cyan-300">+0.2 XP / hora</span>
          </div>
          <div className="p-3 rounded-xl bg-[#101822] border border-[#2a475e] flex items-center justify-between">
            <span className="text-gray-300">Avaliar &amp; Resenhar</span>
            <span className="font-mono font-bold text-emerald-400">+20 XP</span>
          </div>
        </div>
      )}

      {/* Indicadores de Paginação Estilo Steam */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <button
          onClick={() => setActiveSlide(0)}
          className={`h-1.5 rounded-full transition-all cursor-pointer ${
            activeSlide === 0
              ? "w-7 bg-[#66c0f4] shadow-[0_0_8px_rgba(102,192,244,0.6)]"
              : "w-2 bg-[#2a475e] hover:bg-[#66c0f4]/40"
          }`}
          aria-label="Ver placar de pontos"
        />
        <button
          onClick={() => setActiveSlide(1)}
          className={`h-1.5 rounded-full transition-all cursor-pointer ${
            activeSlide === 1
              ? "w-7 bg-[#66c0f4] shadow-[0_0_8px_rgba(102,192,244,0.6)]"
              : "w-2 bg-[#2a475e] hover:bg-[#66c0f4]/40"
          }`}
          aria-label="Ver regras de XP"
        />
      </div>
    </div>
  );
}
