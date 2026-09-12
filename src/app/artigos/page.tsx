import React from "react";
import type { Metadata } from "next";
import { getCombinedArticles } from "@/lib/articlesService";
import ArticleCard from "@/components/articles/ArticleCard";
import JsonLd from "@/components/seo/JsonLd";
import { BookOpen, Sparkles, Flame, ShieldCheck } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const revalidate = 60; // ISR revalidação a cada 1 minuto

export const metadata: Metadata = {
  title: "Artigos, Guias e Análises Gamer • Central Editorial",
  description:
    "Explore guias de duração, análises críticas de notas do Metacritic, retrospectivas de franquias e dicas para organizar seu backlog gamer no MyGameList.",
  alternates: {
    canonical: "/artigos",
  },
  openGraph: {
    title: "Artigos, Guias e Análises Gamer • MyGameList",
    description:
      "Conteúdo editorial aprofundado sobre o universo dos videogames, tempo de jogo e notas da crítica.",
    url: `${SITE_URL}/artigos`,
    siteName: "MyGameList",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Artigos, Guias e Análises Gamer • MyGameList",
    description: "Guias, análises críticas e curiosidades do mundo dos videogames.",
    images: ["/og-image.jpg"],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Artigos e Guias Gamer MyGameList",
    description: "Hub editorial com artigos especializados sobre videogames, tempos e análises.",
    url: `${SITE_URL}/artigos`,
  },
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
        name: "Artigos & Guias",
        item: `${SITE_URL}/artigos`,
      },
    ],
  },
];

export default async function ArtigosPage() {
  const allArticles = await getCombinedArticles();
  const featured = allArticles.find((a) => a.featured) || allArticles[0];
  const regularArticles = allArticles.filter((a) => a.id !== featured?.id);

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="max-w-6xl mx-auto space-y-10 py-6 px-4">
        {/* Header Editorial */}
        <section className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#141822] p-8 sm:p-12 shadow-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CENTRAL EDITORIAL &amp; CURADORIA</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Artigos, Guias &amp; <br />
            <span className="gamer-gradient-text">Análises do Universo Gamer.</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
            Textos autorais preparados pela equipe do <strong>MyGameList</strong> para enriquecer sua experiência de jogo. Guias de tempo com HowLongToBeat, análises de notas do Metacritic e retrospectivas históricas.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Conteúdo 100% Humano e Autoral
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              Atualizações Semanais
            </span>
          </div>
        </section>

        {/* Artigo em Destaque Principal */}
        {featured && (
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              <Flame className="w-4 h-4 text-emerald-400" />
              <span>Destaque da Semana</span>
            </div>
            <ArticleCard article={featured} featured={true} />
          </section>
        )}

        {/* Grid de Demais Artigos */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-xl font-black text-white tracking-tight">
              Todos os Guias e Publicações
            </h2>
            <span className="text-xs text-gray-400 font-mono">
              {allArticles.length} artigos disponíveis
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
