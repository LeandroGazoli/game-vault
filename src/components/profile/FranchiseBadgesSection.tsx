"use client";

import React, { useMemo } from "react";
import { UserGame } from "@/lib/types";
import { calculateFranchiseBadgesProgress } from "@/lib/franchiseBadgesUtils";
import { Flame, Award, Trophy, Shield, ChevronRight, Star } from "lucide-react";
import Link from "next/link";

interface FranchiseBadgesSectionProps {
  games: UserGame[];
  isOwner?: boolean;
}

export default function FranchiseBadgesSection({ games }: FranchiseBadgesSectionProps) {
  const { progressList, badges, totalUnlockedBadges } = useMemo(() => {
    return calculateFranchiseBadgesProgress(games);
  }, [games]);

  const badgeMap = useMemo(() => {
    return new Map(badges.map((b) => [b.id, b]));
  }, [badges]);

  return (
    <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Trophy className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Insígnias de Franquias</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                {totalUnlockedBadges}/{badges.length} Desbloqueadas
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Complete jogos de sagas consagradas para evoluir e desbloquear o Hall da Fama
            </p>
          </div>
        </div>

        <Link
          href="/profile/badges"
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 active:scale-95 transition-transform"
        >
          <span>Ver Todas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid de Franquias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {progressList.map((prog) => {
          const badge = badgeMap.get(prog.badgeId);
          if (!badge) return null;

          const isUnlocked = prog.unlockedTier !== "none";
          const progressPercent = Math.min(
            100,
            Math.round((prog.completedGamesCount / prog.totalGamesCount) * 100)
          );

          // Tier colors & badges
          const tierBadge = {
            none: { label: "Bloqueada", color: "text-gray-400 bg-white/5 border-white/10" },
            bronze: { label: "Bronze", color: "text-amber-600 bg-amber-900/20 border-amber-700/30" },
            silver: { label: "Prata", color: "text-slate-300 bg-slate-500/20 border-slate-400/30" },
            gold: { label: "Ouro", color: "text-amber-300 bg-amber-500/20 border-amber-400/40" },
            platinum: { label: "Platina 100%", color: "text-cyan-300 bg-cyan-500/20 border-cyan-400/40" },
          }[prog.unlockedTier];

          return (
            <div
              key={badge.id}
              className={`p-3.5 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                isUnlocked
                  ? "bg-[#181d28] border-white/10 hover:border-amber-500/30"
                  : "bg-[#12151d] border-white/5 opacity-75"
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center border"
                    style={{
                      backgroundColor: `${badge.accentColor}15`,
                      borderColor: `${badge.accentColor}40`,
                      color: badge.accentColor,
                    }}
                  >
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-tight">{badge.name}</h3>
                    <p className="text-[10px] text-gray-400">{badge.tagline}</p>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border ${tierBadge.color}`}
                >
                  {tierBadge.label}
                </span>
              </div>

              {/* Barra de Progresso de Jogos */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-400">
                    {prog.completedGamesCount}/{prog.totalGamesCount} jogos zerados
                  </span>
                  <span className="font-mono font-bold text-white">{progressPercent}%</span>
                </div>

                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${progressPercent}%`,
                      backgroundColor: badge.accentColor,
                    }}
                  />
                </div>

                {/* Estrelas / Pontos dos Jogos */}
                <div className="flex items-center gap-1 pt-1 overflow-x-auto no-scrollbar">
                  {badge.games.map((g) => {
                    const done = prog.completedGameIds.includes(g.id);
                    return (
                      <span
                        key={g.id}
                        title={`${g.title} (${done ? "Zerado" : "Pendente"})`}
                        className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded border transition-colors ${
                          done
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-white/5 border-white/5 text-gray-500"
                        }`}
                      >
                        <Star className={`w-2.5 h-2.5 ${done ? "fill-emerald-400 text-emerald-400" : ""}`} />
                        <span className="truncate max-w-[70px]">{g.title.split(":")[0]}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
