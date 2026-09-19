"use client";

import React, { useState } from "react";
import Link from "next/link";
import { IndieGame } from "@/lib/types/indie.types";
import { getGameUrl } from "@/lib/routes";
import { Gamepad2, Sparkles, Heart } from "lucide-react";

interface IndieSpotlightCardProps {
  indie: IndieGame;
  className?: string;
}

export default function IndieSpotlightCard({
  indie,
  className = "",
}: IndieSpotlightCardProps) {
  const [imageError, setImageError] = useState(false);

  const targetUrl =
    indie.isCatalogGame && indie.linkedGameId
      ? getGameUrl({
          id: indie.linkedGameId,
          name: indie.linkedGameName || indie.title,
          slug: indie.linkedGameSlug,
        })
      : `/indies/${indie.slug}`;

  // Prioriza banner 16:9, depois screenshots widescreen, depois capa
  const displayImage =
    indie.bannerImage ||
    (indie.screenshots && indie.screenshots.length > 0
      ? indie.screenshots[0]
      : null) ||
    indie.coverImage;

  return (
    <div
      className={`group relative flex-shrink-0 w-64 sm:w-72 md:w-80 aspect-video rounded-2xl overflow-hidden bg-[#141822] border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-950/20 select-none cursor-pointer snap-start ${className}`}
    >
      <Link href={targetUrl} className="block w-full h-full relative" prefetch={false}>
        {/* Imagem de Fundo 16:9 */}
        {displayImage && !imageError ? (
          <img
            src={displayImage}
            alt={indie.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4 text-center text-xs text-neutral-400 font-medium bg-[#161a26]">
            <Gamepad2 className="w-8 h-8 text-neutral-600 mb-1 block mx-auto" />
            <span className="line-clamp-2">{indie.title}</span>
          </div>
        )}

        {/* Gradiente de Leitura */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e1118] via-[#0e1118]/60 to-transparent pointer-events-none" />

        {/* Badges de Topo */}
        <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/25 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold uppercase tracking-wider shadow-sm">
            {indie.isCatalogGame ? (
              <>
                <Gamepad2 className="w-3 h-3 text-emerald-300" />
                <span>Acervo</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-emerald-300" />
                <span>Indie</span>
              </>
            )}
          </span>

          {typeof indie.votesCount === "number" && indie.votesCount > 0 ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-bold shadow-sm">
              <Heart className="w-2.5 h-2.5 text-rose-400 fill-rose-400" />
              <span>{indie.votesCount}</span>
            </span>
          ) : indie.genres && indie.genres.length > 0 ? (
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-neutral-300 text-[10px] font-mono truncate max-w-[100px] shadow-sm">
              {indie.genres[0]}
            </span>
          ) : null}
        </div>

        {/* Informações na Base */}
        <div className="absolute inset-x-0 bottom-0 p-3 flex flex-col justify-end pointer-events-none z-10">
          <h3 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-400 transition-colors line-clamp-1 drop-shadow-md">
            {indie.title}
          </h3>
          <p className="text-[11px] text-gray-300 truncate mt-0.5 drop-shadow-sm font-medium">
            Por {indie.developerName}
            {indie.tagline ? ` • ${indie.tagline}` : ""}
          </p>
        </div>
      </Link>
    </div>
  );
}
