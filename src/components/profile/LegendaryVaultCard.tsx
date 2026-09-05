import React from "react";
import { UserProfile, LibraryStats, calculateGamerLevel } from "@/lib/types";
import { getSteamLevelTier } from "@/lib/steamUtils";
import { Crown, Sparkles, Trophy, ArrowRight, Award, Zap, Shield, Bookmark } from "lucide-react";

interface LegendaryVaultCardProps {
  user: UserProfile;
  stats?: LibraryStats | null;
  isOwner?: boolean;
  realRank?: string;
  onOpenUpgrade?: () => void;
  onOpenManagePlan?: () => void;
  onOpenXpBreakdown?: () => void;
}

export default function LegendaryVaultCard({
  user,
  stats,
  isOwner,
  realRank,
  onOpenUpgrade,
  onOpenManagePlan,
  onOpenXpBreakdown,
}: LegendaryVaultCardProps) {
  const isVip = user.plan === "vip";
  const isPro = user.plan === "pro";
  const isVipOrPro = isVip || isPro;
  const gamerLevelInfo = calculateGamerLevel(stats, realRank, user.plan);
  const displayLevel = user.gamerLevel || gamerLevelInfo.level;
  const steamTier = getSteamLevelTier(displayLevel);

  // Insígnia em destaque automática baseada nas estatísticas
  const featuredBadge = (() => {
    const completed = stats?.completedCount || 0;
    if (completed >= 30) return { title: "Lenda dos Zerados", level: "Nível 4", xp: "+500 XP", icon: Trophy, rarity: "epico" };
    if (completed >= 15) return { title: "Mestre do Backlog", level: "Nível 3", xp: "+300 XP", icon: Award, rarity: "raro" };
    if (completed >= 5) return { title: "Zerador Nato", level: "Nível 2", xp: "+150 XP", icon: Shield, rarity: "comum" };
    return { title: "Pilar da Comunidade", level: "Nível 1", xp: "+100 XP", icon: Bookmark, rarity: "comum" };
  })();
  const FeaturedIcon = featuredBadge.icon;

  const handleAction = () => {
    if (isVipOrPro && onOpenManagePlan) {
      onOpenManagePlan();
    } else if (onOpenUpgrade) {
      onOpenUpgrade();
    }
  };

  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-[#2a475e] bg-gradient-to-r from-[#171a21] via-[#1b2838] to-[#111923] p-4 sm:p-6 shadow-2xl overflow-hidden">
      {/* Luz ambiente Steam suave */}
      <div
        className="absolute top-0 right-1/4 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: steamTier.borderColor }}
      />

      <div className="relative z-10 space-y-4">
        {/* Topo: Nível Steam Circle + Insígnia em Destaque */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Lado Esquerdo: Círculo de Nível Steam Autêntico */}
          <div className="flex items-center gap-4">
            {/* Círculo de Nível da Steam com anel colorido por dezena */}
            <div className="relative flex-shrink-0">
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex flex-col items-center justify-center border-[3px] bg-[#101822] ${steamTier.ringBorderClass}`}
                style={{ borderColor: steamTier.borderColor }}
              >
                <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-gray-400 font-bold leading-none">
                  NÍVEL
                </span>
                <span className={`text-xl sm:text-2xl font-black font-mono leading-none ${steamTier.textColor}`}>
                  {displayLevel}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider font-sans">
                  Nível Gamer Vault
                </h3>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    isVip
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : isPro
                      ? "bg-[#66c0f4]/20 text-[#66c0f4] border-[#66c0f4]/40"
                      : "bg-white/10 text-gray-300 border-white/10"
                  }`}
                >
                  {gamerLevelInfo.boostLabel} BOOST
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
                <span className="text-white font-bold">{gamerLevelInfo.rankTitle}</span>
                <span className="text-gray-500">•</span>
                <span className="text-[#66c0f4] font-semibold">
                  {gamerLevelInfo.globalRank.includes("Global")
                    ? gamerLevelInfo.globalRank
                    : `${gamerLevelInfo.globalRank} Global`}
                </span>
              </div>
            </div>
          </div>

          {/* Lado Direito: Insígnia em Destaque (Featured Badge Steam) */}
          <div className="flex items-center gap-3 bg-[#101822]/90 border border-[#2a475e] p-2.5 sm:p-3 rounded-xl self-start md:self-auto">
            <div className="w-10 h-10 rounded-lg bg-[#1b2838] border border-[#2a475e] flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <FeaturedIcon className="w-5 h-5" />
            </div>
            <div className="min-w-0 pr-2">
              <div className="text-[10px] font-mono uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <span>Insígnia em Destaque</span>
                <span className="text-amber-400 font-bold">{featuredBadge.xp}</span>
              </div>
              <div className="text-xs font-bold text-white truncate">
                {featuredBadge.title}
              </div>
              <div className="text-[10px] text-gray-400 font-mono">
                {featuredBadge.level}
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Progresso de XP Steam */}
        <div
          onClick={onOpenXpBreakdown}
          className={`space-y-2 rounded-xl p-3 bg-[#101822]/70 border border-[#2a475e]/70 transition-all ${
            onOpenXpBreakdown
              ? "cursor-pointer hover:border-[#66c0f4]/50 hover:bg-[#101822] active:scale-[0.99] group/xp"
              : ""
          }`}
          title={onOpenXpBreakdown ? "Clique para abrir o Extrato de XP" : undefined}
          role={onOpenXpBreakdown ? "button" : undefined}
          tabIndex={onOpenXpBreakdown ? 0 : undefined}
        >
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-gray-300 flex items-center gap-2">
              <span className="text-[#66c0f4] font-black">
                {gamerLevelInfo.xp.toLocaleString("pt-BR")} XP
              </span>
              <span className="text-gray-500">/</span>
              <span className="text-gray-400">
                {gamerLevelInfo.nextLevelXp.toLocaleString("pt-BR")} XP
              </span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-gray-400 font-mono">
                Faltam <strong className="text-white">{gamerLevelInfo.xpToNextLevel.toLocaleString("pt-BR")} XP</strong> para o Nível {displayLevel + 1}
              </span>
              {onOpenXpBreakdown && (
                <span className="text-[10px] text-[#66c0f4] font-bold underline opacity-80 group-hover/xp:opacity-100 hidden sm:inline">
                  Ver Detalhes ↗
                </span>
              )}
            </div>
          </div>

          {/* Trilho Steam escuro com preenchimento Steam Blue / Cyan */}
          <div className="h-3 w-full rounded-sm bg-[#0a0f16] border border-[#2a475e] overflow-hidden p-[1px]">
            <div
              className="h-full rounded-sm bg-gradient-to-r from-[#1b88d4] via-[#3878a8] to-[#66c0f4] shadow-[0_0_8px_rgba(102,192,244,0.5)] transition-all duration-700"
              style={{ width: `${Math.max(3, gamerLevelInfo.percentToNext)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span>{gamerLevelInfo.percentToNext}% concluído</span>
              {gamerLevelInfo.boostBonusXp > 0 && (
                <span className="text-emerald-400 font-semibold">
                  (Bônus {gamerLevelInfo.boostLabel}: +{gamerLevelInfo.boostBonusXp.toLocaleString("pt-BR")} XP)
                </span>
              )}
            </span>

            {isOwner && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAction();
                }}
                className="text-[10px] uppercase font-bold text-[#66c0f4] hover:text-white transition-colors cursor-pointer"
              >
                {isVipOrPro ? "Gerenciar Plano" : "Ativar Boost PRO/VIP >"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
