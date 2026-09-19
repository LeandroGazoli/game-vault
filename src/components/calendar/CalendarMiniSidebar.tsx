"use client";

import React, { useMemo } from "react";
import { Game } from "@/lib/types";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEK_DAYS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

interface CalendarMiniSidebarProps {
  currentYear: number;
  currentMonth: number;
  calendarData: Record<string, Game[]>;
  selectedDayFilter: number | null;
  onSelectDayFilter: (day: number | null) => void;
}

export default function CalendarMiniSidebar({
  currentYear,
  currentMonth,
  calendarData,
  selectedDayFilter,
  onSelectDayFilter,
}: CalendarMiniSidebarProps) {
  const today = useMemo(() => new Date(), []);

  const { daysInMonth, firstDayIndex } = useMemo(() => {
    const days = new Date(currentYear, currentMonth, 0).getDate();
    const firstDay = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7;
    return { daysInMonth: days, firstDayIndex: firstDay };
  }, [currentYear, currentMonth]);

  return (
    <div className="rounded-3xl bg-[#18191c] border border-white/10 p-5 sm:p-6 space-y-4 sticky top-24">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {MONTH_NAMES[currentMonth - 1]} {currentYear}
        </span>
        <span className="text-[10px] text-gray-500 font-mono">
          {Object.keys(calendarData).length} dias com lançamentos
        </span>
      </div>

      {/* Cabeçalho dos Dias da Semana */}
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-gray-500">
        {WEEK_DAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      {/* Grid dos Dias do Mês */}
      <div className="grid grid-cols-7 gap-1">
        {/* Espaços vazios antes do primeiro dia */}
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <div key={`empty-${i}`} className="p-2" />
        ))}

        {/* Dias do Mês */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const monthPad = String(currentMonth).padStart(2, "0");
          const dayPad = String(day).padStart(2, "0");
          const dateKey = `${currentYear}-${monthPad}-${dayPad}`;
          const hasReleases = Boolean(calendarData[dateKey]);
          const isSelected = selectedDayFilter === day;
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() + 1 &&
            currentYear === today.getFullYear();

          return (
            <button
              key={day}
              onClick={() => onSelectDayFilter(isSelected ? null : day)}
              className={`relative p-2 rounded-xl text-xs font-mono font-medium transition-all flex flex-col items-center justify-center ${
                isSelected
                  ? "bg-white text-black font-bold shadow-lg"
                  : isToday
                  ? "bg-[#00E5FF]/20 text-[#00E5FF] font-bold border border-[#00E5FF]/40"
                  : hasReleases
                  ? "text-white hover:bg-white/10"
                  : "text-gray-600 hover:text-gray-400 hover:bg-white/5"
              }`}
            >
              <span>{day}</span>
              {hasReleases && (
                <span
                  className={`w-1 h-1 rounded-full mt-0.5 ${
                    isSelected ? "bg-black" : "bg-orange-400"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
