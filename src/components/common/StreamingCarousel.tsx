"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

export interface StreamingCarouselProps {
  children: React.ReactNode;
  className?: string;
  itemGapClass?: string;
  scrollAmountRatio?: number;
}

/**
 * Container horizontal fluido estilo streaming (Netflix / Prime Video / Xbox Cloud).
 * Oferece setas flutuantes sobre o conteúdo, scroll snap nativo, suporte a touch swipe,
 * mouse wheel e acessibilidade via teclado. 100% de superfícies sólidas.
 */
export default function StreamingCarousel({
  children,
  className = "",
  itemGapClass = "gap-3 sm:gap-4",
  scrollAmountRatio = 0.75,
}: StreamingCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScrollability();

    const handleScroll = () => {
      checkScrollability();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", checkScrollability);

    // Checagem de mutação dos filhos para recalcular largura
    const observer = new ResizeObserver(() => {
      checkScrollability();
    });
    observer.observe(el);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", checkScrollability);
      observer.disconnect();
    };
  }, [checkScrollability, children]);

  const handleScroll = (direction: "left" | "right") => {
    triggerSelectionHaptic();
    const el = containerRef.current;
    if (!el) return;

    const offset = el.clientWidth * scrollAmountRatio;
    el.scrollBy({
      left: direction === "left" ? -offset : offset,
      behavior: "smooth",
    });
  };

  return (
    <div className={`relative group/carousel w-full ${className}`}>
      {/* Seta Flutuante Esquerda */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => handleScroll("left")}
          aria-label="Rolar para a esquerda"
          className="absolute left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#181d28] hover:bg-[#222938] text-white border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Container de Rolagem Horizontal */}
      <div
        ref={containerRef}
        className={`flex items-stretch ${itemGapClass} overflow-x-auto no-scrollbar scrollbar-none snap-x snap-mandatory py-1.5 -mx-1 px-1 sm:mx-0 sm:px-0`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {children}
      </div>

      {/* Seta Flutuante Direita */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => handleScroll("right")}
          aria-label="Rolar para a direita"
          className="absolute right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#181d28] hover:bg-[#222938] text-white border border-white/20 flex items-center justify-center transition-all shadow-2xl active:scale-95 cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
