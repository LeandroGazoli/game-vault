"use client";

import React, { useState, useEffect, useMemo } from "react";
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

// Carregamento dinâmico e seguro do Three.js para o Hero (sem SSR)
const HeroArcade3D = dynamic(() => import("@/components/3d/HeroArcade3D"), {
  ssr: false,
  loading: () => null,
});

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
  
  const [topTenGames, setTopTenGames] = useState<Game[]>([]);
  const [releases, setReleases] = useState<Game[]>([]);
  const [upcoming, setUpcoming] = useState<Game[]>([]);
  const [ptbrGames, setPtbrGames] = useState<Game[]>([]);
  const [shortGames, setShortGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados dos modais interativos
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);

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
    <div className="space-y-12 pb-12">
      {/* ==========================================
          1. HERO SECTION COM BUSCA E ATALHOS TÁTEIS + THREE.JS 3D
      ========================================== */}
      <section className="relative z-30 rounded-2xl border border-[#242a36] bg-[#11141a] p-4 sm:p-10 text-left shadow-xl w-full overflow-hidden">
        <div className="relative z-10 w-full">
          {/* Grid Principal do Hero: Conteúdo à Esquerda + Cartucho 3D Interativo à Direita */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            <div className="lg:col-span-8 xl:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#161a22] border border-[#262c38] text-neutral-300 text-xs font-mono font-medium mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>ACERVO GAMER // IGDB • METACRITIC • HOWLONGTOBEAT</span>
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.1] font-display break-words">
                Descubra, Registre e Acompanhe <br className="hidden sm:inline" />
                <span className="text-neutral-400">Seus Jogos Favoritos.</span>
              </h1>

              <p className="text-xs sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                Seu catálogo definitivo com <strong>jogos dublados em PT-BR</strong>, <strong>duração estimada para zerar</strong>, lançamentos ao vivo e estatísticas da comunidade.
              </p>

              {/* Ações do Hero: Botão de Busca Spotlight & Calendário */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => openSpotlightSearch()}
                  className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs sm:text-sm shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  <Search className="w-4 h-4 text-black" />
                  <span>Buscar no Acervo</span>
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-black/10 font-mono text-[10px] text-neutral-800">
                    ⌘K
                  </kbd>
                </button>

                <Link
                  href="/calendar"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#181c25] hover:bg-[#222735] border border-[#2b3342] hover:border-neutral-400 text-neutral-200 hover:text-white font-semibold text-xs sm:text-sm transition-all active:scale-95"
                >
                  <CalendarIcon className="w-4 h-4 text-[#00E5FF]" />
                  <span>Lançamentos 2026</span>
                </Link>
              </div>
            </div>

            {/* Elemento 3D Interativo Three.js (Lado Direito no Desktop) */}
            <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 items-center justify-center">
              <HeroArcade3D />
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          BARRA DE FILTROS POR PLATAFORMA & ROLETA (Mobile-First)
      ========================================== */}
      <div className="md:sticky md:top-20 z-20 py-2 sm:py-2.5 px-2.5 sm:px-4 rounded-2xl bg-[#0f1218]/95 border border-[#242a36] backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x flex-nowrap py-0.5">
          {/* Botão de Destaque: Roleta Gamer (Sempre visível de imediato no mobile) */}
          <button
            onClick={() => setIsRouletteOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/40 hover:border-amber-400 font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            title="Roleta Gamer: O que jogar hoje?"
          >
            <Dices className="w-3.5 h-3.5 text-amber-400" />
            <span>Roleta</span>
          </button>

          {/* Divisor vertical sutil */}
          <div className="h-4 w-px bg-white/10 shrink-0" />

          {/* Label de Plataformas (apenas no desktop para economizar espaço no mobile) */}
          <span className="hidden md:inline-flex items-center gap-1.5 text-[11px] text-neutral-400 uppercase tracking-wider font-mono font-bold shrink-0">
            <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> Plataformas:
          </span>

          {/* Pílulas de Plataforma com rolagem horizontal fluida */}
          {[
            { label: "Todos", href: "/search" },
            { label: "💻 PC", href: "/search?platform=PC" },
            { label: "🎮 PS5", href: "/search?platform=PlayStation%205" },
            { label: "🟢 Xbox", href: "/search?platform=Xbox%20Series" },
            { label: "🔴 Switch", href: "/search?platform=Nintendo%20Switch" },
            { label: "🕹️ Retrô", href: "/search?platform=Retro" },
            { label: "🇧🇷 Dublados", href: "/search?q=dublado" },
          ].map((p) => (
            <Link
              key={p.label}
              href={p.href}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 hover:border-white/20 transition-all font-medium text-xs whitespace-nowrap active:scale-95 shrink-0"
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

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
          7. SEÇÃO: EXPLORAR POR FRANQUIAS LENDÁRIAS
      ========================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
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
              className={`group relative rounded-2xl overflow-hidden border p-3 flex flex-col justify-end min-h-[160px] sm:min-h-[190px] shadow-lg transition-all hover:scale-[1.03] hover:shadow-2xl bg-gradient-to-b ${f.accent}`}
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
      <section className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-[#11141a] to-indigo-950/40 border border-cyan-500/20 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
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
