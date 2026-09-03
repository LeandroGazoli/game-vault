"use client";

import React, { useState, useMemo } from "react";
import { UserGame, Game } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import MetacriticBadge from "./MetacriticBadge";
import StatusBadge from "./StatusBadge";
import Link from "next/link";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import {
  X,
  Dices,
  Sparkles,
  Clock,
  Gamepad2,
  Filter,
  Flame,
  Check,
  Play,
  RotateCcw,
  ArrowRight,
  Trophy,
} from "lucide-react";

const Roulette3D = dynamic(() => import("./3d/Roulette3D"), {
  ssr: false,
});

interface GameRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: UserGame[];
}

export default function GameRouletteModal({
  isOpen,
  onClose,
  games,
}: GameRouletteModalProps) {
  const { addOrUpdateGame } = useGameLibrary();
  const [durationFilter, setDurationFilter] = useState<string>("all");
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedGame, setSelectedGame] = useState<UserGame | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [statusUpdated, setStatusUpdated] = useState(false);

  // Pool de jogos elegíveis (Prioriza Backlog "Quero Jogar" e "Pausados")
  const eligibleGames = useMemo(() => {
    let pool = games.filter((g) => g.status === "backlog" || g.status === "dropped");
    if (pool.length === 0) {
      pool = games; // Se o backlog estiver vazio, usa a biblioteca toda
    }

    if (durationFilter === "short") {
      pool = pool.filter((g) => {
        const hours = g.hltbData?.mainStory || 10;
        return hours <= 12;
      });
    } else if (durationFilter === "medium") {
      pool = pool.filter((g) => {
        const hours = g.hltbData?.mainStory || 20;
        return hours > 12 && hours <= 30;
      });
    } else if (durationFilter === "long") {
      pool = pool.filter((g) => {
        const hours = g.hltbData?.mainStory || 40;
        return hours > 30;
      });
    }

    return pool;
  }, [games, durationFilter]);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (eligibleGames.length === 0) return;

    setIsSpinning(true);
    setStatusUpdated(false);

    let counter = 0;
    const totalIterations = 20;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * eligibleGames.length);
      setSelectedGame(eligibleGames[randomIndex]);
      counter++;

      if (counter >= totalIterations) {
        clearInterval(interval);
        setIsSpinning(false);
        setSpinCount((prev) => prev + 1);
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }, 100);
  };

  const handleStartPlaying = async () => {
    if (!selectedGame) return;
    await addOrUpdateGame({
      ...selectedGame,
      status: "playing",
      startedAt: new Date().toISOString(),
    });
    setStatusUpdated(true);
  };

  return (
    <div
      className="fixed inset-0 z-[999] !m-0 !mt-0 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header da Roleta */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-semibold">
            <Dices className="w-3.5 h-3.5" />
            Roleta Inteligente do Backlog
          </div>
          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            O Que Jogar a Seguir?
          </h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Sem saber o que começar? Deixe o algoritmo sortear o jogo ideal do seu backlog com base no seu tempo livre!
          </p>
        </div>

        {/* Filtro de Tempo Disponível */}
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" /> Quanto tempo você tem livre?
          </label>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: "all", label: "Qualquer Duração" },
              { id: "short", label: "Curto (< 12h)" },
              { id: "medium", label: "Médio (12h - 30h)" },
              { id: "long", label: "Longo / RPG (30h+)" },
            ].map((dur) => (
              <button
                key={dur.id}
                type="button"
                onClick={() => {
                  setDurationFilter(dur.id);
                  setSelectedGame(null);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                  durationFilter === dur.id
                    ? "bg-[#00E5FF] text-black font-bold shadow-md scale-105"
                    : "bg-white/5 hover:bg-white/10 text-gray-300"
                }`}
              >
                {dur.label}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
            <span>Jogos elegíveis no seu Backlog:</span>
            <span className="font-mono font-bold text-[#00E5FF]">{eligibleGames.length} títulos</span>
          </div>
        </div>

        {/* Centro 3D da Roleta */}
        <div className="relative rounded-2xl bg-[#10131a] border border-[#242a36] p-4 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-2 left-3 text-[10px] font-mono text-cyan-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span>[3D CORE // DADO D20 ARCADE]</span>
          </div>
          <Roulette3D isSpinning={isSpinning} />
        </div>

        {/* Card do Jogo Sorteado */}
        {selectedGame ? (
          <div
            className={`relative rounded-3xl overflow-hidden border p-5 sm:p-6 transition-all duration-300 ${
              isSpinning
                ? "border-[#00E5FF] bg-[#00E5FF]/10 scale-95 blur-[0.5px]"
                : "border-purple-500/40 bg-gradient-to-b from-purple-950/30 via-[#18191c] to-black shadow-2xl shadow-purple-500/10 scale-100"
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-center sm:items-start text-center sm:text-left">
              {/* Capa */}
              <div className="relative w-28 sm:w-32 h-36 sm:h-44 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0 border border-white/20">
                <img
                  src={selectedGame.gameCover || "https://placehold.co/300x400/18191c/ffffff?text=Capa"}
                  alt={selectedGame.gameTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Informações */}
              <div className="space-y-3 flex-1">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                    <StatusBadge status={selectedGame.status} />
                    {selectedGame.metacritic && (
                      <MetacriticBadge score={selectedGame.metacritic} />
                    )}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {selectedGame.gameTitle}
                  </h4>
                </div>

                {/* Tempos HowLongToBeat */}
                {selectedGame.hltbData && (
                  <div className="flex items-center justify-center sm:justify-start gap-3 text-xs bg-white/5 border border-white/5 p-2.5 rounded-xl">
                    <span className="text-gray-400">Tempo de Campanha:</span>
                    <span className="font-mono font-bold text-[#00E5FF]">
                      ~{selectedGame.hltbData.mainStory || 15}h para zerar
                    </span>
                  </div>
                )}

                {/* Ações do Jogo Sorteado */}
                {!isSpinning && (
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2">
                    <button
                      onClick={handleStartPlaying}
                      disabled={statusUpdated}
                      className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg hover:scale-105 flex items-center gap-1.5"
                    >
                      {statusUpdated ? (
                        <>
                          <Check className="w-4 h-4" /> Movido para Jogando!
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-black" /> Começar a Jogar Agora
                        </>
                      )}
                    </button>

                    <Link
                      href={`/game/${selectedGame.gameId}`}
                      className="px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      Ver Detalhes <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Botão Principal de Girar */}
        <div className="flex justify-center pt-2">
          <button
            onClick={handleSpin}
            disabled={isSpinning || eligibleGames.length === 0}
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-500 hover:from-purple-400 hover:to-cyan-400 text-black font-black text-sm transition-all shadow-xl shadow-purple-500/20 hover:scale-105 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className={`w-4 h-4 ${isSpinning ? "animate-spin" : ""}`} />
            {isSpinning
              ? "Sorteando Jogo Perfeito..."
              : selectedGame
              ? "Girar Novamente 🎲"
              : "Sortear Jogo do Backlog 🎲"}
          </button>
        </div>
      </div>
    </div>
  );
}
