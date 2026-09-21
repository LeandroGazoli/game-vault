"use client";

import React, { useState, useEffect } from "react";
import { ImportGameDraft, GameStatus, StorePlatform, UserGame } from "@/lib/types";
import { Download, RefreshCw, AlertCircle, KeyRound, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { fetchOwnPrivateData, saveOwnPrivateData } from "@/lib/userPrivateClient";
import { triggerSuccessHaptic } from "@/lib/capacitor";

interface XboxImportTabProps {
  currentLibrary: UserGame[];
  onDraftsReady: (drafts: ImportGameDraft[]) => Promise<void>;
  onError: (msg: string | null) => void;
}

export default function XboxImportTab({
  currentLibrary,
  onDraftsReady,
  onError,
}: XboxImportTabProps) {
  const { user, updateUserProfile } = useAuth();

  const [xboxInput, setXboxInput] = useState(user?.socialLinks?.xbox || "");
  const [xboxApiKey, setXboxApiKey] = useState("");
  const [xboxTextList, setXboxTextList] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isKeySavedInDb, setIsKeySavedInDb] = useState(false);

  // Carrega a chave privada salva no Firestore (users/{uid}/private/data) ou localStorage
  useEffect(() => {
    let isMounted = true;
    async function loadSavedKey() {
      if (user?.uid) {
        try {
          const privateData = await fetchOwnPrivateData(user.uid);
          if (privateData?.xboxApiKey && isMounted) {
            setXboxApiKey(privateData.xboxApiKey);
            setIsKeySavedInDb(true);
            return;
          }
        } catch {}
      }

      if (typeof window !== "undefined" && isMounted) {
        const localKey = localStorage.getItem("gamevault_xbox_api_key");
        if (localKey) setXboxApiKey(localKey);
      }
    }

    loadSavedKey();
    return () => {
      isMounted = false;
    };
  }, [user?.uid]);

  const handleApiKeyChange = async (val: string) => {
    setXboxApiKey(val);
    if (typeof window !== "undefined") {
      localStorage.setItem("gamevault_xbox_api_key", val.trim());
    }
    // Salva na subcoleção privada no Firestore se o usuário estiver autenticado
    if (user?.uid) {
      try {
        await saveOwnPrivateData(user.uid, { xboxApiKey: val.trim() || null });
        setIsKeySavedInDb(Boolean(val.trim()));
      } catch (err) {
        console.warn("Falha ao salvar chave OpenXBL no Firestore privado:", err);
      }
    }
  };

  const handleLoadXbox = async () => {
    // 1. Se preencheu lista rápida de títulos do Xbox por texto
    if (xboxTextList.trim()) {
      const lines = xboxTextList.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (lines.length > 0) {
        const rawDrafts: ImportGameDraft[] = lines.map((line, idx) => {
          const already = currentLibrary.some(
            (libG) => libG.gameTitle.toLowerCase() === line.toLowerCase()
          );
          return {
            id: `xbox_text_${idx}_${Date.now()}`,
            originalTitle: line,
            matchedTitle: line,
            platform: "Xbox Series" as StorePlatform,
            status: "library" as GameStatus,
            selected: true,
            alreadyInLibrary: already,
          };
        });
        await onDraftsReady(rawDrafts);
        return;
      }
    }

    if (!xboxInput.trim()) {
      onError("Por favor, informe sua Xbox Gamertag ou cole sua lista de jogos.");
      return;
    }

    setIsLoading(true);
    onError(null);

    try {
      const params = new URLSearchParams();
      params.set("gamertag", xboxInput.trim());
      if (xboxApiKey.trim()) params.set("apiKey", xboxApiKey.trim());

      const res = await fetch(`/api/importer/xbox?${params.toString()}`);
      const data: any = await res.json();

      if (!data.success || !Array.isArray(data.games) || data.games.length === 0) {
        onError(data.error || "Nenhum jogo encontrado para este Gamertag.");
        return;
      }

      // Se a busca teve sucesso e usuário não tem a Gamertag salva, sugere salvar
      if (data.gamertag && user && (!user.socialLinks?.xbox || user.socialLinks.xbox !== data.gamertag)) {
        try {
          await updateUserProfile({
            socialLinks: {
              ...(user.socialLinks || {}),
              xbox: data.gamertag,
            },
          });
          triggerSuccessHaptic();
        } catch {}
      }

      const rawDrafts: ImportGameDraft[] = data.games.map((g: any, idx: number) => {
        const already = currentLibrary.some(
          (libG) => libG.gameTitle.toLowerCase() === g.name.toLowerCase()
        );

        const hours = g.playtimeForeverHours || 0;
        let initialStatus: GameStatus = "library";
        if (g.progressPercentage === 100) initialStatus = "completed";
        else if (hours > 20) initialStatus = "completed";
        else if (hours > 1 || (g.currentGamerscore && g.currentGamerscore > 500)) initialStatus = "playing";
        else initialStatus = "library";

        return {
          id: `xbox_${g.titleId || idx}_${idx}`,
          originalTitle: g.name,
          matchedTitle: g.name,
          matchedCover: g.logoUrl || null,
          platform: (g.platform || "Xbox Series") as StorePlatform,
          status: initialStatus,
          userPlaytimeHours: hours > 0 ? hours : undefined,
          selected: true,
          alreadyInLibrary: already,
        };
      });

      await onDraftsReady(rawDrafts);
    } catch (e) {
      console.error("Erro ao carregar jogos do Xbox:", e);
      onError("Erro de comunicação com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
          <span className="font-mono text-[10px] bg-emerald-500/30 px-1.5 py-0.5 rounded text-emerald-200">
            XBOX CLOUD SYNC
          </span>
          <span>Sincronização via Gamertag / Xbox Live</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Insira sua <strong>Xbox Gamertag</strong>. Buscamos seus títulos jogados no Xbox Series X|S,
          Xbox One, Xbox 360 e PC Game Pass com capas e conquistas!
        </p>

        <div className="space-y-2.5">
          <input
            type="text"
            placeholder="Ex: MajorNelson ou sua Gamertag"
            value={xboxInput}
            onChange={(e) => setXboxInput(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[#14161a] border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 font-medium"
          />

          {/* Opções Avançadas: Chave OpenXBL (Persistida no Firestore Privado) */}
          <div className="space-y-1 pt-1">
            <details className="text-[11px] text-gray-400 cursor-pointer" open={Boolean(xboxApiKey)}>
              <summary className="hover:text-white flex items-center gap-1.5 font-medium">
                <KeyRound className="w-3 h-3 text-emerald-400" />
                <span>Opções Avançadas: Minha Própria Chave OpenXBL (xbl.io)</span>
              </summary>
              <div className="pt-2 space-y-1.5">
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Sua chave pessoal da API do OpenXBL..."
                    value={xboxApiKey}
                    onChange={(e) => handleApiKeyChange(e.target.value)}
                    className="w-full h-10 px-3 pr-24 rounded-xl bg-[#0e1015] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 font-mono"
                  />
                  {isKeySavedInDb && (
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded flex items-center gap-1">
                      <Check className="w-2.5 h-2.5" /> Salva no Vault
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500 leading-tight">
                  Salva de forma criptografada e segura na sua subcoleção privada. Opcional caso queira usar cota própria. Obtenha em{" "}
                  <a href="https://xbl.io/dashboard" target="_blank" rel="noopener noreferrer" className="text-emerald-400 underline">
                    xbl.io/dashboard
                  </a>.
                </p>
              </div>
            </details>
          </div>

          {/* Opção alternativa: Lista rápida colada */}
          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <label className="text-[11px] text-gray-400 block font-medium">
              Ou cole sua lista de títulos do Xbox (um por linha):
            </label>
            <textarea
              rows={3}
              placeholder={"Halo Infinite\nForza Horizon 5\nGears 5\nStarfield\nHi-Fi RUSH"}
              value={xboxTextList}
              onChange={(e) => setXboxTextList(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#0e1015] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400 font-mono resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleLoadXbox}
          disabled={isLoading || (!xboxInput.trim() && !xboxTextList.trim())}
          className="w-full min-h-[46px] rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Download className="w-4 h-4 text-black" />}
          <span>Carregar Jogos do Xbox</span>
        </button>
      </div>
    </div>
  );
}
