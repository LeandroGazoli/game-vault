"use client";

import React, { useState, useMemo } from "react";
import { UserGame, UserProfile, LibraryStats } from "@/lib/types";
import UserAvatar from "./UserAvatar";
import {
  X,
  Sparkles,
  Trophy,
  Clock,
  Star,
  Gamepad2,
  Flame,
  Share2,
  Check,
  Crown,
  Layers,
  Award,
} from "lucide-react";

interface GamerWrappedModalProps {
  isOpen: boolean;
  onClose: () => void;
  games: UserGame[];
  user: UserProfile;
  stats: LibraryStats;
}

export default function GamerWrappedModal({
  isOpen,
  onClose,
  games,
  user,
  stats,
}: GamerWrappedModalProps) {
  const [copiedShare, setCopiedShare] = useState(false);

  // Computa destaques da retrospectiva
  const wrappedData = useMemo(() => {
    const completed = games.filter((g) => g.status === "completed");
    const totalPlaytime = games.reduce((acc, g) => acc + (g.userPlaytimeHours || 0), 0);

    // Jogo mais jogado
    let longestGame = games.length > 0 ? games[0] : null;
    games.forEach((g) => {
      if ((g.userPlaytimeHours || 0) > (longestGame?.userPlaytimeHours || 0)) {
        longestGame = g;
      }
    });

    // Jogo com maior nota dada pelo usuário
    let highestRated = games.length > 0 ? games[0] : null;
    games.forEach((g) => {
      if ((g.userRating || 0) > (highestRated?.userRating || 0)) {
        highestRated = g;
      }
    });

    // Gênero predominante
    const genreCount: Record<string, number> = {};
    games.forEach((g) => {
      if (g.genres) {
        g.genres.forEach((genre) => {
          genreCount[genre] = (genreCount[genre] || 0) + 1;
        });
      }
    });

    const topGenre = Object.entries(genreCount).sort((a, b) => b[1] - a[1])[0] || ["Gamer Eclético", 0];

    return {
      completedCount: completed.length,
      totalPlaytime,
      longestGame,
      highestRated,
      topGenre: topGenre[0],
      completionRate: games.length > 0 ? Math.round((completed.length / games.length) * 100) : 0,
    };
  }, [games]);

  if (!isOpen) return null;

  const handleShare = () => {
    const shareText = `🎮 Minha Retrospectiva Gamer no MyGameList!\n🏆 ${wrappedData.completedCount} jogos zerados\n⏱️ ${wrappedData.totalPlaytime} horas jogadas\n🔥 Gênero favorito: ${wrappedData.topGenre}\n⭐ Jogo do ano: ${wrappedData.highestRated?.gameTitle || "Vários"}\n\nConfira minha biblioteca: https://mygameslist.com.br/perfil/${user.username}`;
    
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareText);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[999] !m-0 !mt-0 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[36px] bg-[#141518] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Card Retrospectiva Estilizado (Story Mode) */}
        <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 via-[#18191c] to-black p-6 space-y-6 shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar photoURL={user.photoURL} name={user.displayName} size="md" />
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {user.displayName}
                  {user.plan === "vip" && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                </h4>
                <p className="text-[11px] text-[#00E5FF] font-mono">@{user.username}</p>
              </div>
            </div>

            <div className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[#00E5FF] text-[10px] font-black uppercase font-mono tracking-wider">
              WRAPPED 2026
            </div>
          </div>

          {/* Grid de 4 Estatísticas de Ouro */}
          <div className="grid grid-cols-2 gap-3">
            {/* Horas Jogadas */}
            <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-semibold">
                <Clock className="w-3.5 h-3.5" /> Tempo Jogado
              </div>
              <div className="text-2xl font-black text-white">{wrappedData.totalPlaytime}h</div>
              <p className="text-[10px] text-gray-400">dedicadas ao gameplay</p>
            </div>

            {/* Jogos Zerados */}
            <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold">
                <Trophy className="w-3.5 h-3.5" /> Zerados
              </div>
              <div className="text-2xl font-black text-white">{wrappedData.completedCount}</div>
              <p className="text-[10px] text-gray-400">{wrappedData.completionRate}% da biblioteca</p>
            </div>

            {/* Gênero Favorito */}
            <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-400 text-xs font-semibold">
                <Flame className="w-3.5 h-3.5" /> Gênero Dominante
              </div>
              <div className="text-sm font-black text-white truncate">{wrappedData.topGenre}</div>
              <p className="text-[10px] text-gray-400">seu estilo favorito</p>
            </div>

            {/* Média de Nota */}
            <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <Star className="w-3.5 h-3.5" /> Nota Média
              </div>
              <div className="text-2xl font-black text-white">{stats.averageRating || "—"}/10</div>
              <p className="text-[10px] text-gray-400">avaliação pessoal</p>
            </div>
          </div>

          {/* Destaque: Jogo Mais Jogado */}
          {wrappedData.longestGame && (
            <div className="rounded-2xl bg-white/5 border border-white/5 p-3.5 flex items-center gap-3">
              <img
                src={wrappedData.longestGame.gameCover || "https://placehold.co/100x100"}
                alt={wrappedData.longestGame.gameTitle}
                className="w-12 h-16 rounded-xl object-cover border border-white/10"
              />
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-mono text-cyan-400 font-bold flex items-center gap-1">
                  <Award className="w-3 h-3" /> Maior Conquista
                </span>
                <h5 className="text-xs font-bold text-white truncate">{wrappedData.longestGame.gameTitle}</h5>
                <p className="text-[11px] text-gray-400 font-mono">
                  {wrappedData.longestGame.userPlaytimeHours || 20}h jogadas
                </p>
              </div>
            </div>
          )}

          {/* Rodapé do Card */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span>mygameslist.com.br</span>
            <span>MyGameList Studio</span>
          </div>
        </div>

        {/* Botão de Compartilhar */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleShare}
            className="w-full py-3.5 rounded-full bg-[#00E5FF] hover:bg-cyan-400 text-black font-extrabold text-xs transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2"
          >
            {copiedShare ? (
              <>
                <Check className="w-4 h-4" /> Texto da Retrospectiva Copiado!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" /> Compartilhar Retrospectiva
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
