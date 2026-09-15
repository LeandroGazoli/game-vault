"use client";

import React from "react";
import { UserProfile, LibraryStats } from "@/lib/types";
import { GamerRankResult } from "@/lib/firebase";
import LegendaryVaultCard from "@/components/profile/LegendaryVaultCard";
import GamerScoreboardCard from "@/components/profile/GamerScoreboardCard";
import GamerBadgesCard from "@/components/profile/GamerBadgesCard";
import GamerQuestsCard from "@/components/profile/GamerQuestsCard";
import { Trophy } from "lucide-react";

export interface ProfileGamificationSectionProps {
  user: UserProfile;
  stats: LibraryStats;
  isOwner: boolean;
  realGamerRank?: GamerRankResult | null;
  onOpenUpgrade?: () => void;
  onOpenManagePlan?: () => void;
  onOpenXpBreakdown?: () => void;
  onOpenCustomizer?: () => void;
}

export default function ProfileGamificationSection({
  user,
  stats,
  isOwner,
  realGamerRank,
  onOpenUpgrade,
  onOpenManagePlan,
  onOpenXpBreakdown,
  onOpenCustomizer,
}: ProfileGamificationSectionProps) {
  return (
    <div id="profile-achievements" className="profile-achievements space-y-4 animate-fadeIn">
      {/* Cabeçalho da Central Gamer */}
      <div className="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[#141822] border border-white/10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-white">Central de Conquistas &amp; Nível</h3>
            <p className="text-[11px] text-gray-400">Progressão, placar e insígnias conquistadas</p>
          </div>
        </div>
      </div>

      {/* Card de Nível e Insígnia */}
      <LegendaryVaultCard
        user={user}
        stats={stats}
        isOwner={isOwner}
        realRank={realGamerRank?.formattedRank}
        onOpenUpgrade={onOpenUpgrade}
        onOpenManagePlan={onOpenManagePlan}
        onOpenXpBreakdown={onOpenXpBreakdown}
      />

      {/* Placar de Pontos e XP */}
      <GamerScoreboardCard
        stats={stats}
        plan={user.plan}
        bonusXp={user.bonusXp}
        onOpenXpBreakdown={onOpenXpBreakdown}
      />

      {/* Expositor de Insígnias */}
      <GamerBadgesCard
        stats={stats}
        gamerLevel={user.gamerLevel}
        userId={user.uid}
        isOwner={isOwner}
        claimedRewards={user.claimedRewards}
      />

      {/* Missões Gamers */}
      <GamerQuestsCard
        stats={stats}
        user={user}
        isOwner={isOwner}
        onOpenCustomizer={onOpenCustomizer}
      />
    </div>
  );
}
