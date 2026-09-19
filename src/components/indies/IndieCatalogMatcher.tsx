"use client";

import React, { useState, useEffect, useRef } from "react";
import { Search, Loader2, Link as LinkIcon, Check, X, Gamepad2 } from "lucide-react";
import { Game } from "@/lib/types";
import { getGameUrl } from "@/lib/routes";
import { Download } from "lucide-react";

interface IndieCatalogMatcherProps {
  linkedGameId?: number | string | null;
  linkedGameName?: string | null;
  linkedGameSlug?: string | null;
  onSelectGame: (game: { id: number | string; name: string; slug?: string } | null) => void;
  onImportGameData?: (gameDetails: any) => void;
  defaultSearchTitle?: string;
}

export default function IndieCatalogMatcher({
  linkedGameId,
  linkedGameName,
  linkedGameSlug,
  onSelectGame,
  onImportGameData,
  defaultSearchTitle = "",
}: IndieCatalogMatcherProps) {
  const [searchTerm, setSearchTerm] = useState(defaultSearchTitle);
  const [searchResults, setSearchResults] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const performSearch = async (term: string) => {
    const query = term.trim();
    if (!query || query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=6`);
      if (res.ok) {
        const data = (await res.json()) as { games?: Game[] };
        setSearchResults(data.games || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Erro ao buscar jogos na API para vincular:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (val: string) => {
    setSearchTerm(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(val);
    }, 400);
  };

  const handleImportDetails = async () => {
    if (!linkedGameId || !onImportGameData) return;
    setIsImporting(true);
    try {
      const res = await fetch(`/api/games/${linkedGameId}`);
      if (res.ok) {
        const fullGame = (await res.json()) as any;
        onImportGameData(fullGame);
      } else {
        alert("Não foi possível carregar os detalhes do jogo na API.");
      }
    } catch (err) {
      console.error("Erro ao importar detalhes do jogo IGDB:", err);
      alert("Erro ao importar dados do IGDB.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="space-y-3 p-4 rounded-2xl bg-black/30 border border-white/10">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="text-xs font-bold text-gray-300 flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>Vincular ao Catálogo Principal (IGDB / RAWG / Vault)</span>
        </label>
        <span className="text-[10px] font-mono text-gray-400">
          Opcional • Sincroniza backlog, notas e tempo de jogo
        </span>
      </div>

      {/* Jogo Atualmente Vinculado */}
      {linkedGameId ? (
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
              <Gamepad2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-cyan-300 truncate">
                {linkedGameName || `Jogo #${linkedGameId}`}
              </p>
              <p className="text-[10px] text-gray-400 font-mono">
                ID IGDB: {linkedGameId} {linkedGameSlug ? `• slug: ${linkedGameSlug}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onImportGameData && (
              <button
                type="button"
                onClick={handleImportDetails}
                disabled={isImporting}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copiar dados do IGDB para a ficha (capa, sinopse, plataformas, gêneros)"
              >
                {isImporting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Download className="w-3 h-3" />
                )}
                <span>Copiar dados IGDB</span>
              </button>
            )}
            <a
              href={getGameUrl({ id: linkedGameId, name: linkedGameName, slug: linkedGameSlug })}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-cyan-400 hover:underline"
            >
              Ver Ficha
            </a>
            <button
              type="button"
              onClick={() => onSelectGame(null)}
              className="p-1 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
              title="Remover vínculo"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="Buscar título no catálogo de jogos da API..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            {isSearching && (
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin absolute right-3 top-3" />
            )}
          </div>

          {/* Sugestões encontradas */}
          {searchResults.length > 0 && (
            <div className="divide-y divide-white/5 rounded-xl bg-[#101217] border border-white/10 overflow-hidden shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    onSelectGame({ id: game.id, name: game.name, slug: (game as any).slug });
                    setSearchResults([]);
                  }}
                  className="p-2.5 flex items-center justify-between gap-3 hover:bg-white/5 cursor-pointer transition-colors text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {game.background_image ? (
                      <img
                        src={game.background_image}
                        alt={game.name}
                        className="w-8 h-10 rounded object-cover border border-white/10 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-10 rounded bg-white/5 flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-4 h-4 text-gray-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{game.name}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        {game.released ? new Date(game.released).getFullYear() : "N/A"}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black font-bold text-[10px] transition-colors shrink-0"
                  >
                    Vincular
                  </button>
                </div>
              ))}
            </div>
          )}

          {hasSearched && !isSearching && searchResults.length === 0 && searchTerm.trim().length >= 2 && (
            <p className="text-[11px] text-gray-500 italic px-1">
              Nenhum jogo encontrado na base IGDB com este nome. O jogo indie funcionará de forma independente sem vínculo.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
