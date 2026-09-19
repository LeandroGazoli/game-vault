"use client";

import React, { useMemo } from "react";
import GameModal from "./GameModal";
import AdBanner from "./ads/AdBanner";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react";
import { useCalendarState } from "@/hooks/useCalendarState";
import CalendarMiniSidebar from "./calendar/CalendarMiniSidebar";
import CalendarGameCard from "./calendar/CalendarGameCard";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

export default function CalendarView() {
  const {
    currentYear,
    currentMonth,
    calendarData,
    loading,
    selectedGame,
    setSelectedGame,
    selectedDayFilter,
    setSelectedDayFilter,
    saveCardClick,
    handlePrevMonth,
    handleNextMonth,
    handleGoToday,
  } = useCalendarState();

  const today = useMemo(() => new Date(), []);

  // Agrupa e ordena as datas do mês
  const sortedDates = useMemo(() => Object.keys(calendarData).sort(), [calendarData]);
  const filteredDates = useMemo(() => {
    if (!selectedDayFilter) return sortedDates;
    return sortedDates.filter((dateStr) => {
      const day = parseInt(dateStr.split("-")[2], 10);
      return day === selectedDayFilter;
    });
  }, [sortedDates, selectedDayFilter]);

  // Formata o cabeçalho do dia (ex: "2 de setembro", "Hoje")
  const formatDayHeader = (dateStr: string) => {
    const parts = dateStr.split("-");
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    const monthName = MONTH_NAMES[month - 1].toLowerCase();

    const isToday =
      day === today.getDate() &&
      month === today.getMonth() + 1 &&
      parseInt(parts[0], 10) === today.getFullYear();

    return {
      title: `${day} de ${monthName}`,
      isToday,
    };
  };

  return (
    <>
      <div className="space-y-8">
        {/* ==========================================
            BARRA DE TOPO DO CALENDÁRIO
        ========================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-[#00E5FF]">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Calendário de Lançamentos
              </h1>
              <p className="text-xs text-gray-400">
                Acompanhe todos os lançamentos do mês em tempo real
              </p>
            </div>
          </div>

          {/* Navegador de Mês & Ações */}
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-2xl bg-[#18191c] border border-white/10 p-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Mês Anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 text-xs font-bold text-white min-w-[5.5rem] text-center">
                {MONTH_NAMES[currentMonth - 1]} {currentYear}
              </span>

              <button
                onClick={handleGoToday}
                className="px-2 py-1 rounded-xl bg-[#00E5FF] text-black font-bold text-[10px] mx-1 hover:bg-cyan-300 transition-colors"
              >
                Hoje
              </button>

              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                title="Próximo Mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {selectedDayFilter && (
              <button
                onClick={() => setSelectedDayFilter(null)}
                className="px-3 py-2 rounded-2xl bg-white/10 text-xs font-medium text-gray-300 hover:text-white transition-colors"
              >
                Ver Mês Inteiro
              </button>
            )}
          </div>
        </div>

        {/* ==========================================
            LAYOUT PRINCIPAL: FEED DE DIAS + MINI CALENDÁRIO
        ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FEED DE LANÇAMENTOS POR DIA (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {loading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="space-y-3">
                    <div className="h-6 w-48 rounded-lg bg-white/5 animate-pulse" />
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="h-44 rounded-2xl bg-white/5 animate-pulse" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredDates.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-[#18191c] p-12 text-center space-y-3">
                <CalendarIcon className="w-10 h-10 text-gray-600 mx-auto" />
                <h3 className="text-base font-bold text-white">Nenhum lançamento registrado</h3>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Não foram encontrados lançamentos para o período selecionado.
                </p>
                <button
                  onClick={() => setSelectedDayFilter(null)}
                  className="px-4 py-2 rounded-full bg-white text-black font-bold text-xs"
                >
                  Ver todos os dias
                </button>
              </div>
            ) : (
              filteredDates.map((dateStr) => {
                const dayInfo = formatDayHeader(dateStr);
                const dayGames = calendarData[dateStr] || [];

                return (
                  <div key={dateStr} className="space-y-3.5">
                    {/* Cabeçalho do Dia */}
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div className="flex items-center gap-2.5">
                        <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                          {dayInfo.title}
                        </h2>
                        {dayInfo.isToday && (
                          <span className="px-2.5 py-0.5 rounded-full bg-[#00E5FF] text-black font-extrabold text-[11px] shadow-sm">
                            Hoje
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                        <span>{dayGames.length} lançamentos</span>
                        <span className="text-orange-400 flex items-center gap-0.5 font-bold">
                          <Flame className="w-3.5 h-3.5 fill-orange-400" />
                        </span>
                      </div>
                    </div>

                    {/* Grid de Cards dos Jogos do Dia */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                      {dayGames.map((game) => (
                        <CalendarGameCard
                          key={game.id}
                          game={game}
                          onOpenModal={setSelectedGame}
                          onCardClick={saveCardClick}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ==========================================
              MINI-CALENDÁRIO LATERAL (4 cols)
          ========================================== */}
          <div className="lg:col-span-4 space-y-4">
            <CalendarMiniSidebar
              currentYear={currentYear}
              currentMonth={currentMonth}
              calendarData={calendarData}
              selectedDayFilter={selectedDayFilter}
              onSelectDayFilter={setSelectedDayFilter}
            />

            {/* Anúncio Sidebar no Calendário */}
            <AdBanner slot="SIDEBAR_STICKY" />
          </div>
        </div>
      </div>

      {/* Modal para configurar o jogo */}
      <GameModal
        game={selectedGame}
        isOpen={Boolean(selectedGame)}
        onClose={() => setSelectedGame(null)}
      />
    </>
  );
}
