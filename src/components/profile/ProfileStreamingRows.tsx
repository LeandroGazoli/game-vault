"use client";

import React from "react";
import Link from "next/link";
import { UserGame } from "@/lib/types";
import StreamingCarousel from "@/components/common/StreamingCarousel";
import GamePosterCard from "@/components/common/GamePosterCard";
import ViewAllCard from "@/components/common/ViewAllCard";
import { Gamepad2, Bookmark, Trophy, ChevronRight, Plus } from "lucide-react";

export interface ProfileStreamingRowsProps {
  playingGames: UserGame[];
  backlogGames: UserGame[];
  completedGames: UserGame[];
  isOwner: boolean;
  onEditGame?: (game: any) => void;
  onSelectTab: (tabId: string) => void;
}

/**
 * 3 Linhas de Jogos no Modelo Streaming (Netflix/Xbox Cloud):
 * 1. Jogando (com limite + card 'Ver todos' no final)
 * 2. Quero Jogar (com limite + card 'Ver todos' no final)
 * 3. Zerados (com limite + card 'Ver todos' no final)
 */
export default function ProfileStreamingRows({
  playingGames,
  backlogGames,
  completedGames,
  isOwner,
  onEditGame,
  onSelectTab,
}: ProfileStreamingRowsProps) {
  return (
    <div className="space-y-8">
      {/* BLOCO 1: JOGANDO AGORA */}
      <div id="streaming-row-playing" className="space-y-3 scroll-mt-20">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#0e2730] border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Gamepad2 className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Jogando</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0e2730] text-cyan-300 border border-cyan-500/40">
                {playingGames.length}
              </span>
            </h3>
          </div>

          {playingGames.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab("playing")}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 transition-colors"
            >
              <span>Ver todos ({playingGames.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {playingGames.length > 0 ? (
          <StreamingCarousel>
            {playingGames.slice(0, 10).map((game) => (
              <GamePosterCard
                key={game.gameId}
                game={game}
                onEdit={isOwner && onEditGame ? onEditGame : undefined}
              />
            ))}
            <ViewAllCard
              onClick={() => onSelectTab("playing")}
              count={playingGames.length}
              title="Ver Jogando"
              label="Explorar todos em andamento"
            />
          </StreamingCarousel>
        ) : (
          <div className="p-6 rounded-2xl bg-[#141822] border border-dashed border-white/10 text-center space-y-2">
            <p className="text-xs text-gray-400">Nenhum jogo em andamento no momento.</p>
            {isOwner && (
              <button
                type="button"
                onClick={() => onSelectTab("backlog")}
                className="px-3.5 py-1.5 rounded-xl bg-[#1c2230] hover:bg-[#252f42] text-xs font-bold text-gray-200 border border-white/10 inline-flex items-center gap-1.5"
              >
                <span>Escolher do Backlog ({backlogGames.length})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* BLOCO 2: QUERO JOGAR (BACKLOG) */}
      <div id="streaming-row-backlog" className="space-y-3 scroll-mt-20">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#21152d] border border-purple-500/40 text-purple-400 flex items-center justify-center">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Quero Jogar</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#21152d] text-purple-300 border border-purple-500/40">
                {backlogGames.length}
              </span>
            </h3>
          </div>

          {backlogGames.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab("backlog")}
              className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-0.5 transition-colors"
            >
              <span>Ver todos ({backlogGames.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {backlogGames.length > 0 ? (
          <StreamingCarousel>
            {backlogGames.slice(0, 10).map((game) => (
              <GamePosterCard
                key={game.gameId}
                game={game}
                onEdit={isOwner && onEditGame ? onEditGame : undefined}
              />
            ))}
            <ViewAllCard
              onClick={() => onSelectTab("backlog")}
              count={backlogGames.length}
              title="Ver Quero Jogar"
              label="Explorar backlog completo"
            />
          </StreamingCarousel>
        ) : (
          <div className="p-6 rounded-2xl bg-[#141822] border border-dashed border-white/10 text-center space-y-2">
            <p className="text-xs text-gray-400">Nenhum jogo na lista de desejos ou backlog.</p>
            {isOwner && (
              <Link
                href="/search"
                className="px-3.5 py-1.5 rounded-xl bg-[#10291e] hover:bg-[#163829] text-xs font-bold text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Explorar Catálogo</span>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* BLOCO 3: ZERADOS (COMPLETED) */}
      <div id="streaming-row-completed" className="space-y-3 scroll-mt-20">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#0d241a] border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Zerados</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#0d241a] text-emerald-300 border border-emerald-500/40">
                {completedGames.length}
              </span>
            </h3>
          </div>

          {completedGames.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab("completed")}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-0.5 transition-colors"
            >
              <span>Ver todos ({completedGames.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {completedGames.length > 0 ? (
          <StreamingCarousel>
            {completedGames.slice(0, 10).map((game) => (
              <GamePosterCard
                key={game.gameId}
                game={game}
                onEdit={isOwner && onEditGame ? onEditGame : undefined}
              />
            ))}
            <ViewAllCard
              onClick={() => onSelectTab("completed")}
              count={completedGames.length}
              title="Ver Zerados"
              label="Explorar acervo de vitórias"
            />
          </StreamingCarousel>
        ) : (
          <div className="p-6 rounded-2xl bg-[#141822] border border-dashed border-white/10 text-center space-y-2">
            <p className="text-xs text-gray-400">Nenhum jogo marcado como zerado ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
