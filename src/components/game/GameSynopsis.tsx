import React, { useState } from "react";
import { Languages, ChevronUp, ChevronDown, BookOpen } from "lucide-react";
import { sanitizeTranslation } from "@/lib/translate";
import { isLikelyEnglish } from "@/lib/gameUtils";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface GameSynopsisProps {
  descriptionRaw?: string;
  storyline?: string;
  isMobile?: boolean;
  isTranslating?: boolean;
  onTranslateOnDemand?: () => void;
}

export default function GameSynopsis({
  descriptionRaw,
  storyline,
  isMobile = false,
  isTranslating = false,
  onTranslateOnDemand,
}: GameSynopsisProps) {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isStorylineExpanded, setIsStorylineExpanded] = useState(false);

  const rawText = sanitizeTranslation(descriptionRaw) || "Descrição não disponível para este jogo.";
  const isLongDesc = rawText.length > 320;
  const displayDesc = isMobile && isLongDesc && !isDescriptionExpanded
    ? rawText.slice(0, 300) + "..."
    : rawText;

  const storylineText = storyline ? sanitizeTranslation(storyline) : null;
  const isLongStory = storylineText ? storylineText.length > 280 : false;
  const displayStory = isMobile && isLongStory && !isStorylineExpanded && storylineText
    ? storylineText.slice(0, 260) + "..."
    : storylineText;

  return (
    <div className="space-y-6">
      {/* 1. Sobre o Jogo (Sinopse) */}
      <section className="glass-card rounded-2xl p-6 lg:p-7 border border-white/10 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              🎮
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">Sobre o Jogo</h2>
          </div>

          <div className="flex items-center gap-2">
            {isTranslating ? (
              <span className="text-xs text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 rounded-full font-mono font-medium flex items-center gap-1.5 animate-pulse">
                Traduzindo...
              </span>
            ) : descriptionRaw && isLikelyEnglish(descriptionRaw) && onTranslateOnDemand ? (
              <button
                type="button"
                onClick={onTranslateOnDemand}
                className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-medium transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Buscar tradução em Português Brasileiro"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>Traduzir para PT-BR</span>
              </button>
            ) : descriptionRaw ? (
              <span className="px-2.5 py-1 rounded-full bg-emerald-950/70 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Traduzido PT-BR</span>
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <p className="text-sm lg:text-base text-zinc-300 leading-relaxed whitespace-pre-line">
            {displayDesc}
          </p>

          {isMobile && isLongDesc && !isDescriptionExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#121620] to-transparent pointer-events-none" />
          )}
        </div>

        {isMobile && isLongDesc && (
          <button
            type="button"
            onClick={() => {
              triggerSelectionHaptic();
              setIsDescriptionExpanded(!isDescriptionExpanded);
            }}
            className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-emerald-400 border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            <span>{isDescriptionExpanded ? "Mostrar menos" : "Ler sinopse completa"}</span>
            {isDescriptionExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        )}
      </section>

      {/* 2. Enredo & Narrativa (Storyline, se existir) */}
      {storylineText && (
        <section className="glass-card rounded-2xl p-6 lg:p-7 border border-white/10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight">Enredo &amp; Narrativa</h2>
            </div>
            {!isLikelyEnglish(storyline) && (
              <span className="text-xs text-zinc-400 font-mono">História Oficial</span>
            )}
          </div>

          <div className="relative">
            <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">
              {displayStory}
            </p>
            {isMobile && isLongStory && !isStorylineExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#121620] to-transparent pointer-events-none" />
            )}
          </div>

          {isMobile && isLongStory && (
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                setIsStorylineExpanded(!isStorylineExpanded);
              }}
              className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-indigo-400 border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <span>{isStorylineExpanded ? "Mostrar menos" : "Ler enredo completo"}</span>
              {isStorylineExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </section>
      )}
    </div>
  );
}
