"use client";

import React, { useState, useEffect } from "react";
import { Game } from "@/lib/types";
import GameModal from "./GameModal";
import AdBanner from "./ads/AdBanner";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Flame,
  Plus,
  Check,
  Clock,
  Sparkles,
  Filter,
} from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEK_DAYS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

export default function CalendarView() {
  const { getGameInLibrary } = useGameLibrary();
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1); // 1-12
  const [calendarData, setCalendarData] = useState<Record<string, Game[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/games/calendar?year=${currentYear}&month=${currentMonth}`);
        if (res.ok) {
          const data = await res.json();
          setCalendarData(data.calendar || {});
        }
      } catch (err) {
        console.error("Erro ao carregar calendário:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [currentYear, currentMonth]);

  // Navegação de mês
  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDayFilter(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDayFilter(null);
  };

  const handleGoToday = () => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDayFilter(today.getDate());
  };

  // Cálculo dos dias do mês para o mini-calendário lateral
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7; // Começa na segunda-feira

  // Agrupa e ordena as datas do mês
  const sortedDates = Object.keys(calendarData).sort();
  const filteredDates = selectedDayFilter
    ? sortedDates.filter((dateStr) => {
        const day = parseInt(dateStr.split("-")[2], 10);
        return day === selectedDayFilter;
      })
    : sortedDates;

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
                      {dayGames.map((game) => {
                        const userGame = getGameInLibrary(game.id);

                        return (
                          <div
                            key={game.id}
                            className="group relative rounded-2xl bg-[#18191c] border border-white/5 hover:border-white/20 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
                          >
                            {/* Capa com Proporção de Poster - Clicar abre a página do jogo */}
                            <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden">
                              <Link
                                href={`/game/${game.id}`}
                                className="block w-full h-full cursor-pointer"
                                title={`Ver detalhes de ${game.name}`}
                              >
                                {game.background_image ? (
                                  <img
                                    src={game.background_image}
                                    alt={game.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                                    Sem Capa
                                  </div>
                                )}
                              </Link>

                              {/* Efeito de Fogo / Hype no Canto Inferior Direito */}
                              <div className="absolute bottom-2 right-2 p-1 rounded-full bg-black/60 backdrop-blur-md text-orange-400 pointer-events-none">
                                <Flame className="w-3 h-3 fill-orange-400" />
                              </div>

                              {/* Botão + no Hover */}
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedGame(game);
                                }}
                                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-white text-white hover:text-black backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-lg z-20"
                                title="Adicionar à biblioteca"
                              >
                                {userGame ? (
                                  <Check className="w-3.5 h-3.5 text-[#00E5FF]" />
                                ) : (
                                  <Plus className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {/* Título & Plataforma */}
                            <div className="p-2.5 flex-1 flex flex-col justify-between">
                              <Link href={`/game/${game.id}`}>
                                <h3 className="text-xs font-semibold text-white hover:text-[#00E5FF] line-clamp-1 transition-colors">
                                  {game.name}
                                </h3>
                              </Link>
                              <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                                <span className="truncate max-w-[90px]">
                                  {game.genres && game.genres[0] ? game.genres[0].name : "Game"}
                                </span>
                                {game.metacritic && (
                                  <span className="text-emerald-400 font-bold font-mono">
                                    {game.metacritic}%
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ==========================================
              MINI-CALENDÁRIO LATERAL (4 cols)
          ========================================== */}
          <div className="lg:col-span-4 rounded-3xl bg-[#18191c] border border-white/10 p-5 sm:p-6 space-y-4 sticky top-24">
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
                    onClick={() =>
                      setSelectedDayFilter(isSelected ? null : day)
                    }
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
                    {/* Ponto indicador de lançamentos */}
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

          {/* Anúncio Sidebar no Calendário */}
          <AdBanner slot="SIDEBAR_STICKY" />
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
