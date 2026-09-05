"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getGameUrl } from "@/lib/routes";
import { Game, SystemSettings } from "@/lib/types";
import {
  isDescriptiveOrIntentQuery,
  AI_SEARCH_DEBOUNCE_MS,
  MIN_AI_QUERY_LENGTH,
} from "@/lib/searchUtils";
import {
  Search,
  Loader2,
  X,
  Clock,
  Sparkles,
  Calendar,
  Flame,
  ArrowRight,
  Languages,
  Trophy,
} from "lucide-react";
import MetacriticBadge from "./MetacriticBadge";
import { formatGameDuration, formatGenreName } from "@/lib/gameUtils";

export function openSpotlightSearch() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-spotlight"));
  }
}

const TRENDING_SUGGESTIONS = [
  { label: "Grand Theft Auto VI", query: "Grand Theft Auto VI" },
  { label: "Elden Ring", query: "Elden Ring" },
  { label: "The Witcher 3: Wild Hunt", query: "The Witcher 3" },
  { label: "God of War Ragnarök", query: "God of War Ragnarok" },
  { label: "Baldur's Gate 3", query: "Baldur's Gate 3" },
  { label: "Resident Evil", query: "Resident Evil" },
];

export default function SpotlightSearchModal() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Estados do Curador Gamer por Inteligência Artificial
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiQueriedText, setAiQueriedText] = useState<string>("");
  const [isAiEnabled, setIsAiEnabled] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchCacheRef = useRef<Map<string, Game[]>>(new Map());
  const aiDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiQueriedTextRef = useRef<string>("");
  const aiAbortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Fecha o modal automaticamente ao navegar para qualquer página
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Trava o scroll do body quando o modal de busca estiver ativo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escuta atalhos globais (Cmd+K / Ctrl+K / "/") e evento customizado
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (
        e.key === "/" &&
        !isOpen &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    }

    const openHandler = () => setIsOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-spotlight", openHandler);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-spotlight", openHandler);
    };
  }, [isOpen]);

  // Foca no input ao abrir
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      setSelectedIndex(0);
    } else {
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
      setAiQueriedText("");
      aiQueriedTextRef.current = "";
    }
  }, [isOpen]);

  const triggerAiRecommendation = async (searchPrompt: string, force = false) => {
    const text = searchPrompt.trim();
    if (!text || text.length < MIN_AI_QUERY_LENGTH) return;
    if (!isAiEnabled) return;

    if (!force && aiQueriedTextRef.current === text.toLowerCase()) return;

    if (aiAbortControllerRef.current) {
      aiAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    aiAbortControllerRef.current = controller;

    setIsAiLoading(true);
    aiQueriedTextRef.current = text.toLowerCase();
    setAiQueriedText(text.toLowerCase());

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
        signal: controller.signal,
      });

      if (res.ok) {
        const data = await res.json();
        const recommended: Game[] = (data.games || []).map((g: Game) => ({
          ...g,
          isAiRecommended: true,
          aiExplanation: data.explanation,
        }));

        if (recommended.length > 0) {
          setAiExplanation(data.explanation || null);

          setResults((prev) => {
            const aiIds = new Set(recommended.map((g) => g.id));
            const existingUpdated = prev.map((g) =>
              aiIds.has(g.id) ? { ...g, isAiRecommended: true, aiExplanation: data.explanation } : g
            );
            const existingIds = new Set(existingUpdated.map((g) => g.id));
            const newAiGames = recommended.filter((g) => !existingIds.has(g.id));
            return [...newAiGames, ...existingUpdated];
          });
          setSelectedIndex(0);
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.warn("Curador IA não disponível para spotlight:", err);
      }
    } finally {
      if (aiAbortControllerRef.current === controller) {
        setIsAiLoading(false);
      }
    }
  };

  // Busca em tempo real com debounce e cache
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      setAiExplanation(null);
      setAiQueriedText("");
      aiQueriedTextRef.current = "";
      if (aiDebounceTimerRef.current) {
        clearTimeout(aiDebounceTimerRef.current);
        aiDebounceTimerRef.current = null;
      }
      return;
    }

    const isIntent = isDescriptiveOrIntentQuery(trimmed);

    // 1. Se já está no cache local do catálogo:
    const cacheKey = trimmed.toLowerCase();
    if (searchCacheRef.current.has(cacheKey)) {
      const cached = searchCacheRef.current.get(cacheKey)!;
      setResults(cached);
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
          items = data.games || [];
          searchCacheRef.current.set(cacheKey, items);
          setResults(items);
          setSelectedIndex(0);
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.error("Erro na busca spotlight:", err);
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

      // Se encontrou jogos e NÃO é intenção descritiva, cancela a busca por IA
      if (!isIntent && items.length > 0) {
        return;
      }

      // Proteção de digitação: Só agenda a IA após 1200ms de inatividade do usuário sem teclar
      if (isAiEnabled && (isIntent || items.length === 0) && trimmed.length >= MIN_AI_QUERY_LENGTH) {
        aiDebounceTimerRef.current = setTimeout(() => {
          triggerAiRecommendation(trimmed);
        }, AI_SEARCH_DEBOUNCE_MS);
      }
    }, 280);

    return () => {
      clearTimeout(timer);
      abortController.abort();
      if (aiDebounceTimerRef.current) {
        clearTimeout(aiDebounceTimerRef.current);
      }
    };
  }, [query, isAiEnabled]);

  // Navegação por teclado
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleSelectGame(results[selectedIndex]);
      } else if (query.trim()) {
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleSelectGame = (game: Game) => {
    setIsOpen(false);
    router.push(getGameUrl(game));
  };

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[max(env(safe-area-inset-top,0px)+10px,1rem)] sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#101319] border border-[#262d3a] shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior de Busca */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-3.5 border-b border-[#222834] bg-[#141721]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar por título ou descrever o que procura (ex: estilo souls-like)..."
            className="flex-1 bg-transparent text-white placeholder:text-neutral-500 text-sm sm:text-base outline-none font-medium min-w-0"
          />

          {isAiLoading ? (
            <div className="flex items-center gap-1 text-[11px] text-[#00E5FF] font-semibold animate-pulse shrink-0">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              <span className="hidden sm:inline">IA pensando...</span>
            </div>
          ) : loading ? (
            <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
          ) : null}

          {/* Botão de Curadoria IA manual quando houver termo digitado */}
          {isAiEnabled && query.trim().length >= 3 && (
            <button
              type="button"
              onClick={() => {
                if (aiDebounceTimerRef.current) {
                  clearTimeout(aiDebounceTimerRef.current);
                  aiDebounceTimerRef.current = null;
                }
                triggerAiRecommendation(query, true);
              }}
              disabled={isAiLoading}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/40 text-[#00E5FF] hover:text-white text-xs font-bold transition-all shrink-0 cursor-pointer disabled:opacity-50"
              title="Buscar recomendações com Curador IA"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-pulse" />
              <span className="hidden sm:inline">Curadoria IA</span>
            </button>
          )}

          {query && !loading && !isAiLoading && (
            <button
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
                setAiQueriedText("");
                aiQueriedTextRef.current = "";
                setIsAiLoading(false);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Limpar busca"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-400 shrink-0">
            ESC
          </kbd>

          {/* Botão Fechar Modal Dedicado (Sempre visível no mobile e desktop) */}
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white transition-all text-xs font-semibold shrink-0 cursor-pointer active:scale-95"
            title="Fechar busca"
            aria-label="Fechar busca"
          >
            <X className="w-4 h-4 text-neutral-300" />
            <span className="sm:hidden text-xs">Fechar</span>
          </button>
        </div>

        {/* Lista de Conteúdo / Resultados */}
        <div ref={listRef} className="overflow-y-auto flex-1 p-2 space-y-1">
          {/* Banner de Justificativa / Curadoria IA */}
          {aiExplanation && (
            <div className="mx-1 mb-2 p-3 rounded-xl bg-gradient-to-r from-cyan-950/70 via-[#121927] to-purple-950/50 border border-cyan-500/40 flex items-start gap-2.5 text-xs text-cyan-200 animate-fadeIn">
              <Sparkles className="w-4 h-4 text-[#00E5FF] shrink-0 mt-0.5 animate-pulse" />
              <div className="space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px] text-[#00E5FF]">
                  <span>Curadoria Inteligente por IA</span>
                  <span className="text-gray-400 font-normal lowercase">(em destaque)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-200">{aiExplanation}</p>
              </div>
              <button
                type="button"
                onClick={() => setAiExplanation(null)}
                className="text-neutral-400 hover:text-white p-0.5 cursor-pointer rounded hover:bg-white/10"
                title="Fechar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Indicador de carregamento em background da IA */}
          {isAiLoading && results.length > 0 && (
            <div className="mx-1 mb-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] font-medium flex items-center gap-2 animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[#00E5FF] animate-spin shrink-0" />
              <span>Curador IA analisando recomendações para enriquecer sua busca...</span>
            </div>
          )}

          {query.trim().length >= 2 ? (
            results.length > 0 ? (
              results.map((game, index) => {
                const isAi = Boolean(game.isAiRecommended);
                const duration = formatGameDuration(game);
                const isSelected = index === selectedIndex;
                const releaseYear = game.released ? game.released.substring(0, 4) : "";

                return (
                  <div
                    key={`${game.id}-${isAi ? "ai" : "std"}`}
                    className={isAi ? "ai-card-wrapper my-1.5" : "my-0.5"}
                  >
                    {isAi && <div className="ai-card-border-beam" />}
                    <div
                      onClick={() => handleSelectGame(game)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`relative flex items-center justify-between gap-3 p-2.5 ${
                        isAi ? "rounded-[12px] bg-[#121622] hover:bg-[#161c2c]" : "rounded-xl hover:bg-white/5"
                      } cursor-pointer transition-all ${
                        isSelected
                          ? isAi
                            ? "bg-[#182033] shadow-md"
                            : "bg-[#1d2331] border border-cyan-500/30 text-white shadow-sm"
                          : isAi
                          ? "text-neutral-200"
                          : "text-neutral-300 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative w-11 h-14 aspect-[3/4] rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                          {game.background_image ? (
                            <img
                              src={game.background_image}
                              alt={game.name}
                              className="w-full h-full object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0 space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-white truncate max-w-sm">
                              {game.name}
                            </h4>
                            {releaseYear && (
                              <span className="text-[11px] text-neutral-400 font-mono">
                                ({releaseYear})
                              </span>
                            )}
                            {isAi && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[#00E5FF] text-[9px] font-black uppercase tracking-wider border border-cyan-500/40">
                                <Sparkles className="w-2.5 h-2.5 text-[#00E5FF] animate-pulse" />
                                Curadoria IA
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono">
                            {game.genres && game.genres[0] && (
                              <span className="px-1.5 py-0.2 rounded bg-white/5 border border-white/10 text-neutral-300 font-bold uppercase text-[9px]">
                                {formatGenreName(game.genres[0].name)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-cyan-400" />
                              {duration.text}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {game.metacritic && <MetacriticBadge score={game.metacritic} size="sm" />}
                        <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? "translate-x-1 text-[#00E5FF]" : "text-neutral-500"}`} />
                      </div>
                    </div>
                  </div>
                );
              })
            ) : isAiLoading ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-[#00E5FF] flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
                  <Sparkles className="w-5 h-5 text-[#00E5FF] animate-spin" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-white">Consultando o Curador Inteligente...</p>
                  <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                    Buscando recomendações sob medida para &ldquo;<span className="text-cyan-300 font-semibold">{query}</span>&rdquo;.
                  </p>
                </div>
              </div>
            ) : !loading ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm text-neutral-400">Nenhum resultado encontrado para &quot;{query}&quot;</p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {isAiEnabled && query.trim().length >= 3 && (
                    <button
                      type="button"
                      onClick={() => triggerAiRecommendation(query, true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00E5FF] font-bold text-xs border border-cyan-500/40 transition-all cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                      Buscar com Curador IA
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
                  >
                    <span>Abrir busca avançada</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : null
          ) : (
            /* Estado Inicial: Sugestões e Atalhos Rápidos */
            <div className="p-3 space-y-4">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 tracking-wider px-2 block mb-2">
                  🔥 Buscas Populares
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {TRENDING_SUGGESTIONS.map((item) => (
                    <button
                      key={item.label}
                      onClick={() => setQuery(item.query)}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs text-left transition-colors border border-white/5"
                    >
                      <span className="truncate">{item.label}</span>
                      <ArrowRight className="w-3 h-3 text-neutral-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-white/5">
                <span className="text-[10px] uppercase font-mono font-bold text-neutral-500 tracking-wider px-2 block mb-2">
                  ⚡ Atalhos do Vault
                </span>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <Link
                    href="/calendar"
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-colors flex flex-col items-center gap-1.5"
                  >
                    <Calendar className="w-4 h-4 text-[#00E5FF]" />
                    <span>Calendário</span>
                  </Link>

                  <Link
                    href="/rankings"
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-colors flex flex-col items-center gap-1.5"
                  >
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>Rankings</span>
                  </Link>

                  <Link
                    href="/search?q=dublado"
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-colors flex flex-col items-center gap-1.5"
                  >
                    <Languages className="w-4 h-4 text-emerald-400" />
                    <span>Dublados</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé Informativo */}
        <div className="px-4 py-2.5 bg-[#0e1015] border-t border-[#222834] flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <div className="flex items-center gap-3">
            <span>↑↓ navegar</span>
            <span>↵ selecionar</span>
            <span>esc fechar</span>
          </div>

          <Link
            href={query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search"}
            onClick={() => setIsOpen(false)}
            className="text-[#00E5FF] hover:underline font-bold flex items-center gap-1"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
