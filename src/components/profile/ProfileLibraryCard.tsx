"use client";

import React from "react";
import Link from "next/link";
import { UserGame } from "@/lib/types";
import { getGameUrl } from "@/lib/routes";
import GamePosterCover from "@/components/common/GamePosterCover";
import StatusBadge from "@/components/StatusBadge";
import MetacriticBadge from "@/components/MetacriticBadge";
import { Heart, Clock } from "lucide-react";

export interface ProfileLibraryCardProps {
  userGame: UserGame;
  isOwner: boolean;
  viewMode: "grid" | "list";
  onEditGame?: (game: any) => void;
}

export default function ProfileLibraryCard({
  userGame,
  isOwner,
  viewMode,
  onEditGame,
}: ProfileLibraryCardProps) {
  const asGame = {
    id: userGame.gameId,
    slug: userGame.gameSlug,
    name: userGame.gameTitle,
    background_image: userGame.gameCover,
    metacritic: userGame.metacritic,
    hltb: userGame.hltbData,
    dlcs: userGame.dlcs,
  };

  if (viewMode === "list") {
    return (
      <div className="rounded-2xl bg-[#141822] border border-white/5 p-2.5 sm:p-3 flex items-center justify-between gap-3 hover:border-white/15 transition-all">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-16 shrink-0">
            <GamePosterCover
              src={userGame.gameCover}
              alt={userGame.gameTitle}
              aspectRatio="3/4"
              className="rounded-xl shadow"
            />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
              {userGame.metacritic && <MetacriticBadge score={userGame.metacritic} size="sm" />}
              <span className="text-[10px] text-gray-400 font-mono">
                {userGame.releaseYear || userGame.platformPlayed}
              </span>
            </div>

            <Link href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}>
              <h3 className="text-xs sm:text-sm font-bold text-white hover:text-emerald-300 transition-colors truncate">
                {userGame.gameTitle}
              </h3>
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 font-mono">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-gray-400">Tempo</div>
            <div className="text-xs font-bold text-cyan-300">
              {userGame.userPlaytimeHours ? `${userGame.userPlaytimeHours}h` : "--"}
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-gray-400">Nota</div>
            <div className="text-xs font-bold text-amber-300">
              {userGame.userRating !== null ? `★ ${userGame.userRating.toFixed(1)}` : "--"}
            </div>
          </div>

          {isOwner && onEditGame ? (
            <button
              type="button"
              onClick={() => onEditGame(asGame)}
              className="px-3 py-1.5 rounded-xl bg-[#1c2230] hover:bg-[#252f42] border border-white/10 text-xs font-semibold text-gray-200 transition-colors active:scale-95"
            >
              Editar
            </button>
          ) : (
            <Link
              href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}
              className="px-3 py-1.5 rounded-xl bg-[#1c2230] hover:bg-[#252f42] border border-white/10 text-xs font-semibold text-emerald-300 block text-center transition-colors active:scale-95"
            >
              Ver
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Grid mode
  return (
    <div className="group relative flex flex-col rounded-2xl bg-[#141822] border border-white/5 hover:border-white/20 overflow-hidden transition-all duration-200 shadow-md hover:shadow-xl hover:-translate-y-0.5">
      <div className="relative w-full">
        <GamePosterCover
          src={userGame.gameCover}
          alt={userGame.gameTitle}
          aspectRatio="3/4"
          overlayContent={
            <>
              <div className="absolute top-1.5 left-1.5">
                {userGame.metacritic && <MetacriticBadge score={userGame.metacritic} size="sm" />}
              </div>
              <div className="absolute top-1.5 right-1.5">
                <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
              </div>
            </>
          }
        />
      </div>

      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5 font-mono">
            <span>{userGame.releaseYear || userGame.platformPlayed}</span>
            {userGame.isFavorite && <Heart className="w-3 h-3 fill-pink-400 text-pink-400" />}
          </div>
          <Link href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}>
            <h3 className="font-bold text-xs text-white hover:text-emerald-400 transition-colors line-clamp-1">
              {userGame.gameTitle}
            </h3>
          </Link>
        </div>

        <div className="pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono">
          <span className="text-amber-400 font-bold">
            {userGame.userRating !== null ? `★ ${userGame.userRating.toFixed(1)}` : "--"}
          </span>
          <span className="text-cyan-300 font-semibold flex items-center gap-0.5">
            <Clock className="w-2.5 h-2.5" />
            {userGame.userPlaytimeHours ? `${userGame.userPlaytimeHours}h` : "--"}
          </span>
        </div>

        {isOwner && onEditGame ? (
          <button
            type="button"
            onClick={() => onEditGame(asGame)}
            className="w-full py-1 rounded-xl bg-[#1c2230] hover:bg-[#252f42] border border-white/10 text-[11px] font-semibold text-gray-200 transition-colors active:scale-95"
          >
            Editar
          </button>
        ) : (
          <Link
            href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}
            className="w-full py-1 rounded-xl bg-[#1c2230] hover:bg-[#252f42] border border-white/10 text-[11px] font-semibold text-emerald-300 block text-center transition-colors active:scale-95"
          >
            Ver Detalhes
          </Link>
        )}
      </div>
    </div>
  );
}
