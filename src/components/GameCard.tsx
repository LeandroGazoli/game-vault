"use client";

import React, { useState } from "react";
import { Game } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import MetacriticBadge from "./MetacriticBadge";
import StatusBadge from "./StatusBadge";
import GameModal from "./GameModal";
import Link from "next/link";
import { Clock, Plus, Check, Star } from "lucide-react";

interface GameCardProps {
  game: Game;
  onOpenAuthModal?: () => void;
}

export default function GameCard({ game, onOpenAuthModal }: GameCardProps) {
  const { getGameInLibrary } = useGameLibrary();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userGame = getGameInLibrary(game.id);
  const releaseYear = game.released ? game.released.substring(0, 4) : "";

  return (
    <>
      <div className="group relative flex flex-col rounded-2xl bg-[#18191c] border border-white/5 hover:border-white/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1.5">
        {/* Capa do Jogo Vertical Estilo Poster */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-900 text-gray-600 text-xs">
              Sem Imagem
            </div>
          )}

          {/* Gradiente suave */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] via-transparent to-transparent opacity-60" />

          {/* Metacritic Badge (Canto Superior Esquerdo) */}
          {game.metacritic && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <MetacriticBadge score={game.metacritic} size="sm" />
            </div>
          )}

          {/* Status do Usuário se na Biblioteca (Canto Superior Direito) */}
          {userGame && (
            <div className="absolute top-2.5 right-2.5 z-10">
              <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
            </div>
          )}

          {/* Botão de Adição Rápida no Hover */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-black/70 hover:bg-white text-white hover:text-black flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-2xl backdrop-blur-md"
            title={userGame ? "Editar Status" : "Adicionar à Lista"}
          >
            {userGame ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </button>
        </div>

        {/* Informações do Jogo */}
        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1 font-mono">
              <span>{releaseYear}</span>
              {game.genres && game.genres.length > 0 && (
                <span className="truncate max-w-[120px] text-right">
                  {game.genres.slice(0, 1).map((g) => g.name).join(", ")}
                </span>
              )}
            </div>

            <Link href={`/game/${game.id}`}>
              <h3 className="font-semibold text-sm sm:text-base text-white hover:text-[#00E5FF] transition-colors line-clamp-1">
                {game.name}
              </h3>
            </Link>
          </div>

          {/* Mini Info de Tempo HLTB & Avaliação */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            {/* Tempos HLTB */}
            <div className="flex items-center gap-1.5 text-gray-400 text-[11px] font-mono">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>{game.hltb?.mainStory ? `${game.hltb.mainStory}h` : "30h"}</span>
            </div>

            {/* Avaliação do Usuário ou Botão */}
            <div>
              {userGame && userGame.userRating !== null ? (
                <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{userGame.userRating.toFixed(1)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-gray-400 hover:text-white font-medium text-xs transition-colors"
                >
                  {userGame ? "Editar" : "+ Lista"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal para configurar o jogo */}
      <GameModal
        game={game}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onOpenAuthModal={onOpenAuthModal}
      />
    </>
  );
}
