"use client";

import React from "react";
import Link from "next/link";
import { COLLECTIONS_DATA } from "@/lib/collectionsData";
import { Bookmark, Sparkles, ArrowRight, Trophy, ChevronRight } from "lucide-react";

export default function CollectionsSection() {
  // Exibimos as 4 principais coleções em destaque na home
  const featuredCollections = COLLECTIONS_DATA.slice(0, 4);

  return (
    <section className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Curadoria Exclusiva</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Coleções do Acervo
          </h2>
        </div>

        <Link
          href="/colecoes"
          className="inline-flex items-center gap-1 text-xs font-bold text-neutral-400 hover:text-white transition-colors"
        >
          <span>Ver todas as coleções</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid de Coleções em Destaque */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredCollections.map((col) => (
          <Link
            key={col.slug}
            href={`/colecoes/${col.slug}`}
            className={`group relative flex flex-col justify-between p-5 rounded-2xl overflow-hidden border ${col.borderAccent} bg-gradient-to-b ${col.accent} min-h-[220px] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl active:scale-[0.99]`}
            style={{
              boxShadow: `0 10px 30px -10px ${col.glowColor}`,
            }}
          >
            {/* Background com imagem de jogo desfocada */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-neutral-950 opacity-25 group-hover:opacity-35 transition-opacity">
              <img
                src={col.coverImage}
                alt={col.title}
                loading="lazy"
                className="w-full h-full object-cover object-center filter blur-[1px] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f15] via-[#0d0f15]/80 to-transparent" />
            </div>

            {/* Topo do Card: Badge de Curadoria */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 border border-white/10 text-[11px] font-bold text-neutral-200 backdrop-blur-md">
                {col.badge}
              </span>
              <Bookmark className="w-4 h-4 text-neutral-400 group-hover:text-amber-400 transition-colors" />
            </div>

            {/* Conteúdo Central e Base */}
            <div className="relative z-10 space-y-2 mt-6">
              <h3 className="text-base sm:text-lg font-black text-white group-hover:text-cyan-300 transition-colors leading-tight">
                {col.title}
              </h3>
              <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                {col.subtitle}
              </p>

              {/* Títulos em destaque da coleção */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-400">
                <span className="truncate max-w-[170px] text-neutral-400">
                  {col.highlightTitles.slice(0, 2).join(" • ")}
                </span>
                <span className="font-bold text-cyan-400 group-hover:translate-x-1 transition-transform flex items-center gap-0.5 shrink-0">
                  Ver <ArrowRight className="w-3 h-3 inline" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
