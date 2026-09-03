import React from "react";
import Link from "next/link";
import { Metadata } from "next";
import { COLLECTIONS_DATA } from "@/lib/collectionsData";
import { Sparkles, ArrowRight, Bookmark, Trophy, Gamepad2 } from "lucide-react";

import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Coleções Especiais de Jogos",
  description:
    "Explore coleções temáticas curadas: Hall da Fama (90+ Metacritic), Jogos Dublados em Português, Zere no Fim de Semana, Soulslike, Indie Gems e Retrô.",
  alternates: {
    canonical: "/colecoes",
  },
  openGraph: {
    title: "Coleções Especiais de Jogos | Catálogo GameVault",
    description:
      "Explore seleções exclusivas e coleções temáticas de jogos recomendados pela comunidade e crítica.",
    url: `${SITE_URL}/colecoes`,
    siteName: "GameVault",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Coleções Especiais de Jogos | Catálogo GameVault",
    description: "Explore coleções temáticas curadas de jogos no GameVault.",
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
        name: "Coleções",
        item: `${SITE_URL}/colecoes`,
      },
    ],
  },
];

export default function ColecoesPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <div className="space-y-10 pb-16 pt-2">
      {/* Hero da Página de Coleções */}
      <section className="relative rounded-3xl border border-white/10 bg-gradient-to-b from-[#181524] via-[#100f1a] to-[#0a0a10] p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="pointer-events-none absolute -top-24 -right-10 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>CURADORIA EXCLUSIVA GAME VAULT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight font-display">
            Coleções do Acervo
          </h1>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed">
            Nossos editores e a comunidade reuniram seleções temáticas de alto impacto: desde os maiores clássicos com nota acima de 90 até jornadas compactas para você zerar em um fim de semana.
          </p>
        </div>
      </section>

      {/* Grid com Todas as Coleções */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {COLLECTIONS_DATA.map((col) => (
          <Link
            key={col.slug}
            href={`/colecoes/${col.slug}`}
            className={`group relative flex flex-col justify-between p-6 rounded-3xl overflow-hidden border ${col.borderAccent} bg-gradient-to-b ${col.accent} min-h-[260px] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl`}
            style={{
              boxShadow: `0 10px 30px -10px ${col.glowColor}`,
            }}
          >
            {/* Background Image com overlay de gradiente */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-neutral-950 opacity-30 group-hover:opacity-40 transition-opacity">
              <img
                src={col.coverImage}
                alt={col.title}
                loading="lazy"
                className="w-full h-full object-cover object-center filter blur-[1px] group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-black/70 to-transparent" />
            </div>

            {/* Topo do Card: Badge de Curadoria e Ícone */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-3.5 py-1.5 rounded-xl bg-black/60 border border-white/10 text-xs font-bold text-neutral-200 backdrop-blur-md">
                {col.badge}
              </span>
              <span className="p-2 rounded-xl bg-black/40 border border-white/10 text-white/80 group-hover:text-white group-hover:border-white/30 transition-all">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>

            {/* Base do Card: Título, Subtítulo e Destaques */}
            <div className="relative z-10 space-y-2 mt-8">
              <h2 className="text-xl font-black text-white group-hover:text-cyan-300 transition-colors">
                {col.title}
              </h2>
              <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2">
                {col.subtitle}
              </p>

              {/* Títulos em destaque da coleção */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-neutral-400 font-medium">
                <span className="truncate max-w-[200px]">
                  {col.highlightTitles.join(" • ")}
                </span>
                <span className="text-cyan-400 font-bold group-hover:underline">
                  Explorar
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
