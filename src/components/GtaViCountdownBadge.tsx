"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Calendar, Plus, Check } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";

// Data estimada de lançamento do GTA VI (Outono de 2026 / Q3-Q4)
const GTA_RELEASE_TARGET = new Date("2026-10-27T00:00:00Z").getTime();
// Slug oficial de busca do GTA VI
const GTA_VI_SEARCH_URL = "/search?q=Grand+Theft+Auto+VI";

export default function GtaViCountdownBadge() {
  const { library } = useGameLibrary();
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; mins: number } | null>(null);

  // Verifica se o usuário já adicionou o GTA VI à biblioteca
  const isGtaInLibrary = library.some(
    (g) =>
      g.gameTitle?.toLowerCase().includes("grand theft auto vi") ||
      g.gameSlug?.includes("grand-theft-auto-vi") ||
      g.gameTitle?.toLowerCase().includes("gta vi")
  );

  useEffect(() => {
    function calculateTime() {
      const now = Date.now();
      const diff = GTA_RELEASE_TARGET - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0 });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);

      setTimeLeft({ days, hours, mins });
    }

    calculateTime();
    const timer = setInterval(calculateTime, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-full gta-sunset-badge backdrop-blur-md text-xs transition-all shadow-md">
      <div className="flex items-center gap-1.5">
        <span className="text-sm select-none">🌴</span>
        <span className="font-extrabold uppercase tracking-widest text-[11px] gta-sunset-gradient-text">
          GTA VI • VICE CITY
        </span>
      </div>

      {timeLeft && (
        <div className="flex items-center gap-1 font-mono text-[11px] text-neutral-300 font-semibold tabular-nums">
          <span className="text-white">{timeLeft.days}d</span>
          <span className="text-neutral-500">:</span>
          <span className="text-white">{String(timeLeft.hours).padStart(2, "0")}h</span>
          <span className="text-neutral-500">:</span>
          <span className="text-white">{String(timeLeft.mins).padStart(2, "0")}m</span>
        </div>
      )}

      <div className="hidden sm:inline-block w-1 h-1 rounded-full bg-white/20" />

      <Link
        href={GTA_VI_SEARCH_URL}
        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-[11px] transition-colors"
      >
        {isGtaInLibrary ? (
          <>
            <Check className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-300 font-semibold">No seu Backlog</span>
          </>
        ) : (
          <>
            <Plus className="w-3 h-3 text-[#ff7a00]" />
            <span>Adicionar ao Backlog</span>
          </>
        )}
      </Link>
    </div>
  );
}
