"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Game } from "@/lib/types";
import GameCard from "@/components/GameCard";
import { Search, Filter, Sparkles, SlidersHorizontal, Trophy, X } from "lucide-react";

const GENRES_LIST = [
  "Todos",
  "Action",
  "RPG",
  "Adventure",
  "Shooter",
  "Strategy",
  "Puzzle",
  "Platformer",
  "Indie",
];

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [minMetacritic, setMinMetacritic] = useState<number>(0);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch (err) {
        console.error("Erro na busca:", err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(() => {
      fetchGames();
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Filtros em memória
  const filteredGames = games.filter((g) => {
    if (selectedGenre !== "Todos") {
      const hasGenre = g.genres?.some(
        (genre) => genre.name.toLowerCase() === selectedGenre.toLowerCase()
      );
      if (!hasGenre) return false;
    }

    if (minMetacritic > 0) {
      if (!g.metacritic || g.metacritic < minMetacritic) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8">
      {/* Top Header da Busca */}
      <div className="rounded-3xl bg-surface-100/80 border border-gray-800 p-6 sm:p-8">
        <div className="max-w-2xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Explorar Catálogo de Jogos
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Pesquise qualquer jogo para registrar em seu perfil, ver notas do Metacritic e tempos do HowLongToBeat
          </p>

          {/* Campo de Busca */}
          <div className="mt-5 relative flex items-center">
            <Search className="w-5 h-5 text-gray-400 absolute left-4" />
            <input
              type="text"
              placeholder="Digite o nome do jogo (ex: Elden Ring, God of War, Persona 5...)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-2xl bg-surface-50 border border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none text-sm shadow-inner"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Barra de Filtros por Gênero */}
        <div className="mt-6 pt-5 border-t border-gray-800/80 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Gênero:
          </span>
          {GENRES_LIST.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                selectedGenre === genre
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "bg-surface-50 border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Filtro por Nota Metacritic */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-emerald-400" /> Nota Mínima Metacritic:
          </span>
          {[
            { label: "Todas", value: 0 },
            { label: "90+ (Obra-Prima)", value: 90 },
            { label: "85+ (Excelente)", value: 85 },
            { label: "75+ (Bom)", value: 75 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setMinMetacritic(item.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                minMetacritic === item.value
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "bg-surface-50 border border-gray-800 text-gray-400 hover:text-gray-200 hover:border-gray-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <span>
            {loading
              ? "Buscando jogos..."
              : `Encontrados ${filteredGames.length} jogos`}
          </span>
          {query && (
            <span>
              Resultados para &quot;<strong className="text-white">{query}</strong>&quot;
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-surface-100/50 border border-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-800 bg-surface-100/40 p-12 text-center">
            <Search className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">Nenhum jogo encontrado</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Tente pesquisar por outro título ou remova os filtros de gênero e nota.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Carregando busca...</div>}>
      <SearchContent />
    </Suspense>
  );
}
