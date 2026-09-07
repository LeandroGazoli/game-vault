"use client";

import React from "react";
import Link from "next/link";
import { Search, Dices, Languages, Trophy, Clock, Calendar as CalendarIcon, Sparkles } from "lucide-react";
import { openSpotlightSearch } from "@/components/SpotlightSearchModal";
import GtaViCountdownBadge from "@/components/GtaViCountdownBadge";

interface HomeSearchHeroProps {
  onOpenRoulette: () => void;
  featuredBackdrop?: string | null;
  featuredGameTitle?: string | null;
}

// Artwork oficial GTA VI 1080p (Jason & Lucia em Vice City Sunset)
const GTA_VI_OFFICIAL_ARTWORK = "https://images.igdb.com/igdb/image/upload/t_1080p/ar6i4p.jpg";

export default function HomeSearchHero({
  onOpenRoulette,
  featuredBackdrop,
  featuredGameTitle,
}: HomeSearchHeroProps) {
  // Arte oficial do GTA VI tem prioridade absoluta na Home temática
  const backdropImage = GTA_VI_OFFICIAL_ARTWORK;

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#13121a] border border-white/[0.08] shadow-2xl group min-h-[460px] sm:min-h-[520px] flex flex-col justify-between">
      {/* Imagem de Fundo Oficial GTA VI em Alta Definição (1080p) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src={backdropImage}
          alt={featuredGameTitle || "GTA VI Official Artwork - Jason & Lucia Vice City"}
          className="w-full h-full object-cover object-top sm:object-center opacity-70 sm:opacity-80 transform scale-100 group-hover:scale-[1.02] transition-transform duration-1000"
          loading="eager"
        />
        {/* Gradientes cinematográficos de iluminação e legibilidade Vice City */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#13121a] via-[#13121a]/60 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#13121a]/90 via-[#13121a]/40 to-transparent sm:block hidden" />
        {/* Brilho neon tropical nos cantos */}
        <div className="absolute -top-12 -right-12 w-96 h-96 rounded-full bg-gradient-to-br from-[#ff007f]/20 via-[#ff6b00]/15 to-transparent blur-3xl pointer-events-none" />
      </div>

      {/* Topo do Hero: Badge Temática e Contagem Regressiva */}
      <div className="relative z-10 pt-6 px-4 sm:px-8 flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 border border-white/10 backdrop-blur-md shadow-lg">
          <span className="text-sm select-none">🌴</span>
          <span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-neutral-300 font-bold">
            LEONIDA STATE • VICE CITY
          </span>
        </div>

        <GtaViCountdownBadge />
      </div>

      {/* Conteúdo Central e Inferior: Título Icônico + Busca em Destaque Absoluto */}
      <div className="relative z-10 px-4 py-8 sm:px-10 sm:pb-10 max-w-4xl mx-auto w-full flex flex-col items-center text-center mt-auto">
        {/* Tipografia de Destaque Estilo GTA VI / Vice City */}
        <div className="space-y-1 mb-6">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white font-display drop-shadow-lg">
            O Acervo Definitivo de Games{" "}
            <span className="block sm:inline gta-sunset-gradient-text drop-shadow-[0_0_25px_rgba(255,42,133,0.35)]">
              Rumo a Vice City.
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-300 max-w-xl mx-auto drop-shadow-md font-medium">
            Registre suas horas, acompanhe lançamentos em tempo real, rankings Metacritic e dublagens em PT-BR.
          </p>
        </div>

        {/* Barra de Busca Ampla em Destaque com Efeito Neon Sunset */}
        <div className="w-full max-w-2xl mb-5">
          <div
            onClick={() => openSpotlightSearch()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openSpotlightSearch()}
            className="group/search relative flex items-center gap-3.5 w-full px-5 py-4 rounded-2xl bg-black/75 hover:bg-black/90 border border-white/15 hover:border-[#ff007f]/70 focus-within:border-[#ff6b00] text-neutral-300 hover:text-white transition-all shadow-[0_10px_35px_rgba(0,0,0,0.8)] backdrop-blur-xl cursor-pointer active:scale-[0.995]"
          >
            <Search className="w-5 h-5 text-[#ff6b00] group-hover/search:text-[#ff007f] shrink-0 transition-colors" />
            <span className="text-xs sm:text-sm md:text-base font-medium text-neutral-300 group-hover/search:text-white truncate text-left flex-1">
              Buscar entre mais de 150.000 jogos, franquias ou dublagens...
            </span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 text-neutral-300 font-mono text-xs border border-white/10 shadow-inner group-hover/search:border-[#ff007f]/50">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Filtros Rápidos com Estilo Console Vice City */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <Link
            href="/search?q=Grand+Theft+Auto"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#ff007f]/25 to-[#ff6b00]/25 hover:from-[#ff007f]/40 hover:to-[#ff6b00]/40 text-pink-200 border border-[#ff007f]/40 hover:border-[#ff007f] transition-all font-bold shadow-md active:scale-95"
          >
            <span className="text-xs">🌴</span>
            <span>Saga GTA</span>
          </Link>

          <Link
            href="/colecoes/dublados-ptbr"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-neutral-200 border border-white/10 hover:border-emerald-400/40 backdrop-blur-md transition-all font-medium active:scale-95"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Dublados</span>
          </Link>

          <Link
            href="/colecoes/hall-da-fama"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-neutral-200 border border-white/10 hover:border-yellow-400/40 backdrop-blur-md transition-all font-medium active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Hall da Fama (90+)</span>
          </Link>

          <Link
            href="/colecoes/fim-de-semana"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-neutral-200 border border-white/10 hover:border-sky-400/40 backdrop-blur-md transition-all font-medium active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Até 10 Horas</span>
          </Link>

          <button
            onClick={onOpenRoulette}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-neutral-200 border border-white/10 hover:border-amber-400/40 backdrop-blur-md transition-all font-medium active:scale-95 cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Roleta Gamer</span>
          </button>

          <Link
            href="/calendar"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/80 text-neutral-200 border border-white/10 hover:border-indigo-400/40 backdrop-blur-md transition-all font-medium active:scale-95"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Calendário</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
