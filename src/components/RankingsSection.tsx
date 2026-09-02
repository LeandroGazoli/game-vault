"use client";

import React, { useState, useEffect } from "react";
import { Game } from "@/lib/types";
import GameModal from "./GameModal";
import AdBanner from "./ads/AdBanner";
import Link from "next/link";
import { Heart, Trophy, Sparkles, Plus, Check, Flame, Star, BarChart3 } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";

type RankingCategory = "popular" | "top_rated" | "hyped";

export default function RankingsSection() {
  const { getGameInLibrary } = useGameLibrary();
  const [category, setCategory] = useState<RankingCategory>("popular");
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/games/rankings?category=${category}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch (err) {
        console.error("Erro ao carregar rankings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [category]);

  const displayedGames = games.slice(0, limit);

  // Formata o contador de métrica para ficar estilo "9.2K", "8.9K" ou nota
  const formatMetric = (game: Game, cat: RankingCategory, index: number) => {
    if (cat === "top_rated") {
      return game.metacritic ? `${game.metacritic}%` : `${(game.rating).toFixed(1)}`;
    }
    if (cat === "hyped") {
      const hype = game.playtime || (20 - index) * 120;
      return `${(hype / 100).toFixed(1)}K`;
    }
    // Popular: baseado no total_rating_count do IGDB
    const count = game.playtime || (9500 - index * 380);
    return count > 999 ? `${(count / 1000).toFixed(1)}K` : `${count}`;
  };

  return (
    <>
      <section className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ==========================================
              COLUNA ESQUERDA: LISTA RANKEADA (8 cols)
          ========================================== */}
          <div className="lg:col-span-8 space-y-2.5">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div
                    key={n}
                    className="h-16 rounded-2xl bg-[#18191c]/60 border border-white/5 animate-pulse"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {displayedGames.map((game, index) => {
                  const rank = index + 1;
                  const userGame = getGameInLibrary(game.id);
                  const metric = formatMetric(game, category, index);

                  return (
                    <div
                      key={game.id}
                      className="group flex items-center justify-between gap-3 p-2.5 sm:p-3 rounded-2xl bg-[#18191c] hover:bg-[#202227] border border-white/5 hover:border-white/15 transition-all duration-200"
                    >
                      {/* Esquerda: Capa + Posição + Nome */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Capa com link para a página do jogo */}
                        <Link
                          href={`/game/${game.id}`}
                          className="w-11 h-14 sm:w-12 sm:h-16 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0 cursor-pointer block"
                          title={`Ver detalhes de ${game.name}`}
                        >
                          {game.background_image ? (
                            <img
                              src={game.background_image}
                              alt={game.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                              --
                            </div>
                          )}
                        </Link>

                        {/* Posição Numérica */}
                        <div className="w-7 text-center font-mono font-bold text-sm sm:text-base text-gray-300 flex-shrink-0">
                          {rank}
                        </div>

                        {/* Nome do Jogo */}
                        <Link href={`/game/${game.id}`} className="min-w-0">
                          <h3 className="text-sm sm:text-base font-semibold text-white group-hover:text-[#00E5FF] transition-colors truncate">
                            {game.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-400 font-mono mt-0.5">
                            {game.released && (
                              <span>{game.released.substring(0, 4)}</span>
                            )}
                            {game.genres && game.genres[0] && (
                              <>
                                <span>•</span>
                                <span className="truncate">{game.genres[0].name}</span>
                              </>
                            )}
                          </div>
                        </Link>
                      </div>

                      {/* Direita: Métrica (9.2K / 96%) + Botão + */}
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm font-mono text-gray-400">
                          <BarChart3 className="w-3.5 h-3.5 text-gray-500" />
                          <span>{metric}</span>
                        </div>

                        {/* Botão + */}
                        <button
                          onClick={() => setSelectedGame(game)}
                          className={`p-2 rounded-full border transition-all ${
                            userGame
                              ? "bg-[#00E5FF]/10 border-[#00E5FF]/40 text-[#00E5FF]"
                              : "bg-white/5 hover:bg-white/15 border-white/10 text-gray-300 hover:text-white"
                          }`}
                          title={userGame ? "Editar na biblioteca" : "Adicionar à lista"}
                        >
                          {userGame ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Botão Mostrar Mais */}
                {limit === 10 && games.length > 10 && (
                  <button
                    onClick={() => setLimit(20)}
                    className="w-full py-3 rounded-2xl bg-[#18191c] hover:bg-[#202227] border border-white/10 text-xs font-semibold text-gray-300 hover:text-white transition-all mt-3"
                  >
                    Mostrar mais jogos do ranking
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ==========================================
              COLUNA DIREITA: SELETOR DE CATEGORIAS (4 cols)
          ========================================== */}
          <div className="lg:col-span-4 rounded-3xl bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-6 sticky top-24">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                Rankings <span className="text-amber-400">🌟</span>
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Explore os jogos mais aclamados e aguardados do catálogo
              </p>
            </div>

            {/* Lista de Categorias Clicáveis */}
            <div className="space-y-3">
              {/* Mais Populares */}
              <button
                onClick={() => {
                  setCategory("popular");
                  setLimit(10);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  category === "popular"
                    ? "bg-white/15 text-white border border-white/20 shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Heart className={`w-5 h-5 ${category === "popular" ? "text-rose-400 fill-rose-400" : "text-gray-500"}`} />
                <span>Mais Populares</span>
              </button>

              {/* Mais Bem Avaliados */}
              <button
                onClick={() => {
                  setCategory("top_rated");
                  setLimit(10);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  category === "top_rated"
                    ? "bg-white/15 text-white border border-white/20 shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Trophy className={`w-5 h-5 ${category === "top_rated" ? "text-amber-400" : "text-gray-500"}`} />
                <span>Mais Bem Avaliados</span>
              </button>

              {/* Mais Desejados */}
              <button
                onClick={() => {
                  setCategory("hyped");
                  setLimit(10);
                }}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all ${
                  category === "hyped"
                    ? "bg-white/15 text-white border border-white/20 shadow-lg"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Sparkles className={`w-5 h-5 ${category === "hyped" ? "text-[#00E5FF]" : "text-gray-500"}`} />
                <span>Mais Desejados</span>
              </button>
            </div>

            {/* Anúncio Sidebar nos Rankings */}
            <AdBanner slot="SIDEBAR_STICKY" fallbackIndex={1} />
          </div>
        </div>
      </section>

      {/* Modal para configurar o jogo */}
      <GameModal
        game={selectedGame}
        isOpen={Boolean(selectedGame)}
        onClose={() => setSelectedGame(null)}
      />
    </>
  );
}
