import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Image as ImageIcon,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
} from "lucide-react";
import { Game } from "@/lib/types";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import { GalleryMediaItem } from "./gameDetailHelpers";

interface GameMediaGalleryProps {
  game: Game;
  allMediaItems: GalleryMediaItem[];
}

export default function GameMediaGallery({
  game,
  allMediaItems,
}: GameMediaGalleryProps) {
  const [mediaTab, setMediaTab] = useState<"gallery" | "videos">("gallery");
  const [mediaFilter, setMediaFilter] = useState<"all" | "artworks" | "screenshots">("all");
  const [activeVideoId, setActiveVideoId] = useState<string | null>(
    game.videos && game.videos.length > 0 ? game.videos[0].video_id : null
  );
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  const galleryScrollRef = useRef<HTMLDivElement>(null);
  const activeThumbnailRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const artworksCount = useMemo(
    () => allMediaItems.filter((m) => m.type === "artwork").length,
    [allMediaItems]
  );
  const screenshotsCount = useMemo(
    () => allMediaItems.filter((m) => m.type === "screenshot").length,
    [allMediaItems]
  );

  const displayedMediaItems = useMemo(() => {
    if (mediaFilter === "all") return allMediaItems;
    return allMediaItems.filter((item) =>
      mediaFilter === "artworks" ? item.type === "artwork" : item.type === "screenshot"
    );
  }, [allMediaItems, mediaFilter]);

  const currentLightboxItem =
    lightboxIndex !== null ? displayedMediaItems[lightboxIndex] : null;

  const scrollGallery = (direction: "left" | "right") => {
    triggerSelectionHaptic();
    if (galleryScrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      galleryScrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const goToNextImage = useCallback(() => {
    triggerSelectionHaptic();
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev + 1) % displayedMediaItems.length;
    });
  }, [displayedMediaItems.length]);

  const goToPrevImage = useCallback(() => {
    triggerSelectionHaptic();
    setLightboxIndex((prev) => {
      if (prev === null) return null;
      return (prev - 1 + displayedMediaItems.length) % displayedMediaItems.length;
    });
  }, [displayedMediaItems.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goToNextImage();
      if (e.key === "ArrowLeft") goToPrevImage();
      if (e.key === "Escape") setLightboxIndex(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, goToNextImage, goToPrevImage]);

  useEffect(() => {
    if (lightboxIndex !== null && activeThumbnailRef.current) {
      activeThumbnailRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [lightboxIndex]);

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

  if (allMediaItems.length === 0 && (!game.videos || game.videos.length === 0)) {
    return null;
  }

  return (
    <section className="rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#18191c] p-5 sm:p-8 space-y-6 shadow-2xl">
      {/* Header com Abas da Mídia */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 w-fit text-xs">
          {allMediaItems.length > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                setMediaTab("gallery");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all min-h-[36px] ${
                mediaTab === "gallery"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Galeria de Imagens</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  mediaTab === "gallery" ? "bg-black/30 text-black" : "bg-white/10 text-gray-400"
                }`}
              >
                {allMediaItems.length}
              </span>
            </button>
          )}

          {game.videos && game.videos.length > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                setMediaTab("videos");
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all min-h-[36px] ${
                mediaTab === "videos"
                  ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Youtube className="w-3.5 h-3.5" />
              <span>Trailers &amp; Vídeos</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  mediaTab === "videos" ? "bg-black/30 text-white" : "bg-white/10 text-gray-400"
                }`}
              >
                {game.videos.length}
              </span>
            </button>
          )}
        </div>

        {/* Controles da Galeria (Filtros e Setas) */}
        {mediaTab === "gallery" && allMediaItems.length > 0 && (
          <div className="flex items-center gap-2">
            {artworksCount > 0 && screenshotsCount > 0 && (
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    triggerSelectionHaptic();
                    setMediaFilter("all");
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    mediaFilter === "all" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Todas
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerSelectionHaptic();
                    setMediaFilter("artworks");
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    mediaFilter === "artworks" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Artes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    triggerSelectionHaptic();
                    setMediaFilter("screenshots");
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    mediaFilter === "screenshots" ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-white"
                  }`}
                >
                  Screenshots
                </button>
              </div>
            )}

            <div className="hidden sm:flex items-center gap-1">
              <button
                type="button"
                onClick={() => scrollGallery("left")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/5 transition-colors"
                title="Rolar para esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollGallery("right")}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white border border-white/5 transition-colors"
                title="Rolar para direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Conteúdo da Aba Galeria */}
      {mediaTab === "gallery" && allMediaItems.length > 0 && (
        <div
          ref={galleryScrollRef}
          className="flex gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 -mx-2 px-2 sm:mx-0 sm:px-0"
        >
          {displayedMediaItems.map((item, idx) => {
            if (failedImages.has(item.url)) return null;

            return (
              <div
                key={item.id || idx}
                onClick={() => setLightboxIndex(idx)}
                className="w-[260px] sm:w-[320px] md:w-[360px] flex-shrink-0 snap-start group relative aspect-video rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer shadow-lg hover:border-cyan-400/60 transition-all hover:scale-[1.01]"
              >
                <img
                  src={item.url}
                  alt={item.label}
                  loading="lazy"
                  decoding="async"
                  onError={() => {
                    setFailedImages((prev) => new Set(prev).add(item.url));
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-1.5 pointer-events-none">
                  {item.type === "artwork" ? (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-500/25 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-sm">
                      Arte Oficial
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-gray-300 border border-white/15 backdrop-blur-md shadow-sm">
                      Screenshot
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-medium bg-black/70 text-gray-300 border border-white/10 backdrop-blur-md">
                    {idx + 1}/{displayedMediaItems.length}
                  </span>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-white bg-black/85 px-4 py-2 rounded-full border border-white/25 shadow-xl transform translate-y-2 group-hover:translate-y-0 transition-transform">
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" /> Ampliar no Slide
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Conteúdo da Aba Vídeos */}
      {mediaTab === "videos" && game.videos && game.videos.length > 0 && (
        <div className="space-y-4 animate-fadeIn">
          {activeVideoId && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?rel=0&modestbranding=1`}
                title={game.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
          )}

          {game.videos.length > 1 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-gray-400 block">
                Outros Vídeos Disponíveis ({game.videos.length}):
              </span>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
                {game.videos.map((vid) => {
                  const isActive = activeVideoId === vid.video_id;
                  return (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => {
                        triggerSelectionHaptic();
                        setActiveVideoId(vid.video_id);
                      }}
                      className={`flex-shrink-0 w-44 sm:w-48 rounded-xl overflow-hidden text-left border transition-all group ${
                        isActive
                          ? "border-[#00E5FF] shadow-lg shadow-[#00E5FF]/10 bg-cyan-950/40"
                          : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10"
                      }`}
                    >
                      <div className="relative aspect-video w-full overflow-hidden bg-neutral-900">
                        <img
                          src={`https://img.youtube.com/vi/${vid.video_id}/mqdefault.jpg`}
                          alt={vid.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div
                            className={`p-1.5 rounded-full ${
                              isActive ? "bg-[#00E5FF] text-black" : "bg-black/70 text-white"
                            }`}
                          >
                            <Youtube className="w-3.5 h-3.5 fill-current" />
                          </div>
                        </div>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-200 line-clamp-1 group-hover:text-white">
                          {vid.name}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Lightbox Modal em Tela Cheia */}
      {lightboxIndex !== null && currentLightboxItem && mounted && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-[999] !m-0 !mt-0 flex flex-col justify-between p-3 sm:p-6 bg-black/95 backdrop-blur-2xl animate-fadeIn select-none"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Barra Superior do Lightbox */}
          <div
            className="flex items-center justify-between w-full max-w-7xl mx-auto z-20 pb-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              {currentLightboxItem.type === "artwork" ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm">
                  Arte Oficial (Key Art 1080p)
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-gray-200 border border-white/20 shadow-sm">
                  Captura de Tela (1080p)
                </span>
              )}

              <span className="text-xs font-mono font-medium text-gray-400">
                {lightboxIndex + 1} de {displayedMediaItems.length}
              </span>
            </div>

            <button
              onClick={() => setLightboxIndex(null)}
              className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 border border-white/10 hover:border-white/25 cursor-pointer"
              title="Fechar (Esc)"
            >
              <span className="text-xs font-semibold hidden sm:inline">Fechar</span>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Área Central de Visualização com Botões de Slide */}
          <div
            className="relative flex-1 flex items-center justify-center my-auto overflow-hidden px-2"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevImage();
              }}
              className="absolute left-1 sm:left-4 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 hover:border-cyan-400/60 transition-all shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
              title="Foto anterior (←)"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div
              className="max-w-full max-h-[72vh] sm:max-h-[76vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                key={currentLightboxItem.url}
                src={currentLightboxItem.url}
                alt={currentLightboxItem.label}
                loading="lazy"
                decoding="async"
                className="max-w-[94vw] max-h-[72vh] sm:max-h-[76vh] rounded-2xl object-contain border border-white/15 shadow-2xl transition-all duration-300 animate-fadeIn"
              />
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNextImage();
              }}
              className="absolute right-1 sm:right-4 z-30 p-3 sm:p-4 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 hover:border-cyan-400/60 transition-all shadow-2xl hover:scale-110 active:scale-95 cursor-pointer"
              title="Próxima foto (→)"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Faixa Inferior de Miniaturas para Navegação Direta */}
          <div
            className="w-full max-w-5xl mx-auto z-20 pt-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto scrollbar-none py-2 px-3 bg-[#121316]/80 backdrop-blur-md rounded-2xl border border-white/10">
              {displayedMediaItems.map((thumb, idx) => (
                <button
                  key={thumb.id || idx}
                  ref={idx === lightboxIndex ? activeThumbnailRef : null}
                  onClick={() => setLightboxIndex(idx)}
                  className={`flex-shrink-0 w-14 sm:w-20 aspect-video rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    idx === lightboxIndex
                      ? "border-cyan-400 ring-2 ring-cyan-400/40 scale-105 opacity-100 shadow-md"
                      : "border-transparent opacity-40 hover:opacity-80"
                  }`}
                  title={thumb.label}
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
      )}
    </section>
  );
}
