import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchApprovedIndies } from "@/lib/indieService";
import IndieGameCard from "@/components/indies/IndieGameCard";
import JsonLd from "@/components/seo/JsonLd";
import AdBanner from "@/components/ads/AdBanner";
import { Gamepad2, Plus, Sparkles, Heart, Trophy } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const revalidate = 60; // ISR 1 minuto

export const metadata: Metadata = {
  title: "Jogos Indie & Comunidade • Votação e Apoio a Criadores",
  description:
    "Descubra, jogue e apoie jogos de desenvolvedores independentes brasileiros e mundiais. Vote nos seus favoritos e ajude a comunidade indie a crescer no MyGameList.",
  alternates: {
    canonical: "/indies",
  },
  openGraph: {
    title: "Jogos Indie & Comunidade • MyGameList",
    description: "Espaço gratuito de fomento e votação para jogos de criadores independentes.",
    url: `${SITE_URL}/indies`,
    siteName: "MyGameList",
    type: "website",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jogos Indie & Comunidade • MyGameList",
    description: "Apoie desenvolvedores independentes votando nos seus títulos preferidos.",
    images: ["/og-image.jpg"],
  },
};

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Hub de Jogos Independentes MyGameList",
    description: "Plataforma de exposição, votação e comentários para desenvolvedores indie.",
    url: `${SITE_URL}/indies`,
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Indie Hub", item: `${SITE_URL}/indies` },
    ],
  },
];

export default async function IndiesPage() {
  const approvedGames = await fetchApprovedIndies("votes");

  return (
    <>
      <JsonLd data={structuredData} />
      <div className="max-w-6xl mx-auto space-y-10 py-6 px-4">
        {/* Hero do Ecossistema Indie */}
        <section className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#141822] p-8 sm:p-12 shadow-2xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>INDIE SPOTLIGHT &amp; COMUNIDADE</span>
            </div>

            <Link
              href="/indies/cadastrar"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" /> Cadastre Seu Jogo Grátis
            </Link>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            A Nova Geração de <br />
            <span className="gamer-gradient-text">Jogos Independentes.</span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-2xl">
            Conheça projetos incríveis criados por estúdios independentes e desenvolvedores iniciantes. Vote para impulsionar os melhores títulos, deixe seu feedback direto aos criadores e adicione à sua lista de desejos.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 text-rose-400" />
              Votação Aberta à Comunidade
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
              Divulgação 100% Gratuita para Criadores
            </span>
          </div>
        </section>

        {/* Grade de Jogos Aprovados */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-black text-white tracking-tight">
                Mais Votados pela Comunidade
              </h2>
            </div>
            <span className="text-xs text-gray-400 font-mono">
              {approvedGames.length} projetos catalogados
            </span>
          </div>

          {approvedGames.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-[#141822] border border-white/10 space-y-3">
              <Gamepad2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Nenhum jogo indie em exibição no momento</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Você é desenvolvedor ou conhece um jogo independente brasileiro? Cadastre o projeto gratuitamente e ganhe destaque no MyGameList.
              </p>
              <Link
                href="/indies/cadastrar"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs"
              >
                Submeter Jogo Indie
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedGames.map((game) => (
                <IndieGameCard key={game.id} game={game} />
              ))}
            </div>
          )}
        </section>

        {/* Publicidade em Conteúdo */}
        <div className="pt-4">
          <AdBanner slot="HOME_IN_FEED" />
        </div>
      </div>
    </>
  );
}
