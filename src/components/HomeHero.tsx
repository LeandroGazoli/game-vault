"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { openSpotlightSearch } from "@/components/SpotlightSearchModal";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  Search,
  Calendar as CalendarIcon,
  Dices,
  Languages,
  Clock,
  Trophy,
  Gamepad2,
  ArrowRight,
} from "lucide-react";

interface HomeHeroProps {
  onOpenRoulette: () => void;
}

export default function HomeHero({ onOpenRoulette }: HomeHeroProps) {
  const heroRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        reduceMotion: "(prefers-reduced-motion: reduce), (max-width: 768px)",
        allowMotion:
          "(prefers-reduced-motion: no-preference) and (min-width: 769px)",
      },
      (context) => {
        const { reduceMotion } = context.conditions as {
          reduceMotion: boolean;
        };

        if (reduceMotion) {
          gsap.set(
            [".hero-badge", ".hero-title", ".hero-search", ".hero-chip"],
            { autoAlpha: 1, y: 0 }
          );
          return;
        }

        const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

        tl.fromTo(
          ".hero-badge",
          { autoAlpha: 0, y: -10, scale: 0.97 },
          { autoAlpha: 1, y: 0, scale: 1, duration: 0.3 }
        )
          .fromTo(
            ".hero-title",
            { autoAlpha: 0, y: 16 },
            { autoAlpha: 1, y: 0, duration: 0.4 },
            "-=0.15"
          )
          .fromTo(
            ".hero-search",
            { autoAlpha: 0, y: 12, scale: 0.98 },
            { autoAlpha: 1, y: 0, scale: 1, duration: 0.35 },
            "-=0.2"
          )
          .fromTo(
            ".hero-chip",
            { autoAlpha: 0, y: 8, scale: 0.95 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              stagger: 0.04,
              duration: 0.28,
            },
            "-=0.15"
          );
      }
    );
  }, { scope: heroRef });

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden rounded-2xl bg-[#1a1a1a] border border-white/[0.08] px-6 py-8 sm:px-10 sm:py-10"
    >
      {/* Linha de brilho no topo */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="relative z-10 max-w-3xl">
        {/* Eyebrow badge */}
        <div className="hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/10 text-xs font-semibold text-neutral-400 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#10B981]" />
          <span className="font-mono tracking-widest uppercase text-[10px] text-neutral-300">
            MGL · Meu Gamer Log
          </span>
        </div>

        {/* Título principal */}
        <h1 className="hero-title text-2xl sm:text-4xl font-black text-white tracking-tight leading-[1.1] font-display mb-2">
          Descubra, Registre e Acompanhe{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
            Seus Jogos.
          </span>
        </h1>
        <p className="text-sm text-neutral-400 mb-6 leading-relaxed max-w-xl">
          Seu tracker definitivo com{" "}
          <span className="text-neutral-300 font-medium">dublagem PT-BR</span>
          {", "}
          <span className="text-neutral-300 font-medium">tempo para zerar</span>
          , notas Metacritic e estatísticas da comunidade.
        </p>

        {/* Barra de busca spotlight */}
        <div className="hero-search mb-5 max-w-xl">
          <div
            onClick={() => openSpotlightSearch()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && openSpotlightSearch()}
            className="group flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-[#111111] hover:bg-[#191919] border border-white/10 hover:border-white/20 text-neutral-500 hover:text-neutral-300 transition-all cursor-pointer active:scale-[0.99]"
          >
            <Search className="w-4 h-4 text-neutral-400 shrink-0 group-hover:text-neutral-200 transition-colors" />
            <span className="text-sm text-neutral-500 group-hover:text-neutral-400 truncate">
              Buscar por jogo, franquia, gênero ou dublagem...
            </span>
            <kbd className="ml-auto hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/[0.08] text-neutral-400 font-mono text-[11px] border border-white/[0.08]">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Chips de acesso rápido */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={onOpenRoulette}
            className="hero-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/25 hover:border-amber-400/50 font-semibold transition-all active:scale-95 cursor-pointer"
          >
            <Dices className="w-3.5 h-3.5" />
            <span>Roleta Gamer</span>
          </button>

          <Link
            href="/colecoes/dublados-ptbr"
            className="hero-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-neutral-200 border border-white/[0.08] hover:border-white/[0.18] transition-all font-medium active:scale-95"
          >
            <Languages className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Dublados</span>
          </Link>

          <Link
            href="/colecoes/hall-da-fama"
            className="hero-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-neutral-200 border border-white/[0.08] hover:border-white/[0.18] transition-all font-medium active:scale-95"
          >
            <Trophy className="w-3.5 h-3.5 text-yellow-400" />
            <span>Hall da Fama (90+)</span>
          </Link>

          <Link
            href="/colecoes/fim-de-semana"
            className="hero-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-neutral-200 border border-white/[0.08] hover:border-white/[0.18] transition-all font-medium active:scale-95"
          >
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Até 10 Horas</span>
          </Link>

          <Link
            href="/calendar"
            className="hero-chip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/10 text-neutral-400 hover:text-neutral-200 border border-white/[0.08] hover:border-white/[0.18] transition-all font-medium active:scale-95"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lançamentos</span>
          </Link>
        </div>
      </div>

      {/* Barra de plataformas na base */}
      <div className="mt-8 pt-5 border-t border-white/[0.06] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto py-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-500 shrink-0 mr-1 flex items-center gap-1.5">
            <Gamepad2 className="w-3.5 h-3.5 text-neutral-500" />
            Plataformas:
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
              className="px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/10 text-neutral-400 hover:text-white border border-white/[0.06] hover:border-white/15 transition-all font-medium text-xs whitespace-nowrap active:scale-95 shrink-0"
            >
              {p.label}
            </Link>
          ))}
        </div>

        <Link
          href="/categorias"
          className="hidden md:inline-flex items-center gap-1 text-xs font-medium text-neutral-500 hover:text-neutral-300 transition-colors shrink-0"
        >
          <span>Ver todas as categorias</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Linha de brilho na base */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </section>
  );
}
