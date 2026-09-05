"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { triggerSuccessHaptic } from "@/lib/capacitor";
import { AlertOctagon, Check, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";

interface AdultContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export default function AdultContentModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Aviso de Conteúdo Adulto (+18)",
  description = "Você está prestes a visualizar jogos e conteúdos com classificação exclusiva para maiores de 18 anos, que podem conter cenas de violência explícita, nudez e temas adultos. Você confirma que é maior de idade e deseja prosseguir?",
}: AdultContentModalProps) {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      if (user) {
        await updateUserProfile({
          adultContentConfirmedAt: new Date().toISOString(),
        });
      }
      try {
        localStorage.setItem("mgl_adult_confirmed", "true");
      } catch {}

      triggerSuccessHaptic();
      onConfirm();
      onClose();
    } catch (err) {
      console.error("Erro ao registrar confirmação de conteúdo adulto:", err);
      // Mesmo em caso de falha de rede temporária, permite a experiência local
      onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="adult-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#16181f] border-2 border-red-500/30 rounded-2xl shadow-2xl p-6 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Superior Vermelho Intenso */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-red-600/20 blur-3xl rounded-full pointer-events-none" />

        {/* Ícone de Destaque */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center mb-3 shadow-lg shadow-red-500/10">
            <ShieldAlert className="w-8 h-8 text-red-400" />
          </div>

          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-950/80 border border-red-500/40 text-red-400 mb-2">
            Classificação Restrita (+18)
          </span>

          <h2 id="adult-modal-title" className="text-xl font-black text-white tracking-tight">
            {title}
          </h2>
        </div>

        {/* Mensagem e Advertência */}
        <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6 space-y-2">
          <p className="text-xs text-gray-300 leading-relaxed">
            {description}
          </p>
          <div className="pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] text-amber-400 font-medium">
            <AlertOctagon className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Esta confirmação é exigida para cumprir diretrizes de proteção e moderação.</span>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 border border-white/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar / Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                Confirmar e Entrar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
