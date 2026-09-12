"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { IndieGame, IndieSpotlightLocation } from "@/lib/types/indie.types";
import { fetchSpotlightIndie } from "@/lib/indieService";
import { Sparkles, ArrowRight, Heart, X, Gamepad2 } from "lucide-react";

interface IndieSpotlightBannerProps {
  location: IndieSpotlightLocation;
  className?: string;
}

export default function IndieSpotlightBanner({
  location,
  className = "",
}: IndieSpotlightBannerProps) {
  const [indie, setIndie] = useState<IndieGame | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchSpotlightIndie(location)
      .then((data) => {
        if (isMounted) {
          setIndie(data);
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

  if (loading || !indie || isDismissed) {
    return null;
  }

  return (
    <div
      className={`relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-r from-[#141822] via-[#10141d] to-[#141822] border border-emerald-500/30 p-3.5 sm:p-4 shadow-xl overflow-hidden transition-all ${className}`}
    >
      <div className="pointer-events-none absolute -right-10 -bottom-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />

      <div className="flex items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative w-12 h-16 sm:w-14 sm:h-18 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0 shadow-md">
            <img
              src={indie.coverImage}
              alt={indie.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                <Gamepad2 className="w-3 h-3 text-emerald-400" /> Indie Spotlight
              </span>
              <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">
                Apoie Desenvolvedores Independentes
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-black text-white truncate max-w-sm sm:max-w-md">
              {indie.title}
            </h4>

            <p className="text-[11px] text-gray-400 truncate max-w-xs sm:max-w-lg">
              Por <strong className="text-gray-300">{indie.developerName}</strong> • {indie.tagline}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/indies/${indie.slug}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-[11px] sm:text-xs shadow-md transition-transform hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span>Conhecer &amp; Votar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 transition-colors"
            title="Fechar banner temporariamente"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
