"use client";

import React, { useRef, useState } from "react";
import { Game } from "@/lib/types";
import GameModal from "./GameModal";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Plus, Check, Star, Sparkles, Flame, Clock } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";

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
      <section className="space-y-3.5 relative group/row">
        {/* Cabeçalho da Linha */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="p-1.5 rounded-xl bg-white/10 text-white">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {title}
              </h2>
              {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {actionHref && (
              <Link
                href={actionHref}
                className="text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              >
                {actionText}
              </Link>
            )}

            {/* Botões de Rolagem Estilo Netflix */}
            <div className="hidden sm:flex items-center gap-1">
              <button
                onClick={() => scroll("left")}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
                title="Rolar para a esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
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
          className="flex items-stretch gap-4 overflow-x-auto scrollbar-none pb-2 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {games.map((game, index) => {
            const userGame = getGameInLibrary(game.id);
            const rank = index + 1;
            const releaseYear = game.released ? game.released.substring(0, 4) : "";

            return (
              <div
                key={game.id}
                className="group relative flex-shrink-0 w-36 sm:w-44 rounded-2xl bg-[#18191c] border border-white/5 hover:border-white/20 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/70"
              >
                {/* Poster / Capa Vertical de Filme - Clicar abre a página do jogo */}
                <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden">
                  <Link
                    href={`/game/${game.id}`}
                    className="block w-full h-full cursor-pointer"
                    title={`Ver detalhes de ${game.name}`}
                  >
                    {/* Badge de Posição se showRank for ativo */}
                    {showRank && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-[#00E5FF] text-black font-extrabold text-[10px] shadow-lg">
                        #{rank}
                      </div>
                    )}

                    {game.background_image ? (
                      <img
                        src={game.background_image}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        Sem Capa
                      </div>
                    )}

                    {/* Gradiente sutil */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] via-transparent to-transparent opacity-60" />
                  </Link>

                  {/* Botão de Adição Rápida no Hover */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedGame(game);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-white text-white hover:text-black backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-lg z-20"
                    title={userGame ? "Editar na biblioteca" : "Adicionar à lista"}
                  >
                    {userGame ? <Check className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>

                  {/* Badge de Metacritic no Rodapé da Capa */}
                  {game.metacritic && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-md bg-black/70 text-emerald-400 font-bold font-mono text-[10px] backdrop-blur-sm border border-emerald-500/30 pointer-events-none">
                      {game.metacritic}%
                    </div>
                  )}
                </div>

                {/* Informações do Jogo */}
                <div className="p-3 flex-1 flex flex-col justify-between">
                  <div>
                    <Link href={`/game/${game.id}`}>
                      <h3 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                        {game.name}
                      </h3>
                    </Link>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 font-mono">
                      <span>{releaseYear}</span>
                      {game.genres && game.genres[0] && (
                        <span className="truncate max-w-[80px] text-right">
                          {game.genres[0].name}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botão de Ação / Status */}
                  <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>{game.hltb?.mainStory ? `${game.hltb.mainStory}h` : "30h"}</span>
                    </div>

                    <button
                      onClick={() => setSelectedGame(game)}
                      className={`text-[10px] font-semibold transition-colors ${
                        userGame
                          ? "text-[#00E5FF]"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {userGame ? "Na Lista" : "+ Adicionar"}
                    </button>
                  </div>
                </div>
              </div>
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
