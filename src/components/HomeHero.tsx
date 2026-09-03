"use client";

import React from "react";
import Link from "next/link";
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
  ShieldCheck,
  Zap,
} from "lucide-react";

interface HomeHeroProps {
  onOpenRoulette: () => void;
}

export default function HomeHero({ onOpenRoulette }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#111620]/90 via-[#0c0e14] to-[#0a0c10] p-6 sm:p-10 lg:p-12 shadow-2xl backdrop-blur-xl">
      {/* Luzes de ambientação de fundo (Neon Glows) */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-emerald-500/15 blur-[120px]" />
      <div className="pointer-events-none absolute top-1/4 -right-20 h-96 w-96 rounded-full bg-cyan-500/15 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-emerald-500/10 blur-[130px]" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Lado Esquerdo: Marca MGL, Título, Busca & Ações Rápidas */}
        <div className="lg:col-span-7 xl:col-span-7 space-y-6 text-center lg:text-left">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-neutral-300 backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
            <span className="font-mono tracking-wide uppercase text-[11px] text-emerald-300 font-bold">
              MGL // MEU GAMER LOG
            </span>
          </div>

          {/* Título Principal */}
          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1] font-display">
              Descubra, Registre e Acompanhe <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                Seus Jogos Favoritos.
              </span>
            </h1>

            <p className="text-xs sm:text-base text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              O seu acervo definitivo com <strong>jogos dublados em PT-BR</strong>, <strong>duração estimada para zerar</strong>, lançamentos ao vivo e estatísticas da comunidade.
            </p>
          </div>

          {/* Barra de Busca Tátil Flutuante (Dispara o Spotlight ⌘K) */}
          <div className="pt-1 max-w-xl mx-auto lg:mx-0">
            <div
              onClick={() => openSpotlightSearch()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && openSpotlightSearch()}
              className="group relative flex items-center gap-3 w-full px-4 py-3.5 sm:py-4 rounded-2xl bg-[#090b10]/90 hover:bg-[#12151e] border border-white/15 hover:border-emerald-400/50 text-neutral-400 hover:text-white transition-all shadow-xl hover:shadow-emerald-500/10 cursor-pointer active:scale-[0.99]"
            >
              <Search className="w-5 h-5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
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

        {/* Lado Direito: Card Oficial da Insígnia MGL (Sem 3D, com visual gamer premium) */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-5 items-center justify-center">
          <div className="relative w-full max-w-[420px] rounded-3xl border border-emerald-500/25 bg-gradient-to-b from-[#131d1a]/80 via-[#0d1413]/90 to-[#080d0c] p-6 shadow-2xl backdrop-blur-2xl hover:border-emerald-400/40 transition-all group">
            {/* Halo Neon Esmeralda */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

            {/* Imagem do Logo MGL Oficial em Destaque */}
            <div className="relative z-10 flex flex-col items-center justify-center py-4">
              <div className="relative w-full aspect-[2.3/1] max-h-[160px] flex items-center justify-center">
                <img
                  src="/logo-mgl.png"
                  alt="MGL Insígnia Oficial"
                  className="max-h-[150px] w-auto object-contain filter drop-shadow-[0_0_25px_rgba(16,185,129,0.5)] group-hover:drop-shadow-[0_0_35px_rgba(16,185,129,0.8)] transition-all duration-300 group-hover:scale-105"
                />
              </div>

              {/* Destaques Rápidos da Plataforma */}
              <div className="w-full grid grid-cols-2 gap-2.5 mt-6 pt-5 border-t border-white/10 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                  <Gamepad2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white text-[11px]">150.000+</span>
                    <span className="text-[10px] text-neutral-400">Jogos no Acervo</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                  <Languages className="w-4 h-4 text-teal-400 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white text-[11px]">PT-BR</span>
                    <span className="text-[10px] text-neutral-400">Dublados Oficiais</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                  <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white text-[11px]">HowLongToBeat</span>
                    <span className="text-[10px] text-neutral-400">Horas para Zerar</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/5">
                  <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                  <div className="flex flex-col text-left">
                    <span className="font-bold text-white text-[11px]">Metacritic</span>
                    <span className="text-[10px] text-neutral-400">Notas &amp; Rankings</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtro Rápido por Plataforma (Embutida na base do Hero) */}
      <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto py-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-400 shrink-0 mr-1 flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" /> Plataformas:
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
          className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline shrink-0"
        >
          <span>Ver todas as categorias</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}
