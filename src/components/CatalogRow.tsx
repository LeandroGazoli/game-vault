"use client";

import React, { useRef, useState } from "react";
import { Game } from "@/lib/types";
import GameModal from "./GameModal";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import { ChevronLeft, ChevronRight, Plus, Check, Star, Sparkles, Flame, Clock } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";
import Card3DTilt from "./3d/Card3DTilt";
import { formatGameDuration, formatGenreName } from "@/lib/gameUtils";
import { gsap, useGSAP } from "@/lib/gsap";

interface CatalogRowProps {
  title: string;
  subtitle?: string;
  icon?: any;
  games: Game[];
  showRank?: boolean;
  actionHref?: string;
  actionText?: string;
}

export default function CatalogRow({
  title,
  subtitle,
  icon: Icon,
  games,
  showRank = false,
  actionHref,
  actionText = "Ver todos →",
}: CatalogRowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const { getGameInLibrary } = useGameLibrary();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // Revelação fluida dos cards ao rolar via ScrollTrigger
  useGSAP(() => {
    if (!sectionRef.current || games.length === 0) return;

    const mm = gsap.matchMedia();
    mm.add({
      reduceMotion: "(prefers-reduced-motion: reduce)",
      allowMotion: "(prefers-reduced-motion: no-preference)",
    }, (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean };

      if (reduceMotion) {
        gsap.set([".catalog-header", ".catalog-card"], { autoAlpha: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 88%",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      tl.fromTo(
        ".catalog-header",
        { autoAlpha: 0, y: 20 },
        { autoAlpha: 1, y: 0, duration: 0.5 }
      ).fromTo(
        ".catalog-card",
        { autoAlpha: 0, y: 30, scale: 0.96 },
        { autoAlpha: 1, y: 0, scale: 1, stagger: 0.05, duration: 0.45 },
        "-=0.25"
      );
    });
  }, { scope: sectionRef, dependencies: [games] });

  const scroll = (direction: "left" | "right") => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;
      rowRef.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (!games || games.length === 0) return null;

  return (
    <>
      <section ref={sectionRef} className="space-y-3.5 relative group/row">
        {/* Cabeçalho da Linha */}
        <div className="catalog-header flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-[#151820] border border-[#262c38] text-neutral-300 flex items-center justify-center">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-neutral-400">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actionHref && (
              <Link
                href={actionHref}
                className="text-xs font-mono font-semibold text-neutral-400 hover:text-white transition-colors inline-flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                {actionText}
              </Link>
            )}

            {/* Botões de Rolagem Estilo Hardware */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scroll("left")}
                className="p-1.5 rounded-lg bg-[#151820] hover:bg-[#1e232e] text-neutral-400 hover:text-white border border-[#262c38] transition-colors"
                title="Rolar para a esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-1.5 rounded-lg bg-[#151820] hover:bg-[#1e232e] text-neutral-400 hover:text-white border border-[#262c38] transition-colors"
                title="Rolar para a direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Container Horizontal com Scroll Suave */}
        <div
          ref={rowRef}
          className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {games.map((game, index) => {
            const userGame = getGameInLibrary(game.id);
            const rank = index + 1;
            const releaseYear = game.released ? game.released.substring(0, 4) : "";

            return (
              <Card3DTilt
                key={game.id}
                maxTilt={6}
                className="catalog-card flex-shrink-0 w-36 sm:w-44"
              >
                <div className="group relative w-full h-full rounded-xl bg-[#12151c] border border-[#222834] hover:border-[#384255] hover:bg-[#151922] overflow-hidden flex flex-col transition-colors duration-200 hover:shadow-xl hover:shadow-black/70">
                  {/* Poster / Capa Vertical - Clicar abre a página do jogo */}
                  <div className="relative aspect-[3/4] w-full bg-neutral-950 overflow-hidden">
                    <Link
                      href={getGameUrl(game)}
                      className="block w-full h-full cursor-pointer"
                      title={`Ver detalhes de ${game.name}`}
                    >
                      {/* Badge de Posição se showRank for ativo */}
                      {showRank && (
                        <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded bg-[#FFB800] text-black font-extrabold font-mono text-[10px] shadow-md">
                          #{rank}
                        </div>
                      )}

                      {game.background_image ? (
                        <img
                          src={game.background_image}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">
                          Sem Capa
                        </div>
                      )}

                      {/* Gradiente sutil de transição */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-transparent to-transparent opacity-80" />
                    </Link>

                    {/* Botão de Adição Rápida */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedGame(game);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-[#181c25]/90 hover:bg-white text-white hover:text-black border border-[#2a3140] hover:border-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md z-20 active:scale-95"
                      title={userGame ? "Editar na biblioteca" : "Adicionar à lista"}
                    >
                      {userGame ? <Check className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>

                    {/* Badge de Metacritic no Rodapé da Capa */}
                    {game.metacritic && (
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-[#0c1f17]/90 text-emerald-300 font-bold font-mono text-[10px] border border-emerald-500/40 pointer-events-none tabular-nums">
                        {game.metacritic}%
                      </div>
                    )}
                  </div>

                  {/* Informações do Jogo */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={getGameUrl(game)} className="block">
                        <h3
                          className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2 h-8 sm:h-9 leading-snug"
                          title={game.name}
                        >
                          {game.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1.5 font-mono">
                        <span className="tabular-nums font-semibold">{releaseYear}</span>
                        {game.genres && game.genres[0] && (
                          <span
                            className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 font-bold uppercase tracking-wider text-[9px] shrink-0"
                            title={game.genres[0].name}
                          >
                            {formatGenreName(game.genres[0].name)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Botão de Ação / Status */}
                    <div className="mt-2.5 pt-2 border-t border-[#222834] flex items-center justify-between font-mono">
                      {(() => {
                        const duration = formatGameDuration(game, userGame?.userPlaytimeHours);
                        return (
                          <div
                            className="text-[10px] text-neutral-400 flex items-center gap-1 tabular-nums"
                            title={duration.isEstimated ? (duration.isTbd ? "A definir" : "Média HLTB") : "Horas jogadas"}
                          >
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span className={duration.isTbd ? "text-neutral-500 font-bold" : ""}>{duration.text}</span>
                          </div>
                        );
                      })()}

                      <button
                        onClick={() => setSelectedGame(game)}
                        className={`text-[10px] font-semibold transition-colors ${
                          userGame
                            ? "text-[#00E5FF]"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        {userGame ? "Na Lista" : "+ Adicionar"}
                      </button>
                    </div>
                  </div>
                </div>
              </Card3DTilt>
            );
          })}
        </div>
      </section>

      {/* Modal para configurar o jogo */}
      <GameModal
        game={selectedGame}
        isOpen={Boolean(selectedGame)}
        onClose={() => setSelectedGame(null)}
      />
    </>
  );
}

export function CatalogRowSkeleton({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  icon?: any;
}) {
  return (
    <section className="space-y-3.5 relative" aria-busy="true" aria-label={`Carregando ${title}`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {Icon ? (
            <div className="p-1.5 rounded-xl bg-white/10 text-white">
              <Icon className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-xl bg-white/10 animate-pulse" />
          )}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
          </div>
        </div>
      </div>

      {/* Linha horizontal com 6 cards em skeleton com overflow protegido */}
      <div className="flex items-stretch gap-4 overflow-hidden pb-2 pt-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-36 sm:w-44 rounded-2xl bg-[#18191c]/80 border border-white/5 overflow-hidden flex flex-col animate-pulse"
          >
            {/* Poster com aspect 3/4 */}
            <div className="aspect-[3/4] w-full bg-white/5" />
            {/* Informações */}
            <div className="p-3 space-y-2 flex-1 flex flex-col justify-between">
              <div className="w-3/4 h-4 bg-white/10 rounded" />
              <div className="flex items-center justify-between pt-1">
                <div className="w-12 h-3 bg-white/5 rounded" />
                <div className="w-8 h-3 bg-white/5 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

