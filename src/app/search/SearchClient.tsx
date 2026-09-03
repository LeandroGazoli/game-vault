"use client";

import React, { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Game } from "@/lib/types";
import GameCard from "@/components/GameCard";
import LiveSearchInput from "@/components/LiveSearchInput";
import {
  Search,
  Filter,
  Trophy,
  Sparkles,
  Gamepad2,
  X,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  ArrowUpDown,
  Flame,
  Calendar,
  Layers,
  Eye,
  Users,
} from "lucide-react";
import {
  GENRE_FILTER_OPTIONS,
  PLATFORM_FAMILIES,
  QUICK_POPULAR_PLATFORMS,
  RATING_FILTER_OPTIONS,
  SORT_FILTER_OPTIONS,
  DISCOVERY_PRESETS,
  PERSPECTIVE_FILTER_OPTIONS,
  GAME_MODE_FILTER_OPTIONS,
  findPlatformFilter,
  findGenreFilter,
  findPerspectiveFilter,
  findGameModeFilter,
} from "@/lib/filterConstants";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estados principais de busca e filtros
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [selectedGenre, setSelectedGenre] = useState(() => {
    const g = searchParams.get("genre");
    return g ? findGenreFilter(g)?.id || "all" : "all";
  });
  const [selectedPlatform, setSelectedPlatform] = useState(() => {
    const p = searchParams.get("platform") || searchParams.get("console");
    return p ? findPlatformFilter(p)?.id || "all" : "all";
  });
  const [selectedPerspective, setSelectedPerspective] = useState(() => {
    const p = searchParams.get("perspective");
    return p ? findPerspectiveFilter(p)?.id || "all" : "all";
  });
  const [selectedGameMode, setSelectedGameMode] = useState(() => {
    const m = searchParams.get("gameMode") || searchParams.get("mode");
    return m ? findGameModeFilter(m)?.id || "all" : "all";
  });
  const [minRating, setMinRating] = useState<number>(() => {
    const r = searchParams.get("minRating") || searchParams.get("rating");
    return r ? parseInt(r, 10) || 0 : 0;
  });
  const [selectedSort, setSelectedSort] = useState(() => searchParams.get("sort") || "popular");

  // Estados de dados e paginação
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Estados de UI expansível
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Sincroniza estado quando a URL muda externamente (ex: submit do LiveSearchInput ou navegação)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);

    const g = searchParams.get("genre");
    setSelectedGenre(g ? findGenreFilter(g)?.id || "all" : "all");

    const p = searchParams.get("platform") || searchParams.get("console");
    setSelectedPlatform(p ? findPlatformFilter(p)?.id || "all" : "all");

    const persp = searchParams.get("perspective");
    setSelectedPerspective(persp ? findPerspectiveFilter(persp)?.id || "all" : "all");

    const mode = searchParams.get("gameMode") || searchParams.get("mode");
    setSelectedGameMode(mode ? findGameModeFilter(mode)?.id || "all" : "all");

    const r = searchParams.get("minRating") || searchParams.get("rating");
    setMinRating(r ? parseInt(r, 10) || 0 : 0);

    const s = searchParams.get("sort") || "popular";
    setSelectedSort(s);
  }, [searchParams]);

  // Atualiza os parâmetros na URL de forma limpa (sem scroll e sem recarregar a página)
  const updateUrlParams = useCallback(
    (newParams: {
      q?: string;
      genre?: string;
      platform?: string;
      perspective?: string;
      gameMode?: string;
      minRating?: number;
      sort?: string;
    }) => {
      const qVal = newParams.q !== undefined ? newParams.q : query;
      const gVal = newParams.genre !== undefined ? newParams.genre : selectedGenre;
      const pVal = newParams.platform !== undefined ? newParams.platform : selectedPlatform;
      const perspVal = newParams.perspective !== undefined ? newParams.perspective : selectedPerspective;
      const modeVal = newParams.gameMode !== undefined ? newParams.gameMode : selectedGameMode;
      const rVal = newParams.minRating !== undefined ? newParams.minRating : minRating;
      const sVal = newParams.sort !== undefined ? newParams.sort : selectedSort;

      const params = new URLSearchParams();
      if (qVal.trim()) params.set("q", qVal.trim());
      if (gVal && gVal !== "all") params.set("genre", gVal);
      if (pVal && pVal !== "all") params.set("platform", pVal);
      if (perspVal && perspVal !== "all") params.set("perspective", perspVal);
      if (modeVal && modeVal !== "all") params.set("gameMode", modeVal);
      if (rVal > 0) params.set("minRating", String(rVal));
      if (sVal && sVal !== "popular") params.set("sort", sVal);

      const queryString = params.toString();
      const targetUrl = queryString ? `/search?${queryString}` : "/search";
      window.history.replaceState(null, "", targetUrl);
    },
    [query, selectedGenre, selectedPlatform, selectedPerspective, selectedGameMode, minRating, selectedSort]
  );

  // Busca adaptativa acionada ao alterar qualquer filtro ou termo de busca
  useEffect(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function fetchGames() {
      setLoading(true);
      setPage(1);

      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (selectedGenre && selectedGenre !== "all") params.set("genre", selectedGenre);
      if (selectedPlatform && selectedPlatform !== "all") params.set("platform", selectedPlatform);
      if (selectedPerspective && selectedPerspective !== "all") params.set("perspective", selectedPerspective);
      if (selectedGameMode && selectedGameMode !== "all") params.set("gameMode", selectedGameMode);
      if (minRating > 0) params.set("minRating", String(minRating));
      if (selectedSort && selectedSort !== "popular") params.set("sort", selectedSort);
      params.set("page", "1");
      params.set("pageSize", "36");

      try {
        const res = await fetch(`/api/games/search?${params.toString()}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const items: Game[] = data.games || [];
          setGames(items);
          setTotalCount(data.total || data.count || items.length);
          setHasMore(Boolean(data.hasMore ?? (items.length >= 36)));
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Erro na busca de jogos:", err);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchGames();

    return () => {
      controller.abort();
    };
  }, [query, selectedGenre, selectedPlatform, selectedPerspective, selectedGameMode, minRating, selectedSort]);

  // Carregar mais jogos mantendo todos os filtros ativos
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const nextPage = page + 1;

    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedGenre && selectedGenre !== "all") params.set("genre", selectedGenre);
    if (selectedPlatform && selectedPlatform !== "all") params.set("platform", selectedPlatform);
    if (selectedPerspective && selectedPerspective !== "all") params.set("perspective", selectedPerspective);
    if (selectedGameMode && selectedGameMode !== "all") params.set("gameMode", selectedGameMode);
    if (minRating > 0) params.set("minRating", String(minRating));
    if (selectedSort && selectedSort !== "popular") params.set("sort", selectedSort);
    params.set("page", String(nextPage));
    params.set("pageSize", "36");

    try {
      const res = await fetch(`/api/games/search?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const newItems: Game[] = data.games || [];
        setGames((prev) => {
          const existingIds = new Set(prev.map((g) => g.id));
          const uniqueNew = newItems.filter((g) => !existingIds.has(g.id));
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
        setHasMore(Boolean(data.hasMore ?? (newItems.length >= 36)));
      }
    } catch (err) {
      console.error("Erro ao carregar mais jogos:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Manipuladores de Filtros
  const handleSelectGenre = (genreId: string) => {
    setSelectedGenre(genreId);
    updateUrlParams({ genre: genreId });
  };

  const handleSelectPlatform = (platformId: string) => {
    setSelectedPlatform(platformId);
    updateUrlParams({ platform: platformId });
  };

  const handleSelectPerspective = (perspectiveId: string) => {
    setSelectedPerspective(perspectiveId);
    updateUrlParams({ perspective: perspectiveId });
  };

  const handleSelectGameMode = (modeId: string) => {
    setSelectedGameMode(modeId);
    updateUrlParams({ gameMode: modeId });
  };

  const handleSelectRating = (ratingValue: number) => {
    setMinRating(ratingValue);
    updateUrlParams({ minRating: ratingValue });
  };

  const handleSelectSort = (sortId: string) => {
    setSelectedSort(sortId);
    updateUrlParams({ sort: sortId });
  };

  // Aplicação de Presets Rápidos de Descoberta (Modo Adaptativo)
  const handleSelectPreset = (preset: (typeof DISCOVERY_PRESETS)[0]) => {
    setSelectedSort(preset.sort);
    setMinRating(preset.minRating);
    if (preset.platform) {
      setSelectedPlatform(preset.platform);
    } else {
      setSelectedPlatform("all");
    }
    setSelectedGenre("all");
    setSelectedPerspective("all");
    setSelectedGameMode("all");
    setQuery("");
    updateUrlParams({
      q: "",
      genre: "all",
      platform: preset.platform || "all",
      perspective: "all",
      gameMode: "all",
      minRating: preset.minRating,
      sort: preset.sort,
    });
  };

  // Limpar todos os filtros
  const handleClearFilters = () => {
    setQuery("");
    setSelectedGenre("all");
    setSelectedPlatform("all");
    setSelectedPerspective("all");
    setSelectedGameMode("all");
    setMinRating(0);
    setSelectedSort("popular");
    updateUrlParams({
      q: "",
      genre: "all",
      platform: "all",
      perspective: "all",
      gameMode: "all",
      minRating: 0,
      sort: "popular",
    });
  };

  // Verifica se há algum filtro não padrão ativo
  const hasActiveFilters = Boolean(
    query.trim() ||
    selectedGenre !== "all" ||
    selectedPlatform !== "all" ||
    selectedPerspective !== "all" ||
    selectedGameMode !== "all" ||
    minRating > 0 ||
    selectedSort !== "popular"
  );

  const activePlatformOption = findPlatformFilter(selectedPlatform);
  const activeGenreOption = findGenreFilter(selectedGenre);
  const activePerspectiveOption = findPerspectiveFilter(selectedPerspective);
  const activeGameModeOption = findGameModeFilter(selectedGameMode);

  return (
    <div className="space-y-8 pb-12">
      {/* ========================================================
          TOP HEADER DA BUSCA COM DESIGN SYSTEM PREMIUM
      ======================================================== */}
      <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow de ambientação no topo */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" /> Catálogo Completo IGDB
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Explorar Jogos
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Pesquise qualquer jogo do acervo mundial, filtre por console, geração ou gênero, e veja notas oficiais e tempos de zeramento.
          </p>
        </div>

        {/* Campo de Busca Principal com Autocomplete */}
        <div className="max-w-xl relative z-10">
          <LiveSearchInput
            variant="hero"
            placeholder="Digite o nome do jogo (Elden Ring, God of War, Zelda...)"
          />
        </div>

        {/* ========================================================
            BARRA DE PRESETS ADAPTATIVOS RÁPIDOS
        ======================================================== */}
        <div className="pt-2 border-t border-white/5 space-y-3 relative z-10">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
            <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1.5 flex-shrink-0">
              <Flame className="w-3.5 h-3.5 text-cyan-400" /> Modos de Exploração:
            </span>
            {DISCOVERY_PRESETS.map((preset) => {
              const isActive =
                selectedSort === preset.sort &&
                minRating === preset.minRating &&
                (preset.platform ? selectedPlatform === preset.platform : selectedPlatform === "all") &&
                selectedGenre === "all" &&
                !query;

              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "bg-cyan-500/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-md shadow-[#00E5FF]/15"
                      : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                  }`}
                >
                  <span>{preset.icon}</span>
                  <span>{preset.label}</span>
                </button>
              );
            })}
          </div>

          {/* ========================================================
              FILTRO DE CONSOLES / PLATAFORMAS (ORGANIZADO POR GERAÇÃO)
          ======================================================== */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-400 flex items-center gap-1.5">
                <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> Console & Plataforma:
              </span>
              <button
                onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                className="text-xs font-medium text-[#00E5FF] hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <span>{showAllPlatforms ? "Recolher Consoles" : "Ver Todos os Consoles"}</span>
                {showAllPlatforms ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Atalhos Rápidos dos Consoles Mais Populares */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
              {QUICK_POPULAR_PLATFORMS.map((plat) => {
                const isSelected = selectedPlatform === plat.id;
                return (
                  <button
                    key={plat.id}
                    onClick={() => handleSelectPlatform(plat.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-[#00E5FF] text-black font-bold shadow-md shadow-[#00E5FF]/20"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                  >
                    {plat.shortName || plat.name}
                  </button>
                );
              })}
            </div>

            {/* Painel Expansível com Todas as Gerações Agrupadas por Fabricante */}
            {showAllPlatforms && (
              <div className="mt-3 p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4 animate-fadeIn">
                {PLATFORM_FAMILIES.map((family) => (
                  <div key={family.family} className="space-y-1.5">
                    <div className="text-[11px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-1.5">
                      <Layers className="w-3 h-3 text-cyan-400" /> {family.family}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {family.platforms.map((p) => {
                        const isSelected = selectedPlatform === p.id;
                        return (
                          <button
                            key={p.id}
                            onClick={() => {
                              handleSelectPlatform(p.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                              isSelected
                                ? "bg-[#00E5FF] text-black font-bold shadow-sm"
                                : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-white/5"
                            }`}
                          >
                            {p.shortName || p.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================
              FILTRO POR GÊNERO / CATEGORIA
          ======================================================== */}
          <div className="pt-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
              <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1.5 flex-shrink-0">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Gênero:
              </span>
              {GENRE_FILTER_OPTIONS.map((genre) => {
                const isSelected = selectedGenre === genre.id;
                return (
                  <button
                    key={genre.id}
                    onClick={() => handleSelectGenre(genre.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-[#00E5FF] text-black font-bold shadow-md shadow-[#00E5FF]/20"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                  >
                    {genre.shortName || genre.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              FILTRO POR PERSPECTIVA DE CÂMERA
          ======================================================== */}
          <div className="pt-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
              <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1.5 flex-shrink-0">
                <Eye className="w-3.5 h-3.5 text-amber-400" /> Câmera / Visão:
              </span>
              {PERSPECTIVE_FILTER_OPTIONS.map((p) => {
                const isSelected = selectedPerspective === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPerspective(p.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                  >
                    {p.shortName || p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              FILTRO POR MODO DE JOGO
          ======================================================== */}
          <div className="pt-2">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
              <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1.5 flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Modo de Jogo:
              </span>
              {GAME_MODE_FILTER_OPTIONS.map((mode) => {
                const isSelected = selectedGameMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleSelectGameMode(mode.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? "bg-emerald-400 text-black font-bold shadow-md shadow-emerald-400/20"
                        : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white border border-transparent"
                    }`}
                  >
                    {mode.shortName || mode.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================
              NOTA MÍNIMA & ORDENAÇÃO DINÂMICA
          ======================================================== */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Nota Metacritic Mínima */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
              <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1.5 flex-shrink-0">
                <Trophy className="w-3.5 h-3.5 text-amber-400" /> Nota Mínima:
              </span>
              {RATING_FILTER_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleSelectRating(item.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    minRating === item.value
                      ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                      : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 flex-shrink-0">
              <span className="text-xs font-semibold text-gray-400 mr-1 flex items-center gap-1.5 flex-shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" /> Ordem:
              </span>
              <div className="flex items-center gap-1.5">
                {SORT_FILTER_OPTIONS.map((sortOpt) => {
                  const isSelected = selectedSort === sortOpt.id;
                  return (
                    <button
                      key={sortOpt.id}
                      onClick={() => handleSelectSort(sortOpt.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                        isSelected
                          ? "bg-purple-500/30 text-purple-200 border border-purple-400/50 font-bold shadow-sm"
                          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-transparent"
                      }`}
                    >
                      {sortOpt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ========================================================
              PAINEL DE FILTROS ATIVOS & BOTÃO LIMPAR FILTROS
          ======================================================== */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-white/5 flex flex-wrap items-center gap-2">
              <span className="text-xs text-gray-500 font-mono">Filtros ativos:</span>

              {query.trim() && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  Busca: &ldquo;{query}&rdquo;
                  <button
                    onClick={() => {
                      setQuery("");
                      updateUrlParams({ q: "" });
                    }}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPlatform !== "all" && activePlatformOption && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  Console: {activePlatformOption.shortName || activePlatformOption.name}
                  <button
                    onClick={() => handleSelectPlatform("all")}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedGenre !== "all" && activeGenreOption && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                  Gênero: {activeGenreOption.shortName || activeGenreOption.name}
                  <button
                    onClick={() => handleSelectGenre("all")}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedPerspective !== "all" && activePerspectiveOption && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  Visão: {activePerspectiveOption.shortName || activePerspectiveOption.name}
                  <button
                    onClick={() => handleSelectPerspective("all")}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedGameMode !== "all" && activeGameModeOption && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                  Modo: {activeGameModeOption.shortName || activeGameModeOption.name}
                  <button
                    onClick={() => handleSelectGameMode("all")}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-amber-500/15 border border-amber-500/30 text-amber-300">
                  Nota: {minRating}+
                  <button
                    onClick={() => handleSelectRating(0)}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedSort !== "popular" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-purple-500/15 border border-purple-500/30 text-purple-300">
                  Ordem: {SORT_FILTER_OPTIONS.find((s) => s.id === selectedSort)?.label}
                  <button
                    onClick={() => handleSelectSort("popular")}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 font-semibold cursor-pointer transition-colors ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                Limpar todos os filtros
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          LISTA DE RESULTADOS & PAGINAÇÃO REAL
      ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-400 px-1 font-mono">
          <span>
            {loading ? (
              "Consultando acervo IGDB..."
            ) : totalCount > 0 ? (
              <>
                <strong className="text-white">{totalCount}</strong> jogos encontrados{" "}
                <span className="text-gray-500">(Exibindo {games.length} títulos)</span>
              </>
            ) : (
              `Exibindo ${games.length} títulos`
            )}
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
        ) : games.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {games.map((game) => (
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
                  {totalCount > games.length
                    ? `Exibindo ${games.length} de ${totalCount} jogos`
                    : `Mostrando todos os ${games.length} títulos`}
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-4 shadow-2xl">
            <Search className="w-12 h-12 text-gray-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Nenhum jogo encontrado</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Não encontramos títulos correspondentes aos filtros selecionados. Tente relaxar os filtros de gênero, console ou nota.
              </p>
            </div>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 rounded-full bg-[#00E5FF] text-black font-extrabold text-xs transition-all shadow-lg shadow-[#00E5FF]/20 hover:brightness-110 active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Limpar filtros e ver populares
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchClient() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center text-gray-500 font-mono flex items-center justify-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>Carregando catálogo de jogos...</span>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
