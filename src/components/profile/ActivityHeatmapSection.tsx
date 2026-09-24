"use client";

import React, { useMemo } from "react";
import { UserGame } from "@/lib/types";
import { Calendar, Activity, Zap } from "lucide-react";

interface ActivityHeatmapSectionProps {
  games: UserGame[];
}

export default function ActivityHeatmapSection({ games }: ActivityHeatmapSectionProps) {
  // 52 semanas (364 dias) ou 20 semanas para layout mobile-first compacto e autêntico ao GitHub
  const { weeks, totalActivities } = useMemo(() => {
    const totalWeeks = 24; // 24 semanas = ~6 meses de histórico
    const now = new Date();
    const dateCounts: Record<string, number> = {};

    games.forEach((g) => {
      if (g.updatedAt) {
        const d = g.updatedAt.split("T")[0];
        dateCounts[d] = (dateCounts[d] || 0) + 1;
      }
      if (g.addedAt) {
        const d = g.addedAt.split("T")[0];
        dateCounts[d] = (dateCounts[d] || 0) + 1;
      }
    });

    let actSum = 0;
    const generatedWeeks: Array<Array<{ date: string; intensity: number; count: number; dayOfWeek: number }>> = [];

    // Alinhando ao domingo mais recente
    const currentDayOfWeek = now.getDay();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - currentDayOfWeek - (totalWeeks - 1) * 7);

    for (let w = 0; w < totalWeeks; w++) {
      const daysInWeek = [];
      for (let d = 0; d < 7; d++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + w * 7 + d);
        const key = currentDate.toISOString().split("T")[0];

        const count = dateCounts[key] || 0;
        actSum += count;

        let intensity = 0;
        if (count >= 4) intensity = 4;
        else if (count === 3) intensity = 3;
        else if (count === 2) intensity = 2;
        else if (count === 1) intensity = 1;

        daysInWeek.push({
          date: key,
          intensity,
          count,
          dayOfWeek: d,
        });
      }
      generatedWeeks.push(daysInWeek);
    }

    return { weeks: generatedWeeks, totalActivities: actSum };
  }, [games]);

  // Paleta GitHub Dark Mode autêntica
  const intensityColors = [
    "bg-[#161b22] border border-white/5", // 0
    "bg-[#0e4429] border border-[#006d32]/30", // 1
    "bg-[#006d32] border border-[#26a641]/30", // 2
    "bg-[#26a641] border border-[#39d353]/30", // 3
    "bg-[#39d353] shadow-[0_0_6px_rgba(57,211,83,0.4)]", // 4
  ];

  const dayLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  return (
    <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Mapa de Atividade Gamer</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {totalActivities} Atividades
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Visualização estilo GitHub dos registros, updates e campanhas concluídas
            </p>
          </div>
        </div>

        {/* Legenda Estilo GitHub */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 self-end sm:self-center font-mono">
          <span>Menos</span>
          <div className="flex gap-1">
            {intensityColors.map((color, idx) => (
              <div key={idx} className={`w-2.5 h-2.5 rounded-[2px] ${color}`} />
            ))}
          </div>
          <span>Mais</span>
        </div>
      </div>

      {/* Grid de Calor Autêntica do GitHub */}
      <div className="overflow-x-auto no-scrollbar pt-2 pb-1">
        <div className="flex gap-1 min-w-max items-start">
          {/* Coluna de Dias da Semana (Seg, Qua, Sex) */}
          <div className="flex flex-col gap-1 pr-1.5 text-[9px] font-mono text-gray-500 select-none">
            <span className="h-3 leading-3 opacity-0">D</span>
            <span className="h-3 leading-3">Seg</span>
            <span className="h-3 leading-3 opacity-0">T</span>
            <span className="h-3 leading-3">Qua</span>
            <span className="h-3 leading-3 opacity-0">Q</span>
            <span className="h-3 leading-3">Sex</span>
            <span className="h-3 leading-3 opacity-0">S</span>
          </div>

          {/* Semanas em Colunas com 7 Linhas cada */}
          <div className="flex gap-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((item) => (
                  <div
                    key={item.date}
                    title={`${item.count} atividades em ${item.date}`}
                    className={`w-3 h-3 rounded-[2px] transition-all duration-150 hover:scale-125 cursor-pointer ${
                      intensityColors[item.intensity]
                    }`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
