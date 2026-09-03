"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Game } from "@/lib/types";
import GameCard from "@/components/GameCard";
import LiveSearchInput from "@/components/LiveSearchInput";
import { Search, Filter, Trophy, Sparkles, Gamepad2 } from "lucide-react";

const GENRES_LIST = [
  "Todos",
  "Action",
  "Role-playing (RPG)",
  "Adventure",
  "Shooter",
  "Strategy",
  "Puzzle",
  "Platform",
  "Indie",
  "Horror",
];

const SEARCH_PLATFORMS = [
  "Todas",
  "PlayStation 2",
  "PlayStation",
  "PlayStation 3",
  "PlayStation 4",
  "PlayStation 5",
  "Xbox",
  "Xbox 360",
  "Xbox One",
  "Xbox Series",
  "Nintendo 64",
  "GameCube",
  "Super Nintendo",
  "Nintendo Switch",
  "PC",
];

function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState("Todos");
  const [selectedPlatform, setSelectedPlatform] = useState("Todas");
  const [minMetacritic, setMinMetacritic] = useState<number>(0);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
  }, [searchParams]);

  useEffect(() => {
    async function fetchGames() {
      setLoading(true);
      setPage(1);
      try {
        const url = query.trim()
          ? `/api/games/search?q=${encodeURIComponent(query.trim())}&page=1&pageSize=50`
          : `/api/games/search?page=1&pageSize=50`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const items = data.games || [];
          setGames(items);
          setTotalCount(data.total || data.count || items.length);
          setHasMore(Boolean(data.hasMore ?? (items.length >= 50)));
        }
      } catch (err) {
        console.error("Erro na busca:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, [query]);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const url = query.trim()
        ? `/api/games/search?q=${encodeURIComponent(query.trim())}&page=${nextPage}&pageSize=50`
        : `/api/games/search?page=${nextPage}&pageSize=50`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const newItems: Game[] = data.games || [];
        setGames((prev) => {
          const existingIds = new Set(prev.map((g) => g.id));
          const uniqueNew = newItems.filter((g) => !existingIds.has(g.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(Boolean(data.hasMore ?? (newItems.length >= 50)));
      }
    } catch (err) {
      console.error("Erro ao carregar mais jogos:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Filtros de gênero, plataforma e nota
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      if (selectedGenre !== "Todos") {
        const hasGenre = g.genres?.some((genre) =>
          genre.name.toLowerCase().includes(selectedGenre.toLowerCase().replace(/[^a-z]/g, ""))
        );
        if (!hasGenre) return false;
      }

      if (selectedPlatform !== "Todas") {
        const target = selectedPlatform.toLowerCase();
        const hasPlat = g.platforms?.some((p) => {
          const pName = p.platform.name.toLowerCase();
          if (target === "playstation") {
            return pName === "playstation" || pName.includes("ps1");
          }
          if (target === "xbox") {
            return pName === "xbox" || pName.includes("original");
          }
          return pName.includes(target);
        });
        if (!hasPlat) return false;
      }

      if (minMetacritic > 0) {
        if (!g.metacritic || g.metacritic < minMetacritic) return false;
      }

      return true;
    });
  }, [games, selectedGenre, selectedPlatform, minMetacritic]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header da Busca com Design System */}
      <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> Catálogo Completo IGDB
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explorar Jogos
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Pesquise qualquer jogo do mundo dos games para adicionar à sua lista, ver notas e tempos de zeramento.
          </p>
        </div>

        {/* Campo de Busca com Autocomplete */}
        <div className="max-w-xl">
          <LiveSearchInput
            variant="hero"
            placeholder="Digite o nome do jogo (Elden Ring, God of War, Zelda...)"
          />
        </div>

        {/* Barra de Filtros por Gênero */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
            <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Gênero:
            </span>
            {GENRES_LIST.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedGenre === genre
                    ? "bg-[#00E5FF] text-black font-bold shadow-lg shadow-[#00E5FF]/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>

          {/* Barra de Filtros por Plataforma / Console */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap pt-1">
            <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
              <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> Console:
            </span>
            {SEARCH_PLATFORMS.map((plat) => (
              <button
                key={plat}
                onClick={() => setSelectedPlatform(plat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  selectedPlatform === plat
                    ? "bg-[#00E5FF] text-black font-bold shadow-md shadow-[#00E5FF]/20"
                    : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                {plat}
              </button>
            ))}
          </div>

          {/* Filtro por Nota Metacritic */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap pt-1">
            <span className="text-xs font-semibold text-gray-400 mr-2 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" /> Nota Mínima:
            </span>
            {[
              { label: "Todas as Notas", value: 0 },
              { label: "90+ (Obra-Prima)", value: 90 },
              { label: "85+ (Excelente)", value: 85 },
              { label: "75+ (Bom)", value: 75 },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setMinMetacritic(item.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  minMetacritic === item.value
                    ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Resultados */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-mono">
          <span>
            {loading
              ? "Buscando jogos no catálogo..."
              : totalCount > 0
              ? `${totalCount} jogos encontrados (Exibindo ${filteredGames.length} títulos)`
              : `Exibindo ${filteredGames.length} títulos`}
          </span>
          {query && (
            <span>
              Resultados para &quot;<strong className="text-white">{query}</strong>&quot;
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
              <div
                key={n}
                className="aspect-[3/4] rounded-2xl bg-[#18191c]/60 border border-white/5 animate-pulse"
              />
            ))}
          </div>
        ) : filteredGames.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>

            {/* Botão para carregar mais jogos */}
            {hasMore && (
              <div className="pt-6 flex flex-col items-center gap-2">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3.5 rounded-full bg-white/10 hover:bg-[#00E5FF] text-white hover:text-black font-bold text-sm transition-all border border-white/10 hover:border-[#00E5FF] shadow-xl disabled:opacity-50 flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Carregando mais jogos...
                    </>
                  ) : (
                    `Carregar mais jogos...`
                  )}
                </button>
                <span className="text-[11px] text-gray-500 font-mono">
                  {totalCount > filteredGames.length
                    ? `Exibindo ${filteredGames.length} de ${totalCount} jogos`
                    : `Mostrando todos os ${filteredGames.length} títulos`}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-3">
            <Search className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum jogo encontrado</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Tente pesquisar por outro título ou limpe os filtros de gênero e nota.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500 font-mono">Carregando busca...</div>}>
      <SearchContent />
    </Suspense>
  );
}
