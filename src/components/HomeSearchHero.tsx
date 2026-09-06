"use client";

import React from "react";
import Link from "next/link";
import { Search, Dices, Languages, Trophy, Clock, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { openSpotlightSearch } from "@/components/SpotlightSearchModal";

interface HomeSearchHeroProps {
  onOpenRoulette: () => void;
  featuredBackdrop?: string;
  featuredGameTitle?: string;
}

export default function HomeSearchHero({
  onOpenRoulette,
  featuredBackdrop,
  featuredGameTitle,
}: HomeSearchHeroProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#1e1f26] border border-white/[0.06] shadow-xl">
      {/* Imagem de Fundo Cinematográfica (Estilo Xbox Cloud Gaming Header) */}
      {featuredBackdrop && (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            src={featuredBackdrop}
            alt={featuredGameTitle || "Destaque"}
            className="w-full h-full object-cover object-center opacity-25 filter blur-[1px] transform scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e1f26] via-[#1e1f26]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e1f26] via-[#1e1f26]/60 to-transparent" />
        </div>
      )}

      {/* Conteúdo Central: Search em Destaque Absoluto */}
      <div className="relative z-10 px-5 py-8 sm:px-10 sm:py-12 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Tag sutil estilo Xbox */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.07] border border-white/10 text-neutral-300 text-xs font-semibold mb-4 backdrop-blur-sm">
          <span className="w-2 h-2 rounded-full bg-[#107C41] shadow-[0_0_8px_#107C41]" />
          <span className="tracking-wide uppercase text-[11px] font-mono">
            Meu Gamer Log · Catálogo & Tracker
          </span>
        </div>

        {/* Barra de Busca Ampla em Destaque (Xbox Spotlight Bar) */}
        <div className="w-full max-w-2xl mb-4">
          <div
            onClick={() => openSpotlightSearch()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openSpotlightSearch()}
            className="group relative flex items-center gap-3.5 w-full px-5 py-4 rounded-2xl bg-[#14151a]/90 hover:bg-[#181920] border border-white/15 hover:border-white/30 text-neutral-400 hover:text-white transition-all shadow-2xl cursor-pointer active:scale-[0.995]"
          >
            <Search className="w-5 h-5 text-neutral-300 group-hover:text-white shrink-0 transition-colors" />
            <span className="text-sm sm:text-base font-normal text-neutral-400 group-hover:text-neutral-200 truncate text-left flex-1">
              Buscar entre mais de 150.000 jogos, franquias ou dublagens...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-neutral-300 font-mono text-xs border border-white/10 shadow-inner">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Filtros Rápidos Estilo Xbox (Pills Discretas) */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            onClick={onOpenRoulette}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-white/20 transition-all font-medium active:scale-95 cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Roleta Gamer</span>
          </button>

          <Link
            href="/colecoes/dublados-ptbr"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-white/20 transition-all font-medium active:scale-95"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Dublados</span>
          </Link>

          <Link
            href="/colecoes/hall-da-fama"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-white/20 transition-all font-medium active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Hall da Fama (90+)</span>
          </Link>

          <Link
            href="/colecoes/fim-de-semana"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-white/20 transition-all font-medium active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Até 10 Horas</span>
          </Link>

          <Link
            href="/calendar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-white/20 transition-all font-medium active:scale-95"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Calendário</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
