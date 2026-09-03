"use client";

import React, { useState, useEffect, useRef } from "react";
import { Game, GameStatus } from "@/lib/types";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import {
  Trophy,
  Flame,
  Star,
  Sparkles,
  ChevronRight,
  Clock,
  Plus,
  Check,
  MoreHorizontal,
  Bookmark,
  Play,
  ArrowRight,
} from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import MetacriticBadge from "./MetacriticBadge";
import GameModal from "./GameModal";
import { formatGameDuration } from "@/lib/gameUtils";

type RankingTab = "popular" | "top_rated" | "hyped";

interface UnifiedRankingsSectionProps {
  initialGames?: Game[];
}

export default function UnifiedRankingsSection({ initialGames = [] }: UnifiedRankingsSectionProps) {
  const { user } = useAuth();
  const { getGameInLibrary, addOrUpdateGame } = useGameLibrary();
  const [activeTab, setActiveTab] = useState<RankingTab>("popular");
  const [games, setGames] = useState<Game[]>(initialGames);
  const [loading, setLoading] = useState(false);
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);

  // Cache seguro em memória por categoria usando ref para não causar loops no useEffect
  const cacheRef = useRef<Record<string, Game[]>>({
    popular: initialGames,
  });
  const requestedRef = useRef<Set<string>>(new Set());

  // Sincroniza initialGames quando chegam
  useEffect(() => {
    if (initialGames && initialGames.length > 0) {
      cacheRef.current["popular"] = initialGames;
      if (activeTab === "popular" && games.length === 0) {
        setGames(initialGames);
      }
    }
  }, [initialGames, activeTab, games.length]);

  useEffect(() => {
    if (cacheRef.current[activeTab] && cacheRef.current[activeTab].length > 0) {
      setGames(cacheRef.current[activeTab]);
      setLoading(false);
      return;
    }

    if (requestedRef.current.has(activeTab)) {
      return;
    }

    requestedRef.current.add(activeTab);
    const abortController = new AbortController();

    async function loadRankings() {
      setLoading(true);
      try {
        const res = await fetch(`/api/games/rankings?category=${activeTab}&limit=10`, {
          signal: abortController.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const items = data.games || [];
          if (items.length > 0) {
            cacheRef.current[activeTab] = items;
            setGames(items);
          }
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Erro ao carregar ranking:", err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRankings();

    return () => {
      abortController.abort();
    };
  }, [activeTab]);

  const top3 = games.slice(0, 3);
  const rest7 = games.slice(3, 10);

  const handleQuickAdd = async (e: React.MouseEvent, game: Game, status: GameStatus = "backlog") => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      setSelectedGameForModal(game);
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

  return (
    <>
      <section className="space-y-6">
        {/* Cabeçalho Unificado com Abas Interativas */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#242a36] pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
              <Trophy className="w-3.5 h-3.5" />
              <span>Rankings Oficiais GameVault</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Top 10 da Comunidade</span>
            </h2>
          </div>

          {/* Abas Interativas de Seleção */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#14171f] border border-[#262c38] w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("popular")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                activeTab === "popular"
                  ? "bg-[#1f2533] text-white shadow-sm border border-[#343e54]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span className="sm:hidden">Populares</span>
              <span className="hidden sm:inline">Mais Populares</span>
            </button>

            <button
              onClick={() => setActiveTab("top_rated")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                activeTab === "top_rated"
                  ? "bg-[#1f2533] text-white shadow-sm border border-[#343e54]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/30 shrink-0" />
              <span className="sm:hidden">Avaliados</span>
              <span className="hidden sm:inline">Mais Bem Avaliados</span>
            </button>

            <button
              onClick={() => setActiveTab("hyped")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap active:scale-95 cursor-pointer ${
                activeTab === "hyped"
                  ? "bg-[#1f2533] text-white shadow-sm border border-[#343e54]"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="sm:hidden">Desejados</span>
              <span className="hidden sm:inline">Mais Desejados</span>
            </button>
          </div>
        </div>

        {/* Estado de Carregamento Esqueleto (Apenas se não há jogos exibidos) */}
        {loading && games.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-44 rounded-2xl bg-[#12151c] border border-[#222834] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className={`space-y-6 transition-opacity duration-200 ${loading ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            {/* ========================================================
                1. PÓDIO TOP 3: CARDS DE DESTAQUE (#1 OURO, #2 PRATA, #3 BRONZE)
            ======================================================== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {top3.map((game, index) => {
                const rank = index + 1;
                const userGame = getGameInLibrary(game.id);
                const duration = formatGameDuration(game, userGame?.userPlaytimeHours);
                const releaseYear = game.released ? game.released.substring(0, 4) : "";

                const rankColors =
                  rank === 1
                    ? {
                        border: "border-amber-500/40 hover:border-amber-400",
                        badge: "bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black",
                        glow: "hover:shadow-amber-500/10",
                      }
                    : rank === 2
                    ? {
                        border: "border-slate-400/40 hover:border-slate-300",
                        badge: "bg-gradient-to-r from-slate-200 to-slate-400 text-black font-black",
                        glow: "hover:shadow-slate-400/10",
                      }
                    : {
                        border: "border-amber-800/40 hover:border-amber-700",
                        badge: "bg-gradient-to-r from-amber-700 to-amber-800 text-white font-black",
                        glow: "hover:shadow-amber-900/10",
                      };

                return (
                  <div
                    key={game.id}
                    className={`group relative rounded-2xl bg-[#12151c] border ${rankColors.border} p-4 flex gap-4 transition-all duration-200 hover:shadow-2xl ${rankColors.glow}`}
                  >
                    {/* Poster do Jogo */}
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
                        className={`absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md font-mono text-xs shadow-md ${rankColors.badge}`}
                      >
                        #{rank}
                      </div>
                    </div>

                    {/* Informações Centrais do Jogo */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 mb-1">
                          <span>{releaseYear}</span>
                          {game.genres && game.genres[0] && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[100px]">{game.genres[0].name}</span>
                            </>
                          )}
                        </div>

                        <Link href={getGameUrl(game)}>
                          <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2 leading-snug">
                            {game.name}
                          </h3>
                        </Link>
                      </div>

                      <div className="pt-2 border-t border-[#222834] flex items-center justify-between text-xs font-mono">
                        {/* Metacritic ou Duração */}
                        <div className="flex items-center gap-2">
                          {game.metacritic && <MetacriticBadge score={game.metacritic} size="sm" />}
                          <div className="flex items-center gap-1 text-[11px] text-neutral-400 tabular-nums">
                            <Clock className="w-3 h-3 text-cyan-400" />
                            <span>{duration.text}</span>
                          </div>
                        </div>

                        {/* Botão de Adição Rápida */}
                        <button
                          onClick={(e) => handleQuickAdd(e, game)}
                          className={`p-1.5 rounded-lg border transition-all active:scale-90 cursor-pointer ${
                            userGame
                              ? "bg-cyan-500/15 border-cyan-500/40 text-[#00E5FF]"
                              : "bg-white/5 border-white/10 text-neutral-300 hover:bg-white hover:text-black hover:border-white"
                          }`}
                          title={userGame ? "Na sua biblioteca" : "Quero Jogar"}
                        >
                          {userGame ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ========================================================
                2. POSIÇÕES #4 A #10: LISTA COMPACTA DE ALTA DENSIDADE
            ======================================================== */}
            {rest7.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-2">
                {rest7.map((game, index) => {
                  const rank = index + 4;
                  const userGame = getGameInLibrary(game.id);
                  const duration = formatGameDuration(game, userGame?.userPlaytimeHours);
                  const releaseYear = game.released ? game.released.substring(0, 4) : "";

                  return (
                    <div
                      key={game.id}
                      className="group flex items-center justify-between gap-3 p-2.5 rounded-xl bg-[#12151c]/90 hover:bg-[#151922] border border-[#222834] hover:border-[#343e54] transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 text-center font-mono font-bold text-neutral-400 text-xs tabular-nums shrink-0">
                          #{rank}
                        </span>

                        <Link
                          href={getGameUrl(game)}
                          className="relative w-10 h-13 aspect-[3/4] rounded-lg overflow-hidden bg-neutral-900 border border-white/5 shrink-0 block"
                        >
                          {game.background_image ? (
                            <img
                              src={game.background_image}
                              alt={game.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : null}
                        </Link>

                        <div className="min-w-0">
                          <Link href={getGameUrl(game)}>
                            <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00E5FF] transition-colors truncate max-w-[180px] sm:max-w-xs">
                              {game.name}
                            </h4>
                          </Link>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                            <span>{releaseYear}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-cyan-400" />
                              {duration.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 font-mono">
                        {game.metacritic && <MetacriticBadge score={game.metacritic} size="sm" />}
                        <button
                          onClick={(e) => handleQuickAdd(e, game)}
                          className={`p-1.5 rounded-lg border transition-all active:scale-90 cursor-pointer ${
                            userGame
                              ? "bg-cyan-500/15 border-cyan-500/40 text-[#00E5FF]"
                              : "bg-white/5 border-white/10 text-neutral-400 hover:text-white hover:bg-white/10"
                          }`}
                          title={userGame ? "Na biblioteca" : "Quero Jogar"}
                        >
                          {userGame ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rodapé da Seção com Link Explícito para o Ranking Completo */}
            <div className="pt-2 flex justify-center sm:justify-end">
              <Link
                href="/rankings"
                className="inline-flex items-center gap-2 text-xs font-mono font-bold text-neutral-300 hover:text-[#00E5FF] transition-colors py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
              >
                <span>Explorar Ranking Completo (Top 100)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#00E5FF]" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* Modal para configuração detalhada */}
      {selectedGameForModal && (
        <GameModal
          game={selectedGameForModal}
          isOpen={Boolean(selectedGameForModal)}
          onClose={() => setSelectedGameForModal(null)}
        />
      )}
    </>
  );
}
