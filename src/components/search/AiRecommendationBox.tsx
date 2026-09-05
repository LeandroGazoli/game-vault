"use client";

import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SystemSettings, Game } from "@/lib/types";
import GameCard from "@/components/GameCard";
import {
  Sparkles,
  Send,
  Loader2,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
} from "lucide-react";

const SUGGESTION_PROMPTS = [
  "Jogos estilo Dark Souls com temática futurista",
  "RPGs de ação com ótima história e menos de 20 horas",
  "Jogos cooperativos relaxantes para jogar a dois",
  "Metroidvanias sombrios com combate desafiador",
  "Mundo aberto imersivo com sobrevivência e exploração",
];

export default function AiRecommendationBox() {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;

    // Monitora a feature flag em tempo real do Admin
    const unsub = onSnapshot(doc(db, "system", "settings"), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as SystemSettings;
        setIsEnabled(Boolean(data.features?.aiRecommendations));
      }
    });

    return () => unsub();
  }, []);

  if (!isEnabled) return null;

  const handleSearchAi = async (searchPrompt?: string) => {
    const text = (searchPrompt || prompt).trim();
    if (!text || text.length < 3) return;

    setIsLoading(true);
    setErrorMessage(null);
    setExplanation(null);
    setRecommendedGames([]);

    try {
      const res = await fetch("/api/ai/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        const fullMsg = data.details ? `${data.error} (${data.details})` : data.error;
        setErrorMessage(fullMsg || "Não foi possível obter recomendações no momento.");
        return;
      }

      setExplanation(data.explanation || null);
      setRecommendedGames(data.games || []);
    } catch (err: any) {
      setErrorMessage("Erro de conexão ao consultar a IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-[32px] bg-gradient-to-br from-[#12151f] via-[#141824] to-[#0c0e15] border border-cyan-500/30 p-5 sm:p-7 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Glow de fundo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header com Toggle Expandir */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-[#00E5FF] flex items-center justify-center shadow-lg shadow-cyan-500/10 shrink-0">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-white tracking-tight">
                Curador Gamer Inteligente (IA)
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00E5FF] text-[9px] font-mono font-bold uppercase border border-cyan-500/30">
                100% FREE
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Descreva em linguagem natural o estilo que você quer jogar e receba a recomendação ideal.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="self-end sm:self-auto px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-300 transition-colors border border-white/10 min-h-[38px]"
        >
          {isOpen ? "Recolher Assistente" : "Abrir Assistente"}
        </button>
      </div>

      {/* Conteúdo Expansível */}
      {isOpen && (
        <div className="space-y-4 pt-2 relative z-10 animate-fadeIn">
          {/* Campo de Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearchAi();
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ex: Quero um RPG desafiador com temática cyberpunk e gráficos modernos..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isLoading}
                className="w-full bg-[#0b0c10] border border-white/15 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF] min-h-[46px]"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || prompt.trim().length < 3}
              className="px-6 py-3 rounded-2xl bg-[#00E5FF] hover:bg-[#00cbe3] disabled:opacity-50 text-black font-black text-xs transition-all shadow-lg shadow-[#00E5FF]/20 flex items-center justify-center gap-2 shrink-0 min-h-[46px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Consultando IA...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Recomendar</span>
                </>
              )}
            </button>
          </form>

          {/* Sugestões Rápidas de Prompt */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-mono text-gray-500 font-bold flex items-center gap-1">
              <Lightbulb className="w-3 h-3 text-amber-400" />
              <span>Sugestões rápidas de pesquisa:</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTION_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(p);
                    handleSearchAi(p);
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-gray-300 hover:text-white transition-colors text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Explicação da IA */}
          {explanation && (
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs sm:text-sm leading-relaxed space-y-1">
              <div className="font-bold text-[#00E5FF] flex items-center gap-1.5 text-xs font-mono uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Parecer do Curador:</span>
              </div>
              <p>{explanation}</p>
            </div>
          )}

          {/* Grid de Jogos Recomendados */}
          {recommendedGames.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="text-xs font-bold uppercase font-mono text-white tracking-wider flex items-center gap-2">
                <span>Títulos Selecionados para Você ({recommendedGames.length})</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {recommendedGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
