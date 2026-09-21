"use client";

import React, { useState } from "react";
import { ImportGameDraft, GameStatus, StorePlatform, UserGame } from "@/lib/types";
import { Download, Sparkles } from "lucide-react";

interface QuickTextImportTabProps {
  currentLibrary: UserGame[];
  platforms: StorePlatform[];
  onDraftsReady: (drafts: ImportGameDraft[]) => Promise<void>;
  onError: (msg: string | null) => void;
}

export default function QuickTextImportTab({
  currentLibrary,
  platforms,
  onDraftsReady,
  onError,
}: QuickTextImportTabProps) {
  const [textInput, setTextInput] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<StorePlatform>("PC");
  const [defaultStatus, setDefaultStatus] = useState<GameStatus>("library");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLoadText = async () => {
    const rawLines = textInput.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (rawLines.length === 0) {
      onError("Digite ou cole ao menos um título de jogo.");
      return;
    }

    setIsProcessing(true);
    onError(null);

    try {
      const rawDrafts: ImportGameDraft[] = rawLines.map((line, idx) => {
        const already = currentLibrary.some(
          (libG) => libG.gameTitle.toLowerCase() === line.toLowerCase()
        );

        return {
          id: `text_${idx}_${Date.now()}`,
          originalTitle: line,
          matchedTitle: line,
          platform: selectedPlatform,
          status: defaultStatus || "library",
          selected: true,
          alreadyInLibrary: already,
        };
      });

      await onDraftsReady(rawDrafts);
    } catch (e) {
      console.error(e);
      onError("Erro ao processar lista de jogos.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-gray-300">
            Cole a lista de jogos (um título por linha):
          </label>
          <button
            type="button"
            onClick={() =>
              setTextInput(
                "The Witcher 3: Wild Hunt\nCyberpunk 2077\nHades\nGrand Theft Auto V\nDeath Stranding\nControl\nCeleste\nAlan Wake 2"
              )
            }
            className="text-[11px] text-purple-400 hover:text-purple-300 underline font-medium"
          >
            Preencher Exemplo
          </button>
        </div>

        <textarea
          rows={6}
          placeholder={"Red Dead Redemption 2\nElden Ring\nBaldur's Gate 3\nHollow Knight"}
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          className="w-full p-3 rounded-2xl bg-[#14161a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 font-mono resize-none"
        />

        {/* Seleção de Plataforma e Status Padrão */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Plataforma Padrão:</label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value as StorePlatform)}
              className="w-full h-10 px-3 rounded-xl bg-[#14161a] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400"
            >
              {platforms.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Status Inicial:</label>
            <select
              value={defaultStatus}
              onChange={(e) => setDefaultStatus(e.target.value as GameStatus)}
              className="w-full h-10 px-3 rounded-xl bg-[#14161a] border border-white/10 text-xs text-white focus:outline-none focus:border-purple-400"
            >
              <option value="library">Biblioteca (Possuído)</option>
              <option value="backlog">Quero Jogar (Backlog)</option>
              <option value="playing">Jogando Agora</option>
              <option value="completed">Zerado</option>
              <option value="dropped">Dropado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleLoadText}
          disabled={isProcessing || !textInput.trim()}
          className="w-full min-h-[46px] rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-purple-600/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Localizar Jogos e Revisar</span>
        </button>
      </div>
    </div>
  );
}
