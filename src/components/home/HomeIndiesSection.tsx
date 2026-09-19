"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { IndieGame } from "@/lib/types/indie.types";
import {
  Gamepad2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Heart,
  Plus,
} from "lucide-react";
import IndieGameCard from "@/components/indies/IndieGameCard";

export default function HomeIndiesSection() {
  const [indies, setIndies] = useState<IndieGame[]>([]);
  const [loading, setLoading] = useState(true);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    fetch("/api/indies?sortBy=votes")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { indies?: IndieGame[] } | null) => {
        if (isMounted) {
          setIndies(data?.indies || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Erro ao carregar indies na home:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="h-6 w-48 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-4 w-20 bg-white/5 rounded-lg animate-pulse" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-72 h-80 rounded-3xl bg-[#141822] border border-white/5 animate-pulse shrink-0"
            />
          ))}
        </div>
      </section>
    );
  }

  if (indies.length === 0) return null;

  return (
    <section
      className="space-y-4 relative group/indierow"
      style={{ contentVisibility: "auto", containIntrinsicSize: "0 320px" }}
    >
      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/indies"
          className="flex items-center gap-2 group/header hover:opacity-90 transition-opacity"
        >
          <div className="p-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white group-hover/header:text-emerald-400 transition-colors">
                Jogos Independentes &amp; Criações da Comunidade
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold">
                <Sparkles className="w-3 h-3" /> Exclusivo
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-normal">
              Conheça, jogue e vote nos títulos criados por desenvolvedores e estúdios independentes
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/indies"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors group/link shrink-0"
          >
            <span>Ver Todos ({indies.length})</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Contêiner de Navegação com Scroll Suave */}
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/80 hover:bg-emerald-500 text-white hover:text-black border border-white/20 hover:border-emerald-400 flex items-center justify-center opacity-0 group-hover/indierow:opacity-100 transition-[opacity,background-color,border-color,color] duration-200 shadow-xl backdrop-blur-sm cursor-pointer"
          title="Rolar para a esquerda"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/80 hover:bg-emerald-500 text-white hover:text-black border border-white/20 hover:border-emerald-400 flex items-center justify-center opacity-0 group-hover/indierow:opacity-100 transition-[opacity,background-color,border-color,color] duration-200 shadow-xl backdrop-blur-sm cursor-pointer"
          title="Rolar para a direita"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-none pb-2 pt-1 scroll-smooth snap-x snap-mandatory"
        >
          {indies.map((game) => (
            <div
              key={game.id}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start"
            >
              <IndieGameCard game={game} />
            </div>
          ))}

          {/* Card CTA para Cadastrar Projeto */}
          <div className="w-[260px] shrink-0 snap-start flex flex-col justify-between p-6 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-center space-y-4">
            <div className="space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <Plus className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">É Desenvolvedor Indie?</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Cadastre seu jogo gratuitamente com ficha técnica, mídias e receba votos da comunidade.
              </p>
            </div>

            <Link
              href="/indies/cadastrar"
              className="inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-emerald-500 text-gray-300 hover:text-black font-bold text-xs transition-colors"
            >
              <span>Divulgar Jogo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
