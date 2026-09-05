"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Game } from "@/lib/types";
import GameModal from "./GameModal";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import { Search, Loader2, Plus, Check, Star, ArrowRight, X, Sparkles } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { formatPlatformShort } from "@/lib/platformUtils";
import {
  isDescriptiveOrIntentQuery,
  AI_SEARCH_DEBOUNCE_MS,
  MIN_AI_QUERY_LENGTH,
} from "@/lib/searchUtils";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SystemSettings } from "@/lib/types";

interface LiveSearchInputProps {
  placeholder?: string;
  variant?: "navbar" | "hero";
  className?: string;
}

export default function LiveSearchInput({
  placeholder = "Buscar jogos...",
  variant = "navbar",
  className = "",
}: LiveSearchInputProps) {
  const router = useRouter();
  const { getGameInLibrary } = useGameLibrary();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  // IA Recommendations State
  const [isAiEnabled, setIsAiEnabled] = useState(true);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiQueriedText, setAiQueriedText] = useState("");
  const aiAbortControllerRef = useRef<AbortController | null>(null);
  const aiDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiQueriedTextRef = useRef<string>("");

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchCacheRef = useRef<Map<string, Game[]>>(new Map());

  // Observa feature flag de IA em tempo real do Firestore
  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, "system", "settings"), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SystemSettings;
          setIsAiEnabled(data.features?.aiRecommendations !== false);
        }
      });
      return () => unsub();
    } catch (e) {
      console.error("Erro ao escutar configurações no LiveSearchInput:", e);
    }
  }, []);

  // Dispara a Curadoria Inteligente com Gemini
  const triggerAiRecommendation = async (promptText: string, force = false) => {
    const trimmed = promptText.trim();
    if (!trimmed || trimmed.length < MIN_AI_QUERY_LENGTH || !isAiEnabled) return;
    if (!force && aiQueriedTextRef.current === trimmed.toLowerCase()) return;

    if (aiAbortControllerRef.current) {
      aiAbortControllerRef.current.abort();
    }
    const abortController = new AbortController();
    aiAbortControllerRef.current = abortController;

    setIsAiLoading(true);
    aiQueriedTextRef.current = trimmed.toLowerCase();
    setAiQueriedText(trimmed);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
        signal: abortController.signal,
      });

      if (!res.ok) throw new Error("Falha na recomendação IA");
      const data = await res.json();

      if (Array.isArray(data.games) && data.games.length > 0) {
        setAiExplanation(data.explanation || null);
        const markedAiGames: Game[] = data.games.map((g: Game) => ({
          ...g,
          isAiRecommended: true,
          aiExplanation: data.explanation,
        }));

        setResults((prev) => {
          const existingIds = new Set(markedAiGames.map((g) => g.id));
          const filteredPrev = prev.filter((g) => !existingIds.has(g.id));
          return [...markedAiGames, ...filteredPrev];
        });
        setIsOpen(true);
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Curadoria IA ignorada ou indisponível:", err);
      }
    } finally {
      if (aiAbortControllerRef.current === abortController) {
        setIsAiLoading(false);
      }
    }
  };

  // Atalho global: Cmd+K / Ctrl+K ou "/" para focar rapidamente na busca
  useEffect(() => {
    function handleGlobalKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }

    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  // Debounced search com cancelamento via AbortController e cache no cliente
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 3) {
      setResults([]);
      setLoading(false);
      setAiExplanation(null);
      setIsAiLoading(false);
      setAiQueriedText("");
      aiQueriedTextRef.current = "";
      if (aiDebounceTimerRef.current) {
        clearTimeout(aiDebounceTimerRef.current);
        aiDebounceTimerRef.current = null;
      }
      return;
    }

    const isIntent = isDescriptiveOrIntentQuery(trimmed);

    // 1. Responde instantaneamente se já foi buscado nesta sessão
    const cacheKey = trimmed.toLowerCase();
    if (searchCacheRef.current.has(cacheKey)) {
      const cached = searchCacheRef.current.get(cacheKey)!;
      setResults(cached);
      setIsOpen(true);
      setLoading(false);

      if (aiDebounceTimerRef.current) {
        clearTimeout(aiDebounceTimerRef.current);
        aiDebounceTimerRef.current = null;
      }

      // Se achou jogos normais e não é intenção descritiva, a IA NÃO é chamada
      if (!isIntent && cached.length > 0) {
        return;
      }

      if (isAiEnabled && (isIntent || cached.length === 0) && trimmed.length >= MIN_AI_QUERY_LENGTH) {
        aiDebounceTimerRef.current = setTimeout(() => {
          triggerAiRecommendation(trimmed);
        }, AI_SEARCH_DEBOUNCE_MS);
      }
      return;
    }

    setLoading(true);
    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      let items: Game[] = [];
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(trimmed)}&limit=8`, {
          signal: abortController.signal,
        });
        if (res.ok) {
          const data = await res.json();
          items = (data.games || []).slice(0, 6);
          searchCacheRef.current.set(cacheKey, items);
          setResults(items);
          setIsOpen(true);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Erro na busca instantânea:", err);
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }

      // Limpa qualquer timer de IA agendado antes
      if (aiDebounceTimerRef.current) {
        clearTimeout(aiDebounceTimerRef.current);
        aiDebounceTimerRef.current = null;
      }

      // Se encontrou jogos no catálogo e NÃO é intenção descritiva, cancela busca por IA
      if (!isIntent && items.length > 0) {
        return;
      }

      // Proteção de digitação: Só agenda a IA após 1200ms de inatividade sem novas teclas
      if (isAiEnabled && (isIntent || items.length === 0) && trimmed.length >= MIN_AI_QUERY_LENGTH) {
        aiDebounceTimerRef.current = setTimeout(() => {
          triggerAiRecommendation(trimmed);
        }, AI_SEARCH_DEBOUNCE_MS);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      abortController.abort();
      if (aiDebounceTimerRef.current) {
        clearTimeout(aiDebounceTimerRef.current);
      }
    };
  }, [query, isAiEnabled]);

  // Fecha o dropdown ao clicar fora ou ao pressionar Esc
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (aiDebounceTimerRef.current) {
      clearTimeout(aiDebounceTimerRef.current);
      aiDebounceTimerRef.current = null;
    }
    if (query.trim()) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const isHero = variant === "hero";

  return (
    <>
      <div ref={containerRef} className={`relative w-full group ${className}`}>
        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
          <Search
            className={`absolute pointer-events-none transition-colors ${
              isHero
                ? "left-4 w-5 h-5 text-cyan-400 group-focus-within:text-[#00E5FF]"
                : "left-3.5 w-4 h-4 text-[#00E5FF] group-focus-within:text-cyan-300"
            }`}
          />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={`w-full text-white placeholder-gray-400 focus:outline-none transition-all ${
              isHero
                ? "pl-12 pr-32 py-3.5 rounded-full bg-[#12141a]/95 border-2 border-cyan-500/35 focus:border-[#00E5FF] focus:ring-4 focus:ring-[#00E5FF]/20 shadow-2xl text-sm font-medium"
                : "pl-10 pr-14 py-2 rounded-full bg-[#14161f]/90 border border-cyan-500/30 hover:border-cyan-400/60 focus:border-[#00E5FF] focus:bg-[#181a26] focus:ring-2 focus:ring-[#00E5FF]/20 focus:shadow-[0_0_20px_rgba(0,229,255,0.2)] text-xs sm:text-sm font-medium shadow-inner"
            }`}
          />

          {/* Atalho de Teclado, Curadoria IA, Botão de Limpar ou Loading Spinner */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {!query && !loading && !isHero && (
              <div className="hidden xl:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 pointer-events-none">
                <span className="text-[9px]">⌘</span>K
              </div>
            )}

            {/* Botão de Curadoria IA */}
            {isAiEnabled && query.trim().length >= 3 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (aiDebounceTimerRef.current) {
                    clearTimeout(aiDebounceTimerRef.current);
                    aiDebounceTimerRef.current = null;
                  }
                  triggerAiRecommendation(query, true);
                }}
                className={`p-1 rounded-full transition-all flex items-center justify-center ${
                  isAiLoading
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse"
                    : "text-purple-400 hover:text-purple-200 hover:bg-purple-500/20"
                }`}
                title="Curadoria Inteligente por IA"
              >
                <Sparkles className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
              </button>
            )}

            {loading ? (
              <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  if (aiDebounceTimerRef.current) {
                    clearTimeout(aiDebounceTimerRef.current);
                    aiDebounceTimerRef.current = null;
                  }
                  if (aiAbortControllerRef.current) {
                    aiAbortControllerRef.current.abort();
                  }
                  setQuery("");
                  setResults([]);
                  setAiExplanation(null);
                  setIsAiLoading(false);
                  setAiQueriedText("");
                  aiQueriedTextRef.current = "";
                  setIsOpen(false);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Limpar busca"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}

            {isHero && (
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-gradient-to-r from-[#00E5FF] to-cyan-400 hover:from-cyan-300 hover:to-cyan-200 text-black font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/25 active:scale-95 ml-1"
              >
                Buscar
              </button>
            )}
          </div>
        </form>

        {/* ==========================================
            POPUP DE AUTOCOMPLETE / PRÉVIA AO VIVO
        ========================================== */}
        {isOpen && query.trim().length >= 2 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-[60] rounded-2xl bg-[#0e1118] border border-cyan-500/40 shadow-[0_20px_60px_rgba(0,0,0,0.98)] ring-1 ring-white/10 overflow-hidden animate-fadeIn divide-y divide-white/10">
            {/* Banner da Explicação IA */}
            {aiExplanation && (
              <div className="p-3 bg-gradient-to-r from-purple-950/60 via-indigo-950/40 to-black/60 border-b border-purple-500/30 flex items-start gap-2 text-xs">
                <Sparkles className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-[10px] text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                    Curadoria Inteligente por IA
                  </p>
                  <p className="text-[11px] text-purple-200/90 leading-relaxed mt-0.5">
                    {aiExplanation}
                  </p>
                </div>
              </div>
            )}

            {/* Aviso de busca IA em andamento */}
            {isAiLoading && results.length > 0 && !aiExplanation && (
              <div className="px-3 py-1.5 bg-purple-950/20 border-b border-purple-500/20 text-[11px] text-purple-300/90 flex items-center gap-2 animate-pulse">
                <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                <span>Consultando curadoria com IA...</span>
              </div>
            )}

            {results.length === 0 && !loading ? (
              <div className="p-4 text-center text-xs text-gray-400">
                {isAiLoading ? (
                  <div className="flex items-center justify-center gap-2 text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                    <span>Consultando Curadoria Inteligente com IA...</span>
                  </div>
                ) : (
                  <span>Nenhum jogo encontrado para &quot;{query}&quot;. Pressione Enter para ver todos.</span>
                )}
              </div>
            ) : (
              <div>
                <div className="p-2 space-y-1">
                  {results.map((game) => {
                    const userGame = getGameInLibrary(game.id);
                    const releaseYear = game.released ? game.released.substring(0, 4) : "";

                    return (
                      <div
                        key={game.id}
                        className={`group relative flex items-center justify-between gap-3 p-2.5 rounded-xl transition-all cursor-pointer ${
                          game.isAiRecommended
                            ? "ai-card-wrapper bg-[#120e24]/90 border border-purple-500/40 hover:border-purple-400/80 shadow-[0_0_15px_rgba(168,85,247,0.15)] mb-1"
                            : "hover:bg-white/10"
                        }`}
                        onClick={() => {
                          setIsOpen(false);
                          router.push(getGameUrl(game));
                        }}
                        title={`Abrir página de ${game.name}`}
                      >
                        {game.isAiRecommended && (
                          <div className="ai-card-border-beam rounded-xl" />
                        )}

                        {/* Capa + Informações */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className="w-10 h-13 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 group-hover:border-cyan-500/50 flex-shrink-0 transition-colors shadow-sm">
                            {game.background_image ? (
                              <img
                                src={game.background_image}
                                alt={game.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-500">
                                --
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className={`text-xs sm:text-sm font-bold truncate transition-colors ${
                                game.isAiRecommended
                                  ? "text-purple-200 group-hover:text-purple-100"
                                  : "text-white group-hover:text-[#00E5FF]"
                              }`}>
                                {game.name}
                              </h4>
                              {game.isAiRecommended && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 shrink-0">
                                  <Sparkles className="w-2.5 h-2.5 text-purple-400" />
                                  Curadoria IA
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-mono mt-0.5 flex-wrap">
                              {releaseYear && <span>{releaseYear}</span>}
                              {game.platforms && game.platforms.length > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-cyan-300 font-medium">
                                    {game.platforms.slice(0, 2).map((p) => formatPlatformShort(p.platform.name)).join(", ")}
                                    {game.platforms.length > 2 ? ` +${game.platforms.length - 2}` : ""}
                                  </span>
                                </>
                              )}
                              {game.genres && game.genres[0] && (
                                <>
                                  <span>•</span>
                                  <span className="truncate text-gray-400">{game.genres[0].name}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Badges e Ação Rápida */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {game.metacritic && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              {game.metacritic}%
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedGame(game);
                              setIsOpen(false);
                            }}
                            className={`p-1.5 rounded-full transition-all ${
                              userGame
                                ? "bg-[#00E5FF]/20 text-[#00E5FF]"
                                : "bg-white/10 hover:bg-[#00E5FF]/20 text-gray-300 hover:text-[#00E5FF]"
                            }`}
                            title={userGame ? "Na sua biblioteca (clique para gerenciar)" : "Adicionar à biblioteca rápido"}
                          >
                            {userGame ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Plus className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Rodapé: Ver todos os resultados */}
                <Link
                  href={`/search?q=${encodeURIComponent(query.trim())}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full p-2.5 bg-white/[0.03] hover:bg-white/10 flex items-center justify-center gap-2 text-xs font-semibold text-[#00E5FF] hover:text-white transition-colors border-t border-white/5"
                >
                  <span>Ver todos os resultados para &quot;{query}&quot;</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para configurar o jogo clicado */}
      <GameModal
        game={selectedGame}
        isOpen={Boolean(selectedGame)}
        onClose={() => setSelectedGame(null)}
      />
    </>
  );
}
