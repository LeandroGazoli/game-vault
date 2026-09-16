"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { UserProfile, UserGame, calculateGamerLevel } from "@/lib/types";
import { computeLibraryStats } from "@/lib/gamificationCore";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import UserAvatar from "@/components/UserAvatar";
import PlanBadge from "@/components/PlanBadge";
import GamerBadgesCard from "@/components/profile/GamerBadgesCard";
import GamerQuestsCard from "@/components/profile/GamerQuestsCard";
import GamerScoreboardCard from "@/components/profile/GamerScoreboardCard";
import LegendaryVaultCard from "@/components/profile/LegendaryVaultCard";
import {
  Trophy,
  Target,
  Crown,
  ArrowLeft,
  Zap,
  BarChart3,
  Clock,
  Gamepad2,
  ChevronRight,
} from "lucide-react";

export type GamificationTab = "achievements" | "missions" | "scoreboard" | "vault";

interface ConquistasClientProps {
  targetUsername?: string;
}

export default function ConquistasClient({ targetUsername }: ConquistasClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const { library: ownLibrary, stats: ownStats } = useGameLibrary();

  const queryUser = searchParams?.get("user") || "";
  const effectiveUsername = (targetUsername || queryUser || "").trim();

  const isOwn = Boolean(
    authUser && (!effectiveUsername || (authUser.username && authUser.username.toLowerCase() === effectiveUsername.toLowerCase()))
  );

  const [publicData, setPublicData] = useState<{ user: UserProfile; games: UserGame[] } | null>(null);
  const [loadingPublic, setLoadingPublic] = useState(Boolean(effectiveUsername && !isOwn));
  const [activeTab, setActiveTab] = useState<GamificationTab>("achievements");

  useEffect(() => {
    if (effectiveUsername && !isOwn) {
      setLoadingPublic(true);
      fetch(`/api/user/${encodeURIComponent(effectiveUsername)}/games.json`)
        .then(async (res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.user) setPublicData(data);
        })
        .catch(() => null)
        .finally(() => setLoadingPublic(false));
    } else {
      setPublicData(null);
      setLoadingPublic(false);
    }
  }, [effectiveUsername, isOwn]);

  const activeUser = (isOwn ? authUser : publicData?.user) as UserProfile | null;
  const activeLibrary = isOwn ? ownLibrary : publicData?.games || [];
  const activeStats = useMemo(() => (isOwn ? ownStats : computeLibraryStats(activeLibrary)), [isOwn, activeLibrary, ownStats]);

  const gamerLevelInfo = calculateGamerLevel(activeStats, undefined, activeUser?.plan, activeUser?.bonusXp);
  const displayLevel = activeUser?.gamerLevel || gamerLevelInfo.level;
  const progressPercent = Math.min(100, Math.max(0, Math.round(gamerLevelInfo.percentToNext)));

  const profileUrl = activeUser?.username ? `/perfil/${encodeURIComponent(activeUser.username)}` : "/perfil";

  const handleTabChange = (tab: GamificationTab) => {
    triggerSelectionHaptic();
    setActiveTab(tab);
  };

  if ((authLoading && !effectiveUsername) || loadingPublic) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-400">Carregando Central de Conquistas...</p>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-6 rounded-3xl bg-[#141822] border border-white/10 text-center space-y-4">
        <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
        <h2 className="text-lg font-black text-white">Perfil não encontrado</h2>
        <p className="text-xs text-gray-400">Faça login ou selecione um perfil para ver a central de conquistas.</p>
        <Link href="/" className="inline-block px-5 py-2.5 rounded-2xl bg-amber-500 text-black font-black text-xs">
          Voltar ao Início
        </Link>
      </div>
    );
  }

  const navItems = [
    { id: "achievements" as const, label: "Conquistas & Insígnias", icon: Trophy },
    { id: "missions" as const, label: "Missões & Desafios", icon: Target },
    { id: "scoreboard" as const, label: "Placar & XP", icon: BarChart3 },
    { id: "vault" as const, label: "Vault Lendário & VIP", icon: Crown },
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-5">
      {/* 1. BARRA SUPERIOR MOBILE & NAVEGAÇÃO DE VOLTA */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href={profileUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#141822] hover:bg-[#1a202c] border border-white/10 text-xs font-bold text-gray-300 hover:text-white transition-all active:scale-95"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Perfil</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
            Nível {displayLevel}
          </span>
          <span className="text-[11px] font-mono text-gray-400">{gamerLevelInfo.xp.toLocaleString()} XP</span>
        </div>
      </div>

      {/* 2. SELETOR DE ABAS MOBILE (HORIZONTAL SEGMENTED PILLS) */}
      <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleTabChange(item.id)}
              className={`flex-shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 select-none active:scale-95 ${
                isActive
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/20"
                  : "bg-[#141822] text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. LAYOUT PRINCIPAL: SIDEBAR NO DESKTOP + CONTEÚDO */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* SIDEBAR DESKTOP EXCLUSIVA */}
        <aside className="hidden lg:flex flex-col w-80 shrink-0 space-y-4">
          {/* Card de Identidade do Jogador */}
          <div className="p-5 rounded-3xl bg-[#141822] border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <UserAvatar photoURL={activeUser.photoURL} name={activeUser.displayName} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-base font-black text-white truncate">{activeUser.displayName}</h1>
                <p className="text-xs text-gray-400 font-mono truncate">@{activeUser.username}</p>
                {activeUser.plan && activeUser.plan !== "free" && (
                  <div className="mt-1">
                    <PlanBadge plan={activeUser.plan} size="sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Barra de Progresso XP */}
            <div className="p-3 rounded-2xl bg-[#181d28] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-amber-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Nível {displayLevel}
                </span>
                <span className="text-gray-400 font-mono text-[11px]">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#10131a] overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                <span>{gamerLevelInfo.xp} XP</span>
                <span>Prox: Nível {displayLevel + 1}</span>
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded-2xl bg-[#181d28] border border-white/5 text-center">
                <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center justify-center gap-1">
                  <Gamepad2 className="w-3 h-3 text-cyan-400" />
                  <span>Zerados</span>
                </div>
                <div className="text-base font-black text-white font-mono">{activeStats.completedCount}</div>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#181d28] border border-white/5 text-center">
                <div className="text-[10px] font-bold uppercase text-gray-400 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400" />
                  <span>Horas</span>
                </div>
                <div className="text-base font-black text-white font-mono">{activeStats.totalPlaytimeHours}h</div>
              </div>
            </div>
          </div>

          {/* Menu Lateral de Navegação do Hub */}
          <nav className="p-2 rounded-3xl bg-[#141822] border border-white/10 space-y-1 shadow-lg" aria-label="Navegação do Hub">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabChange(item.id)}
                  className={`w-full px-3.5 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between select-none active:scale-98 ${
                    isActive
                      ? "bg-amber-500 text-black font-black shadow-md shadow-amber-500/20"
                      : "text-gray-300 hover:text-white hover:bg-[#1a202c]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 ${isActive ? "text-black" : "text-gray-500"}`} />
                </button>
              );
            })}
          </nav>
        </aside>

        {/* ÁREA DE CONTEÚDO PRINCIPAL DINÂMICA */}
        <main className="flex-1 w-full min-w-0 space-y-5">
          {activeTab === "achievements" && (
            <div className="animate-fadeIn">
              <GamerBadgesCard
                stats={activeStats}
                gamerLevel={displayLevel}
                userId={activeUser.uid}
                isOwner={isOwn}
                claimedRewards={activeUser.claimedRewards}
              />
            </div>
          )}

          {activeTab === "missions" && (
            <div className="animate-fadeIn">
              <GamerQuestsCard
                stats={activeStats}
                user={activeUser}
                isOwner={isOwn}
                onOpenCustomizer={() => router.push("/perfil/editar?tab=showcase")}
              />
            </div>
          )}

          {activeTab === "scoreboard" && (
            <div className="animate-fadeIn">
              <GamerScoreboardCard
                stats={activeStats}
                plan={activeUser.plan}
                bonusXp={activeUser.bonusXp}
                onOpenRankings={() => router.push("/rankings")}
              />
            </div>
          )}

          {activeTab === "vault" && (
            <div className="animate-fadeIn">
              <LegendaryVaultCard
                user={activeUser}
                stats={activeStats}
                isOwner={isOwn}
                onOpenUpgrade={() => router.push("/planos")}
                onOpenManagePlan={() => router.push("/perfil/editar?tab=plano")}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
