"use client";

import React, { useState } from "react";
import Link from "next/link";
import { UserProfile, getEffectiveAccess } from "@/lib/types";
import { getThemeStyles } from "@/lib/themeStyles";
import UserAvatar from "@/components/UserAvatar";
import SocialGamertagsBar from "@/components/SocialGamertagsBar";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import {
  Crown,
  Sparkles,
  Trophy,
  Share2,
  Check,
  Plus,
  Palette,
  SlidersHorizontal,
  Upload,
  Layers,
  Edit2,
  Award,
} from "lucide-react";

export interface ProfileHeroMobileProps {
  user: UserProfile;
  isOwner: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  onOpenEditProfile?: () => void;
  onOpenEditBio?: () => void;
  onOpenTools?: () => void;
  onOpenImporter?: () => void;
  onOpenShare?: () => void;
  onOpenManagePlan?: () => void;
  onOpenUpgrade?: () => void;
  onOpenSectionsOrder?: () => void;
}

/**
 * Hero do Perfil redesenhado com foco 100% Mobile-First e ergonômico.
 * Ocupa altura vertical mínima, priorizando identidade, status rápido e ações táteis.
 */
export default function ProfileHeroMobile({
  user,
  isOwner,
  onOpenEditProfile,
  onOpenEditBio,
  onOpenTools,
  onOpenImporter,
  onOpenShare,
  onOpenManagePlan,
  onOpenUpgrade,
  onOpenSectionsOrder,
}: ProfileHeroMobileProps) {
  const [bioExpanded, setBioExpanded] = useState(false);
  const themeStyles = getThemeStyles(user.theme);
  const access = getEffectiveAccess(user);

  const handleAction = (cb?: () => void) => {
    triggerSelectionHaptic();
    cb?.();
  };

  return (
    <section
      id="profile-hero"
      className={`profile-hero relative rounded-3xl overflow-hidden bg-[#141822] border border-white/10 shadow-xl transition-all duration-300 ${themeStyles.cardGlow}`}
    >
      {/* Banner de Capa com Backdrop Escurecido */}
      {user.bannerURL && (
        <div className="absolute inset-0 h-28 sm:h-36 overflow-hidden pointer-events-none">
          <img
            src={user.bannerURL}
            alt=""
            className="w-full h-full object-cover opacity-25"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141822]/70 to-[#141822]" />
        </div>
      )}

      <div className="relative z-10 p-4 sm:p-6 space-y-3.5">
        {/* Linha Superior: Avatar, Identidade e Ação de Compartilhar */}
        <div className="flex items-start justify-between gap-3 pt-2 sm:pt-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {/* Avatar Gamer com Anel Neon e Botão Rápido */}
            <div id="profile-avatar" className="profile-avatar relative shrink-0">
              <div
                className={`rounded-2xl overflow-hidden border-2 ${themeStyles.avatarBorder} shadow-md ring-1 ring-white/10`}
              >
                <UserAvatar
                  photoURL={user.photoURL}
                  name={user.displayName}
                  size="lg"
                  className="rounded-xl w-14 h-14 sm:w-16 sm:h-16"
                />
              </div>

              {isOwner && (
                <button
                  type="button"
                  onClick={() => handleAction(onOpenEditProfile)}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 hover:bg-emerald-400 border-2 border-[#141822] flex items-center justify-center text-black font-black shadow-md active:scale-95 transition-transform"
                  title="Alterar foto do perfil"
                  aria-label="Alterar foto do perfil"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}
            </div>

            {/* Identidade: Display Name, @username, Nível e Selo */}
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="profile-display-name text-base sm:text-xl font-black text-white tracking-tight truncate">
                  {user.displayName}
                </h1>

                {(user.isVerified || user.isAdmin || access.plan !== "free") && (
                  <span
                    className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-cyan-500 text-black shadow-sm shrink-0"
                    title="Gamer Verificado"
                  >
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={`profile-username text-xs font-mono ${themeStyles.textAccent}`}>
                  @{user.username}
                </span>

                {/* Badge de Nível Gamer com Link Direto para o Hub */}
                <Link
                  href={user.username ? `/perfil/${encodeURIComponent(user.username)}/conquistas` : "/conquistas"}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-mono text-[10px] font-bold transition-all active:scale-95 cursor-pointer shadow-sm group"
                  title="Abrir Central de Conquistas & Missões"
                >
                  <Trophy className="w-3 h-3 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span>LV. {user.gamerLevel || 1} • CONQUISTAS →</span>
                </Link>

                {/* Selo de Assinatura */}
                {access.plan === "vip" ? (
                  <button
                    type="button"
                    onClick={() => (isOwner ? handleAction(onOpenManagePlan) : undefined)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#2a2012] border border-amber-500/40 text-amber-300 font-bold text-[10px] active:scale-95 transition-transform"
                  >
                    <Crown className="w-2.5 h-2.5 text-amber-400" />
                    <span>VIP</span>
                  </button>
                ) : access.plan === "pro" ? (
                  <button
                    type="button"
                    onClick={() => (isOwner ? handleAction(onOpenManagePlan) : undefined)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0e2730] border border-cyan-500/40 text-cyan-300 font-bold text-[10px] active:scale-95 transition-transform"
                  >
                    <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
                    <span>PRO</span>
                  </button>
                ) : isOwner ? (
                  <button
                    type="button"
                    onClick={() => handleAction(onOpenUpgrade)}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    Upgrade PRO →
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {/* Botão Flutuante de Compartilhar */}
          {onOpenShare && (
            <button
              type="button"
              onClick={() => handleAction(onOpenShare)}
              className="p-2 sm:px-3 sm:py-2 rounded-2xl bg-[#1c2230] hover:bg-[#252f42] border border-white/10 text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all shrink-0 active:scale-95"
              title="Compartilhar Perfil"
              aria-label="Compartilhar Perfil"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          )}
        </div>

        {/* Bio Curta com Expansão Progressiva */}
        {user.bio ? (
          <div className="profile-bio text-xs text-gray-300 leading-relaxed pt-1">
            <p className={bioExpanded ? "" : "line-clamp-2"}>{user.bio}</p>
            {user.bio.length > 90 && (
              <button
                type="button"
                onClick={() => setBioExpanded(!bioExpanded)}
                className="text-[11px] text-emerald-400 hover:underline mt-0.5 font-medium"
              >
                {bioExpanded ? "Ver menos" : "Ver mais"}
              </button>
            )}
          </div>
        ) : isOwner ? (
          <button
            type="button"
            onClick={() => handleAction(onOpenEditBio || onOpenEditProfile)}
            className="text-xs text-gray-500 hover:text-emerald-400 flex items-center gap-1.5 transition-colors py-0.5"
          >
            <Edit2 className="w-3 h-3" />
            <span>Adicionar uma bio...</span>
          </button>
        ) : null}

        {/* Insígnias Gamer Equipadas */}
        {(() => {
          const titlesToDisplay =
            user.customTitles && user.customTitles.length > 0
              ? user.customTitles
              : user.customTitle
              ? [user.customTitle]
              : [];

          if (titlesToDisplay.length === 0 && !isOwner) return null;

          return (
            <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
              {titlesToDisplay.map((title, idx) => (
                <span
                  key={`${title}-${idx}`}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm transition-all border ${
                    idx === 0
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                      : "bg-[#1c2230] border-white/10 text-gray-300 hover:border-white/25"
                  }`}
                >
                  <Award className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-[150px]">{title}</span>
                </span>
              ))}

              {titlesToDisplay.length === 0 && isOwner && (
                <button
                  type="button"
                  onClick={() => handleAction(onOpenEditProfile)}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-gray-400 hover:text-white text-[11px] font-medium transition-all"
                >
                  <Award className="w-3 h-3 text-amber-400/80" />
                  <span>Equipar Insígnias</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* Gamertags / Redes Sociais Compactas */}
        {user.socialLinks && Object.values(user.socialLinks).some(Boolean) && (
          <div className="pt-0.5">
            <SocialGamertagsBar socials={user.socialLinks} />
          </div>
        )}

        {/* Barra de Ações Rápidas Ergonômica (Thumb Zone) */}
        {isOwner && (
          <div className="pt-1 flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
            <button
              type="button"
              onClick={() => handleAction(onOpenEditProfile)}
              className="min-h-[38px] px-3.5 py-1.5 rounded-2xl bg-[#1c2230] hover:bg-[#252f42] border border-white/10 text-xs font-bold text-gray-200 flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
            >
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Personalizar</span>
            </button>

            <Link
              href="/search"
              className="min-h-[38px] px-3.5 py-1.5 rounded-2xl bg-[#10291e] hover:bg-[#163829] border border-emerald-500/30 text-xs font-bold text-emerald-300 flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Adicionar Jogos</span>
            </Link>

            {onOpenImporter && (
              <button
                type="button"
                onClick={() => handleAction(onOpenImporter)}
                className="min-h-[38px] px-3.5 py-1.5 rounded-2xl bg-[#1c2230] hover:bg-[#252f42] border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span>Importar</span>
              </button>
            )}

            {onOpenSectionsOrder && (
              <button
                type="button"
                onClick={() => handleAction(onOpenSectionsOrder)}
                className="min-h-[38px] px-3 py-1.5 rounded-2xl bg-[#1c2230] hover:bg-[#252f42] border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
                title="Reordenar seções do perfil"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>Seções</span>
              </button>
            )}

            {onOpenTools && (
              <button
                type="button"
                onClick={() => handleAction(onOpenTools)}
                className="min-h-[38px] w-10 rounded-2xl bg-[#1c2230] hover:bg-[#252f42] border border-white/10 text-gray-300 flex items-center justify-center shrink-0 active:scale-95 transition-transform ml-auto"
                title="Ferramentas e Configurações"
                aria-label="Ferramentas do perfil"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
