"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import { UserGame, Game } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import UserAvatar from "./UserAvatar";
import PlanBadge from "./PlanBadge";
import GameModal from "./GameModal";
import {
  Trophy,
  Clock,
  Play,
  Target,
  Sparkles,
  Gamepad2,
  Bookmark,
  ChevronRight,
  Flame,
  Plus,
} from "lucide-react";

interface GamerDashboardWidgetProps {
  currentlyPlaying?: UserGame | null;
  playingGameObj?: Game | null;
  onOpenRoulette: () => void;
}

export default function GamerDashboardWidget({
  currentlyPlaying,
  playingGameObj,
  onOpenRoulette,
}: GamerDashboardWidgetProps) {
  const { user } = useAuth();
  const { stats, library } = useGameLibrary();
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);

  if (!user) return null;

  // Meta padrão anual (ex: 25 jogos zerados por ano)
  const annualGoalTarget = 25;
  const completedCount = stats.completedCount || 0;
  const progressPercent = Math.min(100, Math.round((completedCount / annualGoalTarget) * 100));

  return (
    <>
      <section
        aria-label="Painel Gamer do Jogador"
        className="relative overflow-hidden rounded-2xl border border-[#242a36] bg-[#11141b] shadow-2xl p-5 sm:p-6 transition-all"
      >
        {/* Glow decorativo de fundo */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* ========================================================
              COLUNA ESQUERDA: PERFIL, MÉTRICAS & META ANUAL 2026 (7 cols)
          ======================================================== */}
          <div className="lg:col-span-7 space-y-4">
            {/* Linha Superior: Avatar, Identidade e Selo */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserAvatar photoURL={user.photoURL} name={user.displayName} size="md" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-white truncate">
                      {user.displayName}
                    </h3>
                    <PlanBadge plan={user.plan || "free"} size="sm" />
                  </div>
                  <span className="text-xs text-neutral-400 font-mono block">
                    @{user.username || "gamer"}
                  </span>
                </div>
              </div>

              <Link
                href="/perfil"
                className="text-xs font-mono text-[#00E5FF] hover:underline flex items-center gap-1 shrink-0 font-semibold"
              >
                <span>Ver Perfil</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Barra da Meta Anual 2026 */}
            <div className="p-3.5 rounded-xl bg-[#161a23] border border-[#262d3a] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-white">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span>Meta Anual 2026</span>
                </div>
                <div className="font-mono text-xs tabular-nums text-emerald-400 font-bold">
                  {completedCount} / {annualGoalTarget} jogos ({progressPercent}%)
                </div>
              </div>

              {/* Barra de Progresso Estilizada */}
              <div className="w-full h-2 rounded-full bg-[#0d0f14] overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#00E5FF] via-cyan-400 to-emerald-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,229,255,0.4)]"
                  style={{ width: `${Math.max(5, progressPercent)}%` }}
                />
              </div>
            </div>

            {/* Pills de Estatísticas Táteis */}
            <div className="grid grid-cols-3 gap-2 text-center font-mono">
              <div className="p-2.5 rounded-xl bg-[#161a23] border border-[#262d3a]">
                <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1 mb-0.5">
                  <Trophy className="w-3 h-3 text-[#00E5FF]" /> Zerados
                </div>
                <div className="text-sm sm:text-base font-bold text-white tabular-nums">
                  {stats.completedCount}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#161a23] border border-[#262d3a]">
                <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1 mb-0.5">
                  <Clock className="w-3 h-3 text-amber-400" /> Horas
                </div>
                <div className="text-sm sm:text-base font-bold text-white tabular-nums">
                  {stats.totalPlaytimeHours}h
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-[#161a23] border border-[#262d3a]">
                <div className="text-[10px] text-neutral-400 flex items-center justify-center gap-1 mb-0.5">
                  <Gamepad2 className="w-3 h-3 text-emerald-400" /> Acervo
                </div>
                <div className="text-sm sm:text-base font-bold text-white tabular-nums">
                  {stats.totalGames}
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================
              COLUNA DIREITA: JOGO EM ANDAMENTO OU ATALHO RÁPIDO (5 cols)
          ======================================================== */}
          <div className="lg:col-span-5 h-full flex flex-col justify-center">
            {currentlyPlaying ? (
              <div className="p-4 rounded-xl bg-[#161a23] border border-[#262d3a] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                    <Play className="w-3 h-3 fill-current text-cyan-400" />
                    JOGANDO AGORA
                  </div>
                  {currentlyPlaying.hltbData?.mainStory && (
                    <span className="text-[10px] text-neutral-400 font-mono">
                      ~{currentlyPlaying.hltbData.mainStory}h HLTB
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 min-w-0">
                  {currentlyPlaying.gameCover ? (
                    <div className="w-14 h-18 aspect-[3/4] rounded-lg overflow-hidden shadow-md border border-white/10 shrink-0 bg-neutral-900">
                      <img
                        src={currentlyPlaying.gameCover}
                        alt={currentlyPlaying.gameTitle}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : null}

                  <div className="min-w-0 space-y-1">
                    <h4 className="text-sm font-bold text-white truncate max-w-xs">
                      {currentlyPlaying.gameTitle}
                    </h4>
                    <div className="text-xs text-neutral-300 font-mono">
                      <strong className="text-[#00E5FF] tabular-nums">
                        {currentlyPlaying.userPlaytimeHours || 0}h
                      </strong>{" "}
                      dedicadas
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={getGameUrl({ id: currentlyPlaying.gameId, name: currentlyPlaying.gameTitle })}
                    className="flex-1 py-2 rounded-lg bg-[#1f2533] hover:bg-[#273042] border border-[#343e54] text-xs font-semibold text-neutral-200 hover:text-white text-center transition-all"
                  >
                    Ver Jogo
                  </Link>

                  {playingGameObj && (
                    <button
                      onClick={() => setSelectedGameForModal(playingGameObj)}
                      className="flex-1 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Trophy className="w-3.5 h-3.5" /> Atualizar
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-[#161a23] border border-[#262d3a] space-y-3 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                  PRÓXIMA JORNADA
                </div>
                <p className="text-xs text-neutral-300 leading-snug">
                  Nenhum jogo ativo no momento. Gire a roleta ou explore o catálogo para definir sua próxima aventura!
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={onOpenRoulette}
                    className="flex-1 py-2 rounded-lg bg-[#1f2533] hover:bg-[#273042] border border-[#343e54] text-xs font-bold text-amber-300 transition-all cursor-pointer"
                  >
                    🎲 Sortear Jogo
                  </button>
                  <Link
                    href="/search"
                    className="flex-1 py-2 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold text-center transition-all shadow-md"
                  >
                    Explorar
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal para atualizar horas / status */}
      {selectedGameForModal && (
        <GameModal
          game={selectedGameForModal}
          isOpen={Boolean(selectedGameForModal)}
          onClose={() => setSelectedGameForModal(null)}
        />
      )}
    </>
  );
}
