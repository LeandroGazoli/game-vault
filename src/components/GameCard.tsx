"use client";

import React, { useState } from "react";
import { Game } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import MetacriticBadge from "./MetacriticBadge";
import StatusBadge from "./StatusBadge";
import RatingStars from "./RatingStars";
import GameModal from "./GameModal";
import Link from "next/link";
import { Clock, Plus, Check, Star, Sparkles } from "lucide-react";

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
      <div className="group relative flex flex-col rounded-2xl bg-surface-100/90 border border-gray-800/80 overflow-hidden transition-all duration-300 hover:border-indigo-500/40 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
        {/* Capa do Jogo */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-950">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-600 text-xs">
              Sem Imagem
            </div>
          )}

          {/* Gradiente sutil sobre a capa */}
          <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-transparent to-black/40 opacity-80" />

          {/* Badge do Metacritic (Topo Esquerdo) */}
          <div className="absolute top-2.5 left-2.5 z-10">
            {game.metacritic ? (
              <MetacriticBadge score={game.metacritic} size="sm" />
            ) : null}
          </div>

          {/* Status do Jogador se já estiver na biblioteca (Topo Direito) */}
          <div className="absolute top-2.5 right-2.5 z-10">
            {userGame ? (
              <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
            ) : null}
          </div>

          {/* Botão de Ação Rápida no Hover */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300 shadow-xl backdrop-blur-sm hover:bg-indigo-500"
            title={userGame ? "Editar Status" : "Adicionar à Lista"}
          >
            {userGame ? <Check className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
          </button>
        </div>

        {/* Informações do Jogo */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>{releaseYear}</span>
              {game.genres && game.genres.length > 0 && (
                <span className="truncate max-w-[140px] text-right text-gray-400">
                  {game.genres.slice(0, 2).map((g) => g.name).join(", ")}
                </span>
              )}
            </div>

            <Link href={`/game/${game.id}`}>
              <h3 className="font-bold text-base text-white hover:text-indigo-400 transition-colors line-clamp-1">
                {game.name}
              </h3>
            </Link>
          </div>

          {/* Mini Info de Tempo HLTB & Avaliação */}
          <div className="mt-3 pt-2.5 border-t border-gray-800/80 flex items-center justify-between text-xs">
            {/* Tempos HLTB */}
            <div className="flex items-center gap-1.5 text-gray-400">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              {game.hltb?.mainStory ? (
                <span>
                  <strong className="text-gray-200">{game.hltb.mainStory}h</strong> história
                </span>
              ) : (
                <span className="text-gray-500">Estimando...</span>
              )}
            </div>

            {/* Avaliação do Usuário ou Ação */}
            <div>
              {userGame && userGame.userRating !== null ? (
                <div className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{userGame.userRating.toFixed(1)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-indigo-400 hover:text-indigo-300 font-medium text-xs transition-colors"
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
