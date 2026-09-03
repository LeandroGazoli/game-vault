"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Game, UserGame } from "@/lib/types";
import UnifiedRankingsSection from "@/components/UnifiedRankingsSection";
import GamerDashboardWidget from "@/components/GamerDashboardWidget";
import CatalogRow, { CatalogRowSkeleton } from "@/components/CatalogRow";
import { openSpotlightSearch } from "@/components/SpotlightSearchModal";
import GameRouletteModal from "@/components/GameRouletteModal";
import GameModal from "@/components/GameModal";
import AdBanner from "@/components/ads/AdBanner";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import Link from "next/link";
import dynamic from "next/dynamic";
import { gsap, useGSAP } from "@/lib/gsap";
import {
  Flame,
  Trophy,
  Clock,
  Sparkles,
  Gamepad2,
  Calendar as CalendarIcon,
  Dices,
  Languages,
  Timer,
  Play,
  Layers,
  ChevronRight,
  ArrowRight,
  Search,
} from "lucide-react";

import HomeHero from "@/components/HomeHero";
import CategoriesCarousel from "@/components/CategoriesCarousel";
import CollectionsSection from "@/components/CollectionsSection";

const ParallaxCharactersSection = dynamic(
  () => import("@/components/3d/ParallaxCharactersSection"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-80 rounded-3xl bg-neutral-900/40 border border-white/10 animate-pulse flex items-center justify-center">
        <span className="text-xs text-neutral-500 font-mono">Carregando Universo 3D Parallax...</span>
      </div>
    ),
  }
);

// Franquias consagradas para a seção de exploração
const LEGENDARY_FRANCHISES = [
  {
    name: "The Witcher",
    desc: "A saga do Bruxo Geralt de Rivia",
    query: "The Witcher",
    accent: "from-amber-950/70 via-[#1c1410] to-[#121316] border-amber-500/30 text-amber-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/coaarl.jpg",
  },
  {
    name: "Resident Evil",
    desc: "O auge do Survival Horror",
    query: "Resident Evil",
    accent: "from-red-950/70 via-[#1a0f10] to-[#121316] border-red-500/30 text-red-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co6qg8.jpg",
  },
  {
    name: "God of War",
    desc: "A jornada mitológica de Kratos",
    query: "God of War",
    accent: "from-blue-950/70 via-[#0f141f] to-[#121316] border-blue-500/30 text-blue-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/cobkt6.jpg",
  },
  {
    name: "Zelda",
    desc: "Aventuras épicas por Hyrule",
    query: "Zelda",
    accent: "from-emerald-950/70 via-[#0f1a14] to-[#121316] border-emerald-500/30 text-emerald-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co5vmg.jpg",
  },
  {
    name: "Dark Souls & Soulslike",
    desc: "Desafio implacável e universos sombrios",
    query: "Dark Souls",
    accent: "from-purple-950/70 via-[#160f1c] to-[#121316] border-purple-500/30 text-purple-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1x77.jpg",
  },
  {
    name: "Grand Theft Auto",
    desc: "Ação definitiva em mundo aberto",
    query: "Grand Theft Auto",
    accent: "from-green-950/70 via-[#0f1a10] to-[#121316] border-green-500/30 text-green-300",
    cover: "https://images.igdb.com/igdb/image/upload/t_cover_big/co2lbd.jpg",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const { stats, library } = useGameLibrary();
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [topTenGames, setTopTenGames] = useState<Game[]>([]);
  const [releases, setReleases] = useState<Game[]>([]);
  const [upcoming, setUpcoming] = useState<Game[]>([]);
  const [ptbrGames, setPtbrGames] = useState<Game[]>([]);
  const [shortGames, setShortGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos modais interativos
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);

  // Animações acionadas pelo Scroll (ScrollTrigger)
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add({
      reduceMotion: "(prefers-reduced-motion: reduce)",
      allowMotion: "(prefers-reduced-motion: no-preference)",
    }, (context) => {
      const { reduceMotion } = context.conditions as { reduceMotion: boolean };

      if (reduceMotion) {
        gsap.set([".franchises-title", ".franchise-card", ".calendar-banner"], {
          autoAlpha: 1,
          y: 0,
        });
        return;
      }

      // Franquias Lendárias
      const franchiseTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".franchises-section",
          start: "top 85%",
          once: true,
        },
        defaults: { ease: "power2.out" },
      });

      franchiseTl
        .fromTo(".franchises-title", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5 })
        .fromTo(
          ".franchise-card",
          { autoAlpha: 0, y: 30, scale: 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.45 },
          "-=0.2"
        );

      // Banner do Calendário de Lançamentos
      gsap.fromTo(
        ".calendar-banner",
        { autoAlpha: 0, y: 35, scale: 0.97 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".calendar-banner",
            start: "top 88%",
            once: true,
          },
        }
      );
    });
  }, { scope: pageRef });

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [popRes, relRes, upRes, ptbrRes, shortRes] = await Promise.all([
          fetch("/api/games/rankings?category=popular&limit=10"),
          fetch("/api/games/releases"),
          fetch("/api/games/upcoming"),
          fetch("/api/games/curated?type=ptbr"),
          fetch("/api/games/curated?type=short"),
        ]);

        if (popRes.ok) {
          const data = await popRes.json();
          setTopTenGames(data.games || []);
        }

        if (relRes.ok) {
          const data = await relRes.json();
          setReleases(data.games || []);
        }

        if (upRes.ok) {
          const data = await upRes.json();
          setUpcoming(data.games || []);
        }

        if (ptbrRes.ok) {
          const data = await ptbrRes.json();
          setPtbrGames(data.games || []);
        }

        if (shortRes.ok) {
          const data = await shortRes.json();
          setShortGames(data.games || []);
        }
      } catch (err) {
        console.error("Erro ao carregar catálogo da home:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Jogo que o usuário está jogando atualmente (para o card de atalho)
  const currentlyPlaying = useMemo(() => {
    return library.find((g) => g.status === "playing");
  }, [library]);

  const playingGameObj: Game | null = useMemo(() => {
    if (!currentlyPlaying) return null;
    return {
      id: Number(currentlyPlaying.gameId),
      slug: currentlyPlaying.gameSlug,
      name: currentlyPlaying.gameTitle,
      background_image: currentlyPlaying.gameCover,
      metacritic: currentlyPlaying.metacritic,
      released: currentlyPlaying.releaseYear || null,
      genres: currentlyPlaying.genres?.map((name, i) => ({ id: i, name })) || [],
      platforms: [{ platform: { id: 1, name: currentlyPlaying.platformPlayed, slug: currentlyPlaying.platformPlayed.toLowerCase() } }],
      hltb: currentlyPlaying.hltbData || null,
    };
  }, [currentlyPlaying]);

  // Pool de jogos para a Roleta Gamer (usa a biblioteca do usuário se houver, ou populares da Home)
  const roulettePool: UserGame[] = useMemo(() => {
    if (library.length > 0) return library;
    return topTenGames.map((g) => ({
      gameId: g.id,
      gameSlug: g.slug,
      gameTitle: g.name,
      gameCover: g.background_image,
      status: "backlog" as const,
      userRating: null,
      userPlaytimeHours: null,
      userReview: "",
      platformPlayed: g.platforms?.[0]?.platform?.name || "PC",
      isFavorite: false,
      completedAt: null,
      startedAt: null,
      createdAt: "",
      updatedAt: "",
      metacritic: g.metacritic,
      hltbData: g.hltb,
    }));
  }, [library, topTenGames]);

  return (
    <div ref={pageRef} className="space-y-12 pb-12">
      {/* ==========================================
          1. HERO SECTION CINEMATOGRÁFICO & REFINADO
      ========================================== */}
      <HomeHero onOpenRoulette={() => setIsRouletteOpen(true)} />

      {/* ==========================================
          2. EXPLORE POR CATEGORIA (CARROSSEL VISUAL)
      ========================================== */}
      <CategoriesCarousel />

      {/* ==========================================
          PAINEL GAMER / WIDGET GAMIFICADO DO USUÁRIO
      ========================================== */}
      {user && (
        <GamerDashboardWidget
          currentlyPlaying={currentlyPlaying}
          playingGameObj={playingGameObj}
          onOpenRoulette={() => setIsRouletteOpen(true)}
        />
      )}

      {/* ==========================================
          PUBLICIDADE 1: LEADERBOARD SUPERIOR
      ========================================== */}
      <AdBanner slot="HOME_TOP_LEADERBOARD" />

      {/* ==========================================
          COLEÇÕES ESPECIAIS DO ACERVO
      ========================================== */}
      <CollectionsSection />

      {/* ==========================================
          2. RANKINGS OFICIAIS GAMEVAULT (UNIFICADO COM ABAS)
      ========================================== */}
      <UnifiedRankingsSection initialGames={topTenGames} />

      {/* ==========================================
          PUBLICIDADE 2: IN-FEED BANNER CENTRAL
      ========================================== */}
      <AdBanner slot="HOME_IN_FEED" />

      {/* ==========================================
          3. LANÇAMENTOS RECENTES (Últimos 60 Dias)
      ========================================== */}
      {loading ? (
        <CatalogRowSkeleton
          title="Lançamentos Recentes"
          subtitle="Jogos recém-lançados disponíveis para jogar agora"
          icon={Flame}
        />
      ) : releases.length > 0 ? (
        <CatalogRow
          title="Lançamentos Recentes"
          subtitle="Os 10 títulos recém-lançados mais relevantes para jogar agora"
          icon={Flame}
          games={releases.slice(0, 10)}
          actionHref="/calendar"
          actionText="Ver Calendário Completo →"
        />
      ) : null}

      {/* ==========================================
          4. 🇧🇷 DUBLADOS EM PORTUGUÊS (BRASIL)
      ========================================== */}
      {loading ? (
        <CatalogRowSkeleton
          title="Dublados em Português"
          subtitle="Títulos consagrados com dublagem oficial em português do Brasil"
          icon={Languages}
        />
      ) : ptbrGames.length > 0 ? (
        <CatalogRow
          title="🇧🇷 Dublados em Português"
          subtitle="Títulos consagrados com dublagem oficial em português do Brasil"
          icon={Languages}
          games={ptbrGames.slice(0, 10)}
          actionHref="/search?q=dublado"
          actionText="Explorar Catálogo →"
        />
      ) : null}

      {/* ==========================================
          5. ⏱️ ZERE NO FIM DE SEMANA (ATÉ 10 HORAS)
      ========================================== */}
      {loading ? (
        <CatalogRowSkeleton
          title="Zere no Fim de Semana"
          subtitle="Obras-primas curtas de até 10 horas para você zerar sem enrolação"
          icon={Timer}
        />
      ) : shortGames.length > 0 ? (
        <CatalogRow
          title="⏱️ Zere no Fim de Semana"
          subtitle="Obras-primas curtas de até 10 horas para você zerar sem enrolação"
          icon={Timer}
          games={shortGames.slice(0, 10)}
          actionHref="/search"
          actionText="Ver mais jogos →"
        />
      ) : null}

      {/* ==========================================
          6. EM BREVE (Próximos Lançamentos)
      ========================================== */}
      {loading ? (
        <CatalogRowSkeleton
          title="Em Breve nos Games"
          subtitle="Títulos aguardados que serão lançados nos próximos meses"
          icon={CalendarIcon}
        />
      ) : upcoming.length > 0 ? (
        <CatalogRow
          title="Em Breve nos Games"
          subtitle="Títulos aguardados que serão lançados nos próximos meses"
          icon={CalendarIcon}
          games={upcoming.slice(0, 10)}
          actionHref="/calendar"
          actionText="Calendário Completo →"
        />
      ) : null}

      {/* ==========================================
          UNIVERSO GAMER • IMERSÃO 3D PARALLAX (PERSONAGENS)
      ========================================== */}
      <ParallaxCharactersSection />

      {/* ==========================================
          7. SEÇÃO: EXPLORAR POR FRANQUIAS LENDÁRIAS
      ========================================== */}
      <section className="franchises-section space-y-4">
        <div className="franchises-title flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> Explorar por Franquias Lendárias
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Mergulhe na cronologia completa das maiores sagas da história dos games.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {LEGENDARY_FRANCHISES.map((f) => (
            <Link
              key={f.name}
              href={`/search?q=${encodeURIComponent(f.query)}`}
              className={`franchise-card group relative rounded-2xl overflow-hidden border p-3 flex flex-col justify-end min-h-[160px] sm:min-h-[190px] shadow-lg transition-all hover:scale-[1.03] hover:shadow-2xl bg-gradient-to-b ${f.accent}`}
            >
              {/* Imagem de Fundo Desfocada */}
              <div className="absolute inset-0 -z-0 overflow-hidden opacity-30 group-hover:opacity-40 transition-opacity">
                <img
                  src={f.cover}
                  alt={f.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 filter blur-[1px]"
                />
              </div>

              <div className="relative z-10 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400/90 block">
                  Saga Completa
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug group-hover:text-[#00E5FF] transition-colors line-clamp-1">
                  {f.name}
                </h3>
                <p className="text-[11px] text-gray-400 line-clamp-1 hidden sm:block">
                  {f.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* ==========================================
          9. BANNER DO CALENDÁRIO DE LANÇAMENTOS
      ========================================== */}
      <section className="calendar-banner rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#11141a] to-indigo-950/40 border border-cyan-500/20 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" /> Calendário Mensal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Nunca perca a estreia de um grande jogo.
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Acompanhe o dia a dia de lançamentos mês a mês, filtre por datas e adicione os títulos mais aguardados diretamente à sua lista de desejos.
          </p>
        </div>

        <Link
          href="/calendar"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-white hover:bg-neutral-200 text-black font-bold px-6 sm:px-8 py-3.5 text-xs sm:text-sm transition-all shadow-xl active:scale-95 flex-shrink-0"
        >
          <span className="whitespace-nowrap">Abrir Calendário de Lançamentos</span>
          <ArrowRight className="w-4 h-4 shrink-0 text-black" />
        </Link>
      </section>

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
    </div>
  );
}
