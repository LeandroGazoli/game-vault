"use client";

import React from "react";
import { UserGame } from "@/lib/types";
import MetacriticBadge from "./MetacriticBadge";
import StatusBadge from "./StatusBadge";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import {
  Trophy,
  Star,
  Clock,
  Quote,
  Sparkles,
  ArrowRight,
  Flame,
} from "lucide-react";

interface ShowcaseGameCardProps {
  game?: UserGame | null;
  className?: string;
}

export default function ShowcaseGameCard({
  game,
  className = "",
}: ShowcaseGameCardProps) {
  if (!game) return null;

  return (
    <div
      className={`relative rounded-3xl overflow-hidden border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-[#18191c] to-[#121316] p-6 sm:p-7 shadow-2xl shadow-amber-500/5 ${className}`}
    >
      {/* Background Cover Blur Effect */}
      {game.gameCover && (
        <img
          src={game.gameCover}
          alt=""
          className="absolute -right-10 -top-10 w-96 h-96 object-cover opacity-10 blur-2xl pointer-events-none"
        />
      )}

      {/* Header do Destaque */}
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/5 text-[11px] font-mono">
        <span className="flex items-center gap-1.5 text-amber-300 font-extrabold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5 text-amber-400" /> Jogo em Destaque no Perfil
        </span>
        <span className="text-gray-400 font-medium">Obra-Prima Escolhida</span>
      </div>

      <div className="relative z-10 flex flex-col sm:flex-row gap-5 sm:gap-6 items-center sm:items-start">
        {/* Capa */}
        <Link
          href={getGameUrl({ id: game.gameId, name: game.gameTitle })}
          className="relative w-28 sm:w-36 h-40 sm:h-52 rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl flex-shrink-0 group hover:scale-105 transition-transform"
        >
          <img
            src={game.gameCover || "https://placehold.co/300x400"}
            alt={game.gameTitle}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-xs font-bold text-white flex items-center gap-1 bg-black/70 px-2.5 py-1 rounded-full">
              Ver Jogo <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </Link>

        {/* Informações & Resenha do Jogador */}
        <div className="space-y-3 flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
            <StatusBadge status={game.status} />
            {game.metacritic && <MetacriticBadge score={game.metacritic} />}
            {game.completionType && (
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-400" />
                {game.completionType === "platinum"
                  ? "Platina Conquistada"
                  : game.completionType === "completionist"
                  ? "100% Concluído"
                  : "Campanha Zerada"}
              </span>
            )}
          </div>

          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {game.gameTitle}
            </h3>
            {game.platformPlayed && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Jogado no {game.platformPlayed}
              </p>
            )}
          </div>

          {/* Badges de Avaliação e Tempo */}
          <div className="flex items-center justify-center sm:justify-start gap-4 text-xs">
            {game.userRating !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Nota Pessoal: {game.userRating}/10</span>
              </div>
            )}
            {game.userPlaytimeHours !== null && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] font-bold">
                <Clock className="w-3.5 h-3.5" />
                <span>{game.userPlaytimeHours}h registradas</span>
              </div>
            )}
          </div>

          {/* Resenha / Citação do Jogador */}
          {game.userReview ? (
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 text-xs text-gray-300 italic leading-relaxed relative">
              <Quote className="w-4 h-4 text-amber-400/40 mb-1" />
              &quot;{game.userReview}&quot;
            </div>
          ) : (
            <p className="text-xs text-gray-400">
              Jogo selecionado como destaque especial no perfil do jogador.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
