"use client";

import React, { useState } from "react";
import { Game } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useHomeCatalog } from "@/hooks/useHomeCatalog";

import UnifiedRankingsSection from "@/components/UnifiedRankingsSection";
import GamerDashboardWidget from "@/components/GamerDashboardWidget";
import GameRouletteModal from "@/components/GameRouletteModal";
import GameModal from "@/components/GameModal";
import AdBanner from "@/components/ads/AdBanner";
import HomeCatalogRows from "@/components/home/HomeCatalogRows";

import HomeSearchHero from "@/components/HomeSearchHero";
import HomeConversionBanner from "@/components/HomeConversionBanner";
import AuthModal from "@/components/AuthModal";
import HomeHeroCarousel from "@/components/HomeHeroCarousel";
import CategoriesCarousel from "@/components/CategoriesCarousel";
import CollectionsSection from "@/components/CollectionsSection";
import HomeFeatureAnnouncementCard from "@/components/HomeFeatureAnnouncementCard";
import HomeEditorialSection from "@/components/home/HomeEditorialSection";
import HomeFranchisesSection from "@/components/home/HomeFranchisesSection";
import HomeCalendarBanner from "@/components/home/HomeCalendarBanner";
import IndieSpotlightBanner from "@/components/indies/IndieSpotlightBanner";
import HomeIndiesSection from "@/components/home/HomeIndiesSection";

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { library } = useGameLibrary();
  
  const {
    topTenGames,
    releases,
    upcoming,
    ptbrGames,
    shortGames,
    gtaGames,
    loading,
    settings,
    settingsLoaded,
    currentlyPlaying,
    playingGameObj,
    roulettePool,
  } = useHomeCatalog(library);

  // Estados dos modais interativos
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);

  return (
    <div className="space-y-8 pb-12">
      {/* ==========================================
          1. TOPO ESTILO GTA VI: SEARCH EM DESTAQUE COM BACKDROP OFICIAL
      ========================================== */}
      <HomeSearchHero
        onOpenRoulette={() => setIsRouletteOpen(true)}
      />

      {/* ==========================================
          CTA DE CONVERSÃO / CAPTURA DE LEADS (DESLOGADOS)
          Exibido em destaque para reduzir a taxa de rejeição de anúncios
      ========================================== */}
      {!user && !isAuthLoading && (
        <HomeConversionBanner
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      )}

      {/* ==========================================
          BANNER DE DESTAQUE INDIE NA HOME
      ========================================== */}
      <IndieSpotlightBanner location="home" className="mb-2" />

      {/* ==========================================
          2. CARROSSEL DESTAQUES WIDESCREEN 16:9
          — Banners cinematográficos (só renderiza quando confirmado ativado no painel admin)
      ========================================== */}
      {settingsLoaded && Boolean(settings?.heroCarousel?.enabled) && (
        <section className="hero-carousel-section">
          <HomeHeroCarousel
            items={settings?.heroCarousel?.items}
            fallbackGames={topTenGames}
            maxItems={settings?.heroCarousel?.maxItems ?? 5}
          />
        </section>
      )}

      {/* ==========================================
          PAINEL GAMER / "VOLTAR A JOGAR" DO USUÁRIO
      ========================================== */}
      {user && (
        <GamerDashboardWidget
          currentlyPlaying={currentlyPlaying}
          playingGameObj={playingGameObj}
          onOpenRoulette={() => setIsRouletteOpen(true)}
        />
      )}

      {/* ==========================================
          3. EXPLORE POR CATEGORIA (CARROSSEL VISUAL)
      ========================================== */}
      <CategoriesCarousel />

      {/* ==========================================
          CARD DE ANÚNCIO DE NOVO RECURSO
      ========================================== */}
      <HomeFeatureAnnouncementCard />


      {/* ==========================================
          PUBLICIDADE 1: LEADERBOARD SUPERIOR
      ========================================== */}
      <AdBanner slot="HOME_TOP_LEADERBOARD" />

      {/* ==========================================
          SEÇÃO EXCLUSIVA: JOGOS INDIES DA COMUNIDADE
      ========================================== */}
      <HomeIndiesSection />

      {/* ==========================================
          COLEÇÕES ESPECIAIS DO ACERVO
      ========================================== */}
      <CollectionsSection />

      {/* ==========================================
          2. RANKINGS OFICIAIS MYGAMELIST (UNIFICADO COM ABAS)
      ========================================== */}
      <UnifiedRankingsSection initialGames={topTenGames} />

      {/* ==========================================
          PUBLICIDADE 2: IN-FEED BANNER CENTRAL
      ========================================== */}
      <AdBanner slot="HOME_IN_FEED" />

      {/* ==========================================
          CATÁLOGO: POPULARES, GTA, LANÇAMENTOS, DUBLADOS, RÁPIDOS & EM BREVE
      ========================================== */}
      <HomeCatalogRows
        loading={loading}
        topTenGames={topTenGames}
        gtaGames={gtaGames}
        releases={releases}
        ptbrGames={ptbrGames}
        shortGames={shortGames}
        upcoming={upcoming}
      />

      {/* ==========================================
          7. SEÇÃO: EXPLORAR POR FRANQUIAS LENDÁRIAS
      ========================================== */}
      <HomeFranchisesSection />

      {/* ==========================================
          8. CENTRAL EDITORIAL: ARTIGOS & GUIAS (SEO & ADSENSE COMPLIANCE)
      ========================================== */}
      <HomeEditorialSection />

      {/* ==========================================
          9. BANNER DO CALENDÁRIO DE LANÇAMENTOS
      ========================================== */}
      <HomeCalendarBanner />

      {/* Modal da Roleta Gamer */}
      {isRouletteOpen && (
        <GameRouletteModal
          isOpen={isRouletteOpen}
          onClose={() => setIsRouletteOpen(false)}
          games={roulettePool}
        />
      )}

      {/* Modal de Registro/Edição rápida de Jogo */}
      {selectedGameForModal && (
        <GameModal
          game={selectedGameForModal}
          isOpen={Boolean(selectedGameForModal)}
          onClose={() => setSelectedGameForModal(null)}
        />
      )}

      {/* Modal de Cadastro / Login Social disparado por CTAs */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </div>
  );
}
