"use client";

import React, { useState } from "react";
import { ImportGameDraft, GameStatus, StorePlatform, UserGame } from "@/lib/types";
import { Download, RefreshCw, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SteamImportTabProps {
  currentLibrary: UserGame[];
  onDraftsReady: (drafts: ImportGameDraft[]) => Promise<void>;
  onError: (msg: string | null) => void;
}

export default function SteamImportTab({
  currentLibrary,
  onDraftsReady,
  onError,
}: SteamImportTabProps) {
  const { user } = useAuth();
  const [steamInput, setSteamInput] = useState(user?.socialLinks?.steam || "");
  const [steamApiKey, setSteamApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLoadSteam = async () => {
    if (!steamInput.trim()) {
      onError("Por favor, informe seu SteamID64 ou link de perfil da Steam.");
      return;
    }

    setIsLoading(true);
    onError(null);

    try {
      // 1. Pré-validação em tempo real
      const validateRes = await fetch("/api/steam/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamInput: steamInput.trim() }),
      });
      const validateData: any = await validateRes.json();

      if (!validateData.valid) {
        onError(validateData.error || "Perfil Steam não encontrado. Verifique o link ou username.");
        return;
      }

      if (validateData.isPrivate) {
        onError(
          `Perfil Steam localizado (${validateData.profile?.personaname || "Gamer"}), porém seus Detalhes dos Jogos estão PRIVADOS na Steam. Altere para "Público" em Editar Perfil > Configurações de Privacidade.`
        );
        return;
      }

      const effectiveSteamId = validateData.steamId64 || steamInput.trim();
      const params = new URLSearchParams();
      params.set("steamId", effectiveSteamId);
      if (steamApiKey.trim()) params.set("apiKey", steamApiKey.trim());

      const res = await fetch(`/api/steam/games?${params.toString()}`);
      const data: any = await res.json();

      if (!data.success || !Array.isArray(data.games) || data.games.length === 0) {
        onError(data.error || "Nenhum jogo encontrado ou a lista de jogos do perfil está privada.");
        return;
      }

      const rawDrafts: ImportGameDraft[] = data.games.map((g: any, idx: number) => {
        const already = currentLibrary.some(
          (libG) => libG.gameTitle.toLowerCase() === g.name.toLowerCase()
        );

        const hours = g.playtimeForeverHours || 0;
        let initialStatus: GameStatus = "library";
        if (hours > 20) initialStatus = "completed";
        else if (hours > 1) initialStatus = "playing";
        else initialStatus = "library";

        return {
          id: `steam_${g.appid || idx}_${idx}`,
          originalTitle: g.name,
          matchedTitle: g.name,
          matchedCover: g.logoUrl || null,
          platform: "Steam" as StorePlatform,
          status: initialStatus,
          userPlaytimeHours: hours > 0 ? hours : undefined,
          selected: true,
          alreadyInLibrary: already,
        };
      });

      await onDraftsReady(rawDrafts);
    } catch (e) {
      console.error("Erro ao carregar jogos da Steam:", e);
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
            STEAM SYNC
          </span>
          <span>Importação direta da Biblioteca Steam</span>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed">
          Insira seu <strong>SteamID64</strong> ou <strong>URL do perfil</strong>. Importamos automaticamente
          os títulos de jogos e suas horas jogadas!
        </p>

        <div className="space-y-2">
          <input
            type="text"
            placeholder="Ex: 76561198000000000 ou https://steamcommunity.com/id/usuario"
            value={steamInput}
            onChange={(e) => setSteamInput(e.target.value)}
            className="w-full h-11 px-3.5 rounded-xl bg-[#14161a] border border-white/15 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]"
          />

          <details className="text-[11px] text-gray-400 cursor-pointer pt-1">
            <summary className="hover:text-white">Opções Avançadas: Chave de API da Steam (Opcional)</summary>
            <div className="pt-2">
              <input
                type="password"
                placeholder="Sua Steam Web API Key..."
                value={steamApiKey}
                onChange={(e) => setSteamApiKey(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#0e1015] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF]"
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Disponível gratuitamente em{" "}
                <a
                  href="https://steamcommunity.com/dev/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 underline"
                >
                  steamcommunity.com/dev/apikey
                </a>
              </p>
            </div>
          </details>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={handleLoadSteam}
          disabled={isLoading || !steamInput.trim()}
          className="w-full min-h-[46px] rounded-2xl bg-[#00E5FF] hover:bg-[#00c8e0] text-black font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-cyan-500/20"
        >
          {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-black" /> : <Download className="w-4 h-4 text-black" />}
          <span>Carregar Jogos da Steam</span>
        </button>
      </div>
    </div>
  );
}
