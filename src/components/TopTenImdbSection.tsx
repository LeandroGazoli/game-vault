"use client";

import React, { useState } from "react";
import { Game } from "@/lib/types";
import GameModal from "./GameModal";
import Link from "next/link";
import { Plus, Check, Star, Eye, ChevronRight, Sparkles } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";

interface TopTenImdbSectionProps {
  games: Game[];
  title?: string;
}

export default function TopTenImdbSection({
  games,
  title = "Top 10 no GameVault esta semana",
}: TopTenImdbSectionProps) {
  const { getGameInLibrary } = useGameLibrary();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  if (!games || games.length === 0) return null;

  const top3 = games.slice(0, 3);
  const next7 = games.slice(3, 10);

  return (
    <>
      <section className="space-y-4">
        {/* Cabeçalho estilo IMDb com barra dourada */}
        <div className="flex items-center justify-between">
          <Link
            href="/rankings"
            className="group flex items-center gap-2.5 text-white hover:text-amber-400 transition-colors"
          >
            <div className="w-1.5 h-6 bg-amber-400 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              {title}
            </h2>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/rankings"
            className="text-xs font-semibold text-gray-400 hover:text-white"
          >
            Ver ranking completo →
          </Link>
        </div>

        {/* Top 1, 2, 3 - Cards Grandes de Destaque */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {top3.map((game, index) => {
            const userGame = getGameInLibrary(game.id);
            const rank = index + 1;
            const releaseYear = game.released ? game.released.substring(0, 4) : "2025";

            return (
              <div
                key={game.id}
                className="group relative rounded-2xl bg-[#18191c] border border-white/10 hover:border-amber-400/40 p-4 flex gap-4 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60"
              >
                {/* Poster / Capa com clique para página do jogo */}
                <div className="relative w-28 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900 flex-shrink-0 border border-white/10 shadow-lg">
                  <Link
                    href={`/game/${game.id}`}
                    className="block w-full h-full cursor-pointer"
                    title={`Ver detalhes de ${game.name}`}
                  >
                    {game.background_image ? (
                      <img
                        src={game.background_image}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        Sem Capa
                      </div>
                    )}
                  </Link>

                  {/* Botão + Estilo IMDb no Canto Superior Esquerdo */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedGame(game);
                    }}
                    className="absolute top-1.5 left-1.5 p-1.5 rounded-xl bg-black/70 hover:bg-amber-500 text-white hover:text-black backdrop-blur-md transition-all z-20 border border-white/10 active:scale-95"
                    title={userGame ? "Editar na biblioteca" : "Adicionar à lista"}
                  >
                    {userGame ? <Check className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Informações detalhadas do Card */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div>
                    {/* Badge de Posição (#1, #2, #3) */}
                    <div className="inline-block px-2 py-0.5 rounded-md bg-[#00E5FF] text-black font-extrabold text-[11px] mb-1.5 shadow-sm">
                      #{rank}
                    </div>

                    <Link href={`/game/${game.id}`}>
                      <h3 className="text-base font-bold text-white hover:text-[#00E5FF] transition-colors line-clamp-1">
                        {game.name}
                      </h3>
                    </Link>

                    {/* Metadados: Ano, Duração, Gênero */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <span>{releaseYear}</span>
                      <span>•</span>
                      <span>{game.hltb?.mainStory ? `${game.hltb.mainStory}h` : "30h"}</span>
                      {game.genres && game.genres[0] && (
                        <>
                          <span>•</span>
                          <span className="truncate">{game.genres[0].name}</span>
                        </>
                      )}
                    </div>

                    {/* Nota Estilo IMDb com Estrela */}
                    <div className="flex items-center gap-3 text-xs mt-2">
                      <div className="flex items-center gap-1 font-bold text-amber-400 font-mono">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{game.rating ? (game.rating).toFixed(1) : "8.5"}</span>
                      </div>
                      <button
                        onClick={() => setSelectedGame(game)}
                        className="text-gray-400 hover:text-white flex items-center gap-1 text-[11px]"
                      >
                        <Star className="w-3 h-3 text-gray-500" /> Avaliar
                      </button>
                    </div>

                    {/* Botão de Ação Rápida */}
                    <div className="mt-2">
                      <button
                        onClick={() => setSelectedGame(game)}
                        className={`text-[11px] font-medium flex items-center gap-1.5 transition-colors ${
                          userGame
                            ? "text-[#00E5FF]"
                            : "text-gray-400 hover:text-[#00E5FF]"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {userGame ? "Na sua biblioteca" : "Marcar como jogado"}
                      </button>
                    </div>
                  </div>

                  {/* Sinopse resumida */}
                  <p className="text-[11px] text-gray-400 line-clamp-2 mt-2 leading-relaxed">
                    {game.description_raw}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Linha Inferior: #4 a #10 em Formato de Posters com Badges */}
        {next7.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 pt-2">
            {next7.map((game, index) => {
              const rank = index + 4;
              const userGame = getGameInLibrary(game.id);

              return (
                <div
                  key={game.id}
                  className="group relative rounded-xl bg-[#18191c] border border-white/5 hover:border-white/20 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative aspect-[2/3] w-full bg-neutral-900 overflow-hidden">
                    <Link
                      href={`/game/${game.id}`}
                      className="block w-full h-full cursor-pointer"
                      title={`Ver detalhes de ${game.name}`}
                    >
                      {/* Badge de Posição (#4 a #10) */}
                      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-[#00E5FF] text-black font-extrabold text-[10px] shadow-md">
                        #{rank}
                      </div>

                      {game.background_image ? (
                        <img
                          src={game.background_image}
                          alt={game.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                          Sem Capa
                        </div>
                      )}
                    </Link>

                    {/* Botão de Ação Rápida no Hover / Touch */}
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedGame(game);
                      }}
                      className="absolute bottom-2 right-2 p-1.5 rounded-full bg-black/80 hover:bg-white text-white hover:text-black backdrop-blur-md opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-lg z-20 border border-white/10 active:scale-95"
                      title={userGame ? "Editar na biblioteca" : "Adicionar à lista"}
                    >
                      {userGame ? <Check className="w-3.5 h-3.5 text-[#00E5FF]" /> : <Plus className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <Link href={`/game/${game.id}`}>
                      <h4 className="text-xs font-semibold text-white hover:text-[#00E5FF] line-clamp-1 transition-colors">
                        {game.name}
                      </h4>
                    </Link>

                    <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1 font-mono">
                      <span>{game.released ? game.released.substring(0, 4) : ""}</span>
                      {game.metacritic && (
                        <span className="text-emerald-400 font-bold">{game.metacritic}%</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

export function TopTenImdbSkeleton() {
  return (
    <section className="space-y-4" aria-busy="true" aria-label="Carregando Top 10">
      {/* Cabeçalho estilo IMDb com barra dourada */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-amber-400/60 rounded-full animate-pulse" />
          <div className="h-6 sm:h-7 w-48 sm:w-64 bg-white/10 rounded-xl animate-pulse" />
        </div>
        <div className="h-4 w-28 bg-white/5 rounded-lg animate-pulse hidden sm:block" />
      </div>

      {/* Top 1, 2, 3 - Cards Grandes Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            className="rounded-2xl bg-[#18191c]/80 border border-white/5 p-4 flex gap-4 animate-pulse"
          >
            {/* Poster / Capa com aspect 2/3 */}
            <div className="w-28 sm:w-32 aspect-[2/3] rounded-xl bg-white/5 flex-shrink-0" />

            {/* Informações detalhadas */}
            <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
              <div className="space-y-2">
                <div className="w-8 h-4 rounded bg-[#00E5FF]/20" />
                <div className="w-4/5 h-4 sm:h-5 rounded bg-white/10" />
                <div className="w-1/2 h-3 rounded bg-white/5" />
                <div className="w-20 h-4 rounded bg-amber-400/20 mt-2" />
              </div>
              <div className="w-full h-8 rounded-xl bg-white/5 mt-3" />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

