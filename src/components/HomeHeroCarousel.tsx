"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { HeroCarouselItem, Game } from "@/lib/types";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface HomeHeroCarouselProps {
  items?: HeroCarouselItem[];
  fallbackGames?: Game[];
  maxItems?: number;
}

export default function HomeHeroCarousel({
  items,
  fallbackGames = [],
  maxItems = 5,
}: HomeHeroCarouselProps) {
  // Combina itens configurados pelo Admin ou usa fallback dos jogos mais populares
  const carouselItems = React.useMemo(() => {
    if (items && items.length > 0) {
      return items.slice(0, maxItems);
    }

    if (fallbackGames && fallbackGames.length > 0) {
      return fallbackGames.slice(0, maxItems).map((g) => ({
        id: String(g.id),
        gameId: g.id,
        title: g.name,
        subtitle: g.metacritic ? `Nota Metacritic: ${g.metacritic}/100 • Aclamado pela crítica` : "Destaque da comunidade gamer",
        bannerUrl: g.background_image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
        linkUrl: `/game/${g.id}/${g.slug}`,
        tag: g.metacritic && g.metacritic >= 90 ? "OBRA-PRIMA" : "EM DESTAQUE",
      }));
    }

    return [];
  }, [items, fallbackGames, maxItems]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    if (carouselItems.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % carouselItems.length);
  }, [carouselItems.length]);

  const prevSlide = useCallback(() => {
    if (carouselItems.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
  }, [carouselItems.length]);

  // Autoplay a cada 5.5 segundos quando não pausado
  useEffect(() => {
    if (isPaused || carouselItems.length <= 1) return;
    const interval = setInterval(nextSlide, 5500);
    return () => clearInterval(interval);
  }, [isPaused, carouselItems.length, nextSlide]);

  // Touch Swipe para dispositivos móveis
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      triggerSelectionHaptic();
      nextSlide();
    } else if (diff < -50) {
      triggerSelectionHaptic();
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (carouselItems.length === 0) return null;

  const currentItem = carouselItems[currentIndex];

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-[#141414] shadow-2xl group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner Widescreen 16:9 com Transição Suave */}
      <div className="relative aspect-[16/9] sm:aspect-[21/9] md:aspect-[2.4/1] w-full overflow-hidden bg-black">
        {carouselItems.map((item, index) => {
          const isActive = index === currentIndex;
          return (
            <div
              key={item.id || index}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              <img
                src={item.bannerUrl}
                alt={item.title}
                className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-[1.03] transition-transform duration-1000"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80";
                }}
              />

              {/* Gradientes de contraste — usa nova cor de fundo */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/85 via-[#141414]/20 to-transparent hidden sm:block" />

              {/* Informações do Jogo */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-7 md:p-8 z-20 space-y-2 max-w-2xl">
                {item.tag && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 border border-white/25 text-white font-mono font-extrabold text-[10px] tracking-wider uppercase backdrop-blur-md">
                    <Sparkles className="w-3 h-3 text-white/80" />
                    <span>{item.tag}</span>
                  </div>
                )}

                <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight drop-shadow-md line-clamp-1">
                  {item.title}
                </h2>

                {item.subtitle && (
                  <p className="text-xs sm:text-sm text-gray-300 line-clamp-2 drop-shadow leading-relaxed font-medium hidden sm:block">
                    {item.subtitle}
                  </p>
                )}

                <div className="pt-1 flex items-center gap-3">
                  <Link
                    href={item.linkUrl}
                    onClick={() => triggerSelectionHaptic()}
                    className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-neutral-100 text-black font-extrabold text-xs transition-all shadow-lg active:scale-95"
                  >
                    <span>Ver Detalhes</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* Botões Laterais de Navegação (Desktop) */}
        {carouselItems.length > 1 && (
          <>
            <button
              onClick={() => {
                triggerSelectionHaptic();
                prevSlide();
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
              aria-label="Slide anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                triggerSelectionHaptic();
                nextSlide();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
              aria-label="Próximo slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      {/* Indicadores de Paginação — estilo Xbox */}
      {carouselItems.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 py-3 bg-[#141414]/95 border-t border-white/[0.06]">
          {carouselItems.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                onClick={() => {
                  triggerSelectionHaptic();
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "w-8 bg-white shadow-[0_0_6px_rgba(255,255,255,0.5)]"
                    : "w-2.5 bg-white/25 hover:bg-white/40"
                }`}
                aria-label={`Ir para o slide ${idx + 1}`}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
