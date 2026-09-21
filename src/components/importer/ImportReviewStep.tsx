"use client";

import React from "react";
import { ImportGameDraft, GameStatus, StorePlatform } from "@/lib/types";
import { Search, CheckSquare, Square, Sparkles } from "lucide-react";

interface ImportReviewStepProps {
  draftGames: ImportGameDraft[];
  filteredReviewGames: ImportGameDraft[];
  reviewSearch: string;
  setReviewSearch: (val: string) => void;
  selectedCount: number;
  toggleSelectAll: (select: boolean) => void;
  toggleSelectGame: (id: string) => void;
  updateGameStatus: (id: string, status: GameStatus) => void;
  updateGamePlatform: (id: string, platform: StorePlatform) => void;
  onBack: () => void;
  onConfirm: () => void;
}

export default function ImportReviewStep({
  draftGames,
  filteredReviewGames,
  reviewSearch,
  setReviewSearch,
  selectedCount,
  toggleSelectAll,
  toggleSelectGame,
  updateGameStatus,
  onBack,
  onConfirm,
}: ImportReviewStepProps) {
  return (
    <div className="space-y-4 overflow-hidden flex flex-col flex-1">
      {/* Topo da Revisão */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white">
            {selectedCount} de {draftGames.length} selecionados
          </span>
          <div className="flex items-center gap-1.5 ml-2">
            <button
              type="button"
              onClick={() => toggleSelectAll(true)}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
            >
              Marcar Todos
            </button>
            <span className="text-gray-600">•</span>
            <button
              type="button"
              onClick={() => toggleSelectAll(false)}
              className="text-[11px] text-gray-400 hover:text-white"
            >
              Desmarcar
            </button>
          </div>
        </div>

        {/* Busca rápida na lista de revisão */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filtrar títulos..."
            value={reviewSearch}
            onChange={(e) => setReviewSearch(e.target.value)}
            className="w-full sm:w-48 h-8 pl-8 pr-3 rounded-xl bg-[#18191c] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]"
          />
        </div>
      </div>

      {/* Lista com Rolagem */}
      <div className="overflow-y-auto space-y-2 pr-1 flex-1 max-h-[50vh]">
        {filteredReviewGames.map((draft) => (
          <div
            key={draft.id}
            className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
              draft.selected
                ? "bg-white/5 border-white/15"
                : "bg-[#18191c]/50 border-transparent opacity-60"
            }`}
          >
            {/* Checkbox e Capa */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => toggleSelectGame(draft.id)}
                className="text-cyan-400 hover:text-cyan-300 shrink-0"
              >
                {draft.selected ? (
                  <CheckSquare className="w-5 h-5 text-[#00E5FF]" />
                ) : (
                  <Square className="w-5 h-5 text-gray-500" />
                )}
              </button>

              <div className="w-10 h-14 rounded-lg bg-neutral-800 overflow-hidden shrink-0 border border-white/10">
                {draft.matchedCover ? (
                  <img
                    src={draft.matchedCover}
                    alt={draft.matchedTitle || draft.originalTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-500">
                    🎮
                  </div>
                )}
              </div>

              <div className="min-w-0 space-y-0.5">
                <h4
                  className="text-xs font-bold text-white truncate"
                  title={draft.matchedTitle || draft.originalTitle}
                >
                  {draft.matchedTitle || draft.originalTitle}
                </h4>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300">
                    {draft.platform}
                  </span>
                  {draft.userPlaytimeHours ? (
                    <span className="text-[10px] text-gray-400 font-mono">
                      {draft.userPlaytimeHours}h jogadas
                    </span>
                  ) : null}
                  {draft.alreadyInLibrary && (
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/15 px-1.5 py-0.2 rounded">
                      Já no Vault
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Seletor de Status Individual */}
            <div className="shrink-0 flex items-center gap-1.5">
              <select
                value={draft.status}
                onChange={(e) => updateGameStatus(draft.id, e.target.value as GameStatus)}
                className="h-8 px-2 rounded-xl bg-[#18191c] border border-white/10 text-[11px] text-white focus:outline-none focus:border-[#00E5FF]"
              >
                <option value="library">Biblioteca</option>
                <option value="backlog">Quero Jogar</option>
                <option value="playing">Jogando</option>
                <option value="completed">Zerado</option>
                <option value="dropped">Dropado</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      {/* Ações da Revisão */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t border-white/10 flex-shrink-0">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
        >
          Voltar
        </button>

        <button
          type="button"
          onClick={onConfirm}
          disabled={selectedCount === 0}
          className="px-6 py-2.5 rounded-2xl bg-[#00E5FF] hover:bg-[#00c8e0] text-black font-bold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
        >
          <Sparkles className="w-4 h-4 text-black" />
          <span>Confirmar Importação ({selectedCount} jogos)</span>
        </button>
      </div>
    </div>
  );
}
