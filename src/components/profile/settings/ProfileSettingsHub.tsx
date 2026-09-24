"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Cloud, Save, ChevronRight, Lock } from "lucide-react";
import { UserGame } from "@/lib/types";
import { useProfileSettings } from "@/hooks/useProfileSettings";
import AuthModal from "@/components/AuthModal";
import ProfilePreviewCard from "./ProfilePreviewCard";
import IdentityAccordion from "./IdentityAccordion";
import VisualThemeAccordion from "./VisualThemeAccordion";
import BadgesAccordion from "./BadgesAccordion";
import CustomBioAccordion from "./CustomBioAccordion";
import ConnectedAccountsAccordion from "./ConnectedAccountsAccordion";
import ShowcaseGameAccordion from "./ShowcaseGameAccordion";
import SetupAccordion from "./SetupAccordion";
import FavoriteCharactersAccordion from "./FavoriteCharactersAccordion";
import PrivacyAccordion from "./PrivacyAccordion";

export interface ProfileSettingsHubProps {
  isPage?: boolean;
  initialTab?: string;
  onClose?: () => void;
  onOpenUpgrade?: () => void;
  games?: UserGame[];
}

const DESKTOP_NAV_ITEMS = [
  { id: 1, label: "1. Dados do Perfil & Identidade" },
  { id: 2, label: "2. Capa, Cores & Temas Visuais" },
  { id: 3, label: "3. Insígnias & Prestígio" },
  { id: 4, label: "4. Bio Estilizada (HTML/MD)" },
  { id: 5, label: "5. Gamertags & Redes Conectadas" },
  { id: 6, label: "6. Vitrine do Jogo em Destaque" },
  { id: 7, label: "7. Setup Gamer & Hardware" },
  { id: 8, label: "8. Personagens Favoritos" },
  { id: 9, label: "9. Privacidade & Segurança" },
];

const EMPTY_USER_GAMES: UserGame[] = [];

export default function ProfileSettingsHub({
  isPage = false,
  initialTab,
  onClose,
  onOpenUpgrade,
  games = EMPTY_USER_GAMES,
}: ProfileSettingsHubProps) {
  const router = useRouter();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const handleBack = () => (onClose ? onClose() : router.back());
  const settings = useProfileSettings(initialTab, onOpenUpgrade, onClose);

  useEffect(() => {
    if (settings.activeAccordion) {
      const el = document.getElementById(`accordion-${settings.activeAccordion}`);
      if (el) {
        const timer = setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "nearest" }), 120);
        return () => clearTimeout(timer);
      }
    }
  }, [settings.activeAccordion]);

  if (settings.isLoading) {
    return (
      <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-gray-400">Carregando estúdio de identidade...</span>
      </div>
    );
  }

  if (!settings.isLoading && !settings.user) {
    return (
      <div className="min-h-screen bg-[#0b0d12] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-emerald-400">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold mb-1">Acesso Restrito ao Estúdio</h2>
        <p className="text-xs text-gray-400 max-w-sm mb-6">
          Você precisa estar conectado à sua conta para personalizar seu perfil, insígnias e temas visuais.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-gray-300"
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-lg shadow-emerald-500/20 active:scale-95 transition-transform"
          >
            Fazer Login
          </button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-[#e2e2e9] selection:bg-[#10b981] selection:text-black">
      {/* Top Header */}
      <header className="fixed top-0 w-full z-40 pt-safe bg-[#0b0d12]/90 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between max-w-6xl mx-auto">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 text-gray-400 hover:text-white active:scale-95 transition-[color,transform] py-1.5 pr-3 pl-1 -ml-1"
          >
            <ArrowLeft className="w-5 h-5 text-[#10b981]" />
            <span className="text-sm font-semibold tracking-tight">Voltar</span>
          </button>

          <div className="flex flex-col items-center">
            <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">Personalizar Perfil</h1>
            <span className="text-[10px] text-[#10b981] font-mono font-semibold uppercase tracking-wider">MGL Identity Studio</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={settings.isSaving}
              onClick={settings.handleSave}
              className="px-4 py-1.5 rounded-full bg-[#10b981] hover:bg-emerald-400 text-black text-xs sm:text-sm font-bold shadow-md active:scale-95 transition-[background-color,transform,opacity] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{settings.isSaving ? "Salvando..." : "Salvar"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content (Mobile: Single Column Stack | Desktop: 2-Column Split-Screen) */}
      <main className="w-full pt-20 pb-28 lg:pb-16 px-4 sm:px-6 max-w-6xl mx-auto flex flex-col lg:grid lg:grid-cols-[380px_1fr] lg:gap-8 lg:items-start">
        {/* Left Column: Live Preview Card (Sticky on Desktop) */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-20">
          <ProfilePreviewCard
            bannerURL={settings.customBannerUrl || settings.bannerURL}
            photoURL={settings.photoURL}
            displayName={settings.displayName}
            username={settings.user?.username || "jogador"}
            equippedTitles={settings.equippedTitles}
            layout={settings.layout}
            theme={settings.theme}
            customCss={settings.customCss}
          />

          {/* Desktop-only Quick Drawer Shortcuts & Action Card */}
          <div className="hidden lg:flex flex-col gap-2 p-4 rounded-3xl bg-[#141822] border border-white/10 shadow-lg">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Atalhos Rápidos
              </span>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold">
                9 Seções
              </span>
            </div>

            <div className="space-y-1 pt-1">
              {DESKTOP_NAV_ITEMS.map((item) => {
                const isActive = settings.activeAccordion === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => settings.toggleAccordion(item.id)}
                    className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-[background-color,border-color,color] ${
                      isActive
                        ? "bg-white/10 text-white font-bold border border-white/20 shadow-sm"
                        : "text-gray-400 hover:text-gray-200 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition-transform ${isActive ? "rotate-90 text-emerald-400" : "text-gray-500"}`} />
                  </button>
                );
              })}
            </div>

            {/* Desktop Action Buttons Inside Sidebar */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <button
                type="button"
                disabled={settings.isSaving}
                onClick={settings.handleSave}
                className="w-full py-2.5 px-4 rounded-xl bg-[#10b981] hover:bg-emerald-400 text-black text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-98 transition-[background-color,transform,opacity] disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{settings.isSaving ? "Salvando Alterações..." : "Salvar Perfil"}</span>
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full py-2 px-3 rounded-xl bg-[#1a2130] hover:bg-[#20293a] text-gray-400 hover:text-white text-xs font-semibold border border-white/5 transition-[background-color,color] text-center"
              >
                Descartar &amp; Voltar
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Accordions & Sections */}
        <div className="flex flex-col gap-3 w-full mt-4 lg:mt-0">
          <div className="flex items-center justify-between px-1 text-xs text-gray-400">
            <span className="font-bold text-[11px] uppercase tracking-wider text-gray-400">Gavetas de Edição</span>
            <span className="font-mono text-[11px] text-[#10b981]">Configurações Avançadas</span>
          </div>

          <div id="accordion-1">
            <IdentityAccordion
              isOpen={settings.activeAccordion === 1}
              onToggle={() => settings.toggleAccordion(1)}
              displayName={settings.displayName}
              setDisplayName={settings.setDisplayName}
              username={settings.username}
              setUsername={settings.setUsername}
              usernameChangeCount={settings.user?.usernameChangeCount || 0}
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
              customCss={settings.customCss}
              setCustomCss={settings.setCustomCss}
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
            <SetupAccordion
              isOpen={settings.activeAccordion === 7}
              onToggle={() => settings.toggleAccordion(7)}
              setup={settings.gamerSetup}
              setSetup={settings.setGamerSetup}
            />
          </div>

          <div id="accordion-8">
            <FavoriteCharactersAccordion
              isOpen={settings.activeAccordion === 8}
              onToggle={() => settings.toggleAccordion(8)}
              characters={settings.favoriteCharacters}
              setCharacters={settings.setFavoriteCharacters}
            />
          </div>

          <div id="accordion-9">
            <PrivacyAccordion
              isOpen={settings.activeAccordion === 9}
              onToggle={() => settings.toggleAccordion(9)}
              visibility={settings.visibility}
              setVisibility={settings.setVisibility}
            />
          </div>

          <div className="flex items-center justify-center gap-2 py-4 text-gray-500 font-mono text-[11px]">
            <Cloud className="w-4 h-4 text-[#10b981]" />
            <span>Sincronizado na Nuvem MGL Vault</span>
          </div>
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

      {/* Mobile Sticky Save Bar (Aparece apenas em Mobile < lg, evitando poluição no desktop) */}
      <aside className="lg:hidden fixed bottom-0 w-full z-40 pb-safe bg-[#0b0d12]/95 backdrop-blur-xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.8)]">
        <div className="p-3 flex items-center justify-center max-w-md mx-auto w-full gap-2.5">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 h-11 rounded-xl bg-[#1a2130] hover:bg-[#1e2433] text-gray-300 text-xs font-semibold border border-white/10 active:scale-95 transition-[background-color,transform]"
          >
            Descartar
          </button>
          <button
            type="button"
            disabled={settings.isSaving}
            onClick={settings.handleSave}
            className="flex-1 h-11 rounded-xl bg-[#10b981] hover:bg-emerald-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_0_24px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-[background-color,transform,opacity] disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{settings.isSaving ? "Salvando..." : "Salvar Alterações"}</span>
          </button>
        </div>
      </aside>
    </div>
  );
}
