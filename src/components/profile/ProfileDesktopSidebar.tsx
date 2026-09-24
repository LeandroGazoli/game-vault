"use client";

import React from "react";
import Link from "next/link";
import { UserProfile, LibraryStats, calculateGamerLevel, getEffectiveAccess } from "@/lib/types";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import {
  Trophy,
  Zap,
  Target,
  Sparkles,
  Dices,
  Upload,
  Crown,
  Share2,
  Lightbulb,
  ChevronRight,
  Clock,
  Gamepad2,
  Bookmark,
  Award,
} from "lucide-react";

export interface ProfileDesktopSidebarProps {
  user: UserProfile;
  stats: LibraryStats;
  isOwner: boolean;
  onOpenImporter?: () => void;
  onOpenShare?: () => void;
  onOpenRoulette?: () => void;
  sidebarCustomContent?: React.ReactNode;
}

/**
 * Sidebar Lateral Exclusiva para Desktop do Perfil (2 Colunas).
 * Exibe a progressão de Nível/XP em tempo real, insígnias em destaque,
 * métricas rápidas e atalhos úteis para ferramentas gamers.
 */
export default function ProfileDesktopSidebar({
  user,
  stats,
  isOwner,
  onOpenImporter,
  onOpenShare,
  onOpenRoulette,
  sidebarCustomContent,
}: ProfileDesktopSidebarProps) {
  const effectivePlan = getEffectiveAccess(user).plan;
  const gamerLevelInfo = calculateGamerLevel(stats, undefined, effectivePlan, user.bonusXp);
  const displayLevel = gamerLevelInfo.level;
  const progressPercent = Math.min(100, Math.max(0, Math.round(gamerLevelInfo.percentToNext)));

  const conquistasUrl = user.username
    ? `/perfil/${encodeURIComponent(user.username)}/conquistas`
    : "/conquistas";

  const handleAction = (cb?: () => void) => {
    triggerSelectionHaptic();
    cb?.();
  };

  return (
    <div className="space-y-4">
      {/* 1. CARD DE NÍVEL & PROGRESSÃO XP */}
      <div className="p-4 rounded-3xl bg-[#141822] border border-white/10 shadow-xl space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Nível Gamer
              </span>
              <h3 className="text-sm font-black text-white font-mono leading-none">
                Nível {displayLevel}
              </h3>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {gamerLevelInfo.rankTitle}
          </span>
        </div>

        {/* Barra de Progresso XP */}
        <div className="space-y-1.5 p-2.5 rounded-2xl bg-[#181d28] border border-white/5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Progresso</span>
            <span className="text-amber-400 font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#10131a] overflow-hidden border border-white/5">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-mono">
            <span>{gamerLevelInfo.xp.toLocaleString()} XP</span>
            <span>Prox: {gamerLevelInfo.nextLevelXp.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Botão Acesso Rápido ao Hub de Conquistas */}
        <Link
          href={conquistasUrl}
          className="w-full py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-between active:scale-98 transition-all group"
        >
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>Ver Conquistas &amp; Missões</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-amber-400/70 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* 2. CARD DE INSÍGNIAS E PRESTÍGIO GAMER */}
      <div className="p-4 rounded-3xl bg-[#141822] border border-white/10 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Insígnias de Prestígio</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 font-semibold">
            {(user.customTitles?.length || (user.customTitle ? 1 : 0))} equipada(s)
          </span>
        </div>

        {/* Lista de Insígnias Equipadas */}
        {(() => {
          const titles =
            user.customTitles && user.customTitles.length > 0
              ? user.customTitles
              : user.customTitle
              ? [user.customTitle]
              : [];

          if (titles.length > 0) {
            return (
              <div className="space-y-1.5">
                {titles.map((title, idx) => (
                  <div
                    key={`${title}-${idx}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#181d28] border border-white/5 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-1">
                      <span className="w-5 h-5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-white truncate font-bold">{title}</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded shrink-0">
                      ATIVA
                    </span>
                  </div>
                ))}
              </div>
            );
          }

          return (
            <div className="p-3 rounded-xl bg-[#181d28] border border-white/5 text-center text-xs text-gray-400">
              Nenhuma insígnia equipada ainda.
            </div>
          );
        })()}

        {/* Métricas Compactas de Prestígio */}
        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/5">
          <div className="p-2 rounded-xl bg-[#181d28] border border-white/5 text-center">
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-0.5" />
            <span className="text-[9px] font-bold text-gray-400 block uppercase">Zerados</span>
            <span className="text-xs font-bold text-white font-mono">{stats.completedCount}</span>
          </div>
          <div className="p-2 rounded-xl bg-[#181d28] border border-white/5 text-center">
            <Clock className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-0.5" />
            <span className="text-[9px] font-bold text-gray-400 block uppercase">Horas</span>
            <span className="text-xs font-bold text-white font-mono">{stats.totalPlaytimeHours}h</span>
          </div>
          <div className="p-2 rounded-xl bg-[#181d28] border border-white/5 text-center">
            <Crown className="w-3.5 h-3.5 text-amber-400 mx-auto mb-0.5" />
            <span className="text-[9px] font-bold text-gray-400 block uppercase">Passe</span>
            <span className="text-xs font-bold text-amber-300 uppercase font-mono">{user.plan || "Free"}</span>
          </div>
        </div>
      </div>

      {/* Seções Modulares Movidas para a Sidebar Lateral pelo Usuário */}
      {sidebarCustomContent}

      {/* 3. MENU DE LINKS ÚTEIS & FERRAMENTAS */}
      <nav className="p-3 rounded-3xl bg-[#141822] border border-white/10 shadow-lg space-y-1" aria-label="Links Úteis do Gamer">
        <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold border-b border-white/5 mb-1 flex items-center justify-between">
          <span>Links Úteis</span>
          <span className="text-[9px] text-cyan-400">Ferramentas</span>
        </div>

        <Link
          href={conquistasUrl}
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#181d28] text-xs font-semibold text-gray-300 hover:text-white transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Central de Conquistas &amp; Missões</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          href="/inventario-steam"
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#181d28] text-xs font-semibold text-gray-300 hover:text-white transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Inventário Steam &amp; Skins</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </Link>

        {isOwner && onOpenRoulette && (
          <button
            type="button"
            onClick={() => handleAction(onOpenRoulette)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#181d28] text-xs font-semibold text-gray-300 hover:text-white transition-colors text-left group"
          >
            <div className="flex items-center gap-2.5">
              <Dices className="w-4 h-4 text-purple-400" />
              <span>Roleta Gamer 3D (Sortear)</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        )}

        {isOwner && onOpenImporter && (
          <button
            type="button"
            onClick={() => handleAction(onOpenImporter)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#181d28] text-xs font-semibold text-cyan-300 hover:text-white transition-colors text-left group"
          >
            <div className="flex items-center gap-2.5">
              <Upload className="w-4 h-4 text-cyan-400" />
              <span>Importar Biblioteca Externa</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        )}

        {onOpenShare && (
          <button
            type="button"
            onClick={() => handleAction(onOpenShare)}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#181d28] text-xs font-semibold text-gray-300 hover:text-white transition-colors text-left group"
          >
            <div className="flex items-center gap-2.5">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Compartilhar Perfil</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>
        )}

        <Link
          href="/planos"
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#181d28] text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Benefícios VIP &amp; PRO</span>
          </div>
          <span className="text-[9px] font-extrabold uppercase bg-amber-400 text-black px-1.5 py-0.5 rounded">
            VIP
          </span>
        </Link>

        <Link
          href="/feedback"
          className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#181d28] text-xs font-semibold text-gray-300 hover:text-white transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <Lightbulb className="w-4 h-4 text-yellow-400" />
            <span>Sugerir Ideias &amp; Reportar Bugs</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
        </Link>
      </nav>
    </div>
  );
}