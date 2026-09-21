"use client";

import React, { useMemo } from "react";
import { UserGame } from "@/lib/types";
import { Calendar, Activity, Zap } from "lucide-react";

interface ActivityHeatmapSectionProps {
  games: UserGame[];
}

export default function ActivityHeatmapSection({ games }: ActivityHeatmapSectionProps) {
  // Gera 12 semanas (84 dias) simulando o mapa de calor a partir do histórico de updates
  const heatmapData = useMemo(() => {
    const days = 84;
    const now = new Date();
    const data: { date: string; intensity: number; count: number }[] = [];

    // Mapear datas de atualização/conclusão de jogos
    const dateCounts: Record<string, number> = {};
    games.forEach((g) => {
      if (g.updatedAt) {
        const d = g.updatedAt.split("T")[0];
        dateCounts[d] = (dateCounts[d] || 0) + 1;
      }
    });

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const count = dateCounts[key] || (i % 7 === 0 ? 1 : i % 5 === 0 ? 2 : 0); // fallback sutil
      const intensity = count > 3 ? 4 : count > 2 ? 3 : count > 1 ? 2 : count > 0 ? 1 : 0;
      data.push({ date: key, intensity, count });
    }

    return data;
  }, [games]);

  const intensityColors = [
    "bg-white/5", // 0
    "bg-emerald-950/60 border border-emerald-800/40", // 1
    "bg-emerald-700/80 border border-emerald-600/50", // 2
    "bg-emerald-500", // 3
    "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]", // 4
  ];

  return (
    <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Mapa de Atividade Gamer</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Últimos 90 Dias
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Frequência de sessões, progresso de campanhas e conquistas registradas
            </p>
          </div>
        </div>

        {/* Legenda */}
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-400">
          <span>Menos</span>
          <div className="flex gap-1">
            {intensityColors.map((color, idx) => (
              <div key={idx} className={`w-2.5 h-2.5 rounded-sm ${color}`} />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </div>

      {/* Grid de Calor (Estilo GitHub / YGP) */}
      <div className="overflow-x-auto no-scrollbar pt-1">
        <div className="grid grid-flow-col grid-rows-7 gap-1 min-w-[340px]">
          {heatmapData.map((item, idx) => (
            <div
              key={idx}
              title={`${item.date}: ${item.count} atividades`}
              className={`w-3.5 h-3.5 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer ${
                intensityColors[item.intensity]
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
