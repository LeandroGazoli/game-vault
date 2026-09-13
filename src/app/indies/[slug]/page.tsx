import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchIndieBySlug, fetchApprovedIndies } from "@/lib/indieService";
import IndieVoteButton from "@/components/indies/IndieVoteButton";
import IndieCommentsSection from "@/components/indies/IndieCommentsSection";
import IndieDescriptionRenderer from "@/components/indies/IndieDescriptionRenderer";
import IndieMainContentTabs from "@/components/indies/IndieMainContentTabs";
import { getGameUrl } from "@/lib/routes";
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
  Monitor,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Play,
  Eye,
  AlertTriangle,
  Youtube,
  Twitter,
  Instagram,
  Music2,
  MessageSquare,
  Link2,
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
  const game = await fetchIndieBySlug(slug);

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
      <div className="max-w-5xl mx-auto space-y-8 py-6 px-4">
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

        {/* Hero Card do Jogo Indie */}
        <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#141822] p-6 sm:p-10 shadow-2xl space-y-6">
          {game.bannerImage && (
            <div className="absolute inset-0 z-0 opacity-15 overflow-hidden">
              <img
                src={game.bannerImage}
                alt=""
                className="w-full h-full object-cover blur-sm scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-[#141822]/80 to-transparent" />
            </div>
          )}

          <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 relative aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl max-w-[240px] mx-auto md:max-w-none">
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
                  Desenvolvedor: <strong className="text-white">{game.developerName}</strong>
                </span>
                {game.publisherName && (
                  <span className="text-xs text-gray-500 font-mono">
                    • Publisher: <strong className="text-gray-300">{game.publisherName}</strong>
                  </span>
                )}
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
                {game.ageRating && (
                  <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-mono font-bold">
                    {game.ageRating}
                  </span>
                )}
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

                {game.studioWebsite && (
                  <a
                    href={game.studioWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs border border-white/10 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Site Oficial</span>
                  </a>
                )}

                {game.contactDiscord && (
                  <a
                    href={game.contactDiscord}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#5865F2] font-bold text-xs border border-[#5865F2]/40 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Discord</span>
                  </a>
                )}

                {game.youtubeUrl && (
                  <a
                    href={game.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 border border-white/10 transition-colors"
                    title="Canal no YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                  </a>
                )}

                {game.tiktokUrl && (
                  <a
                    href={game.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-white/5 hover:bg-pink-500/20 text-gray-300 hover:text-pink-400 border border-white/10 transition-colors"
                    title="Perfil no TikTok"
                  >
                    <Music2 className="w-4 h-4" />
                  </a>
                )}

                {game.twitterUrl && (
                  <a
                    href={game.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-white/5 hover:bg-sky-500/20 text-gray-300 hover:text-sky-400 border border-white/10 transition-colors"
                    title="Perfil no Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}

                {game.instagramUrl && (
                  <a
                    href={game.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-2xl bg-white/5 hover:bg-purple-500/20 text-gray-300 hover:text-purple-400 border border-white/10 transition-colors"
                    title="Perfil no Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Layout em 2 Colunas: Conteúdo Principal com Abas (Esquerda) vs Ficha Técnica (Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Coluna Principal com Abas (Visão Geral, Notas do Dev, Mídias) */}
          <div className="lg:col-span-7 space-y-6">
            <IndieMainContentTabs game={game} embedUrl={embedUrl} />
          </div>

          {/* Coluna Lateral: Ficha Técnica Completa (Padrão GameDetail) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-[#141822] p-6 space-y-4">
              <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-white/10">
                <Monitor className="w-4 h-4 text-emerald-400" />
                <span>Ficha Técnica do Jogo</span>
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-gray-400">Desenvolvedora:</span>
                  <span className="font-semibold text-emerald-400">{game.developerName}</span>
                </div>

                {game.publisherName && (
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Distribuidora:</span>
                    <span className="font-semibold text-white">{game.publisherName}</span>
                  </div>
                )}

                {game.releaseDate && (
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Lançamento:</span>
                    <span className="font-mono text-gray-200">{game.releaseDate}</span>
                  </div>
                )}

                {game.gameModes && game.gameModes.length > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Modos de Jogo:</span>
                    <span className="font-semibold text-white">{game.gameModes.join(", ")}</span>
                  </div>
                )}

                {game.playerPerspectives && game.playerPerspectives.length > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Câmera / Visão:</span>
                    <span className="font-semibold text-white">
                      {game.playerPerspectives.join(", ")}
                    </span>
                  </div>
                )}

                {game.themes && game.themes.length > 0 && (
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Temas:</span>
                    <span className="font-semibold text-cyan-300">{game.themes.join(", ")}</span>
                  </div>
                )}

                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-gray-400">Classificação:</span>
                  <span className="font-bold text-amber-400">{game.ageRating || "Livre"}</span>
                </div>

                {/* Localização PT-BR */}
                {game.ptbrSupport && (
                  <div className="flex justify-between py-1.5 border-b border-white/5">
                    <span className="text-gray-400">Português (Brasil):</span>
                    <span className="font-semibold text-emerald-400">
                      {game.ptbrSupport.audio
                        ? "Dublado & Legendado 🇧🇷"
                        : game.ptbrSupport.subtitles
                        ? "Legendas & Interface 🇧🇷"
                        : "Interface 🇧🇷"}
                    </span>
                  </div>
                )}
              </div>

              {/* Plataformas */}
              <div className="pt-2">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Plataformas:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {game.platforms.map((plat) => (
                    <span
                      key={plat}
                      className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-gray-300"
                    >
                      {plat}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Vínculo com Catálogo Principal (IGDB / RAWG) */}
            {game.linkedGameId && (
              <div className="rounded-3xl border border-cyan-500/30 bg-cyan-500/5 p-5 space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                  <Link2 className="w-4 h-4" />
                  <span>Catálogo Principal Game Vault</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Este título indie está conectado à base oficial. Adicione ao seu backlog, registre seu tempo de jogo e sincronize com sua biblioteca.
                </p>
                <Link
                  href={getGameUrl({
                    id: game.linkedGameId,
                    name: game.linkedGameName || game.title,
                    slug: game.linkedGameSlug,
                  })}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-colors"
                >
                  <Gamepad2 className="w-4 h-4" />
                  <span>Ver no Catálogo do Vault</span>
                </Link>
              </div>
            )}

            {/* Banner Informativo de Criador */}
            <div className="rounded-3xl border border-purple-500/20 bg-purple-500/5 p-5 space-y-2">
              <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" /> Desenvolvedor Certificado
              </span>
              <p className="text-xs text-gray-400 leading-relaxed">
                Este jogo foi aprovado pela curadoria comunitária do MyGameList. Criadores recebem a insígnia oficial de desenvolvedor no seu perfil.
              </p>
            </div>
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
