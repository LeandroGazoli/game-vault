"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Game } from "@/lib/types";
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
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const searchCacheRef = useRef<Map<string, Game[]>>(new Map());

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
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Busca em tempo real com debounce e cache
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const cacheKey = trimmed.toLowerCase();
    if (searchCacheRef.current.has(cacheKey)) {
      setResults(searchCacheRef.current.get(cacheKey)!);
      setLoading(false);
      return;
    }

    setLoading(true);
    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(trimmed)}&limit=8`, {
          signal: abortController.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const items = data.games || [];
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
    }, 280);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

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
    router.push(`/game/${game.id}`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="w-full max-w-2xl rounded-2xl bg-[#101319] border border-[#262d3a] shadow-2xl overflow-hidden flex flex-col max-h-[82vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra Superior de Busca */}
        <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-[#222834] bg-[#141721]">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Buscar por título de jogo, franquia, saga..."
            className="flex-1 bg-transparent text-white placeholder:text-neutral-500 text-sm sm:text-base outline-none font-medium"
          />

          {loading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}

          {query && !loading && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-400">
            ESC
          </kbd>
        </div>

        {/* Lista de Conteúdo / Resultados */}
        <div ref={listRef} className="overflow-y-auto flex-1 p-2 space-y-1">
          {query.trim().length >= 2 ? (
            results.length > 0 ? (
              results.map((game, index) => {
                const duration = formatGameDuration(game);
                const isSelected = index === selectedIndex;
                const releaseYear = game.released ? game.released.substring(0, 4) : "";

                return (
                  <div
                    key={game.id}
                    onClick={() => handleSelectGame(game)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center justify-between gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? "bg-[#1d2331] border border-cyan-500/30 text-white shadow-sm"
                        : "hover:bg-white/5 text-neutral-300 border border-transparent"
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
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white truncate max-w-sm">
                            {game.name}
                          </h4>
                          {releaseYear && (
                            <span className="text-[11px] text-neutral-400 font-mono">
                              ({releaseYear})
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
                );
              })
            ) : !loading ? (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm text-neutral-400">Nenhum resultado encontrado para &quot;{query}&quot;</p>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push(`/search?q=${encodeURIComponent(query)}`);
                  }}
                  className="text-xs text-[#00E5FF] hover:underline font-mono"
                >
                  Tentar busca avançada no catálogo completo →
                </button>
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
    </div>
  );
}
