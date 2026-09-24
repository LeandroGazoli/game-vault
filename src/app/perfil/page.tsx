"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { UserGame, UserProfile } from "@/lib/types";
import { ProfileSectionId } from "@/lib/types/profile.types";
import { getProfileUrl } from "@/lib/routes";
import { computeLibraryStats } from "@/lib/gamificationCore";
import { useProfileModules } from "@/hooks/useProfileModules";

import ProfileHeroMobile from "@/components/profile/ProfileHeroMobile";
import ProfileGameTracker from "@/components/profile/ProfileGameTracker";
import ProfileStreamingSections from "@/components/profile/ProfileStreamingSections";
import ProfileGamificationTeaser from "@/components/profile/ProfileGamificationTeaser";
import ProfileModularContainer from "@/components/profile/ProfileModularContainer";
import ProfileDesktopSidebar from "@/components/profile/ProfileDesktopSidebar";
import ShowcaseGameCard from "@/components/ShowcaseGameCard";
import ProfileBioRenderer from "@/components/ProfileBioRenderer";
import UserAvatar from "@/components/UserAvatar";

import ProfileModalsContainer from "@/components/profile/ProfileModalsContainer";
import FranchiseBadgesSection from "@/components/profile/FranchiseBadgesSection";
import ShowcaseTrophiesSection from "@/components/profile/ShowcaseTrophiesSection";
import GamerGallerySection from "@/components/profile/GamerGallerySection";
import FinancialStatsCard from "@/components/profile/FinancialStatsCard";
import ActivityHeatmapSection from "@/components/profile/ActivityHeatmapSection";
import FavoriteCharactersSection from "@/components/profile/FavoriteCharactersSection";
import SetupShowcaseSection from "@/components/profile/SetupShowcaseSection";
import TwitchLiveSection from "@/components/profile/TwitchLiveSection";
import NowPlayingRail from "@/components/profile/NowPlayingRail";
import MostAnticipatedSection from "@/components/profile/MostAnticipatedSection";
import ProfileGuestbookSection from "@/components/profile/ProfileGuestbookSection";
import AuthModal from "@/components/AuthModal";
import { Gamepad2, XCircle } from "lucide-react";
import { scopeProfileCss } from "@/lib/sanitizeCss";

export interface ProfilePageProps {
  targetUsername?: string;
}

export default function ProfilePage({ targetUsername }: ProfilePageProps = {}) {
  const { user: authUser, updateUserProfile, isAdmin, isPremium, isLoading: authLoading } = useAuth();
  const { library: ownLibrary, stats: ownStats, isLoading: libraryLoading, levelUpData, dismissLevelUp } = useGameLibrary();
  const router = useRouter();
  const params = useParams();

  const routeUsername = (targetUsername || (params?.username as string) || "").trim();

  useEffect(() => {
    if (!routeUsername && authUser?.username) {
      router.replace(getProfileUrl(authUser.username));
    }
  }, [routeUsername, authUser?.username, router]);

  const isOwnProfile = Boolean(
    authUser && (!routeUsername || (authUser.username && authUser.username.toLowerCase() === routeUsername.toLowerCase()))
  );
  const isViewingPublic = Boolean(
    routeUsername && (!authUser?.username || authUser.username.toLowerCase() !== routeUsername.toLowerCase())
  );

  const [publicData, setPublicData] = useState<{ user: UserProfile; games: UserGame[]; isPrivate?: boolean } | null>(null);
  const [publicLoading, setPublicLoading] = useState(isViewingPublic);
  const [publicNotFound, setPublicNotFound] = useState(false);

  useEffect(() => {
    if (isViewingPublic && routeUsername) {
      setPublicLoading(true);
      fetch(`/api/user/${encodeURIComponent(routeUsername)}/games.json?limit=all`)
        .then(async (res) => (res.ok ? ((await res.json()) as { user?: UserProfile; games?: UserGame[]; stats?: any }) : null))
        .then((data) => {
          if (data?.user) setPublicData(data);
          else setPublicNotFound(true);
        })
        .catch(() => setPublicNotFound(true))
        .finally(() => setPublicLoading(false));
    } else {
      setPublicData(null);
      setPublicLoading(false);
    }
  }, [isViewingPublic, routeUsername]);

  const activeUser = (isViewingPublic ? publicData?.user : authUser) as UserProfile | null;
  const activeLibrary = isViewingPublic ? publicData?.games || [] : ownLibrary;
  const activeStats = useMemo(() => (isViewingPublic ? computeLibraryStats(activeLibrary) : ownStats), [isViewingPublic, activeLibrary, ownStats]);

  // Hook Modular de Seções e Templates
  const { activeTemplate, sections, customTemplate, applySections } = useProfileModules(activeUser, isOwnProfile ? updateUserProfile : undefined);

  // Estados de Modais
  const [selectedGameToEdit, setSelectedGameToEdit] = useState<any | null>(null);
  const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isManagePlanOpen, setIsManagePlanOpen] = useState(false);
  const [isXpBreakdownOpen, setIsXpBreakdownOpen] = useState(false);
  const [isGamerCardOpen, setIsGamerCardOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  const renderSection = useCallback((sectionId: ProfileSectionId) => {
    if (!activeUser) return null;

    switch (sectionId) {
      case "twitch_live":
        return activeUser.twitchChannel || activeUser.socialLinks?.twitch ? (
          <TwitchLiveSection
            channel={activeUser.twitchChannel || activeUser.socialLinks?.twitch || ""}
            currentGame={activeLibrary.find((g) => g.status === "playing")?.gameTitle}
          />
        ) : null;
      case "now_playing":
        return (
          <NowPlayingRail
            games={activeLibrary}
            pinnedGameIds={activeUser.nowPlayingConfig?.pinnedGameIds}
            intervalSeconds={activeUser.nowPlayingConfig?.intervalSeconds || 6}
            isOwner={isOwnProfile}
          />
        );
      case "game_tracker":
        return (
          <ProfileGameTracker
            games={activeLibrary}
            stats={activeStats}
            isOwner={isOwnProfile}
            onEditGame={(g) => setSelectedGameToEdit(g)}
            onAddGame={() => router.push("/search")}
          />
        );
      case "library":
        return (
          <ProfileStreamingSections
            games={activeLibrary}
            stats={activeStats}
            isOwner={isOwnProfile}
            theme={activeUser.theme}
            steamId={activeUser.socialLinks?.steam}
            onEditGame={(g) => setSelectedGameToEdit(g)}
            onOpenImporter={() => setIsImporterOpen(true)}
            onSaveSteamId={async (steamId) => {
              if (isOwnProfile) {
                await updateUserProfile?.({ socialLinks: { ...authUser?.socialLinks, steam: steamId } });
              }
            }}
          />
        );
      case "achievements":
        return (
          <ProfileGamificationTeaser
            user={activeUser}
            stats={activeStats}
            isOwner={isOwnProfile}
          />
        );
      case "bio":
        return activeUser.customMarkdown || activeUser.customHtml ? (
          <ProfileBioRenderer
            content={activeUser.customMarkdown || activeUser.customHtml}
            mode={activeUser.customBioMode}
            onEdit={isOwnProfile ? () => router.push("/perfil/editar?tab=markdown") : undefined}
          />
        ) : null;
      case "financial_stats":
        return <FinancialStatsCard games={activeLibrary} isOwner={isOwnProfile} />;
      case "showcase_trophies":
        return <ShowcaseTrophiesSection isOwner={isOwnProfile} />;
      case "gamer_gallery":
        return <GamerGallerySection isOwner={isOwnProfile} />;
      case "franchise_badges":
        return <FranchiseBadgesSection games={activeLibrary} isOwner={isOwnProfile} />;
      case "activity_heatmap":
        return <ActivityHeatmapSection games={activeLibrary} />;
      case "favorite_characters":
        return <FavoriteCharactersSection isOwner={isOwnProfile} />;
      case "setup_showcase":
        return <SetupShowcaseSection isOwner={isOwnProfile} />;
      case "most_anticipated":
        return (
          <MostAnticipatedSection
            games={activeUser.mostAnticipatedGames}
            isOwner={isOwnProfile}
            onSaveGames={async (updatedGames) => {
              if (isOwnProfile) {
                await updateUserProfile?.({ mostAnticipatedGames: updatedGames });
              }
            }}
          />
        );
      case "guestbook":
        return (
          <ProfileGuestbookSection
            entries={activeUser.guestbookEntries}
            config={activeUser.guestbookConfig}
            isOwner={isOwnProfile}
            currentViewer={
              authUser
                ? {
                    uid: authUser.uid,
                    username: authUser.username,
                    displayName: authUser.displayName,
                    photoURL: authUser.photoURL,
                  }
                : null
            }
            onPostMessage={async (entryData) => {
              const currentEntries = activeUser.guestbookEntries || [];
              const isAutoApproved = !activeUser.guestbookConfig?.requireApproval || isOwnProfile;
              const newEntry = {
                id: "gb_" + Date.now(),
                ...entryData,
                createdAt: new Date().toISOString(),
                approved: isAutoApproved,
              };
              if (isOwnProfile) {
                await updateUserProfile?.({ guestbookEntries: [newEntry, ...currentEntries] });
              }
            }}
            onApproveMessage={async (entryId) => {
              if (isOwnProfile) {
                const currentEntries = activeUser.guestbookEntries || [];
                const updated = currentEntries.map((e) => (e.id === entryId ? { ...e, approved: true } : e));
                await updateUserProfile?.({ guestbookEntries: updated });
              }
            }}
            onDeleteMessage={async (entryId) => {
              if (isOwnProfile) {
                const currentEntries = activeUser.guestbookEntries || [];
                const updated = currentEntries.filter((e) => e.id !== entryId);
                await updateUserProfile?.({ guestbookEntries: updated });
              }
            }}
          />
        );
      case "showcase":
        return activeUser.showcaseGameId ? (
          <ShowcaseGameCard game={activeLibrary.find((g) => g.gameId === activeUser.showcaseGameId)} />
        ) : null;
      default:
        return null;
    }
  }, [activeUser, activeLibrary, activeStats, isOwnProfile, router, authUser, updateUserProfile]);

  if (authLoading || (authUser && !isViewingPublic && libraryLoading) || (isViewingPublic && publicLoading)) {
    return <div className="space-y-4 animate-pulse"><div className="h-44 rounded-3xl bg-[#141822]" /><div className="h-64 rounded-3xl bg-[#141822]" /></div>;
  }

  if (isViewingPublic && publicData?.isPrivate) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 rounded-3xl border border-amber-500/30 bg-[#141822] text-center space-y-4 shadow-xl">
        <UserAvatar photoURL={publicData.user?.photoURL} name={routeUsername} size="xl" className="mx-auto" />
        <h2 className="text-xl font-bold text-white">🔒 Perfil Privado</h2>
        <p className="text-xs text-gray-400">Este usuário optou por manter sua biblioteca privada.</p>
        <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs">Voltar ao Início</Link>
      </div>
    );
  }

  if (isViewingPublic && publicNotFound) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-white/10 bg-[#141822] text-center space-y-3">
        <Gamepad2 className="w-10 h-10 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Perfil não encontrado</h2>
        <p className="text-xs text-gray-400">O usuário @{routeUsername} não existe.</p>
        <Link href="/" className="inline-block px-5 py-2.5 rounded-xl bg-white text-black font-bold text-xs">Voltar ao Início</Link>
      </div>
    );
  }

  if (!activeUser) {
    return (
      <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-white/10 bg-[#141822] text-center space-y-3">
        <Gamepad2 className="w-10 h-10 text-cyan-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Acesse seu Perfil Gamer</h2>
        <button onClick={() => setIsAuthOpen(true)} className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs">Entrar ou Criar Conta</button>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div id="profile" className="profile profile-root space-y-4 pb-12">
      {/* Estilização Customizada Scoped do Usuário VIP/PRO */}
      {activeUser.customCss && (
        <style dangerouslySetInnerHTML={{ __html: scopeProfileCss(activeUser.customCss, "#profile") }} />
      )}

      {celebrationBanner && (
        <div className="rounded-2xl bg-emerald-950/80 border border-emerald-500/50 p-4 flex items-center justify-between text-xs text-emerald-200">
          <span>{celebrationBanner}</span>
          <button onClick={() => setCelebrationBanner(null)}><XCircle className="w-4 h-4" /></button>
        </div>
      )}

      {/* Hero Mobile-First */}
      <ProfileHeroMobile
        user={activeUser}
        stats={activeStats}
        isOwner={isOwnProfile}
        isAdmin={isAdmin}
        isPremium={isPremium}
        isFavorited={Boolean(authUser?.favoritedUserAlerts?.[activeUser.uid])}
        onToggleFavorite={async (isFav, favSettings) => {
          if (!authUser || isOwnProfile) return;
          const currentAlerts = authUser.favoritedUserAlerts || {};
          const updatedAlerts = { ...currentAlerts };
          if (isFav) {
            updatedAlerts[activeUser.uid] = favSettings;
          } else {
            delete updatedAlerts[activeUser.uid];
          }
          await updateUserProfile?.({ favoritedUserAlerts: updatedAlerts });
        }}
        onOpenEditProfile={() => router.push("/perfil/editar?tab=info")}
        onOpenEditBio={() => router.push("/perfil/editar?tab=markdown")}
        onOpenTools={() => setIsToolsOpen(true)}
        onOpenImporter={() => setIsImporterOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenManagePlan={() => setIsManagePlanOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenSectionsOrder={() => setIsSectionsModalOpen(true)}
      />

      {/* Container Principal: 2 Colunas no Desktop (Principal + Sidebar Lateral com Links e XP) */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Coluna Principal: Game Tracker HUD, Seções de Streaming, Bio, Showcase */}
        <div className="flex-1 w-full min-w-0">
          <ProfileModularContainer sections={sections} renderSection={renderSection} />
        </div>

        {/* Coluna Lateral no Desktop (Sidebar com Nível/XP, Insígnias e Links Úteis) */}
        <aside className="hidden lg:block w-80 shrink-0 sticky top-20 space-y-4" aria-label="Painel Lateral do Perfil">
          <ProfileDesktopSidebar
            user={activeUser}
            stats={activeStats}
            isOwner={isOwnProfile}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenRoulette={() => setIsRouletteOpen(true)}
          />
        </aside>
      </div>

      {/* Modais do Perfil */}
      <ProfileModalsContainer
        isOwnProfile={isOwnProfile}
        activeUser={activeUser}
        activeLibrary={activeLibrary}
        ownLibrary={ownLibrary}
        ownStats={ownStats}
        activeStats={activeStats}
        realGamerRank={null}
        isPremium={isPremium}
        isAdmin={isAdmin}
        levelUpData={levelUpData}
        dismissLevelUp={dismissLevelUp}
        isSectionsModalOpen={isSectionsModalOpen}
        setIsSectionsModalOpen={setIsSectionsModalOpen}
        activeTemplate={activeTemplate}
        sections={sections}
        customTemplate={customTemplate}
        applySections={applySections}
        isToolsOpen={isToolsOpen}
        setIsToolsOpen={setIsToolsOpen}
        isImporterOpen={isImporterOpen}
        setIsImporterOpen={setIsImporterOpen}
        isExportOpen={isExportOpen}
        setIsExportOpen={setIsExportOpen}
        isManagePlanOpen={isManagePlanOpen}
        setIsManagePlanOpen={setIsManagePlanOpen}
        selectedGameToEdit={selectedGameToEdit}
        setSelectedGameToEdit={setSelectedGameToEdit}
        isRouletteOpen={isRouletteOpen}
        setIsRouletteOpen={setIsRouletteOpen}
        isWrappedOpen={isWrappedOpen}
        setIsWrappedOpen={setIsWrappedOpen}
        isUpgradeOpen={isUpgradeOpen}
        setIsUpgradeOpen={setIsUpgradeOpen}
        isShareOpen={isShareOpen}
        setIsShareOpen={setIsShareOpen}
        isXpBreakdownOpen={isXpBreakdownOpen}
        setIsXpBreakdownOpen={setIsXpBreakdownOpen}
        isGamerCardOpen={isGamerCardOpen}
        setIsGamerCardOpen={setIsGamerCardOpen}
      />
    </div>
  );
}
