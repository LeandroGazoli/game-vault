"use client";

import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { openSpotlightSearch } from "@/components/SpotlightSearchModal";
import {
  Search,
  Sparkles,
  Calendar as CalendarIcon,
  Dices,
  Languages,
  Clock,
  Trophy,
  Gamepad2,
  ArrowRight,
  Flame,
} from "lucide-react";

// Carregamento dinâmico e seguro do Three.js para o Hero (sem SSR)
const HeroArcade3D = dynamic(() => import("@/components/3d/HeroArcade3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[320px] sm:h-[380px] flex items-center justify-center">
      <div className="w-24 h-32 rounded-2xl bg-white/5 animate-pulse border border-white/10" />
    </div>
  ),
});

interface HomeHeroProps {
  onOpenRoulette: () => void;
}

export default function HomeHero({ onOpenRoulette }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#131722]/90 via-[#0c0e14] to-[#0a0c10] p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">
      {/* Luzes de ambientação de fundo (Neon Glows) */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-indigo-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-amber-500/10 blur-[130px]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Lado Esquerdo: Tipografia de Alto Impacto, Busca & Tags */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 text-center lg:text-left">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-neutral-300 backdrop-blur-md shadow-sm hover:border-cyan-500/30 transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse shadow-[0_0_8px_#00E5FF]" />
            <span className="font-mono tracking-wide uppercase text-[11px] text-cyan-300">
              Game Vault // Acervo & Comunidade
            </span>
          </div>

          {/* Letreiro Monumental Recortado com Arte dos Jogos (Inspirado na referência de alta performance visual) */}
          <div className="space-y-2">
            <div className="relative select-none inline-block">
              <h1
                className="text-6xl sm:text-7xl md:text-8xl xl:text-9xl font-black tracking-tighter uppercase font-display leading-[0.9] text-transparent bg-clip-text drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(200,220,255,0.8) 100%), url('https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80')",
                  WebkitBackgroundClip: "text",
                  backgroundSize: "cover",
                  backgroundPosition: "center 30%",
                }}
              >
                GAMES
              </h1>
            </div>

            <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
              Encontre seu próximo momento inesquecível.
            </p>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Explore mais de <strong>150.000 títulos</strong>, descubra jogos dublados em <strong>PT-BR</strong>, tempo estimado para zerar e organize seu backlog gamer.
            </p>
          </div>

          {/* Barra de Busca Tátil Flutuante (Dispara o Spotlight ⌘K) */}
          <div className="pt-1 max-w-xl mx-auto lg:mx-0">
            <div
              onClick={() => openSpotlightSearch()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openSpotlightSearch()}
              className="group relative flex items-center gap-3 w-full px-4 py-3.5 sm:py-4 rounded-2xl bg-[#090b10]/90 hover:bg-[#12151e] border border-white/15 hover:border-cyan-400/50 text-neutral-400 hover:text-white transition-all shadow-xl hover:shadow-cyan-500/10 cursor-pointer active:scale-[0.99]"
            >
              <Search className="w-5 h-5 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm font-medium text-neutral-400 group-hover:text-neutral-200 truncate">
                Buscar por jogo, franquia, gênero ou dublagem...
              </span>
              <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 text-neutral-300 font-mono text-[11px] font-semibold border border-white/10 shadow-inner">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Chips de Acesso Rápido / Gatilhos Gamers */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
            <button
              onClick={onOpenRoulette}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Dices className="w-3.5 h-3.5 text-amber-400" />
              <span>Roleta Gamer</span>
            </button>

            <Link
              href="/colecoes/dublados-ptbr"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 hover:border-emerald-500/40 transition-all font-medium active:scale-95"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% Dublados</span>
            </Link>

            <Link
              href="/colecoes/hall-da-fama"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 hover:border-yellow-500/40 transition-all font-medium active:scale-95"
            >
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Hall da Fama (90+)</span>
            </Link>

            <Link
              href="/colecoes/fim-de-semana"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 hover:border-cyan-500/40 transition-all font-medium active:scale-95"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Até 10 Horas</span>
            </Link>

            <Link
              href="/calendar"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/10 hover:border-indigo-500/40 transition-all font-medium active:scale-95"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Lançamentos</span>
            </Link>
          </div>
        </div>

        {/* Lado Direito: Dock Holográfico com Three.js 3D (Desktop) */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 items-center justify-center">
          <div className="relative w-full max-w-[380px] rounded-3xl border border-white/10 bg-gradient-to-b from-[#181d2a]/60 via-[#10131d]/80 to-[#0a0d14]/90 p-4 shadow-2xl backdrop-blur-2xl">
            {/* Anéis de iluminação cibernética decorativos */}
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <HeroArcade3D />
            </div>

            {/* Rodapé sutil do Dock 3D */}
            <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400 px-2 font-mono">
              <span className="flex items-center gap-1.5 text-neutral-400">
                <Gamepad2 className="w-3.5 h-3.5 text-[#00E5FF]" /> Cartucho Interativo
              </span>
              <span className="text-cyan-400/90 font-semibold">WebGL 3D Core</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtro Rápido por Plataforma (Embutida na base do Hero) */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto py-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1 flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> Plataformas:
          </span>

          {[
            { label: "Todos", href: "/search" },
            { label: "💻 PC", href: "/search?platform=PC" },
            { label: "🎮 PS5", href: "/search?platform=PlayStation%205" },
            { label: "🟢 Xbox", href: "/search?platform=Xbox%20Series" },
            { label: "🔴 Switch", href: "/search?platform=Nintendo%20Switch" },
            { label: "🕹️ Retrô", href: "/search?platform=Retro" },
            { label: "🇧🇷 Dublados", href: "/search?q=dublado" },
          ].map((p) => (
            <Link
              key={p.label}
              href={p.href}
              className="px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/5 hover:border-white/20 transition-all font-medium text-xs whitespace-nowrap active:scale-95 shrink-0"
            >
              {p.label}
            </Link>
          ))}
        </div>

        <Link
          href="/categorias"
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline shrink-0"
        >
          <span>Ver todas as categorias</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
