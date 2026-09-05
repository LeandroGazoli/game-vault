"use client";

import React, { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Game, SystemSettings } from "@/lib/types";
import GameCard from "@/components/GameCard";
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
  Loader2,
  SlidersHorizontal,
  ArrowUp,
  Check,
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

/**
 * Detecta se a busca é descritiva/por intenção/estilo em vez de um título específico de jogo.
 * Ex: "quero um jogo estilo dark souls", "jogos de corrida na chuva", "indie relaxante", etc.
 */
function isDescriptiveOrIntentQuery(q: string): boolean {
  const text = q.trim().toLowerCase();
  if (text.length < 3) return false;

  const intentWords = [
    "quero", "queria", "procuro", "busco", "gostaria", "preciso", "indique", "recomende",
    "recomendacao", "recomendação", "sugestao", "sugestão", "indicação", "indicacoes", "indicações",
    "jogo de", "jogos de", "jogo com", "jogos com", "jogo tipo", "jogos tipo",
    "estilo", "parecido", "parecidos", "semelhante", "semelhantes", "melhores", "mais avaliados",
    "para jogar", "relaxar", "desafiador", "desafiadores", "mundo aberto",
    "souls-like", "soulslike", "roguelike", "roguelite", "metroidvania",
    "com historia", "com história", "boa trama", "coop", "multiplayer",
    "tela dividida", "cooperativo", "terror psicologico", "terror psicológico",
    "gratis", "grátis", "barato", "passar o tempo", "curto", "longo"
  ];

  const hasIntentWord = intentWords.some((word) => text.includes(word));
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return hasIntentWord || wordCount >= 4;
}

const SEARCH_STATE_STORAGE_KEY = "MGL_SEARCH_SESSION_STATE_V1";

interface SavedSearchState {
  query: string;
  genre: string;
  platform: string;
  perspective: string;
  gameMode: string;
  minRating: number;
  sort: string;
  games: Game[];
  page: number;
  totalCount: number;
  hasMore: boolean;
  scrollY: number;
  targetGameId?: number | string | null;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Estados principais de busca e filtros
  const [query, setQuery] = useState(() => searchParams.get("q") || "");
  const [inputValue, setInputValue] = useState(() => searchParams.get("q") || "");
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

  // Estados do Curador Gamer por Inteligência Artificial (integrado diretamente ao Search)
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiQueriedText, setAiQueriedText] = useState<string>("");
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  // Monitora a feature flag em tempo real do Admin
  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(doc(db, "system", "settings"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SystemSettings;
        setIsAiEnabled(Boolean(data.features?.aiRecommendations ?? true));
      }
    });
    return () => unsub();
  }, []);

  // Estados de UI expansível e utilitários
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAllPlatforms, setShowAllPlatforms] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isRestoredRef = useRef(false);

  // Sincroniza estado quando a URL muda externamente (ex: botão Voltar do navegador)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    setQuery(q);
    setInputValue(q);

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

  // Evita que o navegador force scroll para o topo antes de renderizar os itens cacheados
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      const original = window.history.scrollRestoration;
      window.history.scrollRestoration = "manual";
      return () => {
        window.history.scrollRestoration = original;
      };
    }
  }, []);

  // Restauração inteligente de cache de sessão e coordenadas de scroll ao voltar da página de jogo
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SEARCH_STATE_STORAGE_KEY);
      if (!raw) return;
      const cached: SavedSearchState = JSON.parse(raw);

      const qVal = searchParams.get("q") || "";
      const gVal = searchParams.get("genre") || "all";
      const pVal = searchParams.get("platform") || searchParams.get("console") || "all";
      const perspVal = searchParams.get("perspective") || "all";
      const modeVal = searchParams.get("gameMode") || searchParams.get("mode") || "all";
      const rVal = parseInt(searchParams.get("minRating") || searchParams.get("rating") || "0", 10);
      const sVal = searchParams.get("sort") || "popular";

      const matches =
        (cached.query || "") === qVal &&
        (cached.genre || "all") === gVal &&
        (cached.platform || "all") === pVal &&
        (cached.perspective || "all") === perspVal &&
        (cached.gameMode || "all") === modeVal &&
        (cached.minRating || 0) === rVal &&
        (cached.sort || "popular") === sVal;

      if (matches && cached.games && cached.games.length > 0) {
        isRestoredRef.current = true;
        setGames(cached.games);
        setPage(cached.page || 1);
        setTotalCount(cached.totalCount || cached.games.length);
        setHasMore(Boolean(cached.hasMore));
        setLoading(false);

        const restoreScroll = () => {
          if (cached.targetGameId) {
            const cardEl = document.getElementById(`game-card-${cached.targetGameId}`);
            if (cardEl) {
              cardEl.scrollIntoView({ block: "center", behavior: "instant" });
              return true;
            }
          }
          if (cached.scrollY > 0) {
            window.scrollTo({ top: cached.scrollY, behavior: "instant" });
            return true;
          }
          return false;
        };

        requestAnimationFrame(() => {
          restoreScroll();
          setTimeout(restoreScroll, 60);
          setTimeout(restoreScroll, 180);
          setTimeout(restoreScroll, 350);
        });

        // Limpa targetGameId para não forçar salto em futuros reloads manuais
        sessionStorage.setItem(
          SEARCH_STATE_STORAGE_KEY,
          JSON.stringify({ ...cached, targetGameId: null })
        );
      }
    } catch (e) {
      console.error("Erro ao restaurar busca da sessão:", e);
    }
  }, []);

  // Listener de scroll para salvar posição atualizada e exibir botão "Voltar ao topo"
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);

      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        try {
          const raw = sessionStorage.getItem(SEARCH_STATE_STORAGE_KEY);
          if (raw) {
            const current = JSON.parse(raw);
            sessionStorage.setItem(
              SEARCH_STATE_STORAGE_KEY,
              JSON.stringify({ ...current, scrollY: window.scrollY })
            );
          }
        } catch {}
      }, 150);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, []);

  // Mantém os dados da busca sincronizados no sessionStorage conforme mudam
  useEffect(() => {
    if (games.length > 0) {
      try {
        const raw = sessionStorage.getItem(SEARCH_STATE_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : {};
        const stateToSave: SavedSearchState = {
          query,
          genre: selectedGenre,
          platform: selectedPlatform,
          perspective: selectedPerspective,
          gameMode: selectedGameMode,
          minRating,
          sort: selectedSort,
          games,
          page,
          totalCount,
          hasMore,
          scrollY: existing.scrollY !== undefined ? existing.scrollY : window.scrollY,
          targetGameId: existing.targetGameId || null,
        };
        sessionStorage.setItem(SEARCH_STATE_STORAGE_KEY, JSON.stringify(stateToSave));
      } catch {}
    }
  }, [
    games,
    page,
    totalCount,
    hasMore,
    query,
    selectedGenre,
    selectedPlatform,
    selectedPerspective,
    selectedGameMode,
    minRating,
    selectedSort,
  ]);

  // Grava o ID do jogo e posição exata de scroll ao clicar num card antes de navegar
  const handleCardClick = (gameId: number | string) => {
    try {
      const raw = sessionStorage.getItem(SEARCH_STATE_STORAGE_KEY);
      const current = raw ? JSON.parse(raw) : {};
      sessionStorage.setItem(
        SEARCH_STATE_STORAGE_KEY,
        JSON.stringify({
          ...current,
          scrollY: window.scrollY,
          targetGameId: gameId,
        })
      );
    } catch {}
  };

  // Scroll suave ao topo
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  // Debounce na digitação do campo de busca para atualizar a query com fluidez
  useEffect(() => {
    if (inputValue === query) return;
    const timer = setTimeout(() => {
      setQuery(inputValue);
      updateUrlParams({ q: inputValue });
    }, 350);
    return () => clearTimeout(timer);
  }, [inputValue, query, updateUrlParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuery(inputValue);
    updateUrlParams({ q: inputValue });
  };

  const triggerAiRecommendation = useCallback(
    async (searchPrompt: string, force = false) => {
      const text = searchPrompt.trim();
      if (!text || text.length < 3) return;
      if (!isAiEnabled) return;

      // Evita disparar chamadas repetidas para a mesma query
      if (!force && aiQueriedText === text.toLowerCase()) return;

      setIsAiLoading(true);
      setAiQueriedText(text.toLowerCase());

      try {
        const res = await fetch("/api/ai/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: text }),
        });

        if (res.ok) {
          const data = await res.json();
          const recommended: Game[] = (data.games || []).map((g: Game) => ({
            ...g,
            isAiRecommended: true,
          }));

          if (recommended.length > 0) {
            setAiExplanation(data.explanation || null);

            setGames((prev) => {
              const aiIds = new Set(recommended.map((g) => g.id));
              // Marca os jogos existentes que a IA também recomendou
              const existingUpdated = prev.map((g) =>
                aiIds.has(g.id) ? { ...g, isAiRecommended: true } : g
              );
              const existingIds = new Set(existingUpdated.map((g) => g.id));
              const newAiGames = recommended.filter((g) => !existingIds.has(g.id));

              // Unifica colocando os achados da IA em destaque no topo
              return [...newAiGames, ...existingUpdated];
            });

            setTotalCount((prev) => prev + recommended.length);
          }
        }
      } catch (err) {
        console.warn("Curador IA não disponível para esta consulta:", err);
      } finally {
        setIsAiLoading(false);
      }
    },
    [aiQueriedText, isAiEnabled]
  );

  const handleClearSearch = () => {
    setInputValue("");
    setQuery("");
    setAiExplanation(null);
    setAiQueriedText("");
    updateUrlParams({ q: "" });
  };

  // Busca adaptativa acionada ao alterar qualquer filtro ou termo de busca
  useEffect(() => {
    if (isRestoredRef.current) {
      isRestoredRef.current = false;
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    async function fetchGames() {
      setLoading(true);
      setPage(1);

      // Limpa explicação da IA caso mude a busca
      if (!query.trim()) {
        setAiExplanation(null);
        setAiQueriedText("");
      }

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

          // Regras para acionamento do Curador Inteligente (IA):
          // 1. Quando for busca descritiva / intenção de estilo (não título de jogo específico)
          // 2. OU quando a busca tradicional retornar 0 resultados no catálogo
          const isIntent = isDescriptiveOrIntentQuery(query);
          const hadNoResults = items.length === 0;

          if (isAiEnabled && (isIntent || hadNoResults) && query.trim().length >= 3) {
            triggerAiRecommendation(query);
          }
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
  }, [query, selectedGenre, selectedPlatform, selectedPerspective, selectedGameMode, minRating, selectedSort, triggerAiRecommendation, isAiEnabled]);

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
    setInputValue("");
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
    sessionStorage.removeItem(SEARCH_STATE_STORAGE_KEY);
    setInputValue("");
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

  // Contagem de filtros avançados aplicados (não padrão)
  const activeCustomFiltersCount =
    (selectedPlatform !== "all" ? 1 : 0) +
    (selectedGenre !== "all" ? 1 : 0) +
    (selectedPerspective !== "all" ? 1 : 0) +
    (selectedGameMode !== "all" ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (selectedSort !== "popular" ? 1 : 0);

  // Verifica se há algum filtro não padrão ativo
  const hasActiveFilters = Boolean(query.trim() || activeCustomFiltersCount > 0);

  const activePlatformOption = findPlatformFilter(selectedPlatform);
  const activeGenreOption = findGenreFilter(selectedGenre);
  const activePerspectiveOption = findPerspectiveFilter(selectedPerspective);
  const activeGameModeOption = findGameModeFilter(selectedGameMode);

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================
          CABEÇALHO DE BUSCA COMPACTO E LIMPO
      ======================================================== */}
      <div className="rounded-[28px] bg-[#14161d]/95 border border-white/10 p-4 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden backdrop-blur-md">
        {/* Glow de ambientação no topo */}
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#00E5FF]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Título & Badge integrados */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 relative z-10">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-semibold">
              <Sparkles className="w-3 h-3 text-[#00E5FF]" /> Catálogo Completo IGDB &amp; IA Curadoria
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Explorar Jogos
            </h1>
            <p className="text-xs text-gray-400">
              Pesquise por títulos ou descreva o estilo de jogo desejado para receber recomendações inteligentes.
            </p>
          </div>
        </div>

        {/* Linha de Ação: Barra de Busca + Botão Filtros Avançados */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 relative z-10">
          {/* Campo de Busca Principal */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center group">
            <Search className="absolute left-3.5 w-4 h-4 text-cyan-400 group-focus-within:text-[#00E5FF] transition-colors pointer-events-none" />
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Pesquise por título (Elden Ring...) ou descreva o que procura (estilo souls-like, relaxante...)"
              className="w-full pl-10 pr-24 sm:pr-48 py-2.5 sm:py-3 rounded-2xl bg-[#0c0e14]/90 border border-cyan-500/30 focus:border-[#00E5FF] focus:ring-4 focus:ring-[#00E5FF]/20 text-xs sm:text-sm font-medium text-white placeholder-gray-400 focus:outline-none transition-all shadow-inner"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {loading && !isAiLoading ? (
                <div className="p-1">
                  <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" />
                </div>
              ) : inputValue ? (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="Limpar busca"
                  aria-label="Limpar busca"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : null}

              {/* Botão de Curadoria IA manual quando houver termo digitado */}
              {isAiEnabled && inputValue.trim().length >= 3 && (
                <button
                  type="button"
                  onClick={() => triggerAiRecommendation(inputValue, true)}
                  disabled={isAiLoading}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-[#00E5FF] hover:text-white font-bold text-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm"
                  title="Consultar recomendações inteligentes do Curador IA"
                >
                  {isAiLoading ? (
                    <Loader2 className="w-3.5 h-3.5 text-[#00E5FF] animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
                  )}
                  <span>{isAiLoading ? "IA Buscando..." : "Curadoria IA"}</span>
                </button>
              )}

              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#00E5FF] to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
              >
                Buscar
              </button>
            </div>
          </form>

          {/* Botão de Filtros Avançados / Customizados */}
          <button
            type="button"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-3.5 py-2.5 sm:py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border cursor-pointer active:scale-95 shadow-md flex-shrink-0 ${
              showAdvancedFilters
                ? "bg-cyan-500/20 text-[#00E5FF] border-[#00E5FF]/60 shadow-cyan-500/20"
                : activeCustomFiltersCount > 0
                ? "bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25"
                : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filtros Avançados</span>
            {activeCustomFiltersCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-[#00E5FF] text-black text-[10px] font-black leading-none">
                {activeCustomFiltersCount}
              </span>
            )}
            {showAdvancedFilters ? (
              <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>

        {/* Linha de Presets Rápidos de Descoberta (Sempre acessíveis em 1 toque) */}
        <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 relative z-10">
          <span className="text-[11px] font-semibold text-gray-400 flex items-center gap-1 flex-shrink-0 mr-1">
            <Flame className="w-3.5 h-3.5 text-cyan-400" /> Modos rápidos:
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
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-cyan-500/20 text-[#00E5FF] border border-[#00E5FF]/40 font-bold shadow-sm shadow-[#00E5FF]/20"
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
            PAINEL EXPANSÍVEL DE FILTROS AVANÇADOS / CUSTOMIZADOS
        ======================================================== */}
        {showAdvancedFilters && (
          <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-[#0c0e14]/95 border border-cyan-500/30 space-y-4 shadow-2xl relative z-10 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[#00E5FF]" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Personalizar Filtros
                </h3>
              </div>
              {activeCustomFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Redefinir tudo
                </button>
              )}
            </div>

            {/* 1. Console & Plataforma */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> Console & Plataforma:
                </span>
                <button
                  type="button"
                  onClick={() => setShowAllPlatforms(!showAllPlatforms)}
                  className="text-[11px] font-medium text-[#00E5FF] hover:text-cyan-300 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>{showAllPlatforms ? "Recolher Gerações" : "Ver Todas as Gerações"}</span>
                  {showAllPlatforms ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              </div>

              {/* Atalhos Rápidos dos Consoles Mais Populares */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
                {QUICK_POPULAR_PLATFORMS.map((plat) => {
                  const isSelected = selectedPlatform === plat.id;
                  return (
                    <button
                      key={plat.id}
                      onClick={() => handleSelectPlatform(plat.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
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

              {/* Painel Expansível de Gerações Agrupadas */}
              {showAllPlatforms && (
                <div className="mt-2 p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-3 animate-fadeIn">
                  {PLATFORM_FAMILIES.map((family) => (
                    <div key={family.family} className="space-y-1.5">
                      <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase flex items-center gap-1">
                        <Layers className="w-3 h-3 text-cyan-400" /> {family.family}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {family.platforms.map((p) => {
                          const isSelected = selectedPlatform === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleSelectPlatform(p.id)}
                              className={`px-2 py-0.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
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

            {/* 2. Gênero / Categoria */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-cyan-400" /> Gênero:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
                {GENRE_FILTER_OPTIONS.map((genre) => {
                  const isSelected = selectedGenre === genre.id;
                  return (
                    <button
                      key={genre.id}
                      onClick={() => handleSelectGenre(genre.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
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

            {/* 3. Câmera & Visão */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-amber-400" /> Câmera / Visão:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
                {PERSPECTIVE_FILTER_OPTIONS.map((p) => {
                  const isSelected = selectedPerspective === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPerspective(p.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
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

            {/* 4. Modo de Jogo */}
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" /> Modo de Jogo:
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
                {GAME_MODE_FILTER_OPTIONS.map((mode) => {
                  const isSelected = selectedGameMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleSelectGameMode(mode.id)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
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

            {/* 5. Nota Mínima & Ordenação */}
            <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Nota Mínima */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" /> Nota Mínima:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {RATING_FILTER_OPTIONS.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => handleSelectRating(item.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                        minRating === item.value
                          ? "bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20"
                          : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ordenação */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-purple-400" /> Ordem:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
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

            {/* Rodapé do Painel de Filtros */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent hover:border-red-500/20"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar filtros
              </button>

              <button
                type="button"
                onClick={() => setShowAdvancedFilters(false)}
                className="px-4 py-1.5 rounded-xl bg-[#00E5FF] hover:bg-cyan-300 text-black text-xs font-extrabold transition-all shadow-md shadow-[#00E5FF]/20 cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Ver Resultados ({totalCount > 0 ? totalCount : games.length})
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            FITA DE FILTROS ATIVOS (CHIPS RÁPIDOS PARA DESATIVAR)
        ======================================================== */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5 relative z-10">
            <span className="text-[11px] text-gray-500 font-mono mr-0.5">Ativos:</span>

            {query.trim() && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                Busca: &ldquo;{query}&rdquo;
                <button
                  onClick={handleClearSearch}
                  className="hover:text-white cursor-pointer ml-0.5"
                  title="Remover termo de busca"
                  aria-label="Remover termo de busca"
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
                  title="Remover filtro de plataforma"
                  aria-label="Remover filtro de plataforma"
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
                  title="Remover filtro de gênero"
                  aria-label="Remover filtro de gênero"
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
                  title="Remover filtro de perspectiva"
                  aria-label="Remover filtro de perspectiva"
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
                  title="Remover filtro de modo de jogo"
                  aria-label="Remover filtro de modo de jogo"
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
                  title="Remover filtro de nota"
                  aria-label="Remover filtro de nota"
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
                  title="Remover ordenação personalizada"
                  aria-label="Remover ordenação personalizada"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-300 font-semibold cursor-pointer transition-colors ml-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar tudo
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          LISTA DE RESULTADOS & PAGINAÇÃO REAL
      ======================================================== */}
      <div className="space-y-4">
        {/* Banner do Curador IA se houver explicação */}
        {aiExplanation && (
          <div className="rounded-2xl bg-gradient-to-r from-cyan-950/60 via-[#101928] to-purple-950/40 border border-[#00E5FF]/40 p-4 sm:p-5 shadow-xl relative overflow-hidden backdrop-blur-md animate-fadeIn">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#00E5FF]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-start gap-3 relative z-10">
              <div className="p-2.5 rounded-xl bg-cyan-500/20 text-[#00E5FF] border border-cyan-500/40 shrink-0 mt-0.5 shadow-md shadow-cyan-500/20">
                <Sparkles className="w-5 h-5 text-[#00E5FF] animate-pulse" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#00E5FF] flex items-center gap-1.5">
                    Curadoria Inteligente por IA
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                    Destaques com borda animada
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-200 leading-relaxed font-medium">
                  {aiExplanation}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAiExplanation(null)}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
                title="Fechar explicação"
                aria-label="Fechar explicação"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Indicador de carregamento em background da IA */}
        {isAiLoading && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#0c121e] border border-cyan-500/40 text-cyan-300 text-xs shadow-lg animate-pulse">
            <Sparkles className="w-4 h-4 text-[#00E5FF] animate-spin shrink-0" />
            <span>
              O Curador IA está analisando seu estilo de jogo para selecionar recomendações exclusivas no catálogo...
            </span>
          </div>
        )}

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
                <div
                  key={game.id}
                  id={`game-card-${game.id}`}
                  onClickCapture={() => handleCardClick(game.id)}
                  className="h-full"
                >
                  <GameCard game={game} isAiRecommended={game.isAiRecommended} />
                </div>
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
        ) : isAiLoading ? (
          <div className="rounded-[32px] border border-cyan-500/30 bg-[#121622] p-12 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-[#00E5FF] flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
              <Sparkles className="w-6 h-6 text-[#00E5FF] animate-spin" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-white">
                Consultando o Curador Inteligente...
              </h3>
              <p className="text-xs text-gray-300 max-w-md mx-auto">
                Não encontramos correspondência exata de título no catálogo. A inteligência artificial está buscando recomendações sob medida para &ldquo;<span className="text-cyan-300 font-semibold">{query}</span>&rdquo;.
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-4 shadow-2xl">
            <Search className="w-12 h-12 text-gray-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Nenhum jogo encontrado</h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto">
                Não encontramos títulos correspondentes aos filtros selecionados. Tente relaxar os filtros de gênero, console ou nota.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {isAiEnabled && query.trim().length >= 3 && (
                <button
                  type="button"
                  onClick={() => triggerAiRecommendation(query, true)}
                  className="px-5 py-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white font-bold text-xs border border-cyan-500/40 transition-all shadow-lg active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                  Buscar com Curador IA
                </button>
              )}
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-6 py-2.5 rounded-full bg-[#00E5FF] text-black font-extrabold text-xs transition-all shadow-lg shadow-[#00E5FF]/20 hover:brightness-110 active:scale-95 cursor-pointer inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar filtros e ver populares
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          BOTÃO FLUTUANTE VOLTAR AO TOPO
      ======================================================== */}
      <button
        type="button"
        onClick={handleScrollToTop}
        aria-label="Voltar ao topo"
        className={`fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#12151c]/90 hover:bg-[#1a1f2c] border border-cyan-500/40 hover:border-[#00E5FF] text-cyan-400 hover:text-white shadow-2xl shadow-cyan-500/10 backdrop-blur-md transition-all duration-300 active:scale-95 group cursor-pointer ${
          showBackToTop
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <ArrowUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 text-cyan-400 group-hover:text-white" />
        <span className="text-xs font-bold hidden sm:inline text-gray-200 group-hover:text-white">Topo</span>
      </button>
    </div>
  );
}

export function SearchPageSkeleton() {
  return (
    <div className="space-y-6 pb-12 animate-pulse">
      {/* Top Header Skeleton Compacto */}
      <div className="rounded-[28px] bg-[#14161d]/80 border border-white/10 p-4 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
        <div className="space-y-2">
          <div className="h-5 w-40 rounded-full bg-white/10" />
          <div className="h-7 w-56 rounded-xl bg-white/15" />
          <div className="h-3.5 w-72 rounded-lg bg-white/5" />
        </div>

        {/* Barra de Busca + Botão Filtros Skeleton */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="h-11 flex-1 rounded-2xl bg-white/10 border border-white/5" />
          <div className="h-11 w-36 rounded-2xl bg-white/10 shrink-0 border border-white/5" />
        </div>

        {/* Modos de Exploração Skeleton */}
        <div className="pt-2 border-t border-white/5 flex items-center gap-2 overflow-hidden py-1">
          <div className="h-6 w-24 rounded-full bg-white/5 shrink-0" />
          <div className="h-6 w-24 rounded-full bg-white/10 shrink-0" />
          <div className="h-6 w-32 rounded-full bg-white/10 shrink-0" />
          <div className="h-6 w-28 rounded-full bg-white/10 shrink-0" />
          <div className="h-6 w-24 rounded-full bg-white/10 shrink-0" />
        </div>
      </div>

      {/* Grid de Resultados Skeleton (18 cards) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="h-4 w-48 rounded bg-white/10" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((n) => (
            <div
              key={n}
              className="aspect-[3/4] rounded-2xl bg-[#18191c]/80 border border-white/10 overflow-hidden relative"
            >
              <div className="absolute inset-x-3 bottom-3 space-y-2">
                <div className="h-4 w-3/4 rounded bg-white/15" />
                <div className="h-3 w-1/2 rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchClient() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchContent />
    </Suspense>
  );
}
