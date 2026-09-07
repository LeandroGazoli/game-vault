"use client";

import React, { useState, useEffect } from "react";
import { Clock, Calendar, Sparkles } from "lucide-react";
import { Game } from "@/lib/types";

interface GameReleaseCountdownProps {
  game: Game;
  variant?: "floating" | "inline";
  className?: string;
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

export default function GameReleaseCountdown({
  game,
  variant = "floating",
  className = "",
}: GameReleaseCountdownProps) {
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

  // Formata data abreviada para o tooltip/title
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(targetDate);

  if (variant === "floating") {
    return (
      <div
        className={`w-full bg-gradient-to-t from-black/95 via-black/90 to-black/40 backdrop-blur-md px-2 py-1.5 border-t border-white/10 ${className}`}
        title={`Lançamento em ${formattedDate}`}
      >
        <div className="flex items-center justify-between gap-1 mb-0.5 px-0.5">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a85] animate-pulse shadow-[0_0_6px_#ff2a85]" />
            <span className="text-[8px] sm:text-[9px] font-black tracking-wider uppercase gta-sunset-gradient-text">
              Lançamento
            </span>
          </div>
          <span className="text-[8px] sm:text-[9px] font-medium text-neutral-400 font-mono">
            {formattedDate}
          </span>
        </div>

        {/* HUD Compacto de Contagem */}
        <div className="flex items-center justify-around font-mono text-center pt-0.5">
          {/* Dias */}
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-[13px] font-black text-white leading-none tabular-nums">
              {time.days}
            </span>
            <span className="text-[7px] sm:text-[8px] uppercase font-bold text-neutral-400">
              dias
            </span>
          </div>
          <span className="text-[10px] font-bold text-neutral-600 select-none">:</span>

          {/* Horas */}
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-[13px] font-black text-white leading-none tabular-nums">
              {String(time.hours).padStart(2, "0")}
            </span>
            <span className="text-[7px] sm:text-[8px] uppercase font-bold text-neutral-400">
              h
            </span>
          </div>
          <span className="text-[10px] font-bold text-neutral-600 select-none">:</span>

          {/* Minutos */}
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-[13px] font-black text-white leading-none tabular-nums">
              {String(time.minutes).padStart(2, "0")}
            </span>
            <span className="text-[7px] sm:text-[8px] uppercase font-bold text-neutral-400">
              m
            </span>
          </div>
          <span className="text-[10px] font-bold text-neutral-600 select-none">:</span>

          {/* Segundos */}
          <div className="flex flex-col">
            <span className="text-[11px] sm:text-[13px] font-black text-[#ff7a00] leading-none tabular-nums animate-pulse">
              {String(time.seconds).padStart(2, "0")}
            </span>
            <span className="text-[7px] sm:text-[8px] uppercase font-bold text-neutral-400">
              s
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Variant inline caso necessário
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-white/15 backdrop-blur-md text-[11px] font-mono text-white ${className}`}
      title={`Lançamento em ${formattedDate}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a85] animate-pulse" />
      <span className="font-bold text-white tabular-nums">
        {time.days}d {String(time.hours).padStart(2, "0")}h {String(time.minutes).padStart(2, "0")}m {String(time.seconds).padStart(2, "0")}s
      </span>
    </div>
  );
}
