"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Game } from "@/lib/types";
import GameModal from "./GameModal";
import Link from "next/link";
import { Search, Loader2, Plus, Check, Star, ArrowRight, X } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { formatPlatformShort } from "@/lib/platformUtils";

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

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchCacheRef = useRef<Map<string, Game[]>>(new Map());

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
      return;
    }

    // 1. Responde instantaneamente se já foi buscado nesta sessão
    const cacheKey = trimmed.toLowerCase();
    if (searchCacheRef.current.has(cacheKey)) {
      setResults(searchCacheRef.current.get(cacheKey)!);
      setIsOpen(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    const abortController = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(trimmed)}`, {
          signal: abortController.signal,
        });
        if (res.ok) {
          const data = await res.json();
          const items = (data.games || []).slice(0, 6);
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
    }, 350);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

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

          {/* Atalho de Teclado, Botão de Limpar ou Loading Spinner */}
          <div className="absolute right-3 flex items-center gap-1.5">
            {!query && !loading && !isHero && (
              <div className="hidden xl:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 pointer-events-none">
                <span className="text-[9px]">⌘</span>K
              </div>
            )}

            {loading ? (
              <Loader2 className="w-4 h-4 text-[#00E5FF] animate-spin" />
            ) : query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
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
          <div className="absolute top-full left-0 right-0 mt-2 z-[60] rounded-2xl bg-[#14161f]/95 border border-cyan-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden backdrop-blur-2xl animate-fadeIn divide-y divide-white/5">
            {results.length === 0 && !loading ? (
              <div className="p-4 text-center text-xs text-gray-400">
                Nenhum jogo encontrado para &quot;{query}&quot;. Pressione Enter para ver todos.
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
                        className="group flex items-center justify-between gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                        onClick={() => {
                          setIsOpen(false);
                          router.push(`/game/${game.id}`);
                        }}
                        title={`Abrir página de ${game.name}`}
                      >
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
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E5FF] truncate transition-colors">
                              {game.name}
                            </h4>
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
