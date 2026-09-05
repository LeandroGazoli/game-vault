"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import AdaptiveModal from "@/components/ui/AdaptiveModal";
import {
  Trophy,
  Sparkles,
  Crown,
  Share2,
  ArrowRight,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { triggerHaptic, triggerSuccessHaptic } from "@/lib/capacitor";

interface LevelUpCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  oldLevel: number;
  rankTitle: string;
  onOpenGamerCard?: () => void;
}

export default function LevelUpCelebrationModal({
  isOpen,
  onClose,
  newLevel,
  oldLevel,
  rankTitle,
  onOpenGamerCard,
}: LevelUpCelebrationModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    // Dispara haptic feedback
    triggerSuccessHaptic();
    triggerHaptic("heavy");

    // Explosão de confetes holográficos gamer (ciano, dourado, roxo)
    try {
      const end = Date.now() + 2.5 * 1000;
      const colors = ["#00E5FF", "#F59E0B", "#A855F7", "#34D399", "#FFFFFF"];

      (function frame() {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
          zIndex: 99999,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
          zIndex: 99999,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (e) {
      console.warn("Confetti effect failed:", e);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
      className="border-[#00E5FF]/40 shadow-[0_0_50px_rgba(0,229,255,0.3)]"
    >
      <div className="space-y-6 text-center py-2 relative overflow-hidden">
        {/* Luz de fundo pulsante */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Tag Superior */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-300 text-xs font-mono font-black tracking-wider uppercase shadow-md">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>CONQUISTA DE PRESTÍGIO // LEVEL UP!</span>
        </div>

        {/* Brasão de Nível Holográfico */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#00E5FF] via-purple-500 to-amber-400 animate-spin opacity-40 blur-md" style={{ animationDuration: "8s" }} />
          <div className="relative w-28 h-28 rounded-full bg-[#10131d] border-2 border-[#00E5FF] flex flex-col items-center justify-center shadow-[0_0_25px_rgba(0,229,255,0.4)]">
            <span className="text-[10px] font-mono font-bold text-gray-400 tracking-wider">
              NÍVEL
            </span>
            <span className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-white via-[#00E5FF] to-cyan-300 drop-shadow-[0_0_12px_rgba(0,229,255,0.6)]">
              {newLevel}
            </span>
            {oldLevel < newLevel && (
              <span className="text-[9px] font-mono text-emerald-400 font-bold">
                ▲ +{newLevel - oldLevel} {newLevel - oldLevel === 1 ? "Nível" : "Níveis"}
              </span>
            )}
          </div>
        </div>

        {/* Título e Parabéns */}
        <div className="space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>Parabéns, Gamer!</span>
            <Sparkles className="w-5 h-5 text-[#00E5FF] animate-pulse" />
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 font-medium">
            Você desbloqueou o título oficial de:
          </p>
          <div className="inline-block px-4 py-1 rounded-xl bg-white/5 border border-white/10 text-sm font-black text-[#00E5FF] shadow-inner font-mono">
            {rankTitle}
          </div>
        </div>

        {/* Benefícios Liberados */}
        <div className="p-3.5 rounded-2xl bg-[#141824] border border-white/10 text-left space-y-2 text-xs">
          <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block">
            Vantagens Ativadas
          </span>
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Sua nova insígnia foi atualizada no seu perfil público</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Sua colocação subiu no Hall da Fama da Comunidade</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Novo card gamer de compartilhamento disponível</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="space-y-2 pt-2">
          {onOpenGamerCard && (
            <button
              onClick={() => {
                onClose();
                onOpenGamerCard();
              }}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-cyan-500 hover:from-white hover:to-gray-200 text-black font-extrabold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(0,229,255,0.4)] cursor-pointer"
            >
              <Share2 className="w-4 h-4 stroke-[2.5]" />
              <span>Compartilhar Conquista nas Redes</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Continuar Jogando
          </button>
        </div>
      </div>
    </AdaptiveModal>
  );
}
