"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  ExternalLink,
  Sparkles,
  Trophy,
  Monitor,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { Game } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { isAdultGame, isLikelyEnglish } from "@/lib/gameUtils";
import { getGameUrl } from "@/lib/routes";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import { useBackNavigation } from "@/hooks/useBackNavigation";
import HltbCard from "@/components/HltbCard";
import GameModal from "@/components/GameModal";
import AdBanner from "@/components/ads/AdBanner";
import GameDetailLoading from "./[slug]/loading";

// Componentes Modulares de Jogo
import { GalleryMediaItem, isStoreWebsite, getFeaturedBackdropImage } from "@/components/game/gameDetailHelpers";
import GameAgeGate from "@/components/game/GameAgeGate";
import GameHeroMobile from "@/components/game/GameHeroMobile";
import GameHeroDesktop from "@/components/game/GameHeroDesktop";
import GameVaultCard from "@/components/game/GameVaultCard";
import GameSpecsTable from "@/components/game/GameSpecsTable";
import GameSynopsis from "@/components/game/GameSynopsis";
import GameStoreLinks from "@/components/game/GameStoreLinks";
import GameCategoriesHub from "@/components/game/GameCategoriesHub";
import GameDlcsSection from "@/components/game/GameDlcsSection";
import GameCommunityLinks from "@/components/game/GameCommunityLinks";
import GameSimilarSection from "@/components/game/GameSimilarSection";
import GameMediaGallery from "@/components/game/GameMediaGallery";

interface GameDetailClientProps {
  initialGame?: Game | null;
  id: string;
}

export default function GameDetailClient({ initialGame, id }: GameDetailClientProps) {
  const router = useRouter();
  const handleBack = useBackNavigation("/search");
  const { user } = useAuth();
  const { getGameInLibrary, addOrUpdateGame } = useGameLibrary();

  const [game, setGame] = useState<Game | null>(initialGame || null);
  const [loading, setLoading] = useState(!initialGame);
  const [isTranslating, setIsTranslating] = useState(false);
  const [mobileTab, setMobileTab] = useState<"overview" | "vault" | "details" | "media">("overview");
  const [isVaultExpanded, setIsVaultExpanded] = useState(true);
  const [bannerError, setBannerError] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalGame, setModalGame] = useState<any>(null);
  const [copiedToast, setCopiedToast] = useState(false);

  const userGame = game ? getGameInLibrary(game.id) : undefined;
  const isAdult = isAdultGame(game);

  // Auto-cura de tradução e carregamento sob demanda
  useEffect(() => {
    if (initialGame) {
      setGame(initialGame);
      setLoading(false);
      if (isLikelyEnglish(initialGame.description_raw)) {
        setIsTranslating(true);
        fetch(`/api/games/${id}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((freshGame: Game | null) => {
            if (freshGame && freshGame.description_raw && !isLikelyEnglish(freshGame.description_raw)) {
              setGame(freshGame);
            }
          })
          .catch(() => {})
          .finally(() => setIsTranslating(false));
      }
      return;
    }

    async function loadGame() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/games/${id}`);
        if (res.ok) {
          const data: Game = await res.json();
          setGame(data);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes do jogo:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGame();
  }, [id, initialGame]);

  const handleTranslateOnDemand = async () => {
    if (!id || isTranslating) return;
    setIsTranslating(true);
    try {
      const res = await fetch(`/api/games/${id}`);
      if (res.ok) {
        const data: Game = await res.json();
        setGame(data);
      }
    } catch (err) {
      console.warn("Erro ao traduzir sob demanda:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleShareGame = () => {
    triggerSelectionHaptic();
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title: game?.name,
        url: typeof window !== "undefined" ? window.location.href : "",
      }).catch(() => {});
    } else if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2000);
    }
  };

  const handleQuickWishlist = async () => {
    triggerSelectionHaptic();
    if (!user) {
      setIsModalOpen(true);
      return;
    }
    if (!game) return;

    try {
      if (userGame?.status === "backlog") {
        setIsModalOpen(true);
      } else {
        await addOrUpdateGame({
          gameId: game.id,
          gameTitle: game.name,
          gameCover: game.background_image,
          status: "backlog",
          userRating: userGame?.userRating ?? null,
          userPlaytimeHours: userGame?.userPlaytimeHours ?? null,
          platformPlayed: userGame?.platformPlayed ?? game.platforms?.[0]?.platform?.name ?? "",
        });
      }
    } catch (e) {
      console.error("Erro ao atualizar lista de desejos:", e);
    }
  };

  // Mídias, Lojas e DLCs Memoizados
  const storeWebsites = useMemo(
    () => (game?.websites || []).filter((w) => isStoreWebsite(w.url)),
    [game?.websites]
  );

  const communityWebsites = useMemo(() => {
    const raw = (game?.websites || []).filter((w) => !isStoreWebsite(w.url));
    const seen = new Set<string>();
    return raw.filter((w) => {
      const normalized = w.url.trim().toLowerCase().replace(/\/$/, "");
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    });
  }, [game?.websites]);

  const allMediaItems = useMemo<GalleryMediaItem[]>(() => {
    if (!game) return [];
    const items: GalleryMediaItem[] = [];
    if (game.artworks) {
      game.artworks.forEach((url, i) =>
        items.push({ url, type: "artwork", label: `Arte Oficial #${i + 1}`, id: `artwork-${i}` })
      );
    }
    if (game.screenshots) {
      game.screenshots.forEach((url, i) =>
        items.push({ url, type: "screenshot", label: `Captura de Tela #${i + 1}`, id: `screenshot-${i}` })
      );
    }
    return items;
  }, [game]);

  const uniqueDlcs = useMemo(() => {
    const rawDlcs = [...(game?.dlcs || []), ...(game?.expansions || [])];
    const seen = new Set<number>();
    return rawDlcs.filter((d) => {
      if (seen.has(d.id)) return false;
      seen.add(d.id);
      return true;
    });
  }, [game?.dlcs, game?.expansions]);

  const backdropImage = useMemo(() => getFeaturedBackdropImage(game), [game]);

  if (loading) return <GameDetailLoading />;

  if (!game) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Jogo não encontrado</h2>
        <p className="text-xs text-gray-400">Não conseguimos carregar as informações deste título.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>
      </div>
    );
  }

  return (
    <GameAgeGate isAdult={isAdult}>
      <div className="space-y-6 sm:space-y-8 pb-16 relative">
        {/* Breadcrumb & Ação Voltar (Desktop) */}
        <div className="hidden lg:flex items-center justify-between mb-2 relative z-20">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300 hover:text-emerald-400 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
            title="Voltar para a tela anterior ou catálogo de jogos"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para Navegação</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
            <span>ID #{game.id}</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">MGL Vault</span>
          </div>
        </div>

        {/* Banner Informativo se o título for DLC Oficial */}
        {game.parent_game && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-fadeIn relative z-20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] text-amber-300/80 font-bold uppercase tracking-wider">
                  Conteúdo Adicional / Expansão Oficial
                </p>
                <h4 className="text-sm font-bold text-white">
                  Este título é uma DLC/Expansão oficial de{" "}
                  <Link href={getGameUrl(game.parent_game)} className="text-amber-400 hover:underline font-extrabold">
                    {game.parent_game.name}
                  </Link>
                </h4>
              </div>
            </div>
            <Link
              href={getGameUrl(game.parent_game)}
              className="px-4 py-2 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-end sm:self-auto flex-shrink-0 min-h-[40px]"
            >
              <span>Ver Jogo Base</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Hero Mobile */}
        <GameHeroMobile
          game={game}
          backdropImage={backdropImage}
          bannerError={bannerError}
          onBannerError={() => setBannerError(true)}
          posterError={posterError}
          onPosterError={() => setPosterError(true)}
          isAdult={isAdult}
          userGame={userGame}
          onBack={handleBack}
          onShare={handleShareGame}
          onQuickWishlist={handleQuickWishlist}
          onOpenModal={() => setIsModalOpen(true)}
        />

        {/* Hero Desktop (Spotlight Card Unificado) */}
        <GameHeroDesktop
          game={game}
          backdropImage={backdropImage}
          posterError={posterError}
          onPosterError={() => setPosterError(true)}
          isAdult={isAdult}
          userGame={userGame}
          storeWebsites={storeWebsites}
          onOpenModal={() => setIsModalOpen(true)}
          onQuickWishlist={handleQuickWishlist}
          onShare={handleShareGame}
        />

        {/* Barra de Abas Segmentadas para Dispositivos Móveis */}
        <div className="lg:hidden sticky top-16 z-30 -mx-3.5 sm:-mx-6 px-3.5 sm:px-6 py-2 bg-[#0b0d12]/95 backdrop-blur-2xl border-y border-white/10 shadow-xl">
          <div className="flex items-center justify-between gap-1 p-1 bg-white/5 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                setMobileTab("overview");
              }}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1 rounded-xl text-[11px] font-bold transition-all min-h-[44px] ${
                mobileTab === "overview"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/25 font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Visão Geral</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                setMobileTab("vault");
              }}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1 rounded-xl text-[11px] font-bold transition-all min-h-[44px] relative ${
                mobileTab === "vault"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/25 font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Meu Vault</span>
              {userGame && <span className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#0b0d12]" />}
            </button>

            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                setMobileTab("details");
              }}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1 rounded-xl text-[11px] font-bold transition-all min-h-[44px] ${
                mobileTab === "details"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/25 font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Ficha</span>
            </button>

            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                setMobileTab("media");
              }}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 py-2.5 px-1 rounded-xl text-[11px] font-bold transition-all min-h-[44px] ${
                mobileTab === "media"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/25 font-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Mídia &amp; DLCs</span>
            </button>
          </div>
        </div>

        {/* Conteúdo Mobile Organizado por Abas */}
        <div className="block lg:hidden space-y-6">
          {mobileTab === "overview" && (
            <div className="space-y-6 animate-fadeIn">
              <GameSynopsis
                descriptionRaw={game.description_raw}
                storyline={game.storyline}
                isMobile={true}
                isTranslating={isTranslating}
                onTranslateOnDemand={handleTranslateOnDemand}
              />
              <GameVaultCard
                game={game}
                userGame={userGame}
                isVaultExpanded={isVaultExpanded}
                onToggleExpanded={() => {
                  triggerSelectionHaptic();
                  setIsVaultExpanded(!isVaultExpanded);
                }}
                onOpenModal={() => setIsModalOpen(true)}
              />
              <HltbCard hltb={game.hltb} userPlaytimeHours={userGame?.userPlaytimeHours} />
              <GameStoreLinks gameName={game.name} storeWebsites={storeWebsites} />
              <GameCategoriesHub genres={game.genres} themes={game.themes} />
            </div>
          )}

          {mobileTab === "vault" && (
            <div className="space-y-6 animate-fadeIn">
              <GameVaultCard
                game={game}
                userGame={userGame}
                isVaultExpanded={true}
                onToggleExpanded={() => {}}
                onOpenModal={() => setIsModalOpen(true)}
              />
            </div>
          )}

          {mobileTab === "details" && (
            <div className="space-y-6 animate-fadeIn">
              <GameSpecsTable game={game} isAdult={isAdult} />
              <GameCommunityLinks communityWebsites={communityWebsites} />
            </div>
          )}

          {mobileTab === "media" && (
            <div className="space-y-6 animate-fadeIn">
              <GameMediaGallery game={game} allMediaItems={allMediaItems} />
              <GameDlcsSection
                game={game}
                uniqueDlcs={uniqueDlcs}
                userGame={userGame}
                onOpenModal={() => setIsModalOpen(true)}
              />
              <GameSimilarSection
                game={game}
                onSelectGameToSave={(g) => {
                  setModalGame(g);
                  setIsModalOpen(true);
                }}
              />
            </div>
          )}

          <AdBanner slot="GAME_DETAIL_IN_CONTENT" />
        </div>

        {/* Layout Desktop em 2 Colunas */}
        <div className="hidden lg:grid grid-cols-12 gap-8 items-start">
          {/* Coluna Principal (8 colunas) */}
          <div className="col-span-8 space-y-8">
            <GameSynopsis
              descriptionRaw={game.description_raw}
              storyline={game.storyline}
              isMobile={false}
              isTranslating={isTranslating}
              onTranslateOnDemand={handleTranslateOnDemand}
            />
            <HltbCard hltb={game.hltb} userPlaytimeHours={userGame?.userPlaytimeHours} />
            <GameMediaGallery game={game} allMediaItems={allMediaItems} />
            <GameDlcsSection
              game={game}
              uniqueDlcs={uniqueDlcs}
              userGame={userGame}
              onOpenModal={() => setIsModalOpen(true)}
            />
            <AdBanner slot="GAME_DETAIL_IN_CONTENT" />
          </div>

          {/* Barra Lateral Desktop (4 colunas) */}
          <div className="col-span-4 space-y-6 sticky top-20">
            <GameVaultCard
              game={game}
              userGame={userGame}
              isVaultExpanded={isVaultExpanded}
              onToggleExpanded={() => {
                triggerSelectionHaptic();
                setIsVaultExpanded(!isVaultExpanded);
              }}
              onOpenModal={() => setIsModalOpen(true)}
            />
            <GameStoreLinks gameName={game.name} storeWebsites={storeWebsites} />
            <GameSpecsTable game={game} isAdult={isAdult} />
            <GameCommunityLinks communityWebsites={communityWebsites} />
          </div>
        </div>

        {/* Títulos Semelhantes Desktop em Largura Total */}
        <div className="hidden lg:block space-y-8">
          <GameSimilarSection
            game={game}
            onSelectGameToSave={(g) => {
              setModalGame(g);
              setIsModalOpen(true);
            }}
          />
        </div>

        {/* Modal de Registro / Atualização */}
        <GameModal
          game={modalGame || game}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setModalGame(null);
          }}
        />

        {/* Toast flutuante de link copiado */}
        {copiedToast && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black font-black text-xs px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
            <CheckCircle2 className="w-4 h-4" />
            <span>Link copiado para a área de transferência!</span>
          </div>
        )}
      </div>
    </GameAgeGate>
  );
}
