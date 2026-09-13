"use client";

import React, { useState } from "react";
import { IndieGame } from "@/lib/types/indie.types";
import IndieVoteButton from "./IndieVoteButton";
import {
  ExternalLink,
  Globe,
  MessageSquare,
  Youtube,
  Music2,
  Twitter,
  Instagram,
  Share2,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { triggerSuccessHaptic } from "@/lib/capacitor";

interface IndieHeroCompactProps {
  game: IndieGame;
}

export default function IndieHeroCompact({ game }: IndieHeroCompactProps) {
  const [copied, setCopied] = useState(false);
  const [showAllLinks, setShowAllLinks] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${game.title} no MyGameList`,
          text: game.tagline,
          url,
        });
        triggerSuccessHaptic();
      } catch {
        // usuário cancelou
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      triggerSuccessHaptic();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const socialLinks = [
    { url: game.youtubeUrl, icon: Youtube, label: "YouTube", hoverClass: "hover:bg-red-500/20 hover:text-red-400" },
    { url: game.tiktokUrl, icon: Music2, label: "TikTok", hoverClass: "hover:bg-pink-500/20 hover:text-pink-400" },
    { url: game.twitterUrl, icon: Twitter, label: "Twitter / X", hoverClass: "hover:bg-sky-500/20 hover:text-sky-400" },
    { url: game.instagramUrl, icon: Instagram, label: "Instagram", hoverClass: "hover:bg-purple-500/20 hover:text-purple-400" },
    { url: game.studioWebsite, icon: Globe, label: "Site Oficial", hoverClass: "hover:bg-cyan-500/20 hover:text-cyan-400" },
  ].filter((item) => Boolean(item.url));

  return (
    <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#141822] p-4 sm:p-6 shadow-2xl space-y-4">
      {/* Banner de fundo sutil */}
      {game.bannerImage && (
        <div className="absolute inset-0 z-0 opacity-15 overflow-hidden pointer-events-none">
          <img
            src={game.bannerImage}
            alt=""
            className="w-full h-full object-cover blur-sm scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-[#141822]/85 to-transparent" />
        </div>
      )}

      {/* Grid Principal Compacto: Capa + Info */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
        {/* Capa Poster Proporcional e Compacta */}
        <div className="relative w-32 sm:w-44 aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-xl shrink-0">
          <img
            src={game.coverImage}
            alt={game.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Informações Centrais do Jogo */}
        <div className="flex-1 min-w-0 space-y-2.5 text-center sm:text-left w-full">
          {/* Badges de Topo */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-[11px] font-mono">
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase tracking-wider text-[10px]">
              PROJETO INDEPENDENTE
            </span>
            <span className="text-gray-400 truncate">
              Dev: <strong className="text-white">{game.developerName}</strong>
            </span>
            {game.publisherName && (
              <span className="text-gray-500 truncate hidden md:inline">
                • {game.publisherName}
              </span>
            )}
          </div>

          {/* Título Principal */}
          <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
            {game.title}
          </h1>

          {/* Tagline / Subtítulo */}
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-medium line-clamp-2 sm:line-clamp-3">
            {game.tagline}
          </p>

          {/* Tags de Plataformas e Gêneros (Pills Compactas e Uniformes) */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1 pt-0.5">
            {game.platforms.map((p) => (
              <span
                key={p}
                className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] sm:text-xs text-white font-mono"
              >
                {p}
              </span>
            ))}
            {game.genres.slice(0, 4).map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] sm:text-xs text-cyan-300 font-mono"
              >
                {g}
              </span>
            ))}
            {game.ageRating && (
              <span className="px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] sm:text-xs text-amber-300 font-mono font-bold">
                {game.ageRating}
              </span>
            )}
          </div>

          {/* Barra de Ações Padronizada (h-10 / 40px no mobile, compacta e alinhada) */}
          <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {/* Botão de Voto */}
            <IndieVoteButton
              gameId={game.id}
              initialVotesCount={game.votesCount || 0}
              initialVoters={game.voters || []}
              size="md"
              className="h-10"
            />

            {/* Wishlist na Steam */}
            {game.steamUrl && (
              <a
                href={game.steamUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 h-10 rounded-2xl bg-[#1b2838] hover:bg-[#2a475e] text-white font-bold text-xs shadow-md transition-colors shrink-0"
              >
                <span>Wishlist na Steam</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}

            {/* Discord */}
            {game.contactDiscord && (
              <a
                href={game.contactDiscord}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 h-10 rounded-2xl bg-[#5865F2]/20 hover:bg-[#5865F2]/30 text-[#5865F2] font-bold text-xs border border-[#5865F2]/40 transition-colors shrink-0"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Discord</span>
              </a>
            )}

            {/* Redes Sociais Inline Compactas (Icon buttons de 40x40px) */}
            {socialLinks.slice(0, 3).map((item, idx) => {
              const Icon = item.icon;
              return (
                <a
                  key={idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-10 h-10 rounded-2xl bg-white/5 text-gray-300 border border-white/10 flex items-center justify-center transition-colors shrink-0 ${item.hoverClass}`}
                  title={item.label}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}

            {/* Se houver mais redes ou links, botão de toggle recolhível */}
            {socialLinks.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllLinks(!showAllLinks)}
                className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                title={showAllLinks ? "Ocultar links adicionais" : "Ver mais links"}
              >
                {showAllLinks ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}

            {/* Botão de Compartilhamento Nativo */}
            <button
              type="button"
              onClick={handleShare}
              className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
              title="Compartilhar"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Links Expandidos caso existam mais de 3 redes sociais */}
          {showAllLinks && socialLinks.length > 3 && (
            <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 animate-fadeIn">
              {socialLinks.slice(3).map((item, idx) => {
                const Icon = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1.5 px-3 h-8 rounded-xl bg-white/5 text-gray-300 border border-white/10 text-xs font-medium transition-colors ${item.hoverClass}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
