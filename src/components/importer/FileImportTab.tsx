"use client";

import React, { useState } from "react";
import { ImportGameDraft, GameStatus, UserGame } from "@/lib/types";
import { Download, FileSpreadsheet } from "lucide-react";

interface FileImportTabProps {
  currentLibrary: UserGame[];
  onDraftsReady: (drafts: ImportGameDraft[]) => Promise<void>;
  onError: (msg: string | null) => void;
}

export default function FileImportTab({
  currentLibrary,
  onDraftsReady,
  onError,
}: FileImportTabProps) {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    onError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) return;

        let parsedDrafts: ImportGameDraft[] = [];

        if (file.name.endsWith(".json")) {
          const json = JSON.parse(content);
          const list = Array.isArray(json) ? json : json.games || [];

          parsedDrafts = list.map((item: any, idx: number) => {
            const title = item.gameTitle || item.title || item.name || `Jogo ${idx + 1}`;
            const already = currentLibrary.some(
              (libG) => libG.gameTitle.toLowerCase() === title.toLowerCase()
            );

            const hours = item.userPlaytimeHours || item.playtime || undefined;
            let status: GameStatus = "library";
            if (item.status) {
              const s = String(item.status).toLowerCase();
              if (s.includes("completed") || s.includes("zerado")) status = "completed";
              else if (s.includes("playing") || s.includes("jogando")) status = "playing";
              else if (s.includes("dropped") || s.includes("dropado")) status = "dropped";
              else if (s.includes("backlog") || s.includes("quero jogar")) status = "backlog";
            } else if (hours !== undefined && hours > 20) {
              status = "completed";
            } else if (hours !== undefined && hours > 1) {
              status = "playing";
            }

            return {
              id: `json_${idx}_${Date.now()}`,
              originalTitle: title,
              matchedTitle: title,
              matchedCover: item.gameCover || item.cover || null,
              platform: item.platformPlayed || item.platform || "PC",
              status,
              userPlaytimeHours: hours,
              userRating: item.userRating || item.rating || undefined,
              selected: true,
              alreadyInLibrary: already,
            };
          });
        } else {
          // CSV
          const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
          if (lines.length < 2) {
            onError("Arquivo CSV vazio ou sem dados.");
            return;
          }

          const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
          const titleIdx = header.findIndex(
            (h) => h.includes("title") || h.includes("name") || h.includes("jogo") || h.includes("nome")
          );
          const platformIdx = header.findIndex((h) => h.includes("platform") || h.includes("plataforma"));
          const statusIdx = header.findIndex((h) => h.includes("status") || h.includes("completion"));
          const hoursIdx = header.findIndex((h) => h.includes("time") || h.includes("hours") || h.includes("horas"));

          for (let i = 1; i < lines.length; i++) {
            const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
            const cleanRow = row.map((c) => c.trim().replace(/^"|"$/g, ""));
            const title = cleanRow[titleIdx >= 0 ? titleIdx : 0];
            if (!title) continue;

            const platform = platformIdx >= 0 && cleanRow[platformIdx] ? cleanRow[platformIdx] : "PC";
            const rawStatus = statusIdx >= 0 && cleanRow[statusIdx] ? cleanRow[statusIdx].toLowerCase() : "";
            const hours =
              hoursIdx >= 0 && !isNaN(parseFloat(cleanRow[hoursIdx]))
                ? parseFloat(cleanRow[hoursIdx])
                : undefined;

            let status: GameStatus = "library";
            if (rawStatus.includes("completed") || rawStatus.includes("zerado") || rawStatus.includes("beaten")) {
              status = "completed";
            } else if (rawStatus.includes("playing") || rawStatus.includes("jogando")) {
              status = "playing";
            } else if (rawStatus.includes("dropped") || rawStatus.includes("dropado")) {
              status = "dropped";
            } else if (rawStatus.includes("backlog") || rawStatus.includes("quero jogar")) {
              status = "backlog";
            }

            const already = currentLibrary.some(
              (libG) => libG.gameTitle.toLowerCase() === title.toLowerCase()
            );

            parsedDrafts.push({
              id: `csv_${i}_${Date.now()}`,
              originalTitle: title,
              matchedTitle: title,
              platform,
              status,
              userPlaytimeHours: hours,
              selected: true,
              alreadyInLibrary: already,
            });
          }
        }

        if (parsedDrafts.length === 0) {
          onError("Nenhum jogo identificado no arquivo. Verifique o formato.");
          return;
        }

        await onDraftsReady(parsedDrafts);
      } catch (err) {
        console.error("Erro ao ler arquivo:", err);
        onError("Erro ao processar o arquivo. Verifique se é um CSV ou JSON válido.");
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    const sampleCsv = `Title,Platform,Status,Hours\nThe Witcher 3,PC,completed,120\nCyberpunk 2077,PC,playing,45\nSuper Mario Odyssey,Nintendo Switch,completed,55\nHalo Infinite,Xbox Series,completed,30`;
    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "exemplo-importador-gamevault.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <label className="relative border-2 border-dashed border-white/20 hover:border-cyan-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 bg-[#14161a] group">
          <input type="file" accept=".csv,.json" onChange={handleFileUpload} className="hidden" />
          <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-[#00E5FF] group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-white block">
              {fileName ? fileName : "Clique para selecionar ou arraste seu arquivo .CSV ou .JSON"}
            </span>
            <span className="text-[11px] text-gray-400 block mt-1">
              Suporta exportações do Playnite, GOG Galaxy, Deku Deals, Backloggd ou CSV padrão
            </span>
          </div>
        </label>

        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-gray-400">
          <span>Deseja um formato de exemplo?</span>
          <button
            type="button"
            onClick={handleDownloadSample}
            className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> Baixar Modelo CSV
          </button>
        </div>
      </div>
    </div>
  );
}
