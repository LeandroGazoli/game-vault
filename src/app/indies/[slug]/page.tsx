import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchIndieBySlug, fetchApprovedIndies } from "@/lib/indieService";
import IndieVoteButton from "@/components/indies/IndieVoteButton";
import IndieCommentsSection from "@/components/indies/IndieCommentsSection";
import JsonLd from "@/components/seo/JsonLd";
import AdBanner from "@/components/ads/AdBanner";
import {
  ArrowLeft,
  Gamepad2,
  ExternalLink,
  Calendar,
  Globe,
  Share2,
  Layers,
  Heart,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const revalidate = 60;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const game = await fetchIndieBySlug(slug);

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
      images: [{ url: game.coverImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: game.tagline,
      images: [game.coverImage],
    },
  };
}

export default async function IndieDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const game = await fetchIndieBySlug(slug);

  if (!game) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/indies/${slug}`;

  const videoGameSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.title,
    description: game.description,
    image: game.coverImage,
    url: canonicalUrl,
    genre: game.genres,
    gamePlatform: game.platforms,
    author: {
      "@type": "Organization",
      name: game.developerName,
      url: game.studioWebsite,
    },
  };

  return (
    <>
      <JsonLd data={[videoGameSchema]} />
      <div className="max-w-4xl mx-auto space-y-8 py-6 px-4">
        {/* Voltar ao Hub */}
        <Link
          href="/indies"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o Indie Hub
        </Link>

        {/* Hero Card do Jogo Indie */}
        <div className="rounded-[32px] overflow-hidden border border-white/10 bg-[#141822] p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl max-w-[240px] mx-auto md:max-w-none">
              <img
                src={game.coverImage}
                alt={game.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider font-mono">
                  PROJETO INDEPENDENTE
                </span>
                <span className="text-xs text-gray-400 font-mono">
                  Criado por <strong className="text-white">{game.developerName}</strong>
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                {game.title}
              </h1>

              <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-medium">
                {game.tagline}
              </p>

              {/* Gêneros e Plataformas */}
              <div className="flex flex-wrap gap-2 pt-1">
                {game.platforms.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs text-white font-mono"
                  >
                    {p}
                  </span>
                ))}
                {game.genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-300 font-mono"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Ações de Apoio e Wishlist */}
              <div className="pt-3 flex flex-wrap items-center gap-3">
                <IndieVoteButton
                  gameId={game.id}
                  initialVotesCount={game.votesCount || 0}
                  initialVoters={game.voters || []}
                  size="lg"
                />

                {game.steamUrl && (
                  <a
                    href={game.steamUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#1b2838] hover:bg-[#2a475e] text-white font-bold text-xs shadow-md transition-colors"
                  >
                    <span>Wishlist na Steam</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                {game.itchUrl && (
                  <a
                    href={game.itchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#fa5c5c]/20 hover:bg-[#fa5c5c]/30 text-[#fa5c5c] font-bold text-xs border border-[#fa5c5c]/40 transition-colors"
                  >
                    <span>Jogar no Itch.io</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sinopse & Apresentação */}
        <section className="rounded-3xl border border-white/10 bg-[#141822] p-6 sm:p-8 space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-white tracking-tight border-b border-white/10 pb-3">
            Sobre o Projeto &amp; Visão do Desenvolvedor
          </h2>
          <div className="text-sm sm:text-base text-gray-300 leading-relaxed space-y-4 whitespace-pre-line">
            {game.description}
          </div>
        </section>

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
