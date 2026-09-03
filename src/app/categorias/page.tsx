import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { CATEGORIES_DATA } from "@/lib/categoriesData";
import { Layers, ArrowRight, Sparkles, Gamepad2 } from "lucide-react";

import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Categorias de Jogos",
  description:
    "Explore jogos organizados por categorias: Luta, Mundo Aberto, Boa Trama, RPG, Terror, Corrida, Tiro, Retrô e muito mais. Filtros temáticos e notas do Metacritic.",
  alternates: {
    canonical: "/categorias",
  },
  openGraph: {
    title: "Categorias de Jogos | Catálogo GameVault",
    description:
      "Explore jogos organizados por categorias temáticas com notas, tempos de zeramento e lançamentos.",
    url: `${SITE_URL}/categorias`,
    siteName: "GameVault",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Categorias de Jogos | Catálogo GameVault",
    description: "Explore jogos organizados por categorias temáticas no GameVault.",
    images: ["/og-image.jpg"],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Categorias",
        item: `${SITE_URL}/categorias`,
      },
    ],
  },
];

export default function CategoriasPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <div className="space-y-10 pb-16 pt-2">
      {/* Hero da Página de Categorias */}
      <section className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#141824] via-[#0d1017] to-[#090b0f] p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="pointer-events-none absolute -top-24 -right-10 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-purple-500/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-cyan-300">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>ARQUIVO TEMÁTICO DE GAMES</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-display">
            Explore por Categoria
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Seja você fã de narrativas profundas, adrenalina no asfalto, terror psicológico ou combates milimétricos, encontre exatamente a experiência que procura.
          </p>
        </div>
      </section>

      {/* Grid com Todas as Categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORIES_DATA.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categorias/${cat.slug}`}
            className="group relative flex flex-col justify-between p-6 rounded-3xl overflow-hidden border border-white/10 hover:border-white/30 bg-[#10131b] min-h-[240px] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
            style={{
              boxShadow: `0 10px 30px -10px ${cat.glowColor}`,
            }}
          >
            {/* Background Image com overlay de gradiente */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-neutral-950">
              <img
                src={cat.coverImage}
                alt={cat.name}
                loading="lazy"
                className="w-full h-full object-cover object-center filter brightness-[0.5] contrast-[1.1] transition-transform duration-500 group-hover:scale-105 group-hover:brightness-[0.6]"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.accent} opacity-70`} />
            </div>

            {/* Topo do Card: Pill Badge Branco Central/Superior */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-4 py-1.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider shadow-xl">
                {cat.badgeLabel}
              </span>
              <span className="p-2 rounded-xl bg-black/40 border border-white/10 text-white/80 group-hover:text-white group-hover:border-white/30 transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>

            {/* Base do Card: Título, Descrição e Títulos Famosos */}
            <div className="relative z-10 space-y-2 mt-8">
              <h2 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                {cat.name}
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
                {cat.description}
              </p>

              {/* Títulos famosos da categoria */}
              <div className="pt-3 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-neutral-400 font-medium">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span className="truncate">
                  {cat.featuredTitles.join(" • ")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
      </div>
    </>
  );
}
