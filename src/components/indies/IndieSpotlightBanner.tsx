"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IndieGame, IndieSpotlightLocation } from "@/lib/types/indie.types";
import { Sparkles, ChevronRight, X } from "lucide-react";
import StreamingCarousel from "@/components/common/StreamingCarousel";
import IndieSpotlightCard from "./IndieSpotlightCard";
import IndieSpotlightViewAllCard from "./IndieSpotlightViewAllCard";

interface IndieSpotlightBannerProps {
  location: IndieSpotlightLocation;
  className?: string;
  title?: string;
}

export default function IndieSpotlightBanner({
  location,
  className = "",
  title = "Destaques Indie",
}: IndieSpotlightBannerProps) {
  const [indies, setIndies] = useState<IndieGame[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch(`/api/indies?location=${encodeURIComponent(location)}&spotlight=true`)
      .then((res) => (res.ok ? (res.json() as Promise<{ indies?: IndieGame[] }>) : null))
      .then((data) => {
        if (isMounted) {
          setIndies(data?.indies || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [location]);

  if (isDismissed) {
    return null;
  }

  if (loading) {
    return (
      <div className={`space-y-2.5 ${className}`} aria-busy="true" aria-label="Carregando destaques indie">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-white/10 animate-pulse" />
            <div className="w-32 h-5 rounded bg-white/10 animate-pulse" />
          </div>
        </div>
        <div className="flex items-stretch gap-3 sm:gap-4 overflow-hidden py-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-64 sm:w-72 md:w-80 aspect-video rounded-2xl bg-[#141822] border border-white/5 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (indies.length === 0) {
    return null;
  }

  return (
    <section
      className={`space-y-2.5 relative group/indies-spotlight ${className}`}
      aria-label="Jogos independentes em destaque"
    >
      {/* Cabeçalho do Slider */}
      <div className="flex items-center justify-between px-1">
        <Link
          href="/indies"
          className="flex items-center gap-2 group/title hover:opacity-90 transition-opacity"
        >
          <Sparkles className="w-5 h-5 text-emerald-400 group-hover/title:scale-110 transition-transform" />
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight font-display group-hover/title:text-emerald-400 transition-colors">
            {title}
          </h2>
          <span className="hidden sm:inline text-xs text-neutral-400 font-normal">
            • Comunidade & Criadores
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/indies"
            className="text-xs sm:text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-0.5 group/btn"
          >
            <span>Ver todos</span>
            <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </Link>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="p-1 rounded-lg text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors cursor-pointer"
            title="Ocultar destaques temporariamente"
            aria-label="Ocultar destaques temporariamente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider Horizontal Estilo Streaming com Cards 16:9 */}
      <StreamingCarousel itemGapClass="gap-3 sm:gap-4">
        {indies.map((indie) => (
          <IndieSpotlightCard key={indie.id} indie={indie} />
        ))}

        {/* Card 'Ver Todos' ao Final da Fila */}
        <IndieSpotlightViewAllCard href="/indies" totalCount={indies.length} />
      </StreamingCarousel>
    </section>
  );
}
