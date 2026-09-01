"use client";

import React from "react";
import { HLTBData } from "@/lib/types";
import { Clock, Sword, Compass, Crown } from "lucide-react";

interface HltbCardProps {
  hltb: HLTBData | null | undefined;
  compact?: boolean;
}

export default function HltbCard({ hltb, compact = false }: HltbCardProps) {
  if (!hltb || (!hltb.mainStory && !hltb.mainExtra && !hltb.completionist)) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900/40 p-3 text-center text-xs text-gray-400">
        <Clock className="w-4 h-4 mx-auto mb-1 opacity-50" />
        Tempo de jogo ainda não estimado
      </div>
    );
  }

  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-blue-950/40 border border-blue-800/30 p-2">
          <div className="text-[10px] uppercase font-semibold text-blue-300 flex items-center justify-center gap-1">
            <Sword className="w-3 h-3" /> Principal
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {hltb.mainStory ? `${hltb.mainStory}h` : "--"}
          </div>
        </div>
        <div className="rounded-lg bg-purple-950/40 border border-purple-800/30 p-2">
          <div className="text-[10px] uppercase font-semibold text-purple-300 flex items-center justify-center gap-1">
            <Compass className="w-3 h-3" /> + Extras
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {hltb.mainExtra ? `${hltb.mainExtra}h` : "--"}
          </div>
        </div>
        <div className="rounded-lg bg-amber-950/40 border border-amber-800/30 p-2">
          <div className="text-[10px] uppercase font-semibold text-amber-300 flex items-center justify-center gap-1">
            <Crown className="w-3 h-3" /> 100%
          </div>
          <div className="text-sm font-bold text-white mt-0.5">
            {hltb.completionist ? `${hltb.completionist}h` : "--"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-800/80 bg-surface-100/70 p-4 backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 border-b border-gray-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-semibold text-gray-200">
            Tempo Médio para Zerar (HowLongToBeat)
          </h4>
        </div>
        <span className="text-[11px] text-gray-400 font-mono">Estimativa da Comunidade</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* História Principal */}
        <div className="group rounded-xl border border-blue-500/20 bg-gradient-to-b from-blue-950/30 to-blue-900/10 p-3.5 transition-all hover:border-blue-500/40">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Sword className="w-3.5 h-3.5" /> História Principal
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {hltb.mainStory ? (
              <>
                {hltb.mainStory} <span className="text-sm font-normal text-gray-400">horas</span>
              </>
            ) : (
              <span className="text-gray-500 text-lg">--</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Foco exclusivo na campanha principal</p>
        </div>

        {/* Principal + Extras */}
        <div className="group rounded-xl border border-purple-500/20 bg-gradient-to-b from-purple-950/30 to-purple-900/10 p-3.5 transition-all hover:border-purple-500/40">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" /> Principal + Extras
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {hltb.mainExtra ? (
              <>
                {hltb.mainExtra} <span className="text-sm font-normal text-gray-400">horas</span>
              </>
            ) : (
              <span className="text-gray-500 text-lg">--</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">História + missões e conteúdo secundário</p>
        </div>

        {/* 100% Complecionista */}
        <div className="group rounded-xl border border-amber-500/20 bg-gradient-to-b from-amber-950/30 to-amber-900/10 p-3.5 transition-all hover:border-amber-500/40">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" /> 100% Complecionista
            </span>
          </div>
          <div className="text-2xl font-black text-white mt-1">
            {hltb.completionist ? (
              <>
                {hltb.completionist} <span className="text-sm font-normal text-gray-400">horas</span>
              </>
            ) : (
              <span className="text-gray-500 text-lg">--</span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Todas as conquistas, colecionáveis e segredos</p>
        </div>
      </div>
    </div>
  );
}
