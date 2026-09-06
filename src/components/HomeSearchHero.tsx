"use client";

import React from "react";
import Link from "next/link";
import { Search, Dices, Languages, Trophy, Clock, Calendar as CalendarIcon } from "lucide-react";
import { openSpotlightSearch } from "@/components/SpotlightSearchModal";
import GtaViCountdownBadge from "@/components/GtaViCountdownBadge";

interface HomeSearchHeroProps {
  onOpenRoulette: () => void;
  featuredBackdrop?: string | null;
  featuredGameTitle?: string | null;
}

// Wallpaper oficial artwork GTA VI Vice City Sunset
const GTA_VI_DEFAULT_BACKDROP = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=85";

export default function HomeSearchHero({
  onOpenRoulette,
  featuredBackdrop,
  featuredGameTitle,
}: HomeSearchHeroProps) {
  const backdropImage = featuredBackdrop || GTA_VI_DEFAULT_BACKDROP;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#1a1922] border border-white/[0.08] shadow-2xl group">
      {/* Imagem de Fundo Cinematográfica Vice City Sunset */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={backdropImage}
          alt={featuredGameTitle || "GTA VI Vice City"}
          className="w-full h-full object-cover object-center opacity-30 filter blur-[1px] transform scale-105 group-hover:scale-100 transition-transform duration-1000"
        />
        {/* Gradientes de iluminação atmosférica Miami Sunset */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1a1922] via-[#1a1922]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a1922] via-[#1a1922]/50 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gradient-to-br from-[#ff2a85]/15 to-[#ff7a00]/10 blur-3xl pointer-events-none" />
      </div>

      {/* Conteúdo Central: Search em Destaque Absoluto + Badge GTA VI */}
      <div className="relative z-10 px-5 py-8 sm:px-10 sm:py-12 max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Widget de Contagem Regressiva e Hype do GTA VI */}
        <div className="mb-4">
          <GtaViCountdownBadge />
        </div>

        {/* Barra de Busca Ampla em Destaque com Borda Reativa Sunset */}
        <div className="w-full max-w-2xl mb-4">
          <div
            onClick={() => openSpotlightSearch()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openSpotlightSearch()}
            className="group/search relative flex items-center gap-3.5 w-full px-5 py-4 rounded-2xl bg-[#14131a]/95 hover:bg-[#191822] border border-white/15 hover:border-[#ff2a85]/50 focus-within:border-[#ff7a00]/60 text-neutral-400 hover:text-white transition-all shadow-2xl cursor-pointer active:scale-[0.995]"
          >
            <Search className="w-5 h-5 text-neutral-300 group-hover/search:text-[#ff7a00] shrink-0 transition-colors" />
            <span className="text-sm sm:text-base font-normal text-neutral-400 group-hover/search:text-neutral-200 truncate text-left flex-1">
              Buscar entre mais de 150.000 jogos, franquias ou dublagens...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-neutral-300 font-mono text-xs border border-white/10 shadow-inner group-hover/search:border-[#ff2a85]/40">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Filtros Rápidos Estilo Console com Detalhes Leonida */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            onClick={onOpenRoulette}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-amber-400/40 transition-all font-medium active:scale-95 cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Roleta Gamer</span>
          </button>

          <Link
            href="/colecoes/dublados-ptbr"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-emerald-400/40 transition-all font-medium active:scale-95"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Dublados</span>
          </Link>

          <Link
            href="/search?q=Grand+Theft+Auto"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#ff2a85]/15 to-[#ff7a00]/15 hover:from-[#ff2a85]/25 hover:to-[#ff7a00]/25 text-pink-200 border border-[#ff2a85]/30 hover:border-[#ff2a85]/60 transition-all font-semibold active:scale-95"
          >
            <span className="text-xs">🌴</span>
            <span>Saga GTA</span>
          </Link>

          <Link
            href="/colecoes/hall-da-fama"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-yellow-400/40 transition-all font-medium active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Hall da Fama (90+)</span>
          </Link>

          <Link
            href="/colecoes/fim-de-semana"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-sky-400/40 transition-all font-medium active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Até 10 Horas</span>
          </Link>

          <Link
            href="/calendar"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-neutral-200 border border-white/10 hover:border-indigo-400/40 transition-all font-medium active:scale-95"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Calendário</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
