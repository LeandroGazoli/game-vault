import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchIndieBySlugServer } from "@/lib/serverData";
import IndieCommentsSection from "@/components/indies/IndieCommentsSection";
import IndieMainContentTabs from "@/components/indies/IndieMainContentTabs";
import IndieHeroCompact from "@/components/indies/IndieHeroCompact";
import IndieSpecsCompact from "@/components/indies/IndieSpecsCompact";
import JsonLd from "@/components/seo/JsonLd";
import AdBanner from "@/components/ads/AdBanner";
import { ArrowLeft, Eye } from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await fetchIndieBySlugServer(slug);

  if (!game) {
    return {
      title: "Jogo Indie não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const title = `${game.title} (Jogo Indie) • Apoie e Vote no MyGameList`;
  const canonicalUrl = `${SITE_URL}/indies/${slug}`;

  return {
    title,
    description: game.tagline || game.description.slice(0, 160),
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description: game.tagline,
      url: canonicalUrl,
      siteName: "MyGameList",
      type: "website",
      images: [{ url: game.bannerImage || game.coverImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: game.tagline,
      images: [game.bannerImage || game.coverImage],
    },
  };
}

function getMediaEmbedUrl(url?: string): string | null {
  if (!url) return null;
  // Suporte a Google Drive Preview Player (ex: https://drive.google.com/file/d/{id}/preview)
  if (url.includes("drive.google.com/file/d/")) {
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch && driveMatch[1]) {
      return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    }
  }
  // Suporte a YouTube
  const ytRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(ytRegExp);
  return match && match[2].length === 11
    ? `https://www.youtube-nocookie.com/embed/${match[2]}`
    : null;
}

export default async function IndieGameDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const game = await fetchIndieBySlugServer(slug);

  if (!game) {
    notFound();
  }

  const videoGameSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.tagline,
    image: game.coverImage,
    genre: game.genres,
    gamePlatform: game.platforms,
    author: {
      "@type": "Organization",
      name: game.developerName,
    },
    url: `${SITE_URL}/indies/${slug}`,
  };

  const embedUrl = getMediaEmbedUrl(game.trailerUrl);

  return (
    <>
      <JsonLd data={[videoGameSchema]} />
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8 py-4 sm:py-6 px-3 sm:px-4">
        {/* Voltar ao Hub */}
        <Link
          href="/indies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Indie Hub
        </Link>

        {/* Barra de Modo Preview para Rascunho / Em Análise */}
        {game.status !== "approved" && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Eye className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-300 uppercase tracking-wider font-mono">
                    Modo de Preview (Rascunho)
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase">
                    Status: {game.status}
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Esta página está visível em modo de pré-visualização para análise antes da publicação oficial.
                </p>
              </div>
            </div>
            <Link
              href="/admin/indies"
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors shrink-0 whitespace-nowrap"
            >
              Ir para Painel de Moderação
            </Link>
          </div>
        )}

        {/* Hero Card do Jogo Indie (Compacto & Mobile-First) */}
        <IndieHeroCompact game={game} />

        {/* Layout em 2 Colunas: Conteúdo Principal com Abas (Esquerda) vs Ficha Técnica Retrátil (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Coluna Principal com Abas (Visão Geral, Notas do Dev, Mídias) */}
          <div className="lg:col-span-7 space-y-6">
            <IndieMainContentTabs game={game} embedUrl={embedUrl} />
          </div>

          {/* Coluna Lateral: Ficha Técnica Retrátil (Progressive Disclosure) */}
          <div className="lg:col-span-5 space-y-6">
            <IndieSpecsCompact game={game} />
          </div>
        </div>

        {/* Publicidade em Conteúdo */}
        <div>
          <AdBanner slot="GAME_DETAIL_IN_CONTENT" />
        </div>

        {/* Mural de Comentários & Apoio */}
        <IndieCommentsSection gameId={game.id} gameTitle={game.title} />
      </div>
    </>
  );
}
