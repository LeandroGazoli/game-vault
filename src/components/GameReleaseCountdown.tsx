"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Sparkles, Plus, Check, Bell } from "lucide-react";
import { Game } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface GameReleaseCountdownProps {
  game: Game;
  onOpenModal?: () => void;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalMs: number;
}

export function parseReleaseDate(releasedStr: string | null | undefined): Date | null {
  if (!releasedStr) return null;

  // Formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(releasedStr)) {
    const d = new Date(`${releasedStr}T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
  }

  // Formato YYYY-MM
  if (/^\d{4}-\d{2}$/.test(releasedStr)) {
    const d = new Date(`${releasedStr}-01T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
  }

  // Formato apenas YYYY (Ano)
  if (/^\d{4}$/.test(releasedStr)) {
    const year = parseInt(releasedStr, 10);
    // Estipula último dia do ano ou Q4
    const d = new Date(`${year}-12-31T00:00:00Z`);
    return isNaN(d.getTime()) ? null : d;
  }

  const generic = new Date(releasedStr);
  return isNaN(generic.getTime()) ? null : generic;
}

export function isGameUnreleased(game: Game): boolean {
  // Caso especial GTA VI (Lançamento anunciado para o final de 2026)
  if (
    game.name?.toLowerCase().includes("grand theft auto vi") ||
    game.slug?.includes("grand-theft-auto-vi") ||
    game.name?.toLowerCase().includes("gta vi")
  ) {
    return true;
  }

  if (!game.released) return false;
  const target = parseReleaseDate(game.released);
  if (!target) return false;
  return target.getTime() > Date.now();
}

export default function GameReleaseCountdown({ game, onOpenModal }: GameReleaseCountdownProps) {
  const { getGameInLibrary } = useGameLibrary();
  const userGame = getGameInLibrary(game.id);

  // Determina a data alvo
  const targetDate = React.useMemo(() => {
    // Caso especial GTA VI: Outubro de 2026
    if (
      game.name?.toLowerCase().includes("grand theft auto vi") ||
      game.slug?.includes("grand-theft-auto-vi") ||
      game.name?.toLowerCase().includes("gta vi")
    ) {
      return new Date("2026-10-27T00:00:00Z");
    }

    return parseReleaseDate(game.released);
  }, [game]);

  const [time, setTime] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    if (!targetDate) return;

    function updateTimer() {
      const now = Date.now();
      const diff = targetDate!.getTime() - now;

      if (diff <= 0) {
        setTime({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTime({ days, hours, minutes, seconds, totalMs: diff });
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!targetDate || !time || time.totalMs <= 0) {
    return null;
  }

  // Formata data por extenso em português
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(targetDate);

  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#1c1b26]/95 via-[#181622]/95 to-[#121118]/95 border border-white/10 shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
      {/* Luz ambiente de destaque no topo */}
      <div className="absolute top-0 left-1/4 w-80 h-32 bg-gradient-to-r from-[#ff007f]/15 to-[#ff7a00]/15 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        {/* Lado Esquerdo: Tag de Status e Data */}
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff2a85]/15 border border-[#ff2a85]/35 text-[#ff7a00] text-xs font-bold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ff2a85] animate-pulse shadow-[0_0_8px_#ff2a85]" />
            <span className="tracking-wide uppercase text-[11px] font-mono gta-sunset-gradient-text font-black">
              Contagem Regressiva de Lançamento
            </span>
          </div>

          <div className="flex items-center gap-2 text-white">
            <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="text-sm sm:text-base font-bold text-neutral-200">
              Lançamento previsto para <strong className="text-white">{formattedDate}</strong>
            </span>
          </div>
        </div>

        {/* Lado Central/Direito: Bloquinhos do Cronômetro HUD */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-center sm:justify-start">
          {/* Dias */}
          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 min-w-[62px] sm:min-w-[76px] rounded-2xl bg-black/60 border border-white/10 shadow-inner">
            <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-white tabular-nums">
              {time.days}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold text-neutral-400 tracking-wider font-mono">
              Dias
            </span>
          </div>

          <span className="text-xl font-bold text-neutral-500 font-mono -mt-3 select-none">:</span>

          {/* Horas */}
          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 min-w-[62px] sm:min-w-[76px] rounded-2xl bg-black/60 border border-white/10 shadow-inner">
            <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-white tabular-nums">
              {String(time.hours).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold text-neutral-400 tracking-wider font-mono">
              Horas
            </span>
          </div>

          <span className="text-xl font-bold text-neutral-500 font-mono -mt-3 select-none">:</span>

          {/* Minutos */}
          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 min-w-[62px] sm:min-w-[76px] rounded-2xl bg-black/60 border border-white/10 shadow-inner">
            <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-white tabular-nums">
              {String(time.minutes).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold text-neutral-400 tracking-wider font-mono">
              Min
            </span>
          </div>

          <span className="text-xl font-bold text-neutral-500 font-mono -mt-3 select-none">:</span>

          {/* Segundos */}
          <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 min-w-[62px] sm:min-w-[76px] rounded-2xl bg-gradient-to-b from-[#ff2a85]/20 to-black/80 border border-[#ff2a85]/40 shadow-inner">
            <span className="text-xl sm:text-2xl md:text-3xl font-black font-mono text-[#ff7a00] tabular-nums animate-pulse">
              {String(time.seconds).padStart(2, "0")}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase font-bold text-neutral-300 tracking-wider font-mono">
              Seg
            </span>
          </div>
        </div>

        {/* Botão de Notificação / Backlog de 1 Clique */}
        {onOpenModal && (
          <div className="w-full md:w-auto">
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                onOpenModal();
              }}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all border border-white/15 active:scale-95 cursor-pointer shadow-md"
            >
              {userGame ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Já no seu Backlog</span>
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 text-[#ff7a00]" />
                  <span>Avisar / Salvar na Lista</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
