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
          href="/conquistas"
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 active:scale-95 transition-transform"
        >
          <span>Ver Todas</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid de Franquias com Pentagon Badge & Game Art */}
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
            none: { label: "Bloqueada", color: "text-gray-400 bg-black/60 border-white/10" },
            bronze: { label: "Bronze", color: "text-amber-500 bg-amber-950/80 border-amber-600/40" },
            silver: { label: "Prata", color: "text-slate-200 bg-slate-900/80 border-slate-400/40" },
            gold: { label: "Ouro", color: "text-amber-300 bg-amber-900/80 border-amber-400/50" },
            platinum: { label: "Platina 100%", color: "text-cyan-300 bg-cyan-950/80 border-cyan-400/50" },
          }[prog.unlockedTier];

          return (
            <div
              key={badge.id}
              className={`relative rounded-2xl border p-3.5 transition-all duration-300 overflow-hidden group ${
                isUnlocked
                  ? "border-white/15 hover:border-amber-500/40 shadow-lg"
                  : "border-white/5 opacity-80"
              }`}
            >
              {/* Background Artístico da Capa do Jogo com Gradiente Suave */}
              {badge.coverUrl && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <img
                    src={badge.coverUrl}
                    alt={badge.name}
                    className="w-full h-full object-cover object-center opacity-15 scale-105 group-hover:scale-110 transition-transform duration-700 blur-[2px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#141822] via-[#141822]/90 to-[#141822]/80" />
                </div>
              )}

              <div className="relative z-10 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {/* Insígnia em Formato Pentágono com Capa/Arte da Franquia */}
                    <div
                      className="relative shrink-0 flex items-center justify-center transition-transform group-hover:scale-105"
                      style={{ width: "48px", height: "48px" }}
                    >
                      {/* Borda Externa Pentágono */}
                      <div
                        className="absolute inset-0 shadow-md"
                        style={{
                          clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                          backgroundColor: isUnlocked ? badge.accentColor : "rgba(255,255,255,0.15)",
                        }}
                      />
                      {/* Conteúdo Interno Pentágono */}
                      <div
                        className="absolute inset-[2px] overflow-hidden flex items-center justify-center bg-[#0d1017]"
                        style={{
                          clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
                        }}
                      >
                        {badge.coverUrl ? (
                          <img
                            src={badge.coverUrl}
                            alt={badge.name}
                            className={`w-full h-full object-cover ${!isUnlocked ? "grayscale opacity-40" : "opacity-90"}`}
                          />
                        ) : (
                          <Flame
                            className="w-5 h-5"
                            style={{ color: isUnlocked ? badge.accentColor : "#9ca3af" }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                        {badge.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 truncate">{badge.tagline}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${tierBadge.color}`}
                  >
                    {tierBadge.label}
                  </span>
                </div>

                {/* Barra de Progresso de Jogos */}
                <div className="space-y-1.5 pt-0.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-300 font-medium">
                      {prog.completedGamesCount}/{prog.totalGamesCount} jogos zerados
                    </span>
                    <span className="font-mono font-bold text-white">{progressPercent}%</span>
                  </div>

                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500 shadow-sm"
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
                          className={`inline-flex items-center gap-0.5 text-[9px] px-1.5 py-0.5 rounded-md border transition-colors shrink-0 ${
                            done
                              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-medium"
                              : "bg-black/30 border-white/5 text-gray-500"
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
