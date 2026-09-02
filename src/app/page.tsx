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
          1. HERO SECTION COM BUSCA E ATALHOS
      ========================================== */}
      <section className="relative z-30 rounded-3xl border border-white/10 bg-gradient-to-b from-[#1c1d22] via-[#141518] to-surface-50 p-5 sm:p-12 text-center sm:text-left shadow-2xl">
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none -z-0">
          <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Catálogo Oficial IGDB • Metacritic • HowLongToBeat
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Descubra, Registre e Acompanhe <br className="hidden sm:inline" />
            <span className="gamer-gradient-text">Seus Jogos Favoritos.</span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-base text-gray-300 max-w-2xl leading-relaxed">
            Seu acervo gamer completo com <strong>jogos dublados em PT-BR</strong>, <strong>duração para zerar</strong>, lançamentos em tempo real e rankings da comunidade.
          </p>

          {/* Barra de Busca no Hero com Autocomplete ao Vivo */}
          <div className="mt-6 sm:mt-8 max-w-xl">
            <LiveSearchInput
              variant="hero"
              placeholder="Busque por Elden Ring, GTA, God of War, Zelda..."
            />
          </div>

          {/* Atalhos Rápidos por Plataforma & Roleta Gamer */}
          <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-xs text-gray-400 font-semibold mr-1 flex items-center gap-1">
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
                className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 hover:border-cyan-500/40 transition-all font-medium"
              >
                {p.label}
              </Link>
            ))}

            {/* Botão Interativo: Roleta Gamer */}
            <button
              onClick={() => setIsRouletteOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 hover:from-purple-600/50 hover:to-pink-600/50 text-pink-200 border border-pink-500/40 hover:border-pink-400 font-bold transition-all shadow-md shadow-pink-500/10 active:scale-95 cursor-pointer ml-auto sm:ml-2"
              title="Gire a roleta e descubra um jogo surpresa para jogar hoje!"
            >
              <Dices className="w-3.5 h-3.5 text-pink-400" />
              O que jogar hoje? (Roleta)
            </button>
          </div>

          {/* Mini resumo do usuário se autenticado */}
          {user && (
            <div className="mt-6 flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-4 text-xs text-gray-400 border-t border-white/10 pt-4">
              <span className="text-gray-300">
                Olá, <strong className="text-white">{user.displayName}</strong>!
              </span>
              <span className="flex items-center gap-1 text-[#00E5FF] bg-cyan-950/40 px-2.5 py-1 rounded-full border border-cyan-500/20">
                <Trophy className="w-3 h-3" /> {stats.completedCount} zerados
              </span>
              <span className="flex items-center gap-1 text-blue-400 bg-blue-950/40 px-2.5 py-1 rounded-full border border-blue-500/20">
                <Gamepad2 className="w-3 h-3" /> {stats.playingCount} jogando
              </span>
              <span className="flex items-center gap-1 text-amber-400 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-500/20">
                <Clock className="w-3 h-3" /> {stats.totalPlaytimeHours}h registradas
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          CARD "CONTINUE SUA JORNADA" (Usuário Logado)
      ========================================== */}
      {user && currentlyPlaying && (
        <section className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-[#18191c] to-indigo-950/40 p-5 sm:p-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4 w-full sm:w-auto">
              {currentlyPlaying.gameCover ? (
                <div className="w-14 h-20 sm:w-16 sm:h-24 rounded-xl overflow-hidden shadow-lg border border-white/10 flex-shrink-0 bg-neutral-900">
                  <img
                    src={currentlyPlaying.gameCover}
                    alt={currentlyPlaying.gameTitle}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-20 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-xs text-gray-500">
                  Sem Capa
                </div>
              )}

              <div className="space-y-1 min-w-0">
                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
                  <Play className="w-3 h-3 fill-current" /> Continue sua Jornada
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                  {currentlyPlaying.gameTitle}
                </h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 font-mono">
                  <span className="flex items-center gap-1 text-gray-300">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <strong>{currentlyPlaying.userPlaytimeHours || 0}h</strong> dedicadas
                  </span>
                  {currentlyPlaying.hltbData?.mainStory && (
                    <span className="text-gray-500">
                      • Média para zerar: ~{currentlyPlaying.hltbData.mainStory}h
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
              <Link
                href={`/game/${currentlyPlaying.gameId}`}
                className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all"
              >
                Ver Detalhes
              </Link>
              {playingGameObj && (
                <button
                  onClick={() => setSelectedGameForModal(playingGameObj)}
                  className="px-5 py-2.5 rounded-full bg-cyan-400 hover:bg-cyan-300 text-black text-xs font-bold transition-all shadow-lg shadow-cyan-400/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
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
