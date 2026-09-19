"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Game } from "@/lib/types";

export const CALENDAR_STATE_KEY = "gv_calendar_state";
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutos

interface SavedCalendarState {
  year: number;
  month: number;
  selectedDayFilter: number | null;
  calendarData: Record<string, Game[]>;
  scrollY: number;
  targetGameId: string | number | null;
  timestamp: number;
}

function getStoredCalendarState(): SavedCalendarState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(CALENDAR_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedCalendarState;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CALENDAR_STATE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function useCalendarState() {
  const today = new Date();
  const initialCacheRef = useRef<SavedCalendarState | null>(null);

  // Lê o cache uma única vez na inicialização
  if (initialCacheRef.current === null && typeof window !== "undefined") {
    initialCacheRef.current = getStoredCalendarState();
  }

  const cached = initialCacheRef.current;

  const [currentYear, setCurrentYear] = useState<number>(
    cached?.year ?? today.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState<number>(
    cached?.month ?? today.getMonth() + 1
  );
  const [calendarData, setCalendarData] = useState<Record<string, Game[]>>(
    cached?.calendarData ?? {}
  );
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | null>(
    cached?.selectedDayFilter ?? null
  );
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState<boolean>(
    !cached || Object.keys(cached.calendarData || {}).length === 0
  );

  const isRestoredRef = useRef(false);

  // Busca os dados do mês caso não estejam em cache ou se o mês/ano mudar
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      // Se já temos dados em cache para esse ano/mês e acabamos de restaurar, pula o loading
      if (
        isRestoredRef.current &&
        cached &&
        cached.year === currentYear &&
        cached.month === currentMonth &&
        Object.keys(calendarData).length > 0
      ) {
        isRestoredRef.current = false;
        return;
      }

      setLoading(true);
      try {
        const res = await fetch(`/api/games/calendar?year=${currentYear}&month=${currentMonth}`);
        if (res.ok && !cancelled) {
          const data = (await res.json()) as { calendar?: Record<string, Game[]> };
          const newCalendar = data.calendar || {};
          setCalendarData(newCalendar);

          // Atualiza cache de sessão
          try {
            const currentCache = getStoredCalendarState();
            const stateToSave: SavedCalendarState = {
              year: currentYear,
              month: currentMonth,
              selectedDayFilter,
              calendarData: newCalendar,
              scrollY: currentCache?.scrollY ?? window.scrollY,
              targetGameId: null,
              timestamp: Date.now(),
            };
            sessionStorage.setItem(CALENDAR_STATE_KEY, JSON.stringify(stateToSave));
          } catch {}
        }
      } catch (err) {
        console.error("Erro ao carregar calendário:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [currentYear, currentMonth]);

  // Restauração de scroll do calendário ao voltar de um jogo
  useEffect(() => {
    if (!cached) return;

    isRestoredRef.current = true;

    const restoreScroll = (): boolean => {
      if (cached.targetGameId) {
        const cardEl = document.getElementById(`game-card-${cached.targetGameId}`);
        if (cardEl) {
          cardEl.scrollIntoView({ block: "center", behavior: "instant" });
          return true;
        }
      }

      if (cached.scrollY > 0) {
        window.scrollTo({ top: cached.scrollY, behavior: "instant" });
        return true;
      }

      return false;
    };

    const rafId = requestAnimationFrame(() => {
      restoreScroll();
      setTimeout(restoreScroll, 60);
      setTimeout(restoreScroll, 180);
      setTimeout(restoreScroll, 350);
    });

    // Limpa targetGameId no cache para não interferir em futuros recarregamentos manuais
    try {
      sessionStorage.setItem(
        CALENDAR_STATE_KEY,
        JSON.stringify({ ...cached, targetGameId: null })
      );
    } catch {}

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Listener de scroll para manter scrollY salvo no cache da sessão
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        try {
          const raw = sessionStorage.getItem(CALENDAR_STATE_KEY);
          if (raw) {
            const current = JSON.parse(raw) as SavedCalendarState;
            sessionStorage.setItem(
              CALENDAR_STATE_KEY,
              JSON.stringify({ ...current, scrollY: window.scrollY })
            );
          }
        } catch {}
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Salva o ID do jogo e posição atual de scroll ao clicar num card antes de navegar
  const saveCardClick = useCallback((gameId: number | string) => {
    try {
      const raw = sessionStorage.getItem(CALENDAR_STATE_KEY);
      const current = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem(
        CALENDAR_STATE_KEY,
        JSON.stringify({
          ...current,
          scrollY: window.scrollY,
          targetGameId: gameId,
          timestamp: Date.now(),
        })
      );
    } catch {}
  }, []);

  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDayFilter(null);
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDayFilter(null);
  }, [currentMonth]);

  const handleGoToday = useCallback(() => {
    setCurrentYear(today.getFullYear());
    setCurrentMonth(today.getMonth() + 1);
    setSelectedDayFilter(today.getDate());
  }, [today]);

  return {
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
  };
}
