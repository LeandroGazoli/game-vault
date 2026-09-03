"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Game, UserGame } from "@/lib/types";
import TopTenImdbSection, { TopTenImdbSkeleton } from "@/components/TopTenImdbSection";
import CatalogRow, { CatalogRowSkeleton } from "@/components/CatalogRow";
import RankingsSection from "@/components/RankingsSection";
import LiveSearchInput from "@/components/LiveSearchInput";
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
          fetch("/api/games/search"),
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
      <section className="relative z-30 rounded-2xl border border-[#242a36] bg-[#11141a] p-5 sm:p-10 text-center sm:text-left shadow-xl w-full overflow-hidden">
        <div className="relative z-10 w-full">
          {/* Grid Principal do Hero: Conteúdo à Esquerda + Cartucho 3D Interativo à Direita */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
            <div className="lg:col-span-8 xl:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#161a22] border border-[#262c38] text-neutral-300 text-xs font-mono font-medium mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                <span>ACERVO GAMER // IGDB • METACRITIC • HOWLONGTOBEAT</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-[1.08] font-display">
                Descubra, Registre e Acompanhe <br className="hidden sm:inline" />
                <span className="text-neutral-400">Seus Jogos Favoritos.</span>
              </h1>

              <p className="text-xs sm:text-base text-neutral-300 max-w-2xl leading-relaxed">
                Seu catálogo definitivo com <strong>jogos dublados em PT-BR</strong>, <strong>duração estimada para zerar</strong>, lançamentos ao vivo e estatísticas da comunidade.
              </p>

              {/* Barra de Busca no Hero com Autocomplete ao Vivo */}
              <div className="pt-2 w-full max-w-xl">
                <LiveSearchInput
                  variant="hero"
                  placeholder="Busque por Elden Ring, GTA, God of War, Zelda..."
                />
              </div>
            </div>

            {/* Elemento 3D Interativo Three.js (Lado Direito no Desktop) */}
            <div className="hidden lg:flex lg:col-span-4 xl:col-span-4 items-center justify-center">
              <HeroArcade3D />
            </div>
          </div>

          {/* Atalhos Táteis por Plataforma & Roleta Gamer em Largura Total */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 w-full border-t border-[#242a36]/60 pt-5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-xs text-neutral-400 font-mono uppercase tracking-wider mr-1 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> Plataformas:
              </span>
              {[
                { label: "PC", query: "PC" },
                { label: "PlayStation 5", query: "PlayStation 5" },
                { label: "Xbox Series", query: "Xbox Series" },
                { label: "Nintendo Switch", query: "Nintendo Switch" },
                { label: "Retrô & Clássicos", query: "Retro" },
              ].map((p) => (
                <Link
                  key={p.label}
                  href={`/search?platform=${encodeURIComponent(p.query)}`}
                  className="text-xs px-3 py-1.5 rounded-lg bg-[#181c25] hover:bg-[#202532] text-neutral-200 hover:text-white border border-[#2a3140] hover:border-neutral-400 transition-all font-medium active:scale-95"
                >
                  {p.label}
                </Link>
              ))}
            </div>

            {/* Botão Interativo: Roleta Gamer com Visual Arcade */}
            <button
              onClick={() => setIsRouletteOpen(true)}
              className="inline-flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-lg bg-[#1a1e28] hover:bg-[#232936] text-amber-300 border border-amber-500/40 hover:border-amber-400 font-mono font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex-shrink-0"
              title="Gire a roleta e descubra um jogo surpresa para jogar hoje!"
            >
              <Dices className="w-3.5 h-3.5 text-pink-400" />
              ROLETA // O que jogar hoje?
            </button>
          </div>

          {/* Mini resumo do usuário se autenticado */}
          {user && (
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 sm:gap-6 text-xs text-neutral-400 border-t border-[#242a36] pt-5 font-mono w-full">
              <span className="text-neutral-200 font-sans">
                Jogador: <strong className="text-white font-mono">{user.displayName}</strong>
              </span>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                <span className="flex items-center gap-1.5 text-[#00E5FF]">
                  <Trophy className="w-3.5 h-3.5 text-[#00E5FF]" /> <strong className="text-white tabular-nums">{stats.completedCount}</strong> zerados
                </span>
                <span className="flex items-center gap-1.5 text-blue-400">
                  <Gamepad2 className="w-3.5 h-3.5 text-blue-400" /> <strong className="text-white tabular-nums">{stats.playingCount}</strong> jogando
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> <strong className="text-white tabular-nums">{stats.totalPlaytimeHours}h</strong> registradas
                </span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          CARD "CONTINUE SUA JORNADA" (Usuário Logado)
      ========================================== */}
      {user && currentlyPlaying && (
        <section className="relative overflow-hidden rounded-2xl border border-[#242a36] bg-[#12151c] p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {currentlyPlaying.gameCover ? (
                <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl overflow-hidden shadow-lg border border-[#2a3140] flex-shrink-0 bg-neutral-900">
                  <img
                    src={currentlyPlaying.gameCover}
                    alt={currentlyPlaying.gameTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-20 rounded-xl bg-neutral-900 border border-[#2a3140] flex items-center justify-center text-xs text-neutral-500">
                  Sem Capa
                </div>
              )}

              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider">
                  <Play className="w-3 h-3 fill-current text-cyan-400" />
                  EM ANDAMENTO
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                  {currentlyPlaying.gameTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-400 font-mono">
                  <span className="flex items-center gap-1 text-neutral-200">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <strong className="text-white tabular-nums">{currentlyPlaying.userPlaytimeHours || 0}h</strong> dedicadas
                  </span>
                  {currentlyPlaying.hltbData?.mainStory && (
                    <span className="text-neutral-400">
                      • Média HLTB: ~{currentlyPlaying.hltbData.mainStory}h
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Link
                href={`/game/${currentlyPlaying.gameId}`}
                className="px-4 py-2.5 rounded-lg bg-[#181c25] hover:bg-[#202532] border border-[#2a3140] text-xs font-semibold text-neutral-200 hover:text-white transition-all"
              >
                Ver Detalhes
              </Link>
              {playingGameObj && (
                <button
                  onClick={() => setSelectedGameForModal(playingGameObj)}
                  className="px-5 py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Trophy className="w-3.5 h-3.5" /> Atualizar Progresso
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ==========================================
          PUBLICIDADE 1: LEADERBOARD SUPERIOR
      ========================================== */}
      <AdBanner slot="HOME_TOP_LEADERBOARD" />

      {/* ==========================================
          2. TOP 10 NO GAMEVAULT (Estilo IMDb / Disney+)
      ========================================== */}
      {loading ? (
        <TopTenImdbSkeleton />
      ) : topTenGames.length > 0 ? (
        <TopTenImdbSection games={topTenGames} />
      ) : null}

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
          subtitle="Jogos recém-lançados disponíveis para jogar agora"
          icon={Flame}
          games={releases}
          actionHref="/calendar"
          actionText="Ver no Calendário →"
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
          games={ptbrGames}
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
          games={shortGames}
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
          games={upcoming}
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
          8. RANKINGS MGL (Populares, Avaliados, Desejados)
      ========================================== */}
      <RankingsSection />

      {/* ==========================================
          9. BANNER DO CALENDÁRIO DE LANÇAMENTOS
      ========================================== */}
      <section className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-surface-100 to-indigo-950/40 border border-cyan-500/20 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
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
          className="rounded-full bg-white hover:bg-gray-200 text-black font-bold px-8 py-3.5 text-sm transition-all shadow-xl hover:scale-105 flex-shrink-0"
        >
          Abrir Calendário de Lançamentos →
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
