"use client";

import React, { useRef, useState } from "react";
import { Game } from "@/lib/types";
import GameModal from "./GameModal";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import { ChevronLeft, ChevronRight, Plus, Check, Star, Clock } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { formatGameDuration } from "@/lib/gameUtils";

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
  actionText = "Mostrar Tudo",
}: CatalogRowProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const { getGameInLibrary } = useGameLibrary();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

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
      <section ref={sectionRef} className="space-y-3 relative group/row">
        {/* Cabeçalho Limpo Estilo Xbox Cloud Gaming */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-neutral-400" />}
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight font-display">
              {title}
            </h2>
            {subtitle && (
              <span className="hidden sm:inline text-xs text-neutral-400 font-normal ml-2">
                • {subtitle}
              </span>
            )}
          </div>

          {actionHref && (
            <Link
              href={actionHref}
              className="text-xs sm:text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              {actionText}
            </Link>
          )}
        </div>

        {/* Container Horizontal com Rolagem e Setas Flutuantes Estilo Xbox */}
        <div className="relative">
          {/* Botão Flutuante Esquerdo */}
          <button
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#18181c]/80 hover:bg-[#202127] text-white border border-white/15 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity shadow-2xl active:scale-95 hidden sm:flex"
            aria-label="Rolar para a esquerda"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Linha com Scroll Snap Nativo */}
          <div
            ref={rowRef}
            className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-3 pt-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {games.map((game, index) => {
              const userGame = getGameInLibrary(game.id);
              const rank = index + 1;
              const duration = formatGameDuration(game, userGame?.userPlaytimeHours);

              return (
                <div
                  key={game.id}
                  className="group relative flex-shrink-0 w-32 sm:w-40 md:w-44 aspect-[3/4] rounded-xl sm:rounded-2xl overflow-hidden bg-[#202127] border border-white/[0.06] hover:border-white/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:z-20 cursor-pointer select-none"
                >
                  <Link
                    href={getGameUrl(game)}
                    className="block w-full h-full"
                    title={game.name}
                  >
                    {/* Imagem do Pôster 100% da Área (Estilo Xbox) */}
                    {game.background_image ? (
                      <img
                        src={game.background_image}
                        alt={game.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center p-3 text-center text-xs text-neutral-500 font-medium">
                        {game.name}
                      </div>
                    )}

                    {/* Gradiente sutil na base para contraste das badges */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/85 via-black/40 to-transparent pointer-events-none" />

                    {/* Badge de Posição Rank */}
                    {showRank && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-[#FFB800] text-black font-extrabold font-mono text-[10px] shadow-md">
                        #{rank}
                      </div>
                    )}

                    {/* Micro-Badges de Tracker no Rodapé da Capa (Estilo Xbox) */}
                    <div className="absolute inset-x-0 bottom-0 p-2.5 flex items-end justify-between pointer-events-none z-10">
                      {/* Lado Esquerdo: Metacritic ou Dublado */}
                      {game.metacritic ? (
                        <div
                          className={`px-1.5 py-0.5 rounded-md backdrop-blur-md font-mono text-[10px] font-black border flex items-center gap-1 shadow-sm ${
                            game.metacritic >= 85
                              ? "bg-emerald-950/80 text-emerald-400 border-emerald-500/40"
                              : game.metacritic >= 75
                              ? "bg-amber-950/80 text-amber-300 border-amber-500/40"
                              : "bg-black/70 text-neutral-300 border-white/10"
                          }`}
                        >
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>{game.metacritic}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-white drop-shadow-md truncate max-w-[100px] block">
                          {game.name}
                        </span>
                      )}

                      {/* Lado Direito: Tempo HLTB ou Status da Biblioteca */}
                      {userGame ? (
                        <div className="px-1.5 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 backdrop-blur-sm shadow-sm">
                          <Check className="w-3 h-3" />
                          <span>Salvo</span>
                        </div>
                      ) : duration.text && !duration.isTbd ? (
                        <div className="px-1.5 py-0.5 rounded-md bg-black/60 border border-white/10 text-neutral-300 text-[10px] font-mono flex items-center gap-1 backdrop-blur-sm shadow-sm">
                          <Clock className="w-2.5 h-2.5 text-neutral-400" />
                          <span>{duration.text}</span>
                        </div>
                      ) : null}
                    </div>
                  </Link>

                  {/* Botão de Ação Rápida no Topo Direito (+) */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedGame(game);
                    }}
                    className={`absolute top-2 right-2 p-1.5 rounded-lg border backdrop-blur-md transition-all shadow-md z-20 active:scale-95 ${
                      userGame
                        ? "bg-emerald-500/30 text-emerald-300 border-emerald-500/50 opacity-100"
                        : "bg-black/60 hover:bg-white text-white hover:text-black border-white/15 hover:border-white sm:opacity-0 sm:group-hover:opacity-100 opacity-90"
                    }`}
                    title={userGame ? "Editar na biblioteca" : "Adicionar à biblioteca"}
                  >
                    {userGame ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Botão Flutuante Direito (Idêntico à Seta do Print 3 do Xbox) */}
          <button
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-[#18181c]/80 hover:bg-[#202127] text-white border border-white/15 backdrop-blur-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity shadow-2xl active:scale-95 hidden sm:flex"
            aria-label="Rolar para a direita"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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
    <section className="space-y-3 relative" aria-busy="true" aria-label={`Carregando ${title}`}>
      {/* Cabeçalho */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          {Icon ? (
            <Icon className="w-5 h-5 text-neutral-500" />
          ) : (
            <div className="w-5 h-5 rounded-md bg-white/10 animate-pulse" />
          )}
          <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
            {title}
          </h2>
          {subtitle && <span className="hidden sm:inline text-xs text-neutral-500">• {subtitle}</span>}
        </div>
      </div>

      {/* Linha horizontal com cards em skeleton estilo pôster Xbox */}
      <div className="flex items-stretch gap-3 sm:gap-4 overflow-hidden pb-3 pt-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="flex-shrink-0 w-32 sm:w-40 md:w-44 aspect-[3/4] rounded-xl sm:rounded-2xl bg-[#202127] border border-white/[0.04] overflow-hidden animate-pulse"
          />
        ))}
      </div>
    </section>
  );
}
