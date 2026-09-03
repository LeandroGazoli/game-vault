"use client";

import React, { useState, useEffect, useRef } from "react";
import { Game, GameStatus } from "@/lib/types";
import GameModal from "./GameModal";
import AdBanner from "./ads/AdBanner";
import MetacriticBadge from "./MetacriticBadge";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import {
  Trophy,
  Flame,
  Star,
  Sparkles,
  Languages,
  Gamepad2,
  Clock,
  Check,
  Plus,
  MoreHorizontal,
  Play,
  Bookmark,
  XCircle,
  Trash2,
  Edit3,
  BarChart3,
  Layers,
} from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import { formatGameDuration, formatGenreName } from "@/lib/gameUtils";

type RankingCategory = "popular" | "top_rated" | "hyped" | "ptbr" | "retro" | "short";
type RankingScope = 10 | 25 | 50 | 100;

interface CategoryConfig {
  id: RankingCategory;
  label: string;
  mobileLabel: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const CATEGORIES: CategoryConfig[] = [
  {
    id: "popular",
    label: "Mais Populares",
    mobileLabel: "Populares",
    icon: Flame,
    color: "text-orange-400",
    description: "Os títulos com maior volume de jogadores, discussões e avaliações globais",
  },
  {
    id: "top_rated",
    label: "Melhores da História (Metacritic)",
    mobileLabel: "Metacritic",
    icon: Star,
    color: "text-amber-400",
    description: "As maiores notas atribuídas pela crítica especializada em todos os tempos",
  },
  {
    id: "hyped",
    label: "Mais Desejados / Hype",
    mobileLabel: "Desejados",
    icon: Sparkles,
    color: "text-cyan-400",
    description: "Os lançamentos futuros mais aguardados e colocados nas listas de desejos",
  },
  {
    id: "ptbr",
    label: "Dublados em Português",
    mobileLabel: "Dublados",
    icon: Languages,
    color: "text-emerald-400",
    description: "Grandes jogos com localização e dublagem de áudio oficial em português do Brasil",
  },
  {
    id: "retro",
    label: "Clássicos Retrô",
    mobileLabel: "Retrô",
    icon: Gamepad2,
    color: "text-purple-400",
    description: "Obras-primas históricas lançadas antes de 2005 (PS1, PS2, N64, SNES e Arcade)",
  },
  {
    id: "short",
    label: "Obras-Primas Curtas (<10h)",
    mobileLabel: "Curtos",
    icon: Clock,
    color: "text-blue-400",
    description: "Experiências memoráveis para zerar em poucos dias segundo o HowLongToBeat",
  },
];

const SCOPES: { value: RankingScope; label: string }[] = [
  { value: 10, label: "Top 10" },
  { value: 25, label: "Top 25" },
  { value: 50, label: "Top 50" },
  { value: 100, label: "Top 100" },
];

export default function RankingsSection() {
  const { user } = useAuth();
  const { getGameInLibrary, addOrUpdateGame, deleteGame } = useGameLibrary();

  const [category, setCategory] = useState<RankingCategory>("popular");
  const [scope, setScope] = useState<RankingScope>(25);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de modais e menus
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  // Cache estável com useRef para evitar qualquer loop de re-render ou piscadeira
  const cacheRef = useRef<Record<string, Game[]>>({});
  const requestedRef = useRef<Set<string>>(new Set());

  // Fecha o menu de micro-ações ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-ranking-menu]")) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Carrega rankings sob demanda com cache inteligente
  useEffect(() => {
    const cacheKey = `${category}_${scope}`;

    if (cacheRef.current[cacheKey] && cacheRef.current[cacheKey].length >= scope) {
      setGames(cacheRef.current[cacheKey].slice(0, scope));
      setLoading(false);
      return;
    }

    const abortController = new AbortController();

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/games/rankings?category=${category}&limit=${scope}`, {
          signal: abortController.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const items = data.games || [];
          if (items.length > 0) {
            cacheRef.current[cacheKey] = items;
            setGames(items.slice(0, scope));
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Erro ao carregar ranking dedicado:", err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      abortController.abort();
    };
  }, [category, scope]);

  const activeCategoryConfig = CATEGORIES.find((c) => c.id === category) || CATEGORIES[0];
  const top3 = games.slice(0, 3);
  const restGames = games.slice(3, scope);

  // Ação rápida de status na biblioteca com 1 toque
  const handleSetStatus = async (e: React.MouseEvent, game: Game, status: GameStatus) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);

    if (!user) {
      setSelectedGame(game);
      return;
    }

    await addOrUpdateGame({
      gameId: game.id,
      gameSlug: game.slug || String(game.id),
      gameTitle: game.name,
      gameCover: game.background_image || "",
      status,
      platformsPlayed: game.platforms?.map((p) => p.platform?.name || "").filter(Boolean) || [],
      genres: game.genres?.map((g) => g.name) || [],
      metacritic: game.metacritic || null,
      hltbData: game.hltb || null,
    });
  };

  const handleRemoveGame = async (e: React.MouseEvent, gameId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenuId(null);
    await deleteGame(gameId);
  };

  return (
    <>
      <div className="space-y-8 pb-12">
        {/* ==========================================
            1. HERO INSTITUCIONAL DO RANKINGS
        ========================================== */}
        <div className="rounded-3xl border border-[#242a36] bg-[#11141a] p-5 sm:p-8 space-y-4 shadow-xl text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#161a22] border border-[#262c38] text-amber-300 text-xs font-mono font-medium">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>RANKINGS OFICIAIS // GAMEVAULT HALL DA FAMA</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Os Maiores Jogos de Todos os Tempos
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
              {activeCategoryConfig.description}. Filtre por notas do Metacritic, popularidade da comunidade, clássicos retrô e dublados oficiais.
            </p>
          </div>
        </div>

        {/* ==========================================
            2. CONTROLES SUPERIORES (MOBILE-FIRST)
        ========================================== */}
        <div className="space-y-3.5">
          {/* Fileira A: Tipos de Ranking (Carrossel Horizontal Tátil) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x flex-nowrap py-1 -mx-2 px-2 sm:mx-0 sm:px-0">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = category === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap active:scale-95 cursor-pointer shrink-0 border ${
                    isActive
                      ? "bg-[#1f2533] text-white border-cyan-500/50 shadow-md shadow-cyan-950/30"
                      : "bg-[#12151c] text-neutral-400 hover:text-white border-[#222834] hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? cat.color : "text-neutral-400"}`} />
                  <span className="sm:hidden">{cat.mobileLabel}</span>
                  <span className="hidden sm:inline">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Fileira B: Seletor de Escopo / Quantidade (Top 10, Top 25, Top 50, Top 100) */}
          <div className="flex items-center justify-between gap-3 pt-1 border-t border-[#242a36]/60">
            <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Exibindo escopo:</span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#12151c] p-1 rounded-xl border border-[#222834]">
              {SCOPES.map((sc) => {
                const isSelected = scope === sc.value;
                return (
                  <button
                    key={sc.value}
                    onClick={() => setScope(sc.value)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all active:scale-95 cursor-pointer ${
                      isSelected
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-[#00E5FF] border border-cyan-500/40 shadow-sm"
                        : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    {sc.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==========================================
            3. PÓDIO TOP 3 DESTACADO (OURO, PRATA, BRONZE)
        ========================================== */}
        {loading && games.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-[#12151c] border border-[#222834] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className={`space-y-6 transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            {top3.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {top3.map((game, index) => {
                  const rank = index + 1;
                  const userGame = getGameInLibrary(game.id);
                  const duration = formatGameDuration(game, userGame?.userPlaytimeHours);
                  const releaseYear = game.released ? game.released.substring(0, 4) : "";

                  const rankTheme =
                    rank === 1
                      ? {
                          border: "border-amber-500/40 hover:border-amber-400",
                          badgeBg: "bg-gradient-to-r from-amber-400 to-amber-500 text-black",
                          label: "CAMPEÃO // #1",
                          glow: "shadow-amber-500/10",
                        }
                      : rank === 2
                      ? {
                          border: "border-slate-400/40 hover:border-slate-300",
                          badgeBg: "bg-gradient-to-r from-slate-200 to-slate-400 text-black",
                          label: "VICE-CAMPEÃO // #2",
                          glow: "shadow-slate-400/10",
                        }
                      : {
                          border: "border-amber-800/40 hover:border-amber-700",
                          badgeBg: "bg-gradient-to-r from-amber-700 to-amber-800 text-white",
                          label: "3º LUGAR // #3",
                          glow: "shadow-amber-900/10",
                        };

                  return (
                    <div
                      key={game.id}
                      className={`group relative rounded-2xl bg-[#12151c] border ${rankTheme.border} p-4 flex gap-4 transition-all duration-200 hover:shadow-2xl ${rankTheme.glow}`}
                    >
                      {/* Pôster */}
                      <div className="relative w-24 sm:w-28 aspect-[3/4] rounded-xl overflow-hidden bg-neutral-950 flex-shrink-0 border border-white/10 shadow-md">
                        <Link href={getGameUrl(game)} className="block w-full h-full">
                          {game.background_image ? (
                            <img
                              src={game.background_image}
                              alt={game.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-neutral-600">
                              Sem Capa
                            </div>
                          )}
                        </Link>

                        {/* Selo do Pódio */}
                        <div
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md font-mono text-[10px] font-black shadow-md ${rankTheme.badgeBg}`}
                        >
                          #{rank}
                        </div>
                      </div>

                      {/* Informações */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-neutral-400 block mb-1">
                            {rankTheme.label}
                          </span>

                          <Link href={getGameUrl(game)} className="block">
                            <h3
                              className="font-bold text-sm sm:text-base text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2 leading-snug"
                              title={game.name}
                            >
                              {game.name}
                            </h3>
                          </Link>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-neutral-400 font-mono mt-1.5">
                            {releaseYear && <span>{releaseYear}</span>}
                            {game.genres && game.genres[0] && (
                              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300 font-bold uppercase text-[9px]">
                                {formatGenreName(game.genres[0].name)}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Metadados e Status */}
                        <div className="pt-2 border-t border-[#222834] flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] tabular-nums">
                            <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>{duration.text}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {game.metacritic && <MetacriticBadge score={game.metacritic} size="sm" />}

                            {/* Botão de Adicionar Rápido */}
                            <button
                              onClick={(e) => handleSetStatus(e, game, "backlog")}
                              className={`p-1.5 rounded-lg border transition-all ${
                                userGame
                                  ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                                  : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-400 hover:text-white"
                              }`}
                              title={userGame ? "Já salvo na sua biblioteca" : "Adicionar à lista"}
                            >
                              {userGame ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ==========================================
                4. LISTA COMPLETA DOS DEMAIS JOGOS (#4 a #100)
            ========================================== */}
            {restGames.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs text-neutral-400 font-mono px-3 py-1">
                  <span>POSIÇÃO &amp; JOGO</span>
                  <span>AVALIAÇÃO &amp; STATUS</span>
                </div>

                <div className="space-y-2">
                  {restGames.map((game, index) => {
                    const rank = index + 4;
                    const userGame = getGameInLibrary(game.id);
                    const duration = formatGameDuration(game, userGame?.userPlaytimeHours);
                    const releaseYear = game.released ? game.released.substring(0, 4) : "";
                    const isMenuOpen = activeMenuId === game.id;

                    return (
                      <div
                        key={game.id}
                        className="group flex items-center justify-between gap-3 p-2 sm:p-2.5 rounded-xl bg-[#12151c] hover:bg-[#181c25] border border-[#222834] hover:border-[#2f3849] transition-all"
                      >
                        {/* Lado Esquerdo: Rank + Capa + Título */}
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          {/* Posição */}
                          <div className="w-7 sm:w-8 text-center font-mono font-black text-xs sm:text-sm text-neutral-400 shrink-0">
                            #{rank}
                          </div>

                          {/* Capa */}
                          <Link
                            href={getGameUrl(game)}
                            className="w-10 h-13 sm:w-11 sm:h-14 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shrink-0 block"
                          >
                            {game.background_image ? (
                              <img
                                src={game.background_image}
                                alt={game.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-600">
                                --
                              </div>
                            )}
                          </Link>

                          {/* Título & Detalhes */}
                          <div className="min-w-0 space-y-0.5">
                            <Link href={getGameUrl(game)} className="block">
                              <h4
                                className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00E5FF] transition-colors truncate max-w-[180px] sm:max-w-xs md:max-w-md"
                                title={game.name}
                              >
                                {game.name}
                              </h4>
                            </Link>

                            <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                              {releaseYear && <span>{releaseYear}</span>}
                              {game.genres && game.genres[0] && (
                                <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-neutral-300 font-bold uppercase text-[9px] hidden sm:inline">
                                  {formatGenreName(game.genres[0].name)}
                                </span>
                              )}
                              <span className="flex items-center gap-1 text-[10px]">
                                <Clock className="w-2.5 h-2.5 text-cyan-400" />
                                {duration.text}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Lado Direito: Metacritic + Micro-Ação */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 relative" data-ranking-menu>
                          {game.metacritic && <MetacriticBadge score={game.metacritic} size="sm" />}

                          {/* Botão de 3 Pontos (Micro-ações) */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setActiveMenuId((prev) => (prev === game.id ? null : game.id));
                            }}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              userGame
                                ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                                : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-400 hover:text-white"
                            }`}
                            title="Opções da Biblioteca"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {/* Dropdown Flutuante de Micro-ações */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-[#141720]/95 backdrop-blur-xl border border-[#2b3445] p-1.5 shadow-2xl z-40 space-y-1 animate-scaleUp text-left font-sans">
                              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider px-2 py-0.5 block border-b border-white/5 font-bold">
                                Definir Status
                              </span>

                              <button
                                onClick={(e) => handleSetStatus(e, game, "completed")}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-xs text-neutral-200 transition-colors"
                              >
                                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Já Zerei</span>
                              </button>

                              <button
                                onClick={(e) => handleSetStatus(e, game, "playing")}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-xs text-neutral-200 transition-colors"
                              >
                                <Play className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Jogando Agora</span>
                              </button>

                              <button
                                onClick={(e) => handleSetStatus(e, game, "backlog")}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-xs text-neutral-200 transition-colors"
                              >
                                <Bookmark className="w-3.5 h-3.5 text-amber-400" />
                                <span>Quero Jogar</span>
                              </button>

                              <button
                                onClick={(e) => handleSetStatus(e, game, "dropped")}
                                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-xs text-rose-300 transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-400" />
                                <span>Abandonado</span>
                              </button>

                              <div className="pt-1 border-t border-white/5 space-y-1">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setActiveMenuId(null);
                                    setSelectedGame(game);
                                  }}
                                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/10 text-xs text-neutral-300 transition-colors"
                                >
                                  <Edit3 className="w-3.5 h-3.5 text-neutral-400" />
                                  <span>Detalhes / Notas...</span>
                                </button>

                                {userGame && (
                                  <button
                                    onClick={(e) => handleRemoveGame(e, game.id)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-rose-500/20 text-xs text-rose-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                                    <span>Remover da Lista</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Publicidade Institucional no Rodapé do Ranking */}
        <AdBanner slot="RANKINGS_BOTTOM" />
      </div>

      {/* Modal para configurar o jogo */}
      <GameModal
        game={selectedGame}
        isOpen={Boolean(selectedGame)}
        onClose={() => setSelectedGame(null)}
      />
    </>
  );
}
