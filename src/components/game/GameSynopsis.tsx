import React, { useState } from "react";
import { Sparkles, Languages, ChevronUp, ChevronDown, Layers } from "lucide-react";
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
      <div className="rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#18191c] p-5 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#00E5FF]" /> Sobre o Jogo
          </h3>
          <div className="flex items-center gap-2">
            {isTranslating ? (
              <span className="text-[11px] text-cyan-300 bg-cyan-950/50 border border-cyan-500/30 px-3 py-1 rounded-full font-medium flex items-center gap-1.5 animate-pulse">
                <Sparkles className="w-3.5 h-3.5" /> Traduzindo...
              </span>
            ) : descriptionRaw && isLikelyEnglish(descriptionRaw) && onTranslateOnDemand ? (
              <button
                type="button"
                onClick={onTranslateOnDemand}
                className="text-[11px] px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-medium transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                title="Buscar tradução em Português Brasileiro"
              >
                <Languages className="w-3.5 h-3.5" /> Traduzir para PT-BR
              </button>
            ) : descriptionRaw ? (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/20 font-medium flex items-center gap-1">
                🇧🇷 Traduzido para PT-BR
              </span>
            ) : null}
          </div>
        </div>

        <div className="relative">
          <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
            {displayDesc}
          </p>

          {isMobile && isLongDesc && !isDescriptionExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#18191c] to-transparent pointer-events-none" />
          )}
        </div>

        {isMobile && isLongDesc && (
          <button
            type="button"
            onClick={() => {
              triggerSelectionHaptic();
              setIsDescriptionExpanded(!isDescriptionExpanded);
            }}
            className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-cyan-300 border border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            <span>{isDescriptionExpanded ? "Mostrar menos" : "Ler sinopse completa"}</span>
            {isDescriptionExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* 2. Enredo & Narrativa (Storyline, se existir) */}
      {storylineText && (
        <div className="rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#18191c] p-5 sm:p-8 space-y-4 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" /> Enredo &amp; Narrativa
            </h3>
            {!isLikelyEnglish(storyline) && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-950/40 text-purple-300 border border-purple-500/20 font-medium flex items-center gap-1">
                🇧🇷 Traduzido para PT-BR
              </span>
            )}
          </div>

          <div className="relative">
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {displayStory}
            </p>
            {isMobile && isLongStory && !isStorylineExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#18191c] to-transparent pointer-events-none" />
            )}
          </div>

          {isMobile && isLongStory && (
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                setIsStorylineExpanded(!isStorylineExpanded);
              }}
              className="w-full min-h-[44px] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-purple-300 border border-white/10 transition-all active:scale-95 cursor-pointer"
            >
              <span>{isStorylineExpanded ? "Mostrar menos" : "Ler enredo completo"}</span>
              {isStorylineExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
