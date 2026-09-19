"use client";

import React from "react";
import Link from "next/link";
import { Game } from "@/lib/types";
import { getGameUrl } from "@/lib/routes";
import { Flame, Plus, Check } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";

interface CalendarGameCardProps {
  game: Game;
  onOpenModal: (game: Game) => void;
  onCardClick: (gameId: number | string) => void;
}

export default function CalendarGameCard({
  game,
  onOpenModal,
  onCardClick,
}: CalendarGameCardProps) {
  const { getGameInLibrary } = useGameLibrary();
  const userGame = getGameInLibrary(game.id);

  const handleClick = () => {
    onCardClick(game.id);
  };

  return (
    <div
      id={`game-card-${game.id}`}
      data-game-id={game.id}
      className="group relative rounded-2xl bg-[#18191c] border border-white/5 hover:border-white/20 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/60"
    >
      {/* Capa com Proporção de Poster - Clicar abre a página do jogo */}
      <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden">
        <Link
          href={getGameUrl(game)}
          prefetch={false}
          onClick={handleClick}
          className="block w-full h-full cursor-pointer"
          title={`Ver detalhes de ${game.name}`}
        >
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
        </Link>

        {/* Efeito de Fogo / Hype no Canto Inferior Direito */}
        <div className="absolute bottom-2 right-2 p-1 rounded-full bg-black/60 backdrop-blur-md text-orange-400 pointer-events-none">
          <Flame className="w-3 h-3 fill-orange-400" />
        </div>

        {/* Botão + no Hover */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onOpenModal(game);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-white text-white hover:text-black backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-lg z-20 border border-white/10"
          title="Adicionar à biblioteca"
        >
          {userGame ? (
            <Check className="w-3.5 h-3.5 text-[#00E5FF]" />
          ) : (
            <Plus className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Título & Plataforma */}
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <Link
          href={getGameUrl(game)}
          prefetch={false}
          onClick={handleClick}
        >
          <h3 className="text-xs font-semibold text-white hover:text-[#00E5FF] line-clamp-1 transition-colors">
            {game.name}
          </h3>
        </Link>
        <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
          <span className="truncate max-w-[90px]">
            {game.genres && game.genres[0] ? game.genres[0].name : "Game"}
          </span>
          {game.metacritic && (
            <span className="text-emerald-400 font-bold font-mono">
              {game.metacritic}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
