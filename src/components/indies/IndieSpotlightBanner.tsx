"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IndieGame, IndieSpotlightLocation } from "@/lib/types/indie.types";
import { fetchSpotlightIndies } from "@/lib/indieService";
import { Sparkles, ArrowRight, Heart, X, Gamepad2, ChevronLeft, ChevronRight } from "lucide-react";

interface IndieSpotlightBannerProps {
  location: IndieSpotlightLocation;
  className?: string;
}

export default function IndieSpotlightBanner({
  location,
  className = "",
}: IndieSpotlightBannerProps) {
  const [indies, setIndies] = useState<IndieGame[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchSpotlightIndies(location)
      .then((data) => {
        if (isMounted) {
          setIndies(data);
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

  // Rodízio automático a cada 8 segundos se houver mais de 1 destaque
  useEffect(() => {
    if (indies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % indies.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [indies.length]);

  const indie = indies[currentIndex] || null;

  if (loading || !indie || isDismissed) {
    return null;
  }

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#141822] via-[#10141d] to-[#141822] border border-emerald-500/30 p-3.5 sm:p-4 shadow-xl overflow-hidden transition-all ${className}`}
    >
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

      {/* Botão de Fechar Mobile (fixo no canto superior direito para liberar espaço ao conteúdo) */}
      <button
        onClick={() => setIsDismissed(true)}
        className="sm:hidden absolute top-2.5 right-2.5 p-1.5 rounded-lg text-gray-400 hover:text-white bg-white/5 active:bg-white/10 transition-colors z-20 cursor-pointer"
        title="Fechar banner temporariamente"
        aria-label="Fechar banner temporariamente"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 relative z-10">
        {/* Lado Esquerdo: Capa e Informações do Jogo */}
        <div className="flex items-center gap-3 min-w-0 pr-8 sm:pr-0">
          <Link
            href={`/indies/${indie.slug}`}
            className="relative w-12 h-16 sm:w-14 sm:h-18 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0 shadow-md block hover:opacity-90 active:scale-95 transition-all"
          >
            <img
              src={indie.coverImage}
              alt={indie.title}
              className="w-full h-full object-cover"
            />
          </Link>

          <div className="min-w-0 flex-1 space-y-0.5 sm:space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Gamepad2 className="w-3 h-3 text-emerald-400" /> Indie Spotlight
              </span>
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                Apoie Desenvolvedores Independentes
              </span>
            </div>

            <Link
              href={`/indies/${indie.slug}`}
              className="block group"
            >
              <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-emerald-400 transition-colors truncate max-w-sm sm:max-w-md">
                {indie.title}
              </h4>
            </Link>

            <p className="text-[11px] text-gray-400 truncate max-w-xs sm:max-w-lg">
              Por <strong className="text-gray-300 font-medium">{indie.developerName}</strong>
              {indie.tagline ? ` • ${indie.tagline}` : ""}
            </p>
          </div>
        </div>

        {/* Lado Direito: Ações (Conhecer/Votar) + Paginação */}
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
          {indies.length > 1 && (
            <div className="flex items-center gap-1 mr-1">
              {indies.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? "w-4 bg-emerald-400"
                      : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                  title={`Destaque ${idx + 1} de ${indies.length}`}
                  aria-label={`Ir para destaque ${idx + 1}`}
                />
              ))}
            </div>
          )}

          <Link
            href={`/indies/${indie.slug}`}
            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] sm:text-xs shadow-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap text-center"
          >
            <span>Conhecer &amp; Votar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Botão de Fechar Desktop */}
          <button
            onClick={() => setIsDismissed(true)}
            className="hidden sm:inline-flex p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
            title="Fechar banner temporariamente"
            aria-label="Fechar banner temporariamente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
