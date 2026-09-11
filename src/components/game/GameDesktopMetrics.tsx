import React from "react";
import { Star, Clock } from "lucide-react";

interface GameDesktopMetricsProps {
  rating?: number | null;
  ratingsCount?: number | null;
  metacritic?: number | null;
  hltbMainStory?: number | null;
  hltbCompletionist?: number | null;
}

export default function GameDesktopMetrics({
  rating,
  ratingsCount,
  metacritic,
  hltbMainStory,
  hltbCompletionist,
}: GameDesktopMetricsProps) {
  // Rótulo dinâmico para nota do Metacritic
  const getMetacriticLabel = (score: number) => {
    if (score >= 90) return "Aclamação Universal";
    if (score >= 75) return "Geralmente Favorável";
    if (score >= 50) return "Misto ou Mediano";
    return "Avaliação Baixa";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" data-purpose="metrics-summary">
      {/* Card 1: Avaliação da Comunidade */}
      <div className="p-3.5 rounded-2xl bg-[#141822]/85 backdrop-blur-md border border-white/10 flex items-center gap-3.5 hover:border-amber-500/40 transition-colors shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xl font-black flex-shrink-0">
          ★
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
            Avaliação MGL
          </div>
          <div className="text-xl font-extrabold text-white flex items-baseline gap-1 font-mono">
            {rating ? rating.toFixed(1) : "—"}
            <span className="text-xs text-zinc-400 font-normal font-sans">/10</span>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            {ratingsCount ? `${ratingsCount.toLocaleString("pt-BR")} votos` : "Avaliações da comunidade"}
          </div>
        </div>
      </div>

      {/* Card 2: Metascore Oficial */}
      <div className="p-3.5 rounded-2xl bg-[#141822]/85 backdrop-blur-md border border-white/10 flex items-center gap-3.5 hover:border-emerald-500/40 transition-colors shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-2xl font-black font-mono shadow-[0_0_15px_rgba(16,185,129,0.2)] flex-shrink-0">
          {metacritic ?? "—"}
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
            Metascore Oficial
          </div>
          <div className="text-xs font-bold text-emerald-400 truncate">
            {metacritic ? getMetacriticLabel(metacritic) : "Sem nota de crítica"}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">Críticas da Mídia</div>
        </div>
      </div>

      {/* Card 3: Campanha HLTB */}
      <div className="p-3.5 rounded-2xl bg-[#141822]/85 backdrop-blur-md border border-white/10 flex items-center gap-3.5 hover:border-cyan-500/40 transition-colors shadow-lg">
        <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xl font-mono font-black flex-shrink-0">
          <Clock className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold">
            Campanha (HLTB)
          </div>
          <div className="text-xl font-extrabold text-cyan-300 font-mono flex items-baseline gap-1">
            {hltbMainStory ? `~${hltbMainStory}h` : "—"}
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            {hltbCompletionist ? `Completo: ~${hltbCompletionist}h` : "Média de conclusão"}
          </div>
        </div>
      </div>
    </div>
  );
}
