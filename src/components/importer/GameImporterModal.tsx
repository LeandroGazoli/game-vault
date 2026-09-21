"use client";

import React, { useState, useMemo } from "react";
import { UserGame, GameStatus, StorePlatform, ImportGameDraft } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { X, Upload, AlertCircle, RefreshCw, FileSpreadsheet, FileText } from "lucide-react";
import AdaptiveModal from "../ui/AdaptiveModal";

// Subcomponentes Modulares (Regra Shadcn & Budget < 300 linhas)
import SteamImportTab from "./SteamImportTab";
import XboxImportTab from "./XboxImportTab";
import PlaystationImportTab from "./PlaystationImportTab";
import NintendoImportTab from "./NintendoImportTab";
import QuickTextImportTab from "./QuickTextImportTab";
import FileImportTab from "./FileImportTab";
import ImportReviewStep from "./ImportReviewStep";

interface GameImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGames?: UserGame[];
}

type ImportSourceTab = "steam" | "xbox" | "nintendo" | "playstation" | "text" | "file";

const POPULAR_STORE_PLATFORMS: StorePlatform[] = [
  "Epic Games",
  "Steam",
  "GOG",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series",
  "Xbox One",
  "Nintendo Switch",
  "PC",
  "Outro",
];

export default function GameImporterModal({
  isOpen,
  onClose,
  existingGames = [],
}: GameImporterModalProps) {
  const { batchAddGames, library } = useGameLibrary();
  const currentLibrary = existingGames.length > 0 ? existingGames : library;

  const [activeTab, setActiveTab] = useState<ImportSourceTab>("steam");
  const [step, setStep] = useState<"input" | "review" | "importing" | "completed">("input");
  const [draftGames, setDraftGames] = useState<ImportGameDraft[]>([]);
  const [reviewSearch, setReviewSearch] = useState("");
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filteredReviewGames = useMemo(() => {
    if (!reviewSearch.trim()) return draftGames;
    const q = reviewSearch.toLowerCase();
    return draftGames.filter(
      (d) =>
        d.originalTitle.toLowerCase().includes(q) ||
        (d.matchedTitle && d.matchedTitle.toLowerCase().includes(q))
    );
  }, [draftGames, reviewSearch]);

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("input");
      setDraftGames([]);
      setErrorMessage(null);
      setImportProgress(0);
    }, 200);
  };

  // Enriquecimento com IGDB
  const handleDraftsReady = async (drafts: ImportGameDraft[]) => {
    setDraftGames(drafts);
    setStep("review");
    setErrorMessage(null);

    try {
      const titlesToMatch = drafts.map((d) => d.originalTitle);
      const res = await fetch("/api/games/batch-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles: titlesToMatch }),
      });

      if (res.ok) {
        const data: any = await res.json();
        const matches = data.matches || {};

        setDraftGames((prev) =>
          prev.map((d) => {
            const m = matches[d.originalTitle];
            if (m) {
              return {
                ...d,
                matchedGameId: m.gameId,
                matchedSlug: m.slug,
                matchedTitle: m.title || d.originalTitle,
                matchedCover: m.cover || d.matchedCover,
                matchedMetacritic: m.metacritic,
                matchedReleaseYear: m.releaseYear,
                matchedGenres: m.genres,
              };
            }
            return d;
          })
        );
      }
    } catch (err) {
      console.warn("Matching inteligente IGDB falhou parcialmente:", err);
    }
  };

  // Executa a importação em lote
  const handleExecuteImport = async () => {
    const selectedGames = draftGames.filter((d) => d.selected);
    if (selectedGames.length === 0) return;

    setStep("importing");
    setImportProgress(15);

    const formattedGames = selectedGames.map((d, index) => {
      const hash = Math.abs(
        d.originalTitle.split("").reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0)
      );
      const fallbackId = 9000000 + (hash % 8000000) + index;
      const numId = typeof d.matchedGameId === "number" ? d.matchedGameId : parseInt(String(d.matchedGameId || ""), 10);
      const finalGameId = !isNaN(numId) && numId > 0 ? numId : fallbackId;

      return {
        gameId: finalGameId,
        gameSlug:
          d.matchedSlug ||
          d.originalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") ||
          String(finalGameId),
        gameTitle: d.matchedTitle || d.originalTitle,
        gameCover: d.matchedCover || null,
        status: d.status,
        platformPlayed: d.platform,
        platformsPlayed: [d.platform],
        userPlaytimeHours: typeof d.userPlaytimeHours === "number" && d.userPlaytimeHours > 0 ? d.userPlaytimeHours : null,
        userRating: typeof d.userRating === "number" && d.userRating > 0 ? d.userRating : null,
        metacritic: typeof d.matchedMetacritic === "number" ? d.matchedMetacritic : null,
        releaseYear: d.matchedReleaseYear || "",
        genres: d.matchedGenres || [],
      };
    });

    try {
      setImportProgress(50);
      const count = await batchAddGames(formattedGames);
      setImportProgress(100);
      setImportedCount(count);
      setStep("completed");
    } catch (err) {
      console.error("Falha na importação:", err);
      alert("Ocorreu um erro ao salvar os jogos. Verifique sua conexão e tente novamente.");
      setStep("review");
    }
  };

  const selectedCount = draftGames.filter((d) => d.selected).length;

  if (!isOpen) return null;

  return (
    <AdaptiveModal isOpen={isOpen} onClose={handleClose} maxWidth="max-w-2xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00E5FF] shadow-sm">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Importador de Jogos Multi-Lojas
              </h3>
              <p className="text-xs text-gray-400">
                Alimente sua biblioteca da Steam, Xbox, Nintendo Switch, PlayStation ou Arquivo
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ETAPA 1: ESCOLHA DA FONTE E ENTRADA */}
        {step === "input" && (
          <div className="space-y-4">
            {/* Abas Superiores Compactas */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 rounded-2xl bg-[#14161a] border border-white/10">
              <button
                type="button"
                onClick={() => { setActiveTab("steam"); setErrorMessage(null); }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "steam"
                    ? "bg-cyan-950/60 text-[#00E5FF] border border-[#00E5FF]/50 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>🎮</span>
                <span>Steam</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("xbox"); setErrorMessage(null); }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "xbox"
                    ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/50 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>🟢</span>
                <span>Xbox</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("nintendo"); setErrorMessage(null); }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "nintendo"
                    ? "bg-rose-950/60 text-rose-300 border border-rose-500/50 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>🔴</span>
                <span>Switch</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("playstation"); setErrorMessage(null); }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "playstation"
                    ? "bg-blue-950/60 text-blue-300 border border-blue-500/50 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span>🔵</span>
                <span>PSN</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("text"); setErrorMessage(null); }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "text"
                    ? "bg-purple-950/60 text-purple-300 border border-purple-500/50 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Texto</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab("file"); setErrorMessage(null); }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "file"
                    ? "bg-amber-950/60 text-amber-300 border border-amber-500/50 shadow-sm"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV</span>
              </button>
            </div>

            {/* Conteúdo da Aba Ativa */}
            {activeTab === "steam" && (
              <SteamImportTab currentLibrary={currentLibrary} onDraftsReady={handleDraftsReady} onError={setErrorMessage} />
            )}
            {activeTab === "xbox" && (
              <XboxImportTab currentLibrary={currentLibrary} onDraftsReady={handleDraftsReady} onError={setErrorMessage} />
            )}
            {activeTab === "nintendo" && (
              <NintendoImportTab currentLibrary={currentLibrary} onDraftsReady={handleDraftsReady} onError={setErrorMessage} />
            )}
            {activeTab === "playstation" && (
              <PlaystationImportTab currentLibrary={currentLibrary} onDraftsReady={handleDraftsReady} onError={setErrorMessage} />
            )}
            {activeTab === "text" && (
              <QuickTextImportTab currentLibrary={currentLibrary} platforms={POPULAR_STORE_PLATFORMS} onDraftsReady={handleDraftsReady} onError={setErrorMessage} />
            )}
            {activeTab === "file" && (
              <FileImportTab currentLibrary={currentLibrary} onDraftsReady={handleDraftsReady} onError={setErrorMessage} />
            )}

            {/* Alertas de Erro */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}
          </div>
        )}

        {/* ETAPA 2: REVISÃO DOS JOGOS */}
        {step === "review" && (
          <ImportReviewStep
            draftGames={draftGames}
            filteredReviewGames={filteredReviewGames}
            reviewSearch={reviewSearch}
            setReviewSearch={setReviewSearch}
            selectedCount={selectedCount}
            toggleSelectAll={(sel) => setDraftGames((prev) => prev.map((d) => ({ ...d, selected: sel })))}
            toggleSelectGame={(id) => setDraftGames((prev) => prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d)))}
            updateGameStatus={(id, st) => setDraftGames((prev) => prev.map((d) => (d.id === id ? { ...d, status: st } : d)))}
            updateGamePlatform={(id, pl) => setDraftGames((prev) => prev.map((d) => (d.id === id ? { ...d, platform: pl } : d)))}
            onBack={() => setStep("input")}
            onConfirm={handleExecuteImport}
          />
        )}

        {/* ETAPA 3: PROGRESS BAR */}
        {step === "importing" && (
          <div className="py-12 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-[#00E5FF] animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Importando jogos para o seu Vault...</h3>
              <p className="text-xs text-gray-400 mt-1">Gravando na biblioteca e atualizando estatísticas de jogo</p>
            </div>
            <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-[#00E5FF] h-full transition-all duration-300 rounded-full"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ETAPA 4: CONCLUÍDO */}
        {step === "completed" && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg shadow-emerald-500/20">
              🎉
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-white">Importação Concluída com Sucesso!</h3>
              <p className="text-xs text-gray-300">
                <strong>{importedCount} jogos</strong> foram adicionados e atualizados no seu perfil.
              </p>
            </div>
            <div className="pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all shadow-md active:scale-95"
              >
                Explorar Minha Biblioteca Atualizada
              </button>
            </div>
          </div>
        )}
      </div>
    </AdaptiveModal>
  );
}
