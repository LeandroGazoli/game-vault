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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import { getSteamAchievementRarity } from "@/lib/steamUtils";

export interface GamerAchievement {
  id: string;
  title: string;
  description: string;
  game: string;
  category: "completed" | "hours" | "library" | "reviews" | "level";
  globalRarity: number; // Porcentagem global estilo Steam (ex: 4.2% é rara)
  icon: React.ElementType;
  isUnlocked: boolean;
  currentValue: number;
  targetValue: number;
  progressText: string;
}

export interface SteamBadgeItem {
  id: string;
  title: string;
  subtitle: string;
  level: number;
  maxLevel: number;
  xpReward: number;
  icon: React.ElementType;
  currentValue: number;
  targetValue: number;
  isMaxLevel: boolean;
}

interface GamerBadgesCardProps {
  stats?: LibraryStats | null;
  gamerLevel?: number;
}

export default function GamerBadgesCard({ stats, gamerLevel }: GamerBadgesCardProps) {
  const [activeTab, setActiveTab] = useState<"achievements" | "badges">("achievements");
  const [filter, setFilter] = useState<"all" | "unlocked" | "locked" | "rare">("all");
  const [selectedAchievement, setSelectedAchievement] = useState<GamerAchievement | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const gamerLevelInfo = calculateGamerLevel(stats);
  const effectiveLevel = gamerLevel || gamerLevelInfo.level;

  const completed = stats?.completedCount || 0;
  const hours = stats?.totalPlaytimeHours || 0;
  const library = (stats?.libraryCount ?? 0) + (stats?.totalGames || 0);
  const rated = stats?.averageRating ? Math.min(stats.totalGames || 0, 20) : 0;

  // Lista de Conquistas Estilo Steam com Raridade Global Realista
  const achievements: GamerAchievement[] = useMemo(() => {
    return [
      {
        id: "first_game",
        title: "Primeiro Passo",
        description: "Zere seu primeiro jogo e dê início à sua jornada de conquistas.",
        game: "Game Vault Community",
        category: "completed",
        globalRarity: 74.5,
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
        game: "Backlog Conqueror",
        category: "completed",
        globalRarity: 38.2,
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
        game: "Backlog Conqueror",
        category: "completed",
        globalRarity: 12.8,
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
        game: "Hall of Legends",
        category: "completed",
        globalRarity: 4.1, // Conquista Rara Steam (< 10%)
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
        game: "Time Tracker",
        category: "hours",
        globalRarity: 68.4,
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
        game: "Time Tracker",
        category: "hours",
        globalRarity: 29.5,
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
        game: "Chrono Voyager",
        category: "hours",
        globalRarity: 8.7, // Conquista Rara Steam (< 10%)
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
        game: "Chrono Voyager",
        category: "hours",
        globalRarity: 2.3, // Conquista Rara Steam (< 10%)
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
        game: "Steam Curator Legacy",
        category: "library",
        globalRarity: 42.1,
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
        game: "Steam Curator Legacy",
        category: "library",
        globalRarity: 9.6, // Conquista Rara Steam (< 10%)
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
        game: "Metacritic Lounge",
        category: "reviews",
        globalRarity: 31.0,
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
        game: "Steam Level Climb",
        category: "level",
        globalRarity: 16.4,
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
        game: "Steam Level Climb",
        category: "level",
        globalRarity: 5.9, // Conquista Rara Steam (< 10%)
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
        game: "Steam Level Climb",
        category: "level",
        globalRarity: 1.1, // Conquista Ultra Rara Steam
        icon: Crown,
        isUnlocked: effectiveLevel >= 50,
        currentValue: effectiveLevel,
        targetValue: 50,
        progressText: `Lv. ${effectiveLevel} / Lv. 50`,
      },
    ];
  }, [completed, hours, library, rated, effectiveLevel]);

  // Coleção de Insígnias Steam (Badges com Níveis 1 a 5 e +XP)
  const steamBadges: SteamBadgeItem[] = useMemo(() => {
    const zeradorLvl = completed >= 30 ? 5 : completed >= 15 ? 4 : completed >= 5 ? 3 : completed >= 1 ? 2 : 1;
    const zeradorTargets = [1, 5, 15, 30, 50];

    const horasLvl = hours >= 500 ? 5 : hours >= 200 ? 4 : hours >= 100 ? 3 : hours >= 50 ? 2 : 1;
    const horasTargets = [10, 50, 100, 200, 500];

    const pilarScore = rated + Math.floor(library / 10);
    const pilarLvl = pilarScore >= 15 ? 5 : pilarScore >= 8 ? 4 : pilarScore >= 4 ? 3 : pilarScore >= 2 ? 2 : 1;
    const pilarTargets = [1, 2, 4, 8, 15];

    const curadorLvl = library >= 50 ? 5 : library >= 30 ? 4 : library >= 15 ? 3 : library >= 5 ? 2 : 1;
    const curadorTargets = [5, 15, 30, 50, 100];

    return [
      {
        id: "badge_zerador",
        title: "Zerador Consagrado",
        subtitle: "Insígnia de Conclusão de Campanhas",
        level: zeradorLvl,
        maxLevel: 5,
        xpReward: zeradorLvl * 100,
        icon: Trophy,
        currentValue: completed,
        targetValue: zeradorTargets[zeradorLvl - 1] || 50,
        isMaxLevel: zeradorLvl >= 5,
      },
      {
        id: "badge_tempo",
        title: "Senhor do Tempo",
        subtitle: "Insígnia de Horas Dedicadas",
        level: horasLvl,
        maxLevel: 5,
        xpReward: horasLvl * 100,
        icon: Clock,
        currentValue: Math.floor(hours),
        targetValue: horasTargets[horasLvl - 1] || 500,
        isMaxLevel: horasLvl >= 5,
      },
      {
        id: "badge_pilar",
        title: "Pilar da Comunidade",
        subtitle: "Insígnia de Participação e Avaliações",
        level: pilarLvl,
        maxLevel: 5,
        xpReward: pilarLvl * 100,
        icon: Award,
        currentValue: pilarScore,
        targetValue: pilarTargets[pilarLvl - 1] || 15,
        isMaxLevel: pilarLvl >= 5,
      },
      {
        id: "badge_curador",
        title: "Curador de Acervo",
        subtitle: "Insígnia de Colecionador de Jogos",
        level: curadorLvl,
        maxLevel: 5,
        xpReward: curadorLvl * 100,
        icon: Bookmark,
        currentValue: library,
        targetValue: curadorTargets[curadorLvl - 1] || 100,
        isMaxLevel: curadorLvl >= 5,
      },
    ];
  }, [completed, hours, rated, library]);

  // As 4 Métricas Oficiais do Expositor Steam:
  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;
  const totalAchievements = achievements.length;
  const completionAvg = Math.round((unlockedCount / totalAchievements) * 100);
  const rareCount = achievements.filter((a) => a.isUnlocked && a.globalRarity <= 10).length;
  const perfectGamesCount = Math.floor(completed / 5);

  const filteredAchievements = useMemo(() => {
    if (filter === "unlocked") return achievements.filter((a) => a.isUnlocked);
    if (filter === "locked") return achievements.filter((a) => !a.isUnlocked);
    if (filter === "rare") return achievements.filter((a) => a.globalRarity <= 10);
    return achievements;
  }, [achievements, filter]);

  const visibleAchievements = isExpanded ? filteredAchievements : filteredAchievements.slice(0, 10);

  return (
    <div className="rounded-2xl sm:rounded-3xl border border-[#2a475e] bg-gradient-to-b from-[#171a21] via-[#1b2838] to-[#121923] p-4 sm:p-6 shadow-2xl space-y-5 relative overflow-hidden">
      {/* Luz ambiente azul Steam */}
      <div className="absolute top-0 right-1/3 w-64 h-64 bg-[#1b88d4]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Topo: Cabeçalho Estilo Expositor Steam (Steam Showcase Header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2a475e] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#101822] border border-[#2a475e] flex items-center justify-center text-[#66c0f4] shadow-inner">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#8a9eaf] uppercase">
                Steam Profile Showcase
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#66c0f4]" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide uppercase font-sans">
              Expositor de Conquistas
            </h3>
          </div>
        </div>

        {/* Alternador de Modo: Conquistas vs Insígnias */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#101822] border border-[#2a475e] self-start sm:self-auto">
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setActiveTab("achievements");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "achievements"
                ? "bg-[#2a475e] text-[#66c0f4] shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Conquistas ({unlockedCount})
          </button>
          <button
            onClick={() => {
              triggerSelectionHaptic();
              setActiveTab("badges");
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "badges"
                ? "bg-[#2a475e] text-amber-300 shadow-sm"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Insígnias Steam ({steamBadges.length})
          </button>
        </div>
      </div>

      {activeTab === "achievements" ? (
        <>
          {/* As 4 Métricas Icônicas do Expositor de Conquistas da Steam */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 bg-[#101822]/80 border border-[#2a475e] rounded-xl p-3 sm:p-4">
            {/* Métrica 1: Conquistas */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-[#8a9eaf] font-bold block">
                Conquistas
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-white leading-tight">
                {unlockedCount}
                <span className="text-xs text-[#8a9eaf] font-normal ml-1">
                  / {totalAchievements}
                </span>
              </div>
            </div>

            {/* Métrica 2: Jogos Perfeitos */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-[#8a9eaf] font-bold block">
                Jogos Perfeitos
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-white leading-tight">
                {perfectGamesCount}
              </div>
            </div>

            {/* Métrica 3: Média de Conclusão com Mini Barra */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-[#8a9eaf] font-bold block">
                Média de Conclusão
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-[#66c0f4] leading-tight">
                {completionAvg}%
              </div>
              <div className="h-1.5 w-full rounded bg-[#0a0f16] border border-[#2a475e] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#1b88d4] to-[#66c0f4] transition-all duration-500"
                  style={{ width: `${completionAvg}%` }}
                />
              </div>
            </div>

            {/* Métrica 4: Conquistas Raras */}
            <div className="space-y-0.5">
              <span className="text-[10px] font-mono uppercase text-amber-400 font-bold flex items-center gap-1">
                <span>★ Conquistas Raras</span>
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono text-amber-300 leading-tight">
                {rareCount}
                <span className="text-[10px] text-[#8a9eaf] font-normal ml-1">(&lt; 10%)</span>
              </div>
            </div>
          </div>

          {/* Barra de Filtros de Conquistas */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setFilter("all");
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                  filter === "all"
                    ? "bg-[#2a475e] text-white"
                    : "text-gray-400 hover:text-white bg-[#101822]/60"
                }`}
              >
                Todas ({achievements.length})
              </button>
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setFilter("unlocked");
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                  filter === "unlocked"
                    ? "bg-[#2a475e] text-emerald-400"
                    : "text-gray-400 hover:text-white bg-[#101822]/60"
                }`}
              >
                Desbloqueadas ({unlockedCount})
              </button>
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setFilter("rare");
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                  filter === "rare"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-gray-400 hover:text-white bg-[#101822]/60"
                }`}
              >
                ★ Raras (&lt; 10%)
              </button>
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setFilter("locked");
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-colors cursor-pointer ${
                  filter === "locked"
                    ? "bg-[#2a475e] text-gray-300"
                    : "text-gray-400 hover:text-white bg-[#101822]/60"
                }`}
              >
                Bloqueadas ({totalAchievements - unlockedCount})
              </button>
            </div>

            <span className="text-[11px] font-mono text-[#8a9eaf] hidden sm:inline">
              Clique em uma conquista para ver detalhes
            </span>
          </div>

          {/* Grade de Ladrilhos Quadrados Estilo Steam (Achievement Grid) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 sm:gap-3">
            {visibleAchievements.map((item) => {
              const Icon = item.icon;
              const rarityInfo = getSteamAchievementRarity(item.globalRarity);
              const isSelected = selectedAchievement?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    triggerSelectionHaptic();
                    setSelectedAchievement(isSelected ? null : item);
                  }}
                  className={`relative p-3 rounded-xl border transition-all cursor-pointer active:scale-95 group flex flex-col justify-between ${
                    item.isUnlocked
                      ? rarityInfo.isRare
                        ? `bg-[#101822] ${rarityInfo.borderClass} ${rarityInfo.glowClass}`
                        : "bg-[#101822] border-[#2a475e] hover:border-[#66c0f4]/70"
                      : "bg-[#0c1117] border-[#1d3040]/60 opacity-60 hover:opacity-80"
                  } ${isSelected ? "ring-2 ring-[#66c0f4] shadow-lg" : ""}`}
                >
                  {/* Selo de Conquista Rara no canto superior (Padrão Steam Gold) */}
                  {rarityInfo.isRare && (
                    <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.2 rounded bg-amber-500 text-black font-mono font-black text-[8px] uppercase tracking-tighter shadow-md">
                      ★ Rara
                    </div>
                  )}

                  {/* Ladrilho Quadrado do Ícone */}
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                        item.isUnlocked
                          ? rarityInfo.isRare
                            ? "bg-[#1b2838] border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(229,193,88,0.3)]"
                            : "bg-[#1b2838] border-[#2a475e] text-[#66c0f4] group-hover:border-[#66c0f4]"
                          : "bg-[#090d13] border-white/5 text-gray-600 grayscale"
                      }`}
                    >
                      {item.isUnlocked ? (
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-white truncate group-hover:text-[#66c0f4] transition-colors">
                        {item.title}
                      </h4>
                      <span className="text-[10px] font-mono text-[#8a9eaf] block truncate">
                        {item.game}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold mt-0.5 inline-block ${
                          rarityInfo.isRare ? "text-amber-400" : "text-gray-400"
                        }`}
                      >
                        {item.globalRarity}% global
                      </span>
                    </div>
                  </div>

                  {/* Status / Progresso Footer */}
                  <div className="mt-2 pt-1.5 border-t border-[#2a475e]/40 flex items-center justify-between text-[10px] font-mono">
                    <span className={item.isUnlocked ? "text-emerald-400 font-bold" : "text-gray-500"}>
                      {item.isUnlocked ? "✓ Desbloqueada" : "Bloqueada"}
                    </span>
                    <span className="text-gray-400">
                      {item.progressText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalhe da Conquista Selecionada (Steam Popover Card) */}
          {selectedAchievement && (
            <div className="p-4 rounded-xl bg-[#101822] border border-[#66c0f4]/50 shadow-2xl relative animate-fadeIn flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div
                  className={`w-14 h-14 rounded-lg flex items-center justify-center shrink-0 border ${
                    selectedAchievement.isUnlocked
                      ? selectedAchievement.globalRarity <= 10
                        ? "bg-[#1b2838] border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(229,193,88,0.4)]"
                        : "bg-[#1b2838] border-[#2a475e] text-[#66c0f4]"
                      : "bg-[#090d13] border-white/10 text-gray-500"
                  }`}
                >
                  {selectedAchievement.isUnlocked ? (
                    <selectedAchievement.icon className="w-7 h-7" />
                  ) : (
                    <Lock className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white">
                      {selectedAchievement.title}
                    </h4>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                        selectedAchievement.globalRarity <= 10
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                          : "bg-[#2a475e] text-gray-300 border-[#2a475e]"
                      }`}
                    >
                      ★ {selectedAchievement.globalRarity}% dos jogadores possuem
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5">
                    {selectedAchievement.description}
                  </p>
                  <span className="text-[11px] font-mono text-[#8a9eaf] mt-1 block">
                    Jogo: <strong className="text-white">{selectedAchievement.game}</strong> • Meta: {selectedAchievement.progressText}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedAchievement(null)}
                className="text-xs font-mono font-bold text-[#8a9eaf] hover:text-white px-3 py-1 rounded bg-[#1b2838] border border-[#2a475e] self-end sm:self-center cursor-pointer"
              >
                Fechar
              </button>
            </div>
          )}

          {/* Botão Ver Mais / Menos Conquistas */}
          {filteredAchievements.length > 10 && (
            <div className="text-center pt-1">
              <button
                onClick={() => {
                  triggerSelectionHaptic();
                  setIsExpanded(!isExpanded);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#101822] hover:bg-[#1b2838] border border-[#2a475e] text-xs font-bold text-[#66c0f4] hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <span>
                  {isExpanded
                    ? "Ver Menos Conquistas"
                    : `Ver Todas as ${filteredAchievements.length} Conquistas`}
                </span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Aba 2: Insígnias Steam (Badges com Níveis e +XP) */
        <div className="space-y-4">
          <div className="p-3 bg-[#101822]/60 border border-[#2a475e] rounded-xl flex items-center justify-between text-xs font-mono text-gray-300">
            <span className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Coleção de Insígnias de Conta Steam (Nível 1 a 5)</span>
            </span>
            <span className="text-amber-300 font-bold">
              +{steamBadges.reduce((acc, b) => acc + b.xpReward, 0)} XP Total
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {steamBadges.map((badge) => {
              const Icon = badge.icon;
              const percentToNext = Math.min(
                100,
                Math.round((badge.currentValue / badge.targetValue) * 100)
              );

              return (
                <div
                  key={badge.id}
                  className="p-4 rounded-xl bg-[#101822] border border-[#2a475e] hover:border-[#66c0f4]/50 transition-all flex items-start gap-3.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#1b2838] border border-[#2a475e] flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
                    <Icon className="w-6 h-6" />
                  </div>

                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {badge.title}
                      </h4>
                      <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded">
                        +{badge.xpReward} XP
                      </span>
                    </div>

                    <p className="text-[11px] text-[#8a9eaf]">
                      {badge.subtitle}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-300 pt-1">
                      <span className="text-[#66c0f4] font-bold">
                        Nível {badge.level} de {badge.maxLevel}
                      </span>
                      <span className="text-gray-400">
                        {badge.currentValue} / {badge.targetValue}
                      </span>
                    </div>

                    <div className="h-1.5 w-full rounded bg-[#0a0f16] border border-[#2a475e] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-500"
                        style={{ width: `${percentToNext}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

