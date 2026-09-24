"use client";

import React from "react";
import Link from "next/link";
import { Game, UserGame } from "@/lib/types";
import { getGameUrl } from "@/lib/routes";
import { Star, Clock, Check, Plus, Heart, Play } from "lucide-react";
import GamePosterCover from "@/components/common/GamePosterCover";
import StatusBadge from "@/components/StatusBadge";
import MetacriticBadge from "@/components/MetacriticBadge";
import { formatGameDuration } from "@/lib/gameUtils";

export interface GamePosterCardProps {
  game: Game | UserGame;
  userGame?: UserGame | null;
  onEdit?: (game: any) => void;
  onQuickAdd?: (game: any) => void;
  showRank?: number;
  className?: string;
  isPriority?: boolean;
  isOwner?: boolean;
}

/**
 * Card de jogo oficial e unificado estilo poster (3:4) para carrosseis e grids.
 * 100% de base solida, proporcao perfeita e compatibilidade com Home e Perfil.
 */
export default function GamePosterCard({
  game,
  userGame,
  onEdit,
  onQuickAdd,
  showRank,
  className = "",
  isPriority = false,
  isOwner = false,
}: GamePosterCardProps) {
  const isUserGameObj = "gameId" in game;
  const gameId = isUserGameObj ? game.gameId : game.id;
  const gameTitle = isUserGameObj ? game.gameTitle : game.name;
  const gameSlug = isUserGameObj ? game.gameSlug : game.slug;
  const gameCover = isUserGameObj ? game.gameCover : game.background_image;
  const metacritic = isUserGameObj ? game.metacritic : game.metacritic;
  const status = isUserGameObj ? game.status : userGame?.status;
  const completionType = isUserGameObj ? game.completionType : userGame?.completionType;
  const userRating = isUserGameObj ? game.userRating : userGame?.userRating;
  const playtime = isUserGameObj ? game.userPlaytimeHours : userGame?.userPlaytimeHours;

  const resolvedUrl = getGameUrl({ id: gameId, slug: gameSlug, name: gameTitle });
  const activeUserGame = isUserGameObj ? game : userGame;

  // Verifica se é plataforma PC/Steam e dono do perfil
  const platforms = isUserGameObj
    ? activeUserGame?.platformsPlayed || [activeUserGame?.platformPlayed]
    : "platforms" in game
    ? game.platforms?.map((p) => p.platform?.name)
    : [];
  const isSteamOrPc = platforms?.some((p) =>
    p?.toLowerCase().includes("pc") || p?.toLowerCase().includes("steam")
  );

  return (
    <div
      className={`group relative flex-shrink-0 w-32 sm:w-40 md:w-44 aspect-[3/4] rounded-2xl overflow-hidden bg-[#141822] border border-white/10 hover:border-emerald-500/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl select-none snap-start ${className}`}
    >
      <Link href={resolvedUrl} className="block w-full h-full" title={gameTitle}>
        <GamePosterCover
          src={gameCover}
          alt={gameTitle}
          aspectRatio="3/4"
          priority={isPriority}
          className="w-full h-full rounded-2xl"
          overlayContent={
            <>
              {/* Badge Rank Numerico ou Metacritic no topo esquerdo */}
              <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
                {typeof showRank === "number" && (
                  <span className="px-2 py-0.5 rounded-md bg-[#FFB800] text-black font-extrabold font-mono text-[10px] shadow-md">
                    #{showRank}
                  </span>
                )}
                {metacritic ? <MetacriticBadge score={metacritic} size="sm" /> : null}
              </div>

              {/* Status Badge no topo direito (se houver e nao houver botao de acao sobreposto) */}
              {status && !onEdit && !onQuickAdd && (
                <div className="absolute top-2 right-2 z-10">
                  <StatusBadge status={status} completionType={completionType} size="sm" />
                </div>
              )}

              {/* Botão de Jogar na Steam direto do navegador (Exclusivo do dono do perfil) */}
              {isOwner && isSteamOrPc && (
                <a
                  href={`steam://run/${gameId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute bottom-16 right-2 p-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 border border-cyan-500/40 shadow-lg opacity-0 group-hover:opacity-100 transition-all active:scale-90 z-20"
                  title="Jogar na Steam (Abre o Launcher)"
                  aria-label="Jogar na Steam"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                </a>
              )}

              {/* Barra inferior solida com informacoes essenciais */}
              <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-[#0c0e14] via-[#0c0e14]/90 to-transparent pt-6 flex flex-col justify-end">
                <h4 className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1 leading-tight mb-1">
                  {gameTitle}
                </h4>

                <div className="flex items-center justify-between text-[10px] font-mono text-gray-400">
                  {userRating !== null && userRating !== undefined ? (
                    <span className="text-amber-400 font-bold">★ {userRating.toFixed(1)}</span>
                  ) : (
                    <span>{status ? <StatusBadge status={status} size="sm" showIcon={false} /> : "MGL"}</span>
                  )}

                  {playtime ? (
                    <span className="text-cyan-300 font-semibold flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {playtime}h
                    </span>
                  ) : null}
                </div>
              </div>
            </>
          }
        />
      </Link>

      {/* Botao de Acao Rapida / Editar */}
      {(onEdit || onQuickAdd) && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (activeUserGame && onEdit) {
              onEdit(activeUserGame);
            } else if (onQuickAdd) {
              onQuickAdd(game);
            }
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-xl border transition-all z-20 active:scale-90 shadow-md ${
            activeUserGame
              ? "bg-[#0d2a1d] text-emerald-300 border-emerald-500/60"
              : "bg-[#181d28] hover:bg-white text-white hover:text-black border-white/20"
          }`}
          title={activeUserGame ? "Editar na biblioteca" : "Adicionar à biblioteca"}
          aria-label={activeUserGame ? "Editar jogo" : "Adicionar jogo"}
        >
          {activeUserGame ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}
