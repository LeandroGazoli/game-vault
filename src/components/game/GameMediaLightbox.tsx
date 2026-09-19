"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import { GalleryMediaItem } from "./gameDetailHelpers";

export interface GameMediaLightboxProps {
  items: GalleryMediaItem[];
  currentIndex: number | null;
  onClose: () => void;
  onSelectIndex: (index: number) => void;
}

export default function GameMediaLightbox({
  items,
  currentIndex,
  onClose,
  onSelectIndex,
}: GameMediaLightboxProps) {
  const [mounted, setMounted] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOpen = currentIndex !== null && items.length > 0;
  const currentItem = isOpen && currentIndex !== null ? items[currentIndex] : null;

  const goToNextImage = useCallback(() => {
    if (currentIndex === null || items.length === 0) return;
    triggerSelectionHaptic();
    onSelectIndex((currentIndex + 1) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  const goToPrevImage = useCallback(() => {
    if (currentIndex === null || items.length === 0) return;
    triggerSelectionHaptic();
    onSelectIndex((currentIndex - 1 + items.length) % items.length);
  }, [currentIndex, items.length, onSelectIndex]);

  // Bloqueio de rolagem da página de fundo e atalhos de teclado
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNextImage();
      if (e.key === "ArrowLeft") goToPrevImage();
      if (e.key === "Escape") {
        triggerSelectionHaptic();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, goToNextImage, goToPrevImage, onClose]);

  // Mantém a miniatura selecionada centralizada no carrossel inferior
  useEffect(() => {
    if (currentIndex !== null && activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goToNextImage();
      else goToPrevImage();
    }
    setTouchStartX(null);
  };

  if (!isOpen || !currentItem || !mounted || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Galeria de imagens do jogo"
      className="fixed inset-0 z-[999] !m-0 !mt-0 flex flex-col justify-between bg-black/95 backdrop-blur-2xl animate-fadeIn select-none pt-safe-offset pb-safe-offset pt-[max(calc(env(safe-area-inset-top,0px)+16px),3rem)] pb-[max(calc(env(safe-area-inset-bottom,0px)+16px),1.75rem)] pl-[max(env(safe-area-inset-left,0px),1rem)] pr-[max(env(safe-area-inset-right,0px),1rem)] sm:pt-6 sm:pb-6 sm:px-6"
      onClick={onClose}
    >
      {/* Barra Superior com proteção total para Dynamic Island, Câmeras de Celular e Status Bar */}
      <div
        className="flex items-center justify-between w-full max-w-7xl mx-auto z-20 pb-3 gap-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {currentItem.type === "artwork" ? (
            <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm truncate">
              Arte Oficial <span className="hidden sm:inline">(Key Art 1080p)</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/10 text-gray-200 border border-white/20 shadow-sm truncate">
              Captura de Tela <span className="hidden sm:inline">(1080p)</span>
            </span>
          )}

          <span className="text-[11px] sm:text-xs font-mono font-medium text-gray-400 shrink-0">
            {currentIndex + 1} de {items.length}
          </span>
        </div>

        {/* Botão Fechar Padronizado: área de toque ergonômica (min 44px) e posicionamento seguro */}
        <button
          type="button"
          onClick={() => {
            triggerSelectionHaptic();
            onClose();
          }}
          className="h-11 min-w-[44px] px-3.5 sm:px-4 rounded-full bg-neutral-800/80 hover:bg-neutral-700 active:scale-95 text-white transition-all flex items-center justify-center gap-2 border border-white/20 hover:border-white/35 cursor-pointer shadow-xl backdrop-blur-md shrink-0"
          title="Fechar (Esc)"
          aria-label="Fechar visualização de imagem"
        >
          <span className="text-xs font-bold hidden sm:inline">Fechar</span>
          <X className="w-5 h-5 text-gray-200" />
        </button>
      </div>

      {/* Área Central de Visualização com Navegação Tátil e Botões Laterais */}
      <div
        className="relative flex-1 flex items-center justify-center my-auto overflow-hidden px-1 sm:px-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToPrevImage();
          }}
          className="absolute left-1 sm:left-4 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white border border-white/20 hover:border-cyan-400/60 transition-all shadow-2xl hover:scale-110 cursor-pointer"
          title="Foto anterior (←)"
          aria-label="Foto anterior"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div
          className="max-w-full max-h-[66vh] sm:max-h-[74vh] flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <img
            key={currentItem.url}
            src={currentItem.url}
            alt={currentItem.label || "Imagem do jogo"}
            loading="lazy"
            decoding="async"
            className="max-w-[95vw] max-h-[66vh] sm:max-h-[74vh] rounded-2xl object-contain border border-white/15 shadow-2xl transition-all duration-300 animate-fadeIn"
          />
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            goToNextImage();
          }}
          className="absolute right-1 sm:right-4 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white border border-white/20 hover:border-cyan-400/60 transition-all shadow-2xl hover:scale-110 cursor-pointer"
          title="Próxima foto (→)"
          aria-label="Próxima foto"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
      </div>

      {/* Faixa Inferior de Miniaturas para Navegação Direta com proteção de safe-area */}
      <div
        className="w-full max-w-5xl mx-auto z-20 pt-2"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-none py-2 px-3 bg-[#121316]/80 backdrop-blur-md rounded-2xl border border-white/10">
          {items.map((thumb, idx) => (
            <button
              key={thumb.id || idx}
              type="button"
              ref={idx === currentIndex ? activeThumbnailRef : null}
              onClick={() => {
                triggerSelectionHaptic();
                onSelectIndex(idx);
              }}
              className={`flex-shrink-0 w-14 sm:w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                idx === currentIndex
                  ? "border-cyan-400 ring-2 ring-cyan-400/40 scale-105 opacity-100 shadow-md"
                  : "border-transparent opacity-40 hover:opacity-80"
              }`}
              title={thumb.label}
              aria-label={`Ver imagem ${idx + 1}`}
            >
              <img
                src={thumb.url}
                alt=""
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body
  );
}
