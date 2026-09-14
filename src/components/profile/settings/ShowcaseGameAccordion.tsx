"use client";

import React, { useState, useMemo } from "react";
import { Star, ChevronDown, Search, Gamepad2, Check } from "lucide-react";
import { UserGame } from "@/lib/types";

interface ShowcaseGameAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  showcaseGameId: number | null;
  setShowcaseGameId: (id: number | null) => void;
  games: UserGame[];
}

export default function ShowcaseGameAccordion({
  isOpen,
  onToggle,
  showcaseGameId,
  setShowcaseGameId,
  games,
}: ShowcaseGameAccordionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const currentGame = useMemo(() => {
    if (!showcaseGameId) return null;
    return games.find((g) => Number(g.gameId) === Number(showcaseGameId)) || null;
  }, [showcaseGameId, games]);

  const filteredGames = useMemo(() => {
    if (!searchTerm.trim()) return games.slice(0, 6);
    return games
      .filter((g) => g.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 6);
  }, [games, searchTerm]);

  return (
    <div className={`rounded-2xl bg-[#141822] border transition-all duration-300 overflow-hidden shadow-sm ${
      isOpen ? "border-amber-400/40 ring-1 ring-amber-400/20" : "border-white/10"
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-[#1a2130]/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-white tracking-tight">
              6. Vitrine do Jogo em Destaque
            </h3>
            <p className="text-[11px] text-gray-400">
              Jogo favorito da vida, horas e troca rápida
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="p-4 space-y-3.5 border-t border-white/5 animate-fadeIn">
          {/* Card do Jogo Atual */}
          {currentGame ? (
            <div className="p-3 rounded-xl bg-[#1a2130] border border-white/10 flex items-center gap-3 relative">
              <div className="w-14 h-20 rounded-lg overflow-hidden bg-[#1e2433] shrink-0 relative shadow-md">
                <img
                  src={currentGame.gameCover || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=200"}
                  alt={currentGame.gameTitle}
                  className="w-full h-full object-cover"
                />
                {currentGame.userRating && (
                  <span className="absolute top-1 left-1 px-1 rounded bg-black/80 text-[8px] font-bold text-amber-400">
                    ★ {currentGame.userRating}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0 pr-6">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Jogo Favorito da Vida
                </span>
                <h4 className="font-bold text-sm text-white truncate">
                  {currentGame.gameTitle}
                </h4>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-400 flex-wrap">
                  <span>{currentGame.userPlaytimeHours ? `${currentGame.userPlaytimeHours}h` : "Na biblioteca"}</span>
                  {currentGame.status === "completed" && (
                    <span className="text-[#4edea3] font-semibold">• Zerado</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowcaseGameId(null)}
                className="absolute top-2.5 right-2.5 text-gray-500 hover:text-red-400 text-xs"
                title="Remover destaque"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#1a2130]/50 border border-dashed border-white/10 text-center space-y-1">
              <Gamepad2 className="w-6 h-6 text-gray-500 mx-auto" />
              <p className="text-xs text-gray-400">Nenhum jogo selecionado como destaque.</p>
            </div>
          )}

          {/* Busca na Biblioteca */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Substituir Jogo da Vitrine
            </label>
            <div className="flex items-center gap-2 bg-[#1a2130] rounded-xl px-3 py-2 border border-white/10">
              <Search className="w-4 h-4 text-gray-500 shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Buscar entre seus ${games.length} jogos salvos...`}
                className="w-full bg-transparent text-xs text-white placeholder:text-gray-500 outline-none"
              />
            </div>
          </div>

          {/* Sugestões da Biblioteca */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            {filteredGames.map((g) => {
              const isSelected = Number(g.gameId) === Number(showcaseGameId);
              return (
                <button
                  key={g.gameId}
                  type="button"
                  onClick={() => setShowcaseGameId(isSelected ? null : Number(g.gameId))}
                  className={`p-2 rounded-xl border flex items-center gap-2 text-left transition-all ${
                    isSelected
                      ? "border-[#4edea3] bg-[#4edea3]/10 text-[#4edea3]"
                      : "border-white/10 bg-[#1a2130]/70 hover:border-white/20 text-gray-300"
                  }`}
                >
                  <div className="w-8 h-10 rounded bg-[#141822] shrink-0 overflow-hidden flex items-center justify-center text-xs">
                    {g.gameCover ? (
                      <img src={g.gameCover} alt={g.gameTitle} className="w-full h-full object-cover" />
                    ) : (
                      "🎮"
                    )}
                  </div>
                  <div className="truncate flex-1">
                    <span className="font-bold text-white block truncate text-xs">
                      {g.gameTitle}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {g.status === "completed" ? "Zerado" : "Na lista"}
                    </span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#4edea3] shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
