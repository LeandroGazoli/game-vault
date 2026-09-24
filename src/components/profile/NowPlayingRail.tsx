"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { UserGame } from "@/lib/types";
import { getGameUrl } from "@/lib/routes";
import { Gamepad2, Clock, Trophy, Play, Pause, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

export interface NowPlayingRailProps {
  games: UserGame[];
  pinnedGameIds?: number[];
  intervalSeconds?: number;
  isOwner?: boolean;
  className?: string;
}

export default function NowPlayingRail({
  games,
  pinnedGameIds = [],
  intervalSeconds = 6,
  isOwner = false,
  className = "",
}: NowPlayingRailProps) {
  // Filtra jogos com status 'playing'
  const activePlayingGames = useMemo(() => {
    const playing = games.filter((g) => g.status === "playing");

    // Fallback inteligente: se houver IDs fixados manualmente, usa apenas os fixados que continuam 'playing'.
    // Se nenhum estiver ativo, faz fallback para todos os 'playing' ou para os jogos recentes.
    if (pinnedGameIds.length > 0) {
      const pinnedPlaying = playing.filter((g) => pinnedGameIds.includes(g.gameId));
      if (pinnedPlaying.length > 0) return pinnedPlaying;
    }

    return playing.length > 0 ? playing : games.slice(0, 3);
  }, [games, pinnedGameIds]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotação a cada N segundos
  useEffect(() => {
    if (activePlayingGames.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activePlayingGames.length);
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [activePlayingGames.length, intervalSeconds, isPaused]);

  if (activePlayingGames.length === 0) return null;

  const currentGame = activePlayingGames[currentIndex] || activePlayingGames[0];
  const targetUrl = getGameUrl({
    id: currentGame.gameId,
    slug: currentGame.gameSlug,
    name: currentGame.gameTitle,
  });

  const handleNext = () => {
    triggerSelectionHaptic();
    setCurrentIndex((prev) => (prev + 1) % activePlayingGames.length);
  };

  const handlePrev = () => {
    triggerSelectionHaptic();
    setCurrentIndex((prev) => (prev - 1 + activePlayingGames.length) % activePlayingGames.length);
  };

  return (
    <div
      className={`rounded-3xl bg-gradient-to-r from-[#141822] via-[#1a2130] to-[#141822] border border-cyan-500/30 p-4 sm:p-5 shadow-xl shadow-cyan-950/20 relative overflow-hidden transition-all ${className}`}
    >
      {/* Background Cover com Blur */}
      {currentGame.gameCover && (
        <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden">
          <img
            src={currentGame.gameCover}
            alt=""
            className="w-full h-full object-cover blur-2xl scale-125"
          />
        </div>
      )}

      <div className="relative z-10 space-y-3.5">
        {/* Header do Rail com Indicadores de Rotação */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center">
              <Gamepad2 className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs sm:text-sm font-black text-white tracking-tight uppercase">
                  Jogando Agora
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {currentIndex + 1} de {activePlayingGames.length}
                </span>
              </div>
            </div>
          </div>

          {/* Controles de Play/Pause & Setas */}
          <div className="flex items-center gap-1.5">
            {activePlayingGames.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors text-xs"
                  title={isPaused ? "Retomar rotação automática" : "Pausar rotação"}
                >
                  {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Jogo anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                  title="Próximo jogo"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Card do Jogo Atual em Destaque */}
        <div className="flex items-center gap-3.5 sm:gap-4 bg-[#0d1017]/80 rounded-2xl p-2.5 sm:p-3 border border-white/5 backdrop-blur-md">
          {/* Capa */}
          <Link href={targetUrl} className="shrink-0 group">
            <div className="w-16 sm:w-20 aspect-[3/4] rounded-xl overflow-hidden bg-black/40 ring-1 ring-white/10 group-hover:ring-cyan-400 transition-all shadow-md">
              <img
                src={currentGame.gameCover || "/placeholder-game.png"}
                alt={currentGame.gameTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>

          {/* Dados & Progresso */}
          <div className="flex-1 min-w-0 space-y-1">
            <Link href={targetUrl} className="block group">
              <h4 className="text-sm sm:text-base font-black text-white group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug">
                {currentGame.gameTitle}
              </h4>
            </Link>

            <div className="flex items-center gap-3 text-[11px] font-mono text-gray-400 flex-wrap">
              {currentGame.userPlaytimeHours ? (
                <span className="flex items-center gap-1 text-cyan-300 font-bold">
                  <Clock className="w-3 h-3" />
                  {currentGame.userPlaytimeHours}h registradas
                </span>
              ) : null}

              {currentGame.platformPlayed && (
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-gray-300 text-[10px] font-semibold">
                  {currentGame.platformPlayed}
                </span>
              )}

              {currentGame.userRating && (
                <span className="text-amber-400 font-bold">
                  ★ {currentGame.userRating.toFixed(1)}
                </span>
              )}
            </div>

            {/* Barra de Progresso Visual de Conclusão / HLTB */}
            {currentGame.hltbData?.mainStory && (
              <div className="pt-1 space-y-1">
                <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                  <span>Campanha: ~{currentGame.hltbData.mainStory}h</span>
                  {currentGame.userPlaytimeHours ? (
                    <span className="text-emerald-400 font-bold">
                      {Math.min(100, Math.round((currentGame.userPlaytimeHours / currentGame.hltbData.mainStory) * 100))}%
                    </span>
                  ) : null}
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round(((currentGame.userPlaytimeHours || 0) / (currentGame.hltbData.mainStory || 1)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
