"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { UserGame, UserProfile } from "@/lib/types";
import { ProfileSectionConfig, ProfileTemplate, ProfileTemplateId } from "@/lib/types/profile.types";
import { GamerRankResult } from "@/lib/firebase";
import ProfileSectionsModal from "@/components/profile/ProfileSectionsModal";
import ProfileToolsModal from "@/components/ProfileToolsModal";
import GameImporterModal from "@/components/importer/GameImporterModal";
import ExportModal from "@/components/ExportModal";
import ManagePlanModal from "@/components/ManagePlanModal";
import GameModal from "@/components/GameModal";
import GameRouletteModal from "@/components/GameRouletteModal";
import GamerWrappedModal from "@/components/GamerWrappedModal";
import UpgradeModal from "@/components/UpgradeModal";
import ShareProfileModal from "@/components/ShareProfileModal";
import GamerXpBreakdownModal from "@/components/profile/GamerXpBreakdownModal";
import ShareGamerCardModal from "@/components/profile/ShareGamerCardModal";
import LevelUpCelebrationModal from "@/components/profile/LevelUpCelebrationModal";
import { triggerPwaInstall } from "@/components/PwaInstallPrompt";

export interface ProfileModalsContainerProps {
  isOwnProfile: boolean;
  activeUser: UserProfile;
  activeLibrary: UserGame[];
  ownLibrary: UserGame[];
  ownStats: any;
  activeStats: any;
  realGamerRank: GamerRankResult | null;
  isPremium: boolean;
  isAdmin: boolean;
  levelUpData: any;
  dismissLevelUp: () => void;
  // Modals visibility
  isSectionsModalOpen: boolean;
  setIsSectionsModalOpen: (open: boolean) => void;
  activeTemplate: ProfileTemplateId;
  sections: ProfileSectionConfig[];
  customTemplate?: ProfileTemplate | null;
  applySections: (newSections: ProfileSectionConfig[], templateId: ProfileTemplateId) => Promise<void>;
  isToolsOpen: boolean;
  setIsToolsOpen: (open: boolean) => void;
  isImporterOpen: boolean;
  setIsImporterOpen: (open: boolean) => void;
  isExportOpen: boolean;
  setIsExportOpen: (open: boolean) => void;
  isManagePlanOpen: boolean;
  setIsManagePlanOpen: (open: boolean) => void;
  selectedGameToEdit: any;
  setSelectedGameToEdit: (game: any) => void;
  isRouletteOpen: boolean;
  setIsRouletteOpen: (open: boolean) => void;
  isWrappedOpen: boolean;
  setIsWrappedOpen: (open: boolean) => void;
  isUpgradeOpen: boolean;
  setIsUpgradeOpen: (open: boolean) => void;
  isShareOpen: boolean;
  setIsShareOpen: (open: boolean) => void;
  isXpBreakdownOpen: boolean;
  setIsXpBreakdownOpen: (open: boolean) => void;
  isGamerCardOpen: boolean;
  setIsGamerCardOpen: (open: boolean) => void;
}

export default function ProfileModalsContainer({
  isOwnProfile,
  activeUser,
  activeLibrary,
  ownLibrary,
  ownStats,
  activeStats,
  realGamerRank,
  isPremium,
  isAdmin,
  levelUpData,
  dismissLevelUp,
  isSectionsModalOpen,
  setIsSectionsModalOpen,
  activeTemplate,
  sections,
  customTemplate,
  applySections,
  isToolsOpen,
  setIsToolsOpen,
  isImporterOpen,
  setIsImporterOpen,
  isExportOpen,
  setIsExportOpen,
  isManagePlanOpen,
  setIsManagePlanOpen,
  selectedGameToEdit,
  setSelectedGameToEdit,
  isRouletteOpen,
  setIsRouletteOpen,
  isWrappedOpen,
  setIsWrappedOpen,
  isUpgradeOpen,
  setIsUpgradeOpen,
  isShareOpen,
  setIsShareOpen,
  isXpBreakdownOpen,
  setIsXpBreakdownOpen,
  isGamerCardOpen,
  setIsGamerCardOpen,
}: ProfileModalsContainerProps) {
  const router = useRouter();

  return (
    <>
      {isOwnProfile && (
        <>
          <ProfileSectionsModal
            isOpen={isSectionsModalOpen}
            onClose={() => setIsSectionsModalOpen(false)}
            activeTemplateId={activeTemplate}
            sections={sections}
            customTemplate={customTemplate}
            isPremium={isPremium}
            onApplySections={applySections}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
          />
          <ProfileToolsModal
            isOpen={isToolsOpen}
            onClose={() => setIsToolsOpen(false)}
            user={activeUser}
            isPremium={isPremium}
            isAdmin={isAdmin}
            onOpenManagePlan={() => setIsManagePlanOpen(true)}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onOpenCustomizer={() => router.push("/perfil/editar?tab=info")}
            onOpenPrivacy={() => router.push("/perfil/editar?tab=visibility")}
            onOpenRoulette={() => setIsRouletteOpen(true)}
            onOpenWrapped={() => setIsWrappedOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenSteamInventory={() => {}}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenGamerCard={() => setIsGamerCardOpen(true)}
            onInstallPwa={triggerPwaInstall}
          />
          <GameImporterModal
            isOpen={isImporterOpen}
            onClose={() => setIsImporterOpen(false)}
            existingGames={ownLibrary}
          />
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            games={ownLibrary}
            username={activeUser.username || activeUser.uid}
          />
          <ManagePlanModal
            isOpen={isManagePlanOpen}
            onClose={() => setIsManagePlanOpen(false)}
            user={activeUser}
            onUpgrade={() => setIsUpgradeOpen(true)}
          />
          <GameModal
            game={selectedGameToEdit}
            isOpen={Boolean(selectedGameToEdit)}
            onClose={() => setSelectedGameToEdit(null)}
          />
          <GameRouletteModal
            isOpen={isRouletteOpen}
            onClose={() => setIsRouletteOpen(false)}
            games={ownLibrary}
          />
          <GamerWrappedModal
            isOpen={isWrappedOpen}
            onClose={() => setIsWrappedOpen(false)}
            games={ownLibrary}
            user={activeUser}
            stats={ownStats}
          />
          {levelUpData && (
            <LevelUpCelebrationModal
              isOpen={Boolean(levelUpData)}
              onClose={dismissLevelUp}
              newLevel={levelUpData.newLevel}
              oldLevel={levelUpData.oldLevel}
              rankTitle={levelUpData.rankTitle}
              onOpenGamerCard={() => {
                dismissLevelUp();
                setIsGamerCardOpen(true);
              }}
            />
          )}
        </>
      )}

      {!isPremium && (
        <UpgradeModal
          isOpen={isUpgradeOpen}
          onClose={() => setIsUpgradeOpen(false)}
        />
      )}

      <ShareProfileModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        username={activeUser.username}
        displayName={activeUser.displayName}
        onOpenGamerCard={() => setIsGamerCardOpen(true)}
      />

      <GamerXpBreakdownModal
        isOpen={isXpBreakdownOpen}
        onClose={() => setIsXpBreakdownOpen(false)}
        stats={activeStats}
        gamerLevel={activeUser.gamerLevel}
        realRank={realGamerRank?.formattedRank}
        plan={activeUser.plan}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      <ShareGamerCardModal
        isOpen={isGamerCardOpen}
        onClose={() => setIsGamerCardOpen(false)}
        user={activeUser}
        stats={activeStats}
        library={activeLibrary}
        realRank={realGamerRank?.formattedRank}
      />
    </>
  );
}
