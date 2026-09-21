"use client";

import React, { useState } from "react";
import { ImportGameDraft, GameStatus, StorePlatform, UserGame } from "@/lib/types";
import { Download, FileSpreadsheet, FileText, Check, RefreshCw, UserCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { triggerSuccessHaptic, triggerSelectionHaptic } from "@/lib/capacitor";

interface NintendoImportTabProps {
  currentLibrary: UserGame[];
  onDraftsReady: (drafts: ImportGameDraft[]) => Promise<void>;
  onError: (msg: string | null) => void;
}

const POPULAR_SWITCH_GAMES = [
  "The Legend of Zelda: Tears of the Kingdom",
  "The Legend of Zelda: Breath of the Wild",
  "Super Mario Odyssey",
  "Super Smash Bros. Ultimate",
  "Mario Kart 8 Deluxe",
  "Metroid Dread",
  "Pokémon Legends: Arceus",
  "Animal Crossing: New Horizons",
  "Xenoblade Chronicles 3",
  "Fire Emblem: Three Houses",
].join("\n");

export default function NintendoImportTab({
  currentLibrary,
  onDraftsReady,
  onError,
}: NintendoImportTabProps) {
  const { user, updateUserProfile } = useAuth();

  // Estados dos 3 Métodos
  const [activeMethod, setActiveMethod] = useState<"quicktext" | "csv" | "friendcode">("quicktext");
  const [textList, setTextList] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Método 3: Friend Code
  const [friendCode, setFriendCode] = useState(user?.socialLinks?.switch || "");
  const [isSavingFC, setIsSavingFC] = useState(false);
  const [fcSuccess, setFcSuccess] = useState(false);

  // Método 2: Arquivo CSV
  const [fileName, setFileName] = useState<string | null>(null);

  // Formata Friend Code enquanto digita (SW-XXXX-XXXX-XXXX)
  const handleFriendCodeChange = (val: string) => {
    let clean = val.toUpperCase().replace(/[^0-9A-Z]/g, "");
    if (clean.startsWith("SW")) clean = clean.slice(2);
    clean = clean.replace(/[^0-9]/g, "");

    let formatted = "SW";
    if (clean.length > 0) formatted += `-${clean.slice(0, 4)}`;
    if (clean.length > 4) formatted += `-${clean.slice(4, 8)}`;
    if (clean.length > 8) formatted += `-${clean.slice(8, 12)}`;

    setFriendCode(formatted);
    setFcSuccess(false);
  };

  const handleSaveFriendCode = async () => {
    if (!friendCode.trim()) return;
    setIsSavingFC(true);
    try {
      await updateUserProfile({
        socialLinks: {
          ...(user?.socialLinks || {}),
          switch: friendCode.trim(),
        },
      });
      triggerSuccessHaptic();
      setFcSuccess(true);
      setTimeout(() => setFcSuccess(false), 4000);
    } catch (e) {
      console.error("Erro ao salvar Friend Code:", e);
      onError("Não foi possível salvar seu Friend Code no perfil.");
    } finally {
      setIsSavingFC(false);
    }
  };

  // Método 1: Processar Lista Rápida
  const handleProcessQuickText = async () => {
    const rawLines = textList
      .split(/\r?\n/)
      .map((l) => l.trim().replace(/^[-*•\d.]+\s*/, ""))
      .filter(Boolean);

    if (rawLines.length === 0) {
      onError("Por favor, informe ao menos o título de um jogo.");
      return;
    }

    setIsProcessing(true);
    onError(null);

    try {
      const drafts: ImportGameDraft[] = rawLines.map((title, idx) => {
        const already = currentLibrary.some(
          (libG) => libG.gameTitle.toLowerCase() === title.toLowerCase()
        );

        return {
          id: `switch_txt_${idx}_${Date.now()}`,
          originalTitle: title,
          matchedTitle: title,
          platform: "Nintendo Switch" as StorePlatform,
          status: "library" as GameStatus,
          selected: true,
          alreadyInLibrary: already,
        };
      });

      await onDraftsReady(drafts);
    } catch (e) {
      console.error(e);
      onError("Erro ao processar lista de títulos.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Método 2: Upload CSV
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

        const lines = content.split(/\r?\n/).filter((l) => l.trim() !== "");
        if (lines.length < 2) {
          onError("Arquivo CSV vazio ou sem cabeçalho válido.");
          return;
        }

        const header = lines[0].toLowerCase().split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
        const titleIdx = header.findIndex(
          (h) => h.includes("title") || h.includes("name") || h.includes("jogo") || h.includes("item")
        );
        const hoursIdx = header.findIndex(
          (h) => h.includes("time") || h.includes("hours") || h.includes("horas") || h.includes("played")
        );
        const statusIdx = header.findIndex(
          (h) => h.includes("status") || h.includes("ownership") || h.includes("completion")
        );

        const parsedDrafts: ImportGameDraft[] = [];

        for (let i = 1; i < lines.length; i++) {
          const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(",");
          const cleanRow = row.map((c) => c.trim().replace(/^"|"$/g, ""));
          const title = cleanRow[titleIdx >= 0 ? titleIdx : 0];
          if (!title) continue;

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
          } else if (rawStatus.includes("wishlist") || rawStatus.includes("backlog")) {
            status = "backlog";
          }

          const already = currentLibrary.some(
            (libG) => libG.gameTitle.toLowerCase() === title.toLowerCase()
          );

          parsedDrafts.push({
            id: `switch_csv_${i}_${Date.now()}`,
            originalTitle: title,
            matchedTitle: title,
            platform: "Nintendo Switch" as StorePlatform,
            status,
            userPlaytimeHours: hours,
            selected: true,
            alreadyInLibrary: already,
          });
        }

        if (parsedDrafts.length === 0) {
          onError("Nenhum jogo identificado no CSV.");
          return;
        }

        await onDraftsReady(parsedDrafts);
      } catch (err) {
        console.error(err);
        onError("Falha ao ler arquivo CSV. Verifique o formato.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* ⚠️ Alerta Oficial Nintendo */}
      <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/30 text-xs space-y-1.5">
        <div className="flex items-center gap-2 text-rose-300 font-bold">
          <span className="font-mono text-[10px] bg-rose-500/30 px-1.5 py-0.5 rounded text-rose-200">
            NINTENDO SWITCH
          </span>
          <span>Aviso sobre a Política da Nintendo</span>
        </div>
        <p className="text-[11px] text-gray-300 leading-relaxed">
          A Nintendo <strong>não disponibiliza uma API pública</strong> externa para sincronização direta na nuvem.
          Para garantir a segurança total da sua conta sem riscos de bloqueio, oferecemos 3 métodos confiáveis abaixo:
        </p>
      </div>

      {/* Seletor de Cenários / Métodos */}
      <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10">
        <button
          type="button"
          onClick={() => {
            triggerSelectionHaptic();
            setActiveMethod("quicktext");
          }}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMethod === "quicktext"
              ? "bg-rose-900/60 text-rose-200 border border-rose-500/40 shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">1. Lista Rápida</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerSelectionHaptic();
            setActiveMethod("csv");
          }}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMethod === "csv"
              ? "bg-rose-900/60 text-rose-200 border border-rose-500/40 shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">2. CSV / Export</span>
        </button>

        <button
          type="button"
          onClick={() => {
            triggerSelectionHaptic();
            setActiveMethod("friendcode");
          }}
          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeMethod === "friendcode"
              ? "bg-rose-900/60 text-rose-200 border border-rose-500/40 shadow-sm"
              : "text-gray-400 hover:text-white"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">3. Friend Code</span>
        </button>
      </div>

      {/* CENÁRIO 1: LISTA RÁPIDA */}
      {activeMethod === "quicktext" && (
        <div className="space-y-3 p-4 rounded-2xl bg-[#14161a] border border-white/10">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-gray-300">
              Cole os nomes dos jogos do Switch (1 por linha):
            </label>
            <button
              type="button"
              onClick={() => setTextList(POPULAR_SWITCH_GAMES)}
              className="text-[11px] text-rose-400 hover:text-rose-300 underline font-medium"
            >
              Preencher Exemplo
            </button>
          </div>

          <textarea
            rows={5}
            placeholder="Ex:&#10;The Legend of Zelda: Tears of the Kingdom&#10;Super Mario Odyssey&#10;Metroid Dread&#10;Mario Kart 8 Deluxe"
            value={textList}
            onChange={(e) => setTextList(e.target.value)}
            className="w-full p-3 rounded-xl bg-[#0e1015] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 resize-none font-mono"
          />

          <button
            type="button"
            onClick={handleProcessQuickText}
            disabled={isProcessing || !textList.trim()}
            className="w-full min-h-[44px] rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md shadow-rose-600/20"
          >
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Buscar Capas e Importar para o Switch</span>
          </button>
        </div>
      )}

      {/* CENÁRIO 2: ARQUIVO CSV */}
      {activeMethod === "csv" && (
        <div className="space-y-3 p-4 rounded-2xl bg-[#14161a] border border-white/10">
          <div>
            <span className="text-xs font-bold text-white block">Importar Arquivo CSV / Backup</span>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Compatível com arquivos exportados do <strong>Deku Deals</strong>, <strong>Backloggd</strong>,{" "}
              <strong>SwitchBackup</strong> ou <strong>Tinfoil/DBI</strong>.
            </p>
          </div>

          <label className="relative border-2 border-dashed border-white/15 hover:border-rose-500/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 bg-[#0e1015]">
            <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            <FileSpreadsheet className="w-8 h-8 text-rose-400" />
            <span className="text-xs font-bold text-white">
              {fileName ? fileName : "Clique para selecionar seu arquivo .CSV"}
            </span>
            <span className="text-[10px] text-gray-400">Atribui automaticamente como Nintendo Switch</span>
          </label>
        </div>
      )}

      {/* CENÁRIO 3: FRIEND CODE */}
      {activeMethod === "friendcode" && (
        <div className="space-y-3 p-4 rounded-2xl bg-[#14161a] border border-white/10">
          <div>
            <span className="text-xs font-bold text-white block">Vincular Nintendo Switch Friend Code</span>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Exiba sua Friend Code com badge oficial no seu perfil para que outros jogadores possam te adicionar!
            </p>
          </div>

          <div className="space-y-2">
            <input
              type="text"
              maxLength={17}
              placeholder="SW-0000-0000-0000"
              value={friendCode}
              onChange={(e) => handleFriendCodeChange(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-[#0e1015] border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 font-mono text-center tracking-widest text-sm"
            />

            {fcSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20">
                <Check className="w-4 h-4" />
                <span>Friend Code salva com sucesso no seu perfil!</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveFriendCode}
              disabled={isSavingFC || !friendCode.trim() || friendCode.length < 17}
              className="w-full min-h-[44px] rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
            >
              {isSavingFC ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              <span>Salvar Friend Code no Meu Perfil</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
