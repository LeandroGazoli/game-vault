"use client";

import React, { useState, useMemo } from "react";
import { LibraryStats, calculateGamerLevel } from "@/lib/types";
import {
  Award,
  Trophy,
  Flame,
  Clock,
  Crown,
  Sparkles,
  Star,
  Gamepad2,
  Bookmark,
  Zap,
  Shield,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

export interface GamerBadge {
  id: string;
  title: string;
  description: string;
  category: "completed" | "hours" | "library" | "reviews" | "level";
  rarity: "comum" | "raro" | "epico" | "lendario";
  icon: React.ElementType;
  isUnlocked: boolean;
  currentValue: number;
  targetValue: number;
  progressText: string;
}

interface GamerBadgesCardProps {
  stats?: LibraryStats | null;
  gamerLevel?: number;
}

export default function GamerBadgesCard({ stats, gamerLevel }: GamerBadgesCardProps) {
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [selectedBadge, setSelectedBadge] = useState<GamerBadge | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const gamerLevelInfo = calculateGamerLevel(stats);
  const effectiveLevel = gamerLevel || gamerLevelInfo.level;

  const completed = stats?.completedCount || 0;
  const hours = stats?.totalPlaytimeHours || 0;
  const library = (stats?.libraryCount ?? 0) + (stats?.totalGames || 0);
  const rated = stats?.averageRating ? Math.min(stats.totalGames || 0, 20) : 0;

  const badges: GamerBadge[] = useMemo(() => {
    return [
      {
        id: "first_game",
        title: "Primeiro Passo",
        description: "Zere seu primeiro jogo e dê início à sua jornada de conquistas.",
        category: "completed",
        rarity: "comum",
        icon: Gamepad2,
        isUnlocked: completed >= 1,
        currentValue: completed,
        targetValue: 1,
        progressText: `${Math.min(completed, 1)} / 1 jogo`,
      },
      {
        id: "completed_5",
        title: "Zerador Nato",
        description: "Finalize 5 jogos no seu histórico gamer.",
        category: "completed",
        rarity: "comum",
        icon: Trophy,
        isUnlocked: completed >= 5,
        currentValue: completed,
        targetValue: 5,
        progressText: `${Math.min(completed, 5)} / 5 jogos`,
      },
      {
        id: "completed_15",
        title: "Mestre do Backlog",
        description: "Vença a procrastinação e zere 15 jogos da sua biblioteca.",
        category: "completed",
        rarity: "raro",
        icon: Award,
        isUnlocked: completed >= 15,
        currentValue: completed,
        targetValue: 15,
        progressText: `${Math.min(completed, 15)} / 15 jogos`,
      },
      {
        id: "completed_30",
        title: "Lenda dos Zerados",
        description: "Alcance a incrível marca de 30 títulos finalizados com sucesso.",
        category: "completed",
        rarity: "epico",
        icon: Flame,
        isUnlocked: completed >= 30,
        currentValue: completed,
        targetValue: 30,
        progressText: `${Math.min(completed, 30)} / 30 jogos`,
      },
      {
        id: "hours_10",
        title: "Aquecendo os Motores",
        description: "Registre pelo menos 10 horas totais de jogatina.",
        category: "hours",
        rarity: "comum",
        icon: Clock,
        isUnlocked: hours >= 10,
        currentValue: hours,
        targetValue: 10,
        progressText: `${Math.min(Math.floor(hours), 10)} / 10h`,
      },
      {
        id: "hours_50",
        title: "Maratonista de Elite",
        description: "Acumule 50 horas de pura imersão e gameplay.",
        category: "hours",
        rarity: "comum",
        icon: Clock,
        isUnlocked: hours >= 50,
        currentValue: hours,
        targetValue: 50,
        progressText: `${Math.min(Math.floor(hours), 50)} / 50h`,
      },
      {
        id: "hours_200",
        title: "Viajante dos Mundos",
        description: "Alcance 200 horas navegando pelos universos virtuais.",
        category: "hours",
        rarity: "raro",
        icon: Zap,
        isUnlocked: hours >= 200,
        currentValue: hours,
        targetValue: 200,
        progressText: `${Math.min(Math.floor(hours), 200)} / 200h`,
      },
      {
        id: "hours_500",
        title: "Senhor do Tempo",
        description: "Mais de 500 horas dedicadas à arte dos videogames.",
        category: "hours",
        rarity: "epico",
        icon: Shield,
        isUnlocked: hours >= 500,
        currentValue: hours,
        targetValue: 500,
        progressText: `${Math.min(Math.floor(hours), 500)} / 500h`,
      },
      {
        id: "library_20",
        title: "Curador de Respeito",
        description: "Adicione 20 jogos à sua biblioteca personalizada.",
        category: "library",
        rarity: "comum",
        icon: Bookmark,
        isUnlocked: library >= 20,
        currentValue: library,
        targetValue: 20,
        progressText: `${Math.min(library, 20)} / 20 jogos`,
      },
      {
        id: "library_50",
        title: "Grande Arquivista",
        description: "Catálogo robusto com mais de 50 títulos organizados.",
        category: "library",
        rarity: "raro",
        icon: Bookmark,
        isUnlocked: library >= 50,
        currentValue: library,
        targetValue: 50,
        progressText: `${Math.min(library, 50)} / 50 jogos`,
      },
      {
        id: "reviews_5",
        title: "Crítico Experiente",
        description: "Avalie 5 jogos com notas para enriquecer o banco de opiniões.",
        category: "reviews",
        rarity: "comum",
        icon: Star,
        isUnlocked: rated >= 5,
        currentValue: rated,
        targetValue: 5,
        progressText: `${Math.min(rated, 5)} / 5 notas`,
      },
      {
        id: "level_15",
        title: "Gamer Dedicado (Lv. 15)",
        description: "Alcance o Nível Gamer 15 e garanta seu lugar no Top 25%.",
        category: "level",
        rarity: "raro",
        icon: Sparkles,
        isUnlocked: effectiveLevel >= 15,
        currentValue: effectiveLevel,
        targetValue: 15,
        progressText: `Lv. ${effectiveLevel} / Lv. 15`,
      },
      {
        id: "level_30",
        title: "Veterano Hardcore (Lv. 30)",
        description: "Chegue ao Nível 30 e integre o Top 10% da comunidade.",
        category: "level",
        rarity: "epico",
        icon: Trophy,
        isUnlocked: effectiveLevel >= 30,
        currentValue: effectiveLevel,
        targetValue: 30,
        progressText: `Lv. ${effectiveLevel} / Lv. 30`,
      },
      {
        id: "level_50",
        title: "Mestre Lendário (Lv. 50)",
        description: "Atingiu o prestigiado Nível 50. Reverência garantida!",
        category: "level",
        rarity: "lendario",
        icon: Crown,
        isUnlocked: effectiveLevel >= 50,
        currentValue: effectiveLevel,
        targetValue: 50,
        progressText: `Lv. ${effectiveLevel} / Lv. 50`,
      },
    ];
  }, [completed, hours, library, rated, effectiveLevel]);

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;
  const unlockPercentage = Math.round((unlockedCount / badges.length) * 100);

  const filteredBadges = useMemo(() => {
    if (filter === "unlocked") return badges.filter((b) => b.isUnlocked);
    if (filter === "locked") return badges.filter((b) => !b.isUnlocked);
    return badges;
  }, [badges, filter]);

  // Se não estiver expandido, exibe até 6 medalhas
  const visibleBadges = isExpanded ? filteredBadges : filteredBadges.slice(0, 6);

  const getRarityBadgeStyle = (rarity: GamerBadge["rarity"], isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        cardBg: "bg-white/[0.02] border-white/5 opacity-50",
        iconBg: "bg-white/5 border-white/10 text-gray-500",
        badgeText: "Bloqueada",
        badgeStyle: "bg-white/5 text-gray-400 border border-white/10",
      };
    }

    switch (rarity) {
      case "lendario":
        return {
          cardBg: "bg-gradient-to-br from-[#00E5FF]/10 to-purple-900/20 border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]",
          iconBg: "bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]",
          badgeText: "Lendário",
          badgeStyle: "bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30",
        };
      case "epico":
        return {
          cardBg: "bg-gradient-to-br from-amber-500/10 to-orange-950/20 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.15)]",
          iconBg: "bg-amber-500/20 border-amber-500/50 text-amber-300",
          badgeText: "Épico",
          badgeStyle: "bg-amber-500/10 text-amber-300 border border-amber-500/30",
        };
      case "raro":
        return {
          cardBg: "bg-gradient-to-br from-purple-500/10 to-indigo-950/20 border-purple-500/30",
          iconBg: "bg-purple-500/20 border-purple-500/40 text-purple-300",
          badgeText: "Raro",
          badgeStyle: "bg-purple-500/10 text-purple-300 border border-purple-500/30",
        };
      default:
        return {
          cardBg: "bg-gradient-to-br from-blue-500/10 to-slate-900/20 border-blue-500/30",
          iconBg: "bg-blue-500/20 border-blue-500/40 text-blue-300",
          badgeText: "Comum",
          badgeStyle: "bg-blue-500/10 text-blue-300 border border-blue-500/30",
        };
    }
  };

  return (
    <div className="rounded-[28px] sm:rounded-[32px] bg-[#0e1117] border border-white/10 p-4 sm:p-6 shadow-xl space-y-5 relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Cabeçalho da Seção de Conquistas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
              <span>Medalhas &amp; Conquistas</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300">
                {unlockedCount} / {badges.length}
              </span>
            </h3>
            <p className="text-xs text-gray-400">
              Desbloqueie insígnias exclusivas completando marcos no Vault
            </p>
          </div>
        </div>

        {/* Filtros de Abas */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#141822] border border-white/10 self-start sm:self-auto">
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setFilter("all");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-white/15 text-white shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Todas ({badges.length})
          </button>
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setFilter("unlocked");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "unlocked"
                ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Desbloqueadas ({unlockedCount})
          </button>
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setFilter("locked");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filter === "locked"
                ? "bg-white/10 text-gray-300 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Bloqueadas ({badges.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Barra de Progresso Geral de Conquistas */}
      <div className="space-y-1.5 bg-[#131620] border border-white/5 rounded-2xl p-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-gray-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Progresso da Coleção</span>
          </span>
          <span className="text-[#00E5FF] font-bold">
            {unlockedCount} de {badges.length} desbloqueadas ({unlockPercentage}%)
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-black/50 border border-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-[#00E5FF] to-purple-500 transition-all duration-500"
            style={{ width: `${unlockPercentage}%` }}
          />
        </div>
      </div>

      {/* Grid de Medalhas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visibleBadges.map((badge) => {
          const Icon = badge.icon;
          const style = getRarityBadgeStyle(badge.rarity, badge.isUnlocked);
          const isSelected = selectedBadge?.id === badge.id;

          return (
            <div
              key={badge.id}
              onClick={() => {
                triggerSelectionHaptic();
                setSelectedBadge(isSelected ? null : badge);
              }}
              className={`rounded-2xl border p-3.5 flex flex-col justify-between gap-2.5 transition-all cursor-pointer active:scale-[0.98] relative ${style.cardBg} ${
                isSelected ? "ring-2 ring-[#00E5FF] shadow-lg" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${style.iconBg}`}>
                  {badge.isUnlocked ? (
                    <Icon className="w-5 h-5" />
                  ) : (
                    <Lock className="w-4 h-4 text-gray-500" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <h4 className="text-xs font-bold text-white truncate">
                      {badge.title}
                    </h4>
                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded ${style.badgeStyle}`}>
                      {style.badgeText}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Barra de Progresso Interna da Medalha */}
              <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-400">
                <span>{badge.isUnlocked ? "✓ Concluído" : "Progresso:"}</span>
                <span className={badge.isUnlocked ? "text-emerald-400 font-bold" : "text-gray-300"}>
                  {badge.progressText}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Botão de Ver Mais / Menos Conquistas */}
      {filteredBadges.length > 6 && (
        <div className="text-center pt-1">
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setIsExpanded(!isExpanded);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
          >
            <span>{isExpanded ? "Ver Menos Conquistas" : `Ver Todas as ${filteredBadges.length} Conquistas`}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
