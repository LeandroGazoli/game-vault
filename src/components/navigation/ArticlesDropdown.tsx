"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChevronDown,
  Sparkles,
  Clock,
  Trophy,
  Gamepad2,
  ArrowRight,
  Flame,
} from "lucide-react";
import { ARTICLES_DATA } from "@/lib/articlesData";
import { Article } from "@/lib/types/article.types";

export default function ArticlesDropdown() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Artigo em destaque padrão do acervo (ou o primeiro com featured)
  const featuredArticle: Article =
    ARTICLES_DATA.find((a) => a.featured) || ARTICLES_DATA[0];

  const handleOpen = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Fecha o dropdown ao mudar de rota
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const isActive = pathname?.startsWith("/artigos");

  return (
    <div
      className="relative"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      {/* Botão Gatilho no Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold cursor-pointer relative ${
          isOpen || isActive
            ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
        }`}
        aria-expanded={isOpen}
      >
        <BookOpen
          className={`w-3.5 h-3.5 transition-colors ${
            isOpen || isActive ? "text-emerald-400" : "text-emerald-400/90"
          }`}
        />
        <span>Artigos</span>

        {/* Badge 'NOVO' Pulsante com Glow sutil */}
        <span className="relative flex items-center">
          <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black uppercase tracking-wider bg-emerald-500/25 text-emerald-400 border border-emerald-400/40 shadow-[0_0_8px_rgba(16,185,129,0.4)]">
            Novo
          </span>
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-75 pointer-events-none" />
        </span>

        <ChevronDown
          className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-emerald-400" : ""
          }`}
        />
      </button>

      {/* Painel Dropdown Flutuante */}
      {isOpen && (
        <div className="absolute top-full left-0 pt-2 w-[490px] z-50 animate-fadeIn">
          <div className="rounded-2xl bg-[#0c0e14] border border-[#2a3242] shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-1 ring-white/10 p-4 grid grid-cols-12 gap-4">
            {/* Coluna Esquerda: Seções & Matérias por Assunto (7 Colunas) */}
            <div className="col-span-7 space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400 border-b border-white/10 pb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  Editorial Gamer
                </span>
                <span className="text-[9px] text-neutral-400 font-sans normal-case">
                  Guias &amp; Análises
                </span>
              </div>

              <div className="space-y-1">
                <Link
                  href="/artigos"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold text-white hover:bg-emerald-500/15 border border-transparent hover:border-emerald-500/30 transition-all group"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>Todos os Artigos &amp; Matérias</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link
                  href="/artigos#guias"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium block text-white">Guias de Duração (HLTB)</span>
                    <span className="text-[10px] text-neutral-400 block">Tempo médio e organização de backlog</span>
                  </div>
                </Link>

                <Link
                  href="/artigos#analises"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Trophy className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium block text-white">Análises de Metacritic</span>
                    <span className="text-[10px] text-neutral-400 block">Estatísticas, notas e aclamação crítica</span>
                  </div>
                </Link>

                <Link
                  href="/artigos#retrospectivas"
                  onClick={() => setIsOpen(false)}
                  className="flex items-start gap-2.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium block text-white">Retrospectivas Históricas</span>
                    <span className="text-[10px] text-neutral-400 block">Evolução de sagas consagradas</span>
                  </div>
                </Link>
              </div>
            </div>

            {/* Coluna Direita: Card Miniatura da Matéria em Destaque (5 Colunas) */}
            <div className="col-span-5 flex flex-col justify-between border-l border-white/10 pl-4 space-y-2">
              <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                <Flame className="w-3 h-3 text-orange-400" />
                <span>Em Destaque</span>
              </div>

              {featuredArticle && (
                <Link
                  href={`/artigos/${featuredArticle.slug}`}
                  onClick={() => setIsOpen(false)}
                  className="group block rounded-xl overflow-hidden bg-[#141822] border border-white/10 hover:border-emerald-500/40 transition-all p-2 space-y-2 shadow-md hover:shadow-emerald-950/20"
                >
                  <div className="relative h-20 w-full rounded-lg overflow-hidden bg-neutral-900">
                    <img
                      src={featuredArticle.coverImage}
                      alt={featuredArticle.coverAlt || featuredArticle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <span className="absolute bottom-1.5 left-2 px-1.5 py-0.5 rounded bg-emerald-500/90 text-black text-[9px] font-bold font-mono uppercase">
                      {featuredArticle.categoryLabel || "Destaque"}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                      {featuredArticle.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-neutral-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-neutral-500" />
                        {featuredArticle.readTimeMinutes} min
                      </span>
                    </div>
                  </div>
                </Link>
              )}

              <Link
                href="/artigos"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-1 w-full py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold transition-colors"
              >
                <span>Ver Feed Editorial</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
