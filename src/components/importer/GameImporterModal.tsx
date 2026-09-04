"use client";

import React, { useState, useMemo } from "react";
import { UserGame, GameStatus, StorePlatform, ImportGameDraft } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import {
  X,
  Download,
  Upload,
  Sparkles,
  Gamepad2,
  FileSpreadsheet,
  FileCode,
  FileText,
  Check,
  AlertCircle,
  RefreshCw,
  Search,
  CheckSquare,
  Square,
  ArrowRight,
  ExternalLink,
  Layers,
  ChevronDown,
} from "lucide-react";

interface GameImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGames?: UserGame[];
}

type ImportSourceTab = "steam" | "file" | "text";

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
  const { user } = useAuth();

  const currentLibrary = existingGames.length > 0 ? existingGames : library;

  const [activeTab, setActiveTab] = useState<ImportSourceTab>("steam");

  // Steam Tab State
  const [steamInput, setSteamInput] = useState(user?.socialLinks?.steam || "");
  const [steamApiKey, setSteamApiKey] = useState("");
  const [isSteamLoading, setIsSteamLoading] = useState(false);
  const [steamError, setSteamError] = useState<string | null>(null);

  // File Tab State
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Text Tab State
  const [textInput, setTextInput] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<StorePlatform>("Epic Games");
  const [defaultStatus, setDefaultStatus] = useState<GameStatus>("backlog");

  // Step State: 'input' | 'review' | 'importing' | 'completed'
  const [step, setStep] = useState<"input" | "review" | "importing" | "completed">("input");
  const [draftGames, setDraftGames] = useState<ImportGameDraft[]>([]);
  const [reviewSearch, setReviewSearch] = useState("");
  const [importProgress, setImportProgress] = useState(0);
  const [importedCount, setImportedCount] = useState(0);

  if (!isOpen) return null;

  // Fecha e reinicia estado
  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep("input");
      setDraftGames([]);
      setFileError(null);
      setSteamError(null);
      setImportProgress(0);
    }, 200);
  };

  // =========================================================================
  // 1. CARREGAMENTO VIA STEAM
  // =========================================================================
  const handleLoadSteam = async (forceDemo = false) => {
    setIsSteamLoading(true);
    setSteamError(null);

    try {
      const params = new URLSearchParams();
      if (forceDemo || !steamInput.trim()) {
        params.set("demo", "true");
      } else {
        params.set("steamId", steamInput.trim());
        if (steamApiKey.trim()) params.set("apiKey", steamApiKey.trim());
      }

      const res = await fetch(`/api/steam/games?${params.toString()}`);
      const data = await res.json();

      if (!data.success || !Array.isArray(data.games) || data.games.length === 0) {
        setSteamError(data.error || "Nenhum jogo encontrado ou a lista de jogos do perfil está privada.");
        return;
      }

      // Converte jogos retornados da Steam em rascunhos para revisão
      const rawDrafts: ImportGameDraft[] = data.games.map((g: any, idx: number) => {
        const hours = g.playtimeForeverHours || 0;
        // Se jogou mais de 15h, sugere 'Zerado' ou 'Jogando'
        let initialStatus: GameStatus = "backlog";
        if (hours > 20) initialStatus = "completed";
        else if (hours > 0) initialStatus = "playing";

        const already = currentLibrary.some(
          (libG) => libG.gameTitle.toLowerCase() === g.name.toLowerCase()
        );

        return {
          id: `steam_${g.appId}_${idx}`,
          originalTitle: g.name,
          matchedTitle: g.name,
          matchedCover: g.iconUrl || null,
          platform: "Steam",
          status: initialStatus,
          userPlaytimeHours: hours > 0 ? hours : undefined,
          selected: !already, // Desmarca automaticamente se já estiver na biblioteca
          alreadyInLibrary: already,
        };
      });

      await enrichDraftsWithIGDB(rawDrafts);
    } catch (e) {
      console.error("Erro ao carregar jogos da Steam:", e);
      setSteamError("Erro de comunicação com o servidor.");
    } finally {
      setIsSteamLoading(false);
    }
  };

  // =========================================================================
  // 2. CARREGAMENTO VIA ARQUIVO (CSV / JSON)
  // =========================================================================
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileError(null);

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

            return {
              id: `json_${idx}`,
              originalTitle: title,
              matchedTitle: title,
              matchedCover: item.gameCover || item.cover || null,
              platform: item.platformPlayed || item.platform || "PC",
              status: item.status || "backlog",
              userPlaytimeHours: item.userPlaytimeHours || item.playtime || undefined,
              userRating: item.userRating || item.rating || undefined,
              selected: !already,
              alreadyInLibrary: already,
            };
          });
        } else {
          // Processa CSV
          const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
          if (lines.length < 2) {
            setFileError("Arquivo CSV vazio ou sem dados.");
            return;
          }

          const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
          const titleIdx = header.findIndex((h) => h.includes("title") || h.includes("name") || h.includes("jogo") || h.includes("nome"));
          const platformIdx = header.findIndex((h) => h.includes("platform") || h.includes("plataforma"));
          const statusIdx = header.findIndex((h) => h.includes("status") || h.includes("completion"));
          const hoursIdx = header.findIndex((h) => h.includes("time") || h.includes("hours") || h.includes("horas"));

          for (let i = 1; i < lines.length; i++) {
            // Separa por vírgula respeitando aspas
            const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
            const cleanRow = row.map((c) => c.trim().replace(/^"|"$/g, ""));
            const title = cleanRow[titleIdx >= 0 ? titleIdx : 0];
            if (!title) continue;

            const platform = platformIdx >= 0 && cleanRow[platformIdx] ? cleanRow[platformIdx] : "PC";
            const rawStatus = statusIdx >= 0 && cleanRow[statusIdx] ? cleanRow[statusIdx].toLowerCase() : "";
            let status: GameStatus = "backlog";
            if (rawStatus.includes("completed") || rawStatus.includes("zerado") || rawStatus.includes("beaten")) {
              status = "completed";
            } else if (rawStatus.includes("playing") || rawStatus.includes("jogando")) {
              status = "playing";
            } else if (rawStatus.includes("dropped") || rawStatus.includes("dropado")) {
              status = "dropped";
            }

            const hours = hoursIdx >= 0 && !isNaN(parseFloat(cleanRow[hoursIdx])) ? parseFloat(cleanRow[hoursIdx]) : undefined;
            const already = currentLibrary.some(
              (libG) => libG.gameTitle.toLowerCase() === title.toLowerCase()
            );

            parsedDrafts.push({
              id: `csv_${i}`,
              originalTitle: title,
              matchedTitle: title,
              platform,
              status,
              userPlaytimeHours: hours,
              selected: !already,
              alreadyInLibrary: already,
            });
          }
        }

        if (parsedDrafts.length === 0) {
          setFileError("Nenhum jogo identificado no arquivo. Verifique o formato.");
          return;
        }

        await enrichDraftsWithIGDB(parsedDrafts);
      } catch (err) {
        console.error("Erro ao ler arquivo:", err);
        setFileError("Erro ao processar o arquivo. Verifique se é um CSV ou JSON válido.");
      }
    };
    reader.readAsText(file);
  };

  // =========================================================================
  // 3. CARREGAMENTO VIA LISTA DE TEXTO
  // =========================================================================
  const handleLoadText = async () => {
    const rawLines = textInput.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (rawLines.length === 0) return;

    const rawDrafts: ImportGameDraft[] = rawLines.map((line, idx) => {
      const already = currentLibrary.some(
        (libG) => libG.gameTitle.toLowerCase() === line.toLowerCase()
      );

      return {
        id: `text_${idx}`,
        originalTitle: line,
        matchedTitle: line,
        platform: selectedPlatform,
        status: defaultStatus,
        selected: !already,
        alreadyInLibrary: already,
      };
    });

    await enrichDraftsWithIGDB(rawDrafts);
  };

  // =========================================================================
  // ENRIQUECE RASCUNHOS COM CAPAS E METADADOS DO IGDB
  // =========================================================================
  const enrichDraftsWithIGDB = async (drafts: ImportGameDraft[]) => {
    setDraftGames(drafts);
    setStep("review");

    try {
      const titlesToMatch = drafts.map((d) => d.originalTitle);
      const res = await fetch("/api/games/batch-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles: titlesToMatch }),
      });

      if (res.ok) {
        const data = await res.json();
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

  // =========================================================================
  // EXECUTA A IMPORTAÇÃO EM LOTE
  // =========================================================================
  const handleExecuteImport = async () => {
    const selectedGames = draftGames.filter((d) => d.selected);
    if (selectedGames.length === 0) return;

    setStep("importing");
    setImportProgress(10);

    const formattedGames = selectedGames.map((d, index) => {
      // Gera ID estável se não foi encontrado no IGDB
      const fallbackId = Math.abs(
        d.originalTitle.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
      ) + 9000000;

      return {
        gameId: d.matchedGameId || fallbackId,
        gameSlug: d.matchedSlug || d.originalTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        gameTitle: d.matchedTitle || d.originalTitle,
        gameCover: d.matchedCover || null,
        status: d.status,
        platformPlayed: d.platform,
        platformsPlayed: [d.platform],
        userPlaytimeHours: d.userPlaytimeHours || null,
        userRating: d.userRating || null,
        metacritic: d.matchedMetacritic || null,
        releaseYear: d.matchedReleaseYear || "",
        genres: d.matchedGenres || [],
      };
    });

    try {
      setImportProgress(45);
      const count = await batchAddGames(formattedGames);
      setImportProgress(100);
      setImportedCount(count);
      setStep("completed");
    } catch (err) {
      console.error("Falha na importação:", err);
      alert("Ocorreu um erro ao salvar os jogos. Tente novamente.");
      setStep("review");
    }
  };

  // Controles de seleção na revisão
  const toggleSelectAll = (select: boolean) => {
    setDraftGames((prev) => prev.map((d) => ({ ...d, selected: select })));
  };

  const toggleSelectGame = (id: string) => {
    setDraftGames((prev) =>
      prev.map((d) => (d.id === id ? { ...d, selected: !d.selected } : d))
    );
  };

  const updateGameStatus = (id: string, status: GameStatus) => {
    setDraftGames((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status } : d))
    );
  };

  const updateGamePlatform = (id: string, platform: StorePlatform) => {
    setDraftGames((prev) =>
      prev.map((d) => (d.id === id ? { ...d, platform } : d))
    );
  };

  const filteredReviewGames = useMemo(() => {
    if (!reviewSearch.trim()) return draftGames;
    const q = reviewSearch.toLowerCase();
    return draftGames.filter(
      (d) =>
        d.originalTitle.toLowerCase().includes(q) ||
        (d.matchedTitle && d.matchedTitle.toLowerCase().includes(q))
    );
  }, [draftGames, reviewSearch]);

  const selectedCount = draftGames.filter((d) => d.selected).length;

  return (
    <div
      className="fixed inset-0 z-[1000] !m-0 !mt-0 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative z-10 w-full sm:max-w-2xl rounded-t-[32px] sm:rounded-[32px] bg-[#14161a] border border-white/15 p-5 sm:p-7 shadow-2xl space-y-5 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-1 flex-shrink-0" />

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
                Alimente sua biblioteca da Steam, Epic Games, GOG e consoles
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

        {/* ========================================================================= */}
        {/* ETAPA 1: ESCOLHA DA FONTE (STEAM, ARQUIVO OU LISTA DE TEXTO) */}
        {/* ========================================================================= */}
        {step === "input" && (
          <div className="space-y-5 overflow-y-auto pr-1">
            {/* Abas Seletoras de Fonte */}
            <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-[#18191c] border border-white/10">
              <button
                type="button"
                onClick={() => setActiveTab("steam")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "steam"
                    ? "bg-[#00E5FF] text-black shadow-md shadow-cyan-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <span className="text-sm">🎮</span>
                <span>Steam</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("text")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "text"
                    ? "bg-[#00E5FF] text-black shadow-md shadow-cyan-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Lista Rápida</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === "file"
                    ? "bg-[#00E5FF] text-black shadow-md shadow-cyan-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV / JSON</span>
              </button>
            </div>

            {/* ABA 1: STEAM */}
            {activeTab === "steam" && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-300">
                    <span className="font-mono text-[10px] bg-blue-500/30 px-1.5 py-0.5 rounded text-blue-200">STEAM SYNC</span>
                    <span>Importação direta da Biblioteca Steam</span>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Insira seu <strong>SteamID64</strong> ou <strong>URL do perfil</strong>. Importamos automaticamente os títulos de jogos e suas horas jogadas!
                  </p>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Ex: 76561198000000000 ou https://steamcommunity.com/id/usuario"
                      value={steamInput}
                      onChange={(e) => setSteamInput(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl bg-[#14161a] border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]"
                    />

                    {/* Opcional: Steam API Key */}
                    <div className="space-y-1 pt-1">
                      <details className="text-[11px] text-gray-400 cursor-pointer">
                        <summary className="hover:text-white">
                          Opções Avançadas: Chave de API da Steam (Opcional)
                        </summary>
                        <div className="pt-2">
                          <input
                            type="password"
                            placeholder="Sua Steam Web API Key..."
                            value={steamApiKey}
                            onChange={(e) => setSteamApiKey(e.target.value)}
                            className="w-full h-10 px-3 rounded-xl bg-[#14161a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]"
                          />
                          <p className="text-[10px] text-gray-500 mt-1">
                            Disponível gratuitamente em <a href="https://steamcommunity.com/dev/apikey" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline">steamcommunity.com/dev/apikey</a>
                          </p>
                        </div>
                      </details>
                    </div>
                  </div>
                </div>

                {steamError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-red-300">
                      <AlertCircle className="w-3.5 h-3.5" /> Atenção:
                    </span>
                    <p>{steamError}</p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSteam(false)}
                    disabled={isSteamLoading || !steamInput.trim()}
                    className="flex-1 min-h-[46px] rounded-2xl bg-[#00E5FF] hover:bg-[#00c8e0] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSteamLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    ) : (
                      <Download className="w-4 h-4 text-black" />
                    )}
                    <span>Carregar Jogos da Steam</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLoadSteam(true)}
                    disabled={isSteamLoading}
                    className="min-h-[46px] px-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                    title="Testar com uma biblioteca de demonstração da Steam"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Testar com Demo</span>
                  </button>
                </div>
              </div>
            )}

            {/* ABA 2: LISTA RÁPIDA (TEXTO / COPIAR E COLAR) */}
            {activeTab === "text" && (
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
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 underline self-start sm:self-auto"
                    >
                      Preencher Exemplo Epic Games
                    </button>
                  </div>

                  <textarea
                    rows={6}
                    placeholder="Grand Theft Auto V&#10;The Witcher 3&#10;Cyberpunk 2077&#10;Hades&#10;Death Stranding..."
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    className="w-full p-3 rounded-2xl bg-[#18191c] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Seletor de Loja / Plataforma */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400">Loja / Plataforma:</label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value as StorePlatform)}
                      className="w-full h-11 px-3 rounded-xl bg-[#18191c] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                    >
                      {POPULAR_STORE_PLATFORMS.map((plat) => (
                        <option key={plat} value={plat}>
                          {plat}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Seletor de Status Inicial */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-400">Status Inicial dos Jogos:</label>
                    <select
                      value={defaultStatus}
                      onChange={(e) => setDefaultStatus(e.target.value as GameStatus)}
                      className="w-full h-11 px-3 rounded-xl bg-[#18191c] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                    >
                      <option value="backlog">⏳ Quero Jogar (Backlog)</option>
                      <option value="playing">🎮 Jogando</option>
                      <option value="completed">🏆 Zerado</option>
                      <option value="dropped">🛑 Dropado</option>
                    </select>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLoadText}
                  disabled={!textInput.trim()}
                  className="w-full min-h-[46px] rounded-2xl bg-[#00E5FF] hover:bg-[#00c8e0] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Search className="w-4 h-4 text-black" />
                  <span>Analisar e Buscar Capas ({textInput.split(/\r?\n/).filter(Boolean).length} jogos)</span>
                </button>
              </div>
            )}

            {/* ABA 3: ARQUIVO CSV / JSON */}
            {activeTab === "file" && (
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-[#18191c] border-2 border-dashed border-white/15 hover:border-white/30 text-center space-y-3 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-white block">
                      {fileName ? `Arquivo: ${fileName}` : "Clique para selecionar ou arraste seu arquivo"}
                    </span>
                    <span className="text-[11px] text-gray-400 block mt-1">
                      Suporta exportações do Playnite, GOG Galaxy, Backloggd, SteamDB ou CSV/JSON padrão
                    </span>
                  </div>
                </div>

                {fileError && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-200">
                    {fileError}
                  </div>
                )}

                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between text-xs text-gray-400">
                  <span>Deseja um formato de exemplo?</span>
                  <button
                    type="button"
                    onClick={() => {
                      const sampleCsv = `Title,Platform,Status,Hours\nThe Witcher 3,GOG,completed,120\nCyberpunk 2077,Epic Games,playing,45\nGrand Theft Auto V,PlayStation 5,completed,80`;
                      const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = "exemplo-importador-gamevault.csv";
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Baixar Modelo CSV
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 2: REVISÃO DOS JOGOS (REVIEW & MATCH) */}
        {/* ========================================================================= */}
        {step === "review" && (
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
                      <h4 className="text-xs font-bold text-white truncate" title={draft.matchedTitle || draft.originalTitle}>
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
                onClick={() => setStep("input")}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold transition-colors"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={selectedCount === 0}
                className="px-6 py-2.5 rounded-2xl bg-[#00E5FF] hover:bg-[#00c8e0] text-black font-bold text-xs flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-4 h-4 text-black" />
                <span>Confirmar Importação ({selectedCount} jogos)</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 3: IMPORTANDO (PROGRESS BAR) */}
        {/* ========================================================================= */}
        {step === "importing" && (
          <div className="py-12 text-center space-y-4">
            <RefreshCw className="w-10 h-10 text-[#00E5FF] animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-white">Importando jogos para o seu Vault...</h3>
              <p className="text-xs text-gray-400 mt-1">
                Gravando na biblioteca e atualizando estatísticas de jogo
              </p>
            </div>

            <div className="w-full max-w-md mx-auto bg-white/10 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-[#00E5FF] h-full transition-all duration-300 rounded-full"
                style={{ width: `${importProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* ETAPA 4: CONCLUÍDO (SUCESSO) */}
        {/* ========================================================================= */}
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
    </div>
  );
}
