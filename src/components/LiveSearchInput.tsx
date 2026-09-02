"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Game } from "@/lib/types";
import GameModal from "./GameModal";
import Link from "next/link";
import { Search, Loader2, Plus, Check, Star, ArrowRight, X } from "lucide-react";
import { useGameLibrary } from "@/context/GameLibraryContext";

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

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/games/search?q=${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setResults((data.games || []).slice(0, 6));
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Erro na busca instantânea:", err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
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
      <div ref={containerRef} className={`relative w-full ${className}`}>
        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
          <Search
            className={`text-gray-400 absolute left-4 pointer-events-none ${
              isHero ? "w-5 h-5" : "w-4 h-4"
            }`}
          />
          <input
            type="text"
            value={query}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
            className={`w-full text-white placeholder-gray-400 focus:outline-none transition-all ${
              isHero
                ? "pl-12 pr-32 py-3.5 rounded-full bg-white/10 border border-white/15 focus:border-[#00E5FF] shadow-2xl text-sm"
                : "pl-10 pr-10 py-2 rounded-full bg-white/10 border border-white/10 focus:border-[#00E5FF] focus:bg-white/15 text-sm"
            }`}
          />

          {/* Botão de Limpar ou Loading Spinner */}
          <div className="absolute right-3 flex items-center gap-1.5">
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
                className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}

            {isHero && (
              <button
                type="submit"
                className="px-5 py-2 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all shadow-md ml-1"
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
          <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-[#18191c] border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl animate-fadeIn divide-y divide-white/5">
            {results.length === 0 && !loading ? (
              <div className="p-4 text-center text-xs text-gray-400">
                Nenhum jogo encontrado para &quot;{query}&quot;. Pressione Enter para buscar.
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
                        className="group flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedGame(game);
                          setIsOpen(false);
                        }}
                      >
                        {/* Capa + Informações */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-13 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0">
                            {game.background_image ? (
                              <img
                                src={game.background_image}
                                alt={game.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-500">
                                --
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00E5FF] truncate transition-colors">
                              {game.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono mt-0.5">
                              {releaseYear && <span>{releaseYear}</span>}
                              {game.genres && game.genres[0] && (
                                <>
                                  <span>•</span>
                                  <span className="truncate">{game.genres[0].name}</span>
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
                              e.stopPropagation();
                              setSelectedGame(game);
                              setIsOpen(false);
                            }}
                            className={`p-1.5 rounded-full transition-all ${
                              userGame
                                ? "bg-[#00E5FF]/20 text-[#00E5FF]"
                                : "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                            }`}
                            title={userGame ? "Na sua biblioteca" : "Adicionar à lista"}
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
