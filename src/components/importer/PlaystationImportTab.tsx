"use client";

import React, { useState } from "react";
import { ImportGameDraft, GameStatus, StorePlatform, UserGame } from "@/lib/types";
import { Download, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface PlaystationImportTabProps {
  currentLibrary: UserGame[];
  onDraftsReady: (drafts: ImportGameDraft[]) => Promise<void>;
  onError: (msg: string | null) => void;
}

export default function PlaystationImportTab({
  currentLibrary,
  onDraftsReady,
  onError,
}: PlaystationImportTabProps) {
  const { user } = useAuth();
  const [psnInput, setPsnInput] = useState(user?.socialLinks?.psn || "");
  const [psnTextList, setPsnTextList] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadPlaystation = async () => {
    // 1. Se preencheu lista rápida de títulos
    if (psnTextList.trim()) {
      const lines = psnTextList.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const rawDrafts: ImportGameDraft[] = lines.map((line, idx) => {
          const already = currentLibrary.some(
            (libG) => libG.gameTitle.toLowerCase() === line.toLowerCase()
          );
          return {
            id: `psn_${idx}_${Date.now()}`,
            originalTitle: line,
            matchedTitle: line,
            platform: "PlayStation 5" as StorePlatform,
            status: "library" as GameStatus,
            selected: true,
            alreadyInLibrary: already,
          };
        });
        await onDraftsReady(rawDrafts);
        return;
      }
    }

    if (!psnInput.trim()) {
      onError("Por favor, informe sua PSN Online ID ou cole sua lista de jogos abaixo.");
      return;
    }

    setIsLoading(true);
    onError(null);

    try {
      const params = new URLSearchParams();
      params.set("psnId", psnInput.trim());

      const res = await fetch(`/api/importer/playstation?${params.toString()}`);
      const data: any = await res.json();

      if (!data.success || !Array.isArray(data.games) || data.games.length === 0) {
        onError(
          data.error ||
            "A PlayStation Network exige exportação manual ou chave privada. Cole sua lista de jogos abaixo para importar em 1 clique!"
        );
        return;
      }

      const rawDrafts: ImportGameDraft[] = data.games.map((g: any, idx: number) => {
        const already = currentLibrary.some(
          (libG) => libG.gameTitle.toLowerCase() === g.name.toLowerCase()
        );
        return {
          id: `psn_${idx}`,
          originalTitle: g.name,
          matchedTitle: g.name,
          platform: "PlayStation 5" as StorePlatform,
          status: "library" as GameStatus,
          selected: true,
          alreadyInLibrary: already,
        };
      });

      await onDraftsReady(rawDrafts);
    } catch (e) {
      console.error("Erro ao carregar jogos da PSN:", e);
      onError("Erro de comunicação com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
          <span className="font-mono text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded text-blue-200">
            PLAYSTATION SYNC
          </span>
          <span>Importação de jogos do PS4 e PS5</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Insira sua <strong>PSN Online ID</strong> ou cole a lista dos seus títulos da PlayStation.
          Enriquecemos os títulos com capas oficiais e notas do Metacritic!
        </p>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] text-gray-400 block mb-1">Sua PSN Online ID:</label>
            <input
              type="text"
              placeholder="Ex: PlayStationBrasil ou sua PSN ID"
              value={psnInput}
              onChange={(e) => setPsnInput(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#14161a] border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-gray-400">
                Ou cole os títulos dos seus jogos do PlayStation (1 por linha):
              </label>
              <button
                type="button"
                onClick={() =>
                  setPsnTextList(
                    "God of War Ragnarök\nMarvel's Spider-Man 2\nBloodborne\nThe Last of Us Part I\nGhost of Tsushima\nHorizon Forbidden West\nDemon's Souls\nReturnal"
                  )
                }
                className="text-[10px] text-blue-300 hover:text-blue-200 underline"
              >
                Exemplo PS5
              </button>
            </div>
            <textarea
              rows={4}
              placeholder="Ex:&#10;God of War Ragnarök&#10;Spider-Man 2&#10;The Last of Us Part I"
              value={psnTextList}
              onChange={(e) => setPsnTextList(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#0e1015] border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 resize-none font-mono"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleLoadPlaystation}
          disabled={isLoading || (!psnInput.trim() && !psnTextList.trim())}
          className="w-full min-h-[46px] rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-blue-600/20"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-white" /> : <Download className="w-4 h-4 text-white" />}
          <span>Importar Jogos da PlayStation</span>
        </button>
      </div>
    </div>
  );
}
