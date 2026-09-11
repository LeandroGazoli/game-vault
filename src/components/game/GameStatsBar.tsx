import React from "react";
import { Star, Award, Clock } from "lucide-react";

interface GameStatsBarProps {
  rating?: number | null;
  metacritic?: number | null;
  hltbMainStory?: number | null;
}

export default function GameStatsBar({
  rating,
  metacritic,
  hltbMainStory,
}: GameStatsBarProps) {
  return (
    <div className="grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-[#0f1218]/90 border border-white/10 p-3 text-center shadow-inner">
      {/* 1. Avaliação de Usuários */}
      <div className="flex flex-col items-center justify-center px-1">
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
          Avaliação
        </span>
        <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-white font-mono">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{rating ? rating.toFixed(1) : "—"}</span>
          <span className="text-[10px] text-gray-500 font-normal">/5</span>
        </div>
      </div>

      {/* 2. Metacritic */}
      <div className="flex flex-col items-center justify-center px-1">
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
          Metacritic
        </span>
        <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-emerald-400 font-mono">
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>{metacritic ?? "—"}</span>
        </div>
      </div>

      {/* 3. Campanha HLTB */}
      <div className="flex flex-col items-center justify-center px-1">
        <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5">
          Campanha
        </span>
        <div className="flex items-center gap-1 text-xs sm:text-sm font-black text-cyan-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>{hltbMainStory ? `${hltbMainStory}h` : "—"}</span>
        </div>
      </div>
    </div>
  );
}
