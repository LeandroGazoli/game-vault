"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { CATEGORIES_DATA } from "@/lib/categoriesData";
import { ChevronLeft, ChevronRight, Sparkles, Layers } from "lucide-react";

export default function CategoriesCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const offset = direction === "left" ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  return (
    <section className="space-y-4">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Navegação Temática</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Explore por categoria
          </h2>
        </div>

        {/* Controles de Navegação e Link */}
        <div className="flex items-center gap-2">
          <Link
            href="/categorias"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors mr-2"
          >
            <span>Ver todas</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => scroll("left")}
            aria-label="Rolar para a esquerda"
            className="p-2 rounded-xl bg-[#141822] hover:bg-[#1d2331] border border-white/10 text-neutral-300 hover:text-white transition-all active:scale-90 shadow-md cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Rolar para a direita"
            className="p-2 rounded-xl bg-[#141822] hover:bg-[#1d2331] border border-white/10 text-neutral-300 hover:text-white transition-all active:scale-90 shadow-md cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Carrossel Horizontal de Cards de Categoria */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3.5 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
      >
        {CATEGORIES_DATA.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categorias/${cat.slug}`}
            className="group relative flex-shrink-0 w-[220px] sm:w-[260px] md:w-[280px] h-[125px] sm:h-[145px] rounded-2xl overflow-hidden border border-white/10 hover:border-white/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
            style={{
              boxShadow: `0 10px 25px -5px ${cat.glowColor}`,
            }}
          >
            {/* Imagem de Fundo (Colagem de Jogos) */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-neutral-900">
              <img
                src={cat.coverImage}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover object-center filter brightness-[0.7] contrast-[1.1] transition-transform duration-500 group-hover:scale-110 group-hover:brightness-[0.8]"
              />
              {/* Overlay de gradiente sutil com a cor da categoria */}
              <div
                className={`absolute inset-0 bg-gradient-to-t ${cat.accent} opacity-60 group-hover:opacity-40 transition-opacity`}
              />
            </div>

            {/* Badge Central Branco com Tipografia em Caixa Alta (Exatamente como na referência) */}
            <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-3">
              <div className="px-4 py-1.5 rounded-lg bg-white/95 text-black font-black text-xs sm:text-sm tracking-wider uppercase shadow-xl transition-transform duration-300 group-hover:scale-105 group-hover:bg-white select-none">
                {cat.badgeLabel}
              </div>

              {/* Subtítulo discreto ao passar o mouse */}
              <span className="mt-2 text-[10px] text-white/90 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 line-clamp-1 text-center drop-shadow-md">
                {cat.featuredTitles.slice(0, 2).join(" • ")}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
