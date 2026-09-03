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
      <div className="group relative flex flex-col rounded-xl bg-[#12151c] border border-[#222834] hover:border-[#384255] hover:bg-[#151922] overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/70">
        {/* Capa do Jogo Vertical Estilo Poster - Clicar abre a página do jogo */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-950">
          <Link
            href={`/game/${game.id}`}
            className="block w-full h-full cursor-pointer"
            title={`Ver detalhes de ${game.name}`}
          >
            {game.background_image ? (
              <img
                src={game.background_image}
                alt={game.name}
                className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-950 text-neutral-600 text-xs">
                Sem Imagem
              </div>
            )}

            {/* Gradiente sutil para transição com a base */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#12151c] via-transparent to-transparent opacity-80" />
          </Link>

          {/* Metacritic Badge (Canto Superior Esquerdo) */}
          {game.metacritic && (
            <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
              <MetacriticBadge score={game.metacritic} size="sm" />
            </div>
          )}

          {/* Status do Usuário se na Biblioteca (Canto Superior Direito) */}
          {userGame && (
            <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
              <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
            </div>
          )}

          {/* Botão de Adição Rápida no Hover */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="absolute bottom-2.5 right-2.5 w-8 h-8 rounded-lg bg-[#181c25]/90 hover:bg-white text-white hover:text-black flex items-center justify-center opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150 shadow-md z-20 border border-[#2e3646] hover:border-white active:scale-95"
            title={userGame ? "Editar Status" : "Adicionar à Lista"}
          >
            {userGame ? <Check className="w-4 h-4 text-[#00E5FF]" /> : <Plus className="w-4 h-4" />}
          </button>
        </div>

        {/* Informações do Jogo */}
        <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
          <div>
            <div className="flex items-center justify-between text-[11px] text-neutral-400 mb-1 font-mono">
              <span className="tabular-nums">{releaseYear}</span>
              {userGame?.dlcs && userGame.dlcs.length > 0 ? (
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-[#00E5FF] font-mono border border-cyan-500/30 font-bold"
                  title={`${userGame.dlcs.filter((d) => d.status === "completed").length} de ${userGame.dlcs.length} DLCs zeradas`}
                >
                  +{userGame.dlcs.length} DLC{userGame.dlcs.length > 1 ? "s" : ""}
                </span>
              ) : game.genres && game.genres.length > 0 ? (
                <span className="truncate max-w-[120px] text-right">
                  {game.genres.slice(0, 1).map((g) => g.name).join(", ")}
                </span>
              ) : null}
            </div>

            <Link href={`/game/${game.id}`}>
              <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                {game.name}
              </h3>
            </Link>
          </div>

          {/* Mini Info de Tempo HLTB ou Horas Registradas & Avaliação */}
          <div className="pt-2 border-t border-[#222834] flex items-center justify-between text-xs font-mono">
            {/* Tempos HLTB ou Horas do Jogador */}
            <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] tabular-nums">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {userGame?.userPlaytimeHours
                  ? `${userGame.userPlaytimeHours}h`
                  : game.hltb?.mainStory
                  ? `${game.hltb.mainStory}h`
                  : "30h"}
              </span>
            </div>

            {/* Avaliação do Usuário ou Botão */}
            <div>
              {userGame && userGame.userRating !== null ? (
                <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs tabular-nums">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span>{userGame.userRating.toFixed(1)}</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-neutral-400 hover:text-white font-medium text-xs transition-colors"
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
