"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Cloud, Save } from "lucide-react";
import { UserGame } from "@/lib/types";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import ProfilePreviewCard from "./ProfilePreviewCard";
import IdentityAccordion from "./IdentityAccordion";
import VisualThemeAccordion from "./VisualThemeAccordion";
import BadgesAccordion from "./BadgesAccordion";
import CustomBioAccordion from "./CustomBioAccordion";
import ConnectedAccountsAccordion from "./ConnectedAccountsAccordion";
import ShowcaseGameAccordion from "./ShowcaseGameAccordion";
import PrivacyAccordion from "./PrivacyAccordion";

export interface ProfileSettingsHubProps {
  isPage?: boolean;
  initialTab?: string;
  onClose?: () => void;
  onOpenUpgrade?: () => void;
  games?: UserGame[];
}

export default function ProfileSettingsHub({
  isPage = false,
  initialTab,
  onClose,
  onOpenUpgrade,
  games = [],
}: ProfileSettingsHubProps) {
  const router = useRouter();
  const handleBack = () => (onClose ? onClose() : router.back());
  const settings = useProfileSettings(initialTab, onOpenUpgrade, onClose);

  useEffect(() => {
    if (settings.activeAccordion) {
      const el = document.getElementById(`accordion-${settings.activeAccordion}`);
      if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
    }
  }, [settings.activeAccordion]);

  return (
    <div className="min-h-screen bg-[#0b0d12] text-[#e2e2e9] selection:bg-[#10b981] selection:text-black">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-[#0b0d12]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="h-14 px-4 flex items-center justify-between max-w-md mx-auto">
          <button type="button" onClick={handleBack} className="flex items-center gap-1 text-gray-400 hover:text-white active:scale-95 transition-all py-1.5 pr-3 pl-1 -ml-1">
            <ArrowLeft className="w-5 h-5 text-[#4edea3]" />
            <span className="text-[15px] font-semibold tracking-tight">Cancelar</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-[15px] font-bold text-white tracking-tight">Hub de Edição</h1>
            <span className="text-[10px] text-[#4edea3] font-mono font-semibold uppercase tracking-wider">Variante 2 • Acordeão</span>
          </div>
          <button type="button" disabled={settings.isSaving} onClick={settings.handleSave} className="px-3.5 py-1.5 rounded-full bg-[#10b981] hover:bg-emerald-400 text-black text-[13px] font-bold shadow-md active:scale-95 transition-all disabled:opacity-50">
            {settings.isSaving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full pt-20 pb-32 px-3.5 flex flex-col gap-3 max-w-md mx-auto">
        <ProfilePreviewCard
          bannerURL={settings.customBannerUrl || settings.bannerURL}
          photoURL={settings.photoURL}
          displayName={settings.displayName}
          username={settings.user?.username || "jogador"}
          equippedTitles={settings.equippedTitles}
          layout={settings.layout}
        />

        <div className="flex items-center justify-between px-1 text-xs text-gray-400 pt-1">
          <span className="font-bold text-[11px] uppercase tracking-wider text-gray-400">Gavetas de Configuração</span>
          <span className="font-mono text-[11px] text-[#4edea3]">7 Seções Disponíveis</span>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <div id="accordion-1">
            <IdentityAccordion
              isOpen={settings.activeAccordion === 1}
              onToggle={() => settings.toggleAccordion(1)}
              displayName={settings.displayName}
              setDisplayName={settings.setDisplayName}
              username={settings.user?.username || "jogador"}
              photoURL={settings.photoURL}
              setPhotoURL={settings.setPhotoURL}
              bio={settings.bio}
              setBio={settings.setBio}
              birthDate={settings.birthDate}
              setBirthDate={settings.setBirthDate}
              showAge={settings.showAge}
              setShowAge={settings.setShowAge}
              randomAvatar={settings.randomAvatar}
              suggestBio={settings.suggestBio}
              copyHandle={settings.copyHandle}
            />
          </div>

          <div id="accordion-2">
            <VisualThemeAccordion
              isOpen={settings.activeAccordion === 2}
              onToggle={() => settings.toggleAccordion(2)}
              bannerURL={settings.bannerURL}
              setBannerURL={settings.setBannerURL}
              customBannerUrl={settings.customBannerUrl}
              setCustomBannerUrl={settings.setCustomBannerUrl}
              theme={settings.theme}
              setTheme={settings.setTheme}
              layout={settings.layout}
              setLayout={settings.setLayout}
              customBgConfig={settings.customBgConfig}
              setCustomBgConfig={settings.setCustomBgConfig}
              isPremium={settings.isPremium}
              onOpenUpgrade={onOpenUpgrade}
            />
          </div>

          <div id="accordion-3">
            <BadgesAccordion
              isOpen={settings.activeAccordion === 3}
              onToggle={() => settings.toggleAccordion(3)}
              equippedTitles={settings.equippedTitles}
              moveEquippedTitle={settings.moveEquippedTitle}
              unequipTitle={settings.unequipTitle}
              toggleEquipTitle={settings.toggleEquipTitle}
              createdTitles={settings.createdTitles}
              newTitleInput={settings.newTitleInput}
              setNewTitleInput={settings.setNewTitleInput}
              newTitleEmoji={settings.newTitleEmoji}
              setNewTitleEmoji={settings.setNewTitleEmoji}
              handleCreateCustomTitle={settings.handleCreateCustomTitle}
              isPremium={settings.isPremium}
            />
          </div>

          <div id="accordion-4">
            <CustomBioAccordion
              isOpen={settings.activeAccordion === 4}
              onToggle={() => settings.toggleAccordion(4)}
              markdownContent={settings.markdownContent}
              setMarkdownContent={settings.setMarkdownContent}
              bioTab={settings.bioTab}
              setBioTab={settings.setBioTab}
              bioMode={settings.bioMode}
              setBioMode={settings.setBioMode}
            />
          </div>

          <div id="accordion-5">
            <ConnectedAccountsAccordion
              isOpen={settings.activeAccordion === 5}
              onToggle={() => settings.toggleAccordion(5)}
              socials={settings.socials}
              setSocials={settings.setSocials}
            />
          </div>

          <div id="accordion-6">
            <ShowcaseGameAccordion
              isOpen={settings.activeAccordion === 6}
              onToggle={() => settings.toggleAccordion(6)}
              showcaseGameId={settings.showcaseGameId}
              setShowcaseGameId={settings.setShowcaseGameId}
              games={games}
            />
          </div>

          <div id="accordion-7">
            <PrivacyAccordion
              isOpen={settings.activeAccordion === 7}
              onToggle={() => settings.toggleAccordion(7)}
              visibility={settings.visibility}
              setVisibility={settings.setVisibility}
            />
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 py-3 text-gray-500 font-mono text-[11px]">
          <Cloud className="w-4 h-4 text-[#4edea3]" />
          <span>Sincronizado na Nuvem MGL Vault</span>
        </div>
      </main>

      {/* Floating Toast */}
      {settings.toastMessage && (
        <div className="fixed top-16 inset-x-4 z-50 flex justify-center pointer-events-none animate-fadeIn">
          <div className="bg-[#10b981] text-black px-4 py-2 rounded-xl font-bold text-xs shadow-2xl flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>{settings.toastMessage}</span>
          </div>
        </div>
      )}

      {/* Sticky Save Bar */}
      <aside className="fixed bottom-0 w-full z-40 pb-safe bg-[#0b0d12]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.8)]">
        <div className="p-3.5 flex items-center justify-center max-w-md mx-auto w-full gap-2.5">
          <button type="button" onClick={handleBack} className="px-4 h-12 rounded-xl bg-[#1a2130] hover:bg-[#1e2433] text-gray-300 hover:text-white text-xs font-semibold border border-white/10 active:scale-95 transition-all">
            Descartar
          </button>
          <button type="button" disabled={settings.isSaving} onClick={settings.handleSave} className="flex-1 h-12 rounded-xl bg-[#10b981] hover:bg-emerald-400 text-black text-sm font-bold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all disabled:opacity-50">
            <Save className="w-5 h-5" />
            <span>{settings.isSaving ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
