"use client";

import React from "react";
import Link from "next/link";
import { UserProfile, LibraryStats, calculateGamerLevel } from "@/lib/types";
import { Trophy, ChevronRight, Sparkles, Zap } from "lucide-react";

export interface ProfileGamificationTeaserProps {
  user: UserProfile;
  stats: LibraryStats;
  isOwner: boolean;
}

/**
 * Card Teaser Compacto da Central de Conquistas & Nível.
 * Substitui listas longas de gamificação na página principal de perfil,
 * apresentando apenas o resumo de nível/XP e direcionando para o Hub dedicado de Conquistas.
 */
export default function ProfileGamificationTeaser({
  user,
  stats,
  isOwner,
}: ProfileGamificationTeaserProps) {
  const gamerLevelInfo = calculateGamerLevel(stats, undefined, user.plan, user.bonusXp);
  const displayLevel = user.gamerLevel || gamerLevelInfo.level;
  const progressPercent = Math.min(100, Math.max(0, Math.round(gamerLevelInfo.percentToNext)));

  const conquistasUrl = user.username
    ? `/perfil/${encodeURIComponent(user.username)}/conquistas`
    : "/conquistas";

  return (
    <div
      id="profile-gamification-teaser"
      className="p-4 sm:p-5 rounded-3xl bg-[#141822] border border-white/10 shadow-lg space-y-3.5 transition-all hover:border-amber-500/30"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                Hub de Conquistas &amp; Nível
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Nível {displayLevel}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              {stats.completedCount} jogos zerados • {gamerLevelInfo.xp.toLocaleString()} XP acumulado
            </p>
          </div>
        </div>

        <Link
          href={conquistasUrl}
          className="hidden sm:flex items-center gap-1 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
        >
          <span>Ver Conquistas</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Barra de Progresso XP */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-gray-400 flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" />
            Progresso para o Nível {displayLevel + 1}
          </span>
          <span className="text-amber-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#1c2230] overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Botão de Acesso Direto para Mobile / Desktop */}
      <Link
        href={conquistasUrl}
        className="w-full py-2.5 px-4 rounded-2xl bg-[#1a202c] hover:bg-[#222a3a] border border-white/10 text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all group"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span>Abrir Central de Conquistas, Missões &amp; Placar</span>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
