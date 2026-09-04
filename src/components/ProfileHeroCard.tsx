"use client";

import React from "react";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import { getThemeStyles } from "@/lib/themeStyles";
import UserAvatar from "./UserAvatar";
import PlanBadge from "./PlanBadge";
import SocialGamertagsBar from "./SocialGamertagsBar";
import {
  Crown,
  Sparkles,
  User,
  Heart,
  Plus,
  Edit2,
  SlidersHorizontal,
  Share2,
  ArrowRight,
  ShieldCheck,
  Gamepad2,
  Trophy,
  Palette,
  Upload,
} from "lucide-react";

interface ProfileHeroCardProps {
  user: UserProfile;
  isOwner: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  onOpenEditProfile?: () => void;
  onOpenEditBio?: () => void;
  onOpenTools: () => void;
  onOpenImporter?: () => void;
  onOpenShare: () => void;
  onOpenManagePlan: () => void;
  onOpenUpgrade: () => void;
}

export default function ProfileHeroCard({
  user,
  isOwner,
  isAdmin,
  isPremium,
  onOpenEditProfile,
  onOpenEditBio,
  onOpenTools,
  onOpenImporter,
  onOpenShare,
  onOpenManagePlan,
  onOpenUpgrade,
}: ProfileHeroCardProps) {
  const layout = user.profileLayout || "default";
  const handleEdit = onOpenEditProfile || onOpenEditBio || onOpenTools;
  const themeStyles = getThemeStyles(user.theme);

  // Insígnias do usuário
  const titlesToDisplay =
    user.customTitles && user.customTitles.length > 0
      ? user.customTitles
      : user.customTitle
      ? [user.customTitle]
      : [];

  // =========================================================================
  // 1. LAYOUT PADRÃO: CYBER VAULT (COMBINADO, BALANCEADO & SEM ESPREMER)
  // =========================================================================
  if (layout === "default") {
    return (
      <div className={`relative rounded-[32px] overflow-hidden border ${themeStyles.borderGlow} bg-[#18191c] p-5 sm:p-8 shadow-2xl ${themeStyles.cardGlow} space-y-5 transition-all`}>
        {user.bannerURL && (
          <>
            <img
              src={user.bannerURL}
              alt="Banner de Capa"
              className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] via-[#18191c]/80 to-transparent pointer-events-none" />
          </>
        )}

        <div className="relative z-10 space-y-4">
          {/* Topo: Avatar + Nome/Handle + Selo Nobre + Botão de Compartilhar */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
              <div className="relative shrink-0">
                <UserAvatar
                  photoURL={user.photoURL}
                  name={user.displayName}
                  size="xl"
                  className={`border-2 ${themeStyles.avatarBorder} shadow-xl ring-2 ${themeStyles.avatarRing}/30`}
                />
              </div>

              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight truncate">
                    {user.displayName}
                  </h1>
                  <span className={`text-xs ${themeStyles.textAccent} font-mono shrink-0`}>
                    @{user.username}
                  </span>
                </div>

                {/* Selo Nobre Único e Interativo (Sem Duplicações) */}
                {user.plan === "vip" ? (
                  <div
                    onClick={isOwner ? onOpenManagePlan : undefined}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold w-fit shadow-sm ${
                      isOwner ? "cursor-pointer hover:bg-amber-500/20 active:scale-95 transition-all" : ""
                    }`}
                    title={isOwner ? "Clique para gerenciar seu plano VIP" : "Membro Fundador VIP"}
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Membro VIP Vitalício</span>
                  </div>
                ) : user.plan === "pro" ? (
                  <div
                    onClick={isOwner ? onOpenManagePlan : undefined}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-bold w-fit shadow-sm ${
                      isOwner ? "cursor-pointer hover:bg-cyan-500/20 active:scale-95 transition-all" : ""
                    }`}
                    title={isOwner ? "Clique para gerenciar sua assinatura PRO" : "Assinante PRO"}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>
                      Assinante PRO
                      {user.premiumUntil && (
                        <span className="text-gray-300 font-normal ml-1">
                          • Válido até{" "}
                          {new Date(user.premiumUntil).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      )}
                    </span>
                  </div>
                ) : (
                  <div
                    onClick={isOwner ? onOpenUpgrade : undefined}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium w-fit shadow-sm ${
                      isOwner ? "cursor-pointer hover:border-white/20 hover:text-white active:scale-95 transition-all" : ""
                    }`}
                    title={isOwner ? "Conheça as vantagens do plano PRO" : "Conta Gratuita"}
                  >
                    <User className="w-3.5 h-3.5 text-gray-400" />
                    <span>Conta Free</span>
                    {isOwner && (
                      <span className="text-[#00E5FF] font-semibold ml-1 flex items-center gap-0.5">
                        • Seja PRO <ArrowRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Botão de Compartilhar no Topo Direito */}
            <button
              onClick={onOpenShare}
              className="p-2.5 sm:px-3.5 sm:py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/25 text-gray-300 hover:text-white flex items-center gap-1.5 text-xs font-bold transition-all shrink-0 active:scale-95"
              title="Compartilhar Perfil"
              aria-label="Compartilhar Perfil"
            >
              <Share2 className="w-4 h-4 text-[#00E5FF]" />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          </div>

          {/* Insígnias Gamer em Largura Total */}
          {titlesToDisplay.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {titlesToDisplay.map((title, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-3 py-1 rounded-full font-bold shadow-sm inline-flex items-center gap-1.5 transition-all ${
                    idx === 0
                      ? themeStyles.badgeStyle
                      : "bg-white/10 border border-white/20 text-gray-200"
                  }`}
                >
                  <Sparkles className="w-3 h-3 opacity-70" />
                  {title}
                </span>
              ))}
            </div>
          )}

          {/* Bio e Jogo Favorito */}
          {user.bio ? (
            <div className="group/bio flex items-start gap-2">
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                {user.bio}
              </p>
              {isOwner && (
                <button
                  onClick={onOpenEditBio || handleEdit}
                  className="opacity-70 sm:opacity-0 sm:group-hover/bio:opacity-100 transition-opacity p-1 text-gray-400 hover:text-[#00E5FF] rounded-md hover:bg-white/5 flex-shrink-0"
                  title="Editar bio"
                  aria-label="Editar bio"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : isOwner ? (
            <button
              onClick={onOpenEditBio || handleEdit}
              className="text-xs text-gray-500 hover:text-cyan-400 flex items-center gap-1.5 transition-colors py-0.5"
            >
              <Edit2 className="w-3 h-3" />
              <span>Adicionar uma bio...</span>
            </button>
          ) : null}

          {user.favoriteGame && (
            <div className="inline-flex items-center gap-1.5 text-xs text-pink-300 bg-pink-950/40 border border-pink-500/20 px-3 py-1 rounded-full">
              <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" /> Jogo Favorito:{" "}
              <strong>{user.favoriteGame}</strong>
            </div>
          )}

          {/* Gamertags / Redes Sociais */}
          <SocialGamertagsBar socials={user.socialLinks} />

          {/* Botões de Ação Simétricos */}
          {isOwner ? (
            <div className="pt-2">
              {/* Mobile: 1 Grande em cima + 2 perfeitamente simétricos embaixo */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
                <Link
                  href="/search"
                  className="w-full sm:w-auto min-h-[46px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-gray-200 text-black text-xs font-black transition-all shadow-xl shadow-white/10 active:scale-95"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Adicionar Jogos</span>
                </Link>

                {onOpenImporter && (
                  <button
                    onClick={onOpenImporter}
                    className="w-full sm:w-auto min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-[#00E5FF]/40 hover:border-[#00E5FF]/70 text-[#00E5FF] text-xs font-bold transition-all shadow-md active:scale-95"
                    title="Importar biblioteca da Steam, Epic, Xbox, PlayStation e arquivos"
                  >
                    <Upload className="w-4 h-4 text-[#00E5FF]" />
                    <span>Importar</span>
                  </button>
                )}

                <div className="grid grid-cols-2 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
                  <button
                    onClick={handleEdit}
                    className={`min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl ${themeStyles.bgSubtle} border ${themeStyles.borderAccent} ${themeStyles.borderHover} text-xs font-bold text-white transition-all shadow-md active:scale-95`}
                    title="Editar dados cadastrais, bio, capa e personalizar perfil"
                  >
                    <Palette className={`w-4 h-4 ${themeStyles.textAccent}`} />
                    <span>Editar &amp; Personalizar</span>
                  </button>

                  <button
                    onClick={onOpenTools}
                    className="min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/25 text-xs font-bold text-gray-300 hover:text-white transition-all shadow-md active:scale-95"
                    title="Ações e Ferramentas do Perfil"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                    <span>Ferramentas</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex items-center gap-2.5 flex-wrap">
              <button
                onClick={onOpenShare}
                className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-white text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-xl shadow-white/10 active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartilhar Perfil</span>
              </button>
              <Link
                href="/"
                className="min-h-[46px] px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-semibold text-gray-200 flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Criar Meu MyGameList</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. LAYOUT CINEMÁTICO: PLAYSTATION & STEAM CONSOLE SHOWCASE
  // =========================================================================
  if (layout === "cinematic") {
    return (
      <div className={`relative rounded-[32px] overflow-hidden border ${themeStyles.borderGlow} bg-[#14161a] shadow-2xl ${themeStyles.cardGlow}`}>
        {/* Capa de Banner Expansiva com Botões Flutuantes em Vidro */}
        <div className="relative h-44 sm:h-56 w-full overflow-hidden bg-gradient-to-b from-indigo-950/60 to-black">
          {user.bannerURL ? (
            <img
              src={user.bannerURL}
              alt="Banner"
              className="w-full h-full object-cover opacity-45"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-cyan-900/40 via-purple-900/40 to-black" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#14161a] via-transparent to-black/40" />

          {/* Botões Flutuantes no Canto Superior Direito da Capa */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={onOpenShare}
              className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all shadow-lg active:scale-95"
              title="Compartilhar Perfil"
              aria-label="Compartilhar"
            >
              <Share2 className={`w-4 h-4 ${themeStyles.textAccent}`} />
            </button>

            {isOwner && (
              <button
                onClick={onOpenTools}
                className="p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all shadow-lg active:scale-95"
                title="Ferramentas"
                aria-label="Ferramentas"
              >
                <SlidersHorizontal className={`w-4 h-4 ${themeStyles.textAccent}`} />
              </button>
            )}
          </div>
        </div>

        {/* Conteúdo com Avatar Sobreposto (Overlap) */}
        <div className="relative z-10 px-5 sm:px-8 pb-6 sm:pb-8 space-y-4 -mt-16 sm:-mt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4 sm:gap-5">
              <div className="relative shrink-0">
                <UserAvatar
                  photoURL={user.photoURL}
                  name={user.displayName}
                  size="xl"
                  className={`border-4 border-[#14161a] ring-2 ${themeStyles.avatarRing} shadow-2xl`}
                />
              </div>

              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {user.displayName}
                  </h1>
                  <span className={`text-xs ${themeStyles.textAccent} font-mono`}>@{user.username}</span>
                </div>

                {user.plan === "vip" ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>VIP Member</span>
                  </div>
                ) : user.plan === "pro" ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-[#00E5FF] text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>PRO Pass</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs">
                    <User className="w-3.5 h-3.5" />
                    <span>Free Tier</span>
                  </div>
                )}
              </div>
            </div>

            {/* Ações no Desktop */}
            {isOwner && (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/search"
                  className="min-h-[44px] px-5 py-2.5 rounded-2xl bg-white hover:bg-gray-200 text-black text-xs font-black transition-all shadow-xl active:scale-95 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4 text-black" />
                  <span>Adicionar Jogos</span>
                </Link>
                {onOpenImporter && (
                  <button
                    onClick={onOpenImporter}
                    className="min-h-[44px] px-4 py-2.5 rounded-2xl bg-cyan-950/40 hover:bg-cyan-950/70 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-bold transition-all active:scale-95 flex items-center gap-2 shadow-md"
                    title="Importar biblioteca"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00E5FF]" />
                    <span>Importar</span>
                  </button>
                )}
                <button
                  onClick={handleEdit}
                  className={`min-h-[44px] px-4 py-2.5 rounded-2xl ${themeStyles.bgSubtle} border ${themeStyles.borderAccent} ${themeStyles.borderHover} text-xs font-bold text-white transition-all active:scale-95 flex items-center gap-2 shadow-md`}
                >
                  <Palette className={`w-3.5 h-3.5 ${themeStyles.textAccent}`} />
                  <span>Editar &amp; Personalizar</span>
                </button>
              </div>
            )}
          </div>

          {/* Insígnias Estilo Troféus de Console */}
          {titlesToDisplay.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-2">
              {titlesToDisplay.map((title, idx) => (
                <span
                  key={idx}
                  className={`text-xs px-3 py-1 rounded-xl border font-bold flex items-center gap-1.5 shadow-sm ${
                    idx === 0
                      ? themeStyles.badgeStyle
                      : "bg-white/5 border-white/10 text-gray-200"
                  }`}
                >
                  <Trophy className="w-3 h-3 text-amber-400" />
                  <span>{title}</span>
                </span>
              ))}
            </div>
          )}

          {/* Bio e Jogo Favorito */}
          {user.bio ? (
            <div className="group/bio flex items-start gap-2">
              <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
                {user.bio}
              </p>
              {isOwner && (
                <button
                  onClick={onOpenEditBio || handleEdit}
                  className="opacity-70 sm:opacity-0 sm:group-hover/bio:opacity-100 transition-opacity p-1 text-gray-400 hover:text-[#00E5FF] rounded-md hover:bg-white/5 flex-shrink-0"
                  title="Editar bio"
                  aria-label="Editar bio"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : isOwner ? (
            <button
              onClick={onOpenEditBio || handleEdit}
              className="text-xs text-gray-500 hover:text-cyan-400 flex items-center gap-1.5 transition-colors py-0.5"
            >
              <Edit2 className="w-3 h-3" />
              <span>Adicionar uma bio...</span>
            </button>
          ) : null}

          {user.favoriteGame && (
            <div className="inline-flex items-center gap-1.5 text-xs text-pink-300 bg-pink-950/40 border border-pink-500/20 px-3 py-1 rounded-full">
              <Heart className="w-3.5 h-3.5 fill-pink-400 text-pink-400" /> Jogo Favorito:{" "}
              <strong>{user.favoriteGame}</strong>
            </div>
          )}

          <SocialGamertagsBar socials={user.socialLinks} />

          {/* Ações Mobile */}
          {isOwner && (
            <div className="sm:hidden grid grid-cols-2 gap-2 pt-2">
              <Link
                href="/search"
                className="min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-black text-xs font-black shadow-xl active:scale-95"
              >
                <Plus className="w-4 h-4 text-black" />
                <span>Adicionar</span>
              </Link>
              {onOpenImporter && (
                <button
                  onClick={onOpenImporter}
                  className="min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-cyan-950/40 border border-[#00E5FF]/40 text-[#00E5FF] text-xs font-bold active:scale-95"
                >
                  <Upload className="w-4 h-4 text-[#00E5FF]" />
                  <span>Importar</span>
                </button>
              )}
              <button
                onClick={handleEdit}
                className={`min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl ${themeStyles.bgSubtle} border ${themeStyles.borderAccent} text-xs font-bold text-white active:scale-95`}
              >
                <Palette className={`w-3.5 h-3.5 ${themeStyles.textAccent}`} />
                <span>Personalizar</span>
              </button>
              <button
                onClick={onOpenTools}
                className="min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 text-xs font-bold text-gray-300 hover:text-white active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4 text-gray-400" />
                <span>Ferramentas</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // 3. LAYOUT GAMER ID: CRACHÁ HOLOGRÁFICO CYBERPUNK HUD
  // =========================================================================
  if (layout === "gamer_id") {
    return (
      <div className={`relative rounded-[28px] overflow-hidden border-2 ${themeStyles.hudBorder} bg-gradient-to-br from-[#0e1014] via-[#14171e] to-[#0a0c10] p-5 sm:p-7 shadow-2xl ${themeStyles.cardGlow} space-y-4`}>
        {/* Capa de Banner Cyberpunk com Scanlines se configurada */}
        {user.bannerURL && (
          <>
            <img
              src={user.bannerURL}
              alt="Banner Cyber"
              className="absolute inset-0 w-full h-full object-cover opacity-15 pointer-events-none"
            />
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0e1014] via-transparent to-transparent pointer-events-none" />
          </>
        )}

        {/* HUD Tech Header */}
        <div className={`relative z-10 flex items-center justify-between border-b ${themeStyles.borderAccent} pb-3`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${themeStyles.bgAccent} animate-pulse`} />
            <span className={`text-[10px] font-mono font-bold tracking-widest ${themeStyles.hudText} uppercase`}>
              VAULT-ID // OP-#{user.uid.slice(0, 6).toUpperCase()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenShare}
              className={`p-1.5 rounded-lg ${themeStyles.bgSubtle} border ${themeStyles.borderAccent} ${themeStyles.hudText} hover:text-white transition-colors`}
              title="Compartilhar ID"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            {isOwner && (
              <button
                onClick={onOpenTools}
                className={`p-1.5 rounded-lg ${themeStyles.bgSubtle} border ${themeStyles.borderAccent} ${themeStyles.hudText} hover:text-white transition-colors`}
                title="Ferramentas"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Identity Row */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative shrink-0">
            <UserAvatar
              photoURL={user.photoURL}
              name={user.displayName}
              size="xl"
              className={`rounded-2xl border-2 ${themeStyles.avatarBorder} shadow-lg ${themeStyles.cardGlow}`}
            />
          </div>

          <div className="space-y-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight truncate">
              {user.displayName}
            </h1>
            <p className={`text-xs ${themeStyles.textAccent} font-mono`}>
              CREDENTIAL: @{user.username}
            </p>
          </div>
        </div>

        {/* Faixa de Prestígio Neon */}
        {user.plan === "vip" ? (
          <div className="relative z-10 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-500/40 flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-xs font-mono font-black text-amber-300 uppercase tracking-wide">
              MEMBRO FUNDADOR VIP • ACESSO VITALÍCIO
            </span>
          </div>
        ) : user.plan === "pro" ? (
          <div className={`relative z-10 p-2.5 rounded-xl bg-gradient-to-r ${themeStyles.bgSubtle} via-white/5 to-transparent border ${themeStyles.borderAccent} flex items-center gap-2`}>
            <Sparkles className={`w-4 h-4 ${themeStyles.textAccent} shrink-0`} />
            <span className={`text-xs font-mono font-black ${themeStyles.textAccent} uppercase tracking-wide`}>
              VAULT OPERATIVE PRO • ACESSO TOTAL
            </span>
          </div>
        ) : (
          <div className="relative z-10 p-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gray-400 shrink-0" />
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wide">
              RECRUTA • FREE ACCESS
            </span>
          </div>
        )}

        {/* Chips Colecionáveis */}
        {titlesToDisplay.length > 0 && (
          <div className="relative z-10 flex items-center gap-1.5 flex-wrap">
            {titlesToDisplay.map((title, idx) => (
              <span
                key={idx}
                className={`text-[11px] font-mono px-2.5 py-0.5 rounded-md ${themeStyles.hudBg} border ${themeStyles.hudBorder} ${themeStyles.hudText} font-bold`}
              >
                [ {title} ]
              </span>
            ))}
          </div>
        )}

        {/* Bio e Jogo Favorito */}
        {user.bio ? (
          <div className="relative z-10 group/bio flex items-start gap-2">
            <p className={`text-xs text-gray-300 font-sans leading-relaxed border-l-2 ${themeStyles.hudBorder} pl-3 flex-1`}>
              {user.bio}
            </p>
            {isOwner && (
              <button
                onClick={onOpenEditBio || handleEdit}
                className="opacity-70 sm:opacity-0 sm:group-hover/bio:opacity-100 transition-opacity p-1 text-gray-400 hover:text-cyan-300 rounded-md hover:bg-white/5 flex-shrink-0"
                title="Editar bio"
                aria-label="Editar bio"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ) : isOwner ? (
          <button
            onClick={onOpenEditBio || handleEdit}
            className="relative z-10 text-xs text-gray-500 hover:text-cyan-400 flex items-center gap-1.5 transition-colors py-0.5"
          >
            <Edit2 className="w-3 h-3" />
            <span>Adicionar uma bio...</span>
          </button>
        ) : null}

        {user.favoriteGame && (
          <div className="relative z-10 text-xs text-pink-300 font-mono flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-pink-400" /> FAV_GAME: <strong>{user.favoriteGame}</strong>
          </div>
        )}

        <SocialGamertagsBar socials={user.socialLinks} />

        {/* Botões HUD */}
        {isOwner && (
          <div className={`relative z-10 grid grid-cols-2 sm:flex items-center gap-2 pt-2 border-t ${themeStyles.borderAccent}`}>
            <Link
              href="/search"
              className={`col-span-2 sm:col-span-1 min-h-[44px] px-5 py-2 rounded-xl ${themeStyles.hudButton} text-xs font-mono font-black flex items-center justify-center gap-2 transition-all active:scale-95`}
            >
              <Plus className="w-4 h-4" />
              <span>+ ADD GAMES</span>
            </Link>
            <button
              onClick={handleEdit}
              className={`min-h-[44px] px-4 py-2 rounded-xl ${themeStyles.bgSubtle} border ${themeStyles.hudBorder} text-xs font-mono ${themeStyles.hudText} hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>EDIT_CUSTOMIZE</span>
            </button>
            <button
              onClick={onOpenTools}
              className={`min-h-[44px] px-4 py-2 rounded-xl bg-white/5 border border-white/15 text-xs font-mono text-gray-300 hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>TOOLS</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // 4. LAYOUT EDITORIAL MINIMAL: LUXO, CLEAN & TIPOGRAFIA PURA
  // =========================================================================
  return (
    <div className={`relative rounded-[28px] overflow-hidden border ${themeStyles.borderGlow} bg-[#121316] p-6 sm:p-8 space-y-5 shadow-2xl ${themeStyles.cardGlow}`}>
      {user.bannerURL && (
        <div
          className="absolute top-0 left-0 right-0 h-1.5 opacity-60 pointer-events-none"
          style={{ backgroundColor: themeStyles.primaryHex }}
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 sm:gap-5 min-w-0">
          <UserAvatar
            photoURL={user.photoURL}
            name={user.displayName}
            size="xl"
            className={`border ${themeStyles.avatarBorder}`}
          />

          <div className="space-y-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate">
              {user.displayName}
            </h1>
            <p className={`text-xs ${themeStyles.textAccent} font-mono`}>
              @{user.username}
            </p>
            <div className="pt-0.5">
              {user.plan === "vip" ? (
                <span className="text-[11px] font-bold text-amber-300 tracking-wide uppercase">
                  Membro VIP Vitalício
                </span>
              ) : user.plan === "pro" ? (
                <span className="text-[11px] font-bold text-cyan-300 tracking-wide uppercase">
                  Assinante PRO
                </span>
              ) : (
                <span className="text-[11px] text-gray-500 uppercase tracking-wide">
                  Conta Gratuita
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onOpenShare}
          className="p-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-colors"
          title="Compartilhar"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {titlesToDisplay.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {titlesToDisplay.map((title, idx) => (
            <span
              key={idx}
              className={`text-xs px-3 py-1 rounded-lg border font-medium ${
                idx === 0 ? themeStyles.badgeStyle : "bg-white/5 border-white/10 text-gray-300"
              }`}
            >
              {title}
            </span>
          ))}
        </div>
      )}

      {user.bio ? (
        <div className="group/bio flex items-start gap-2">
          <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
            {user.bio}
          </p>
          {isOwner && (
            <button
              onClick={onOpenEditBio || handleEdit}
              className="opacity-70 sm:opacity-0 sm:group-hover/bio:opacity-100 transition-opacity p-1 text-gray-400 hover:text-white rounded-md hover:bg-white/5 flex-shrink-0"
              title="Editar bio"
              aria-label="Editar bio"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : isOwner ? (
        <button
          onClick={onOpenEditBio || handleEdit}
          className="text-xs text-gray-500 hover:text-white flex items-center gap-1.5 transition-colors py-0.5"
        >
          <Edit2 className="w-3 h-3" />
          <span>Adicionar uma bio...</span>
        </button>
      ) : null}

      {user.favoriteGame && (
        <div className="text-xs text-gray-300 flex items-center gap-1.5">
          <Heart className="w-3.5 h-3.5 text-pink-400" /> Jogo Favorito: <strong>{user.favoriteGame}</strong>
        </div>
      )}

      <SocialGamertagsBar socials={user.socialLinks} />

      {isOwner && (
        <div className="pt-2 flex items-center gap-2.5 flex-wrap">
          <Link
            href="/search"
            className="px-5 py-2.5 rounded-xl bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
          >
            + Adicionar Jogos
          </Link>
          <button
            onClick={handleEdit}
            className={`px-4 py-2.5 rounded-xl border ${themeStyles.borderAccent} ${themeStyles.borderHover} ${themeStyles.bgSubtle} text-xs font-bold text-white transition-colors flex items-center gap-2 shadow-md`}
          >
            <Palette className={`w-3.5 h-3.5 ${themeStyles.textAccent}`} />
            <span>Editar &amp; Personalizar</span>
          </button>
          <button
            onClick={onOpenTools}
            className="px-4 py-2.5 rounded-xl border border-white/15 text-xs text-gray-300 hover:text-white hover:border-white/30 transition-colors"
          >
            Ferramentas
          </button>
        </div>
      )}
    </div>
  );
}
