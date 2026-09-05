"use client";

import React, { useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { calculateAge } from "@/lib/gameUtils";
import { triggerSuccessHaptic, triggerSelectionHaptic } from "@/lib/capacitor";
import { X, Calendar, ShieldCheck, AlertTriangle, Check, Loader2 } from "lucide-react";

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified?: () => void;
}

export default function AgeVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: AgeVerificationModalProps) {
  const { user, updateUserProfile } = useAuth();
  const [birthDate, setBirthDate] = useState<string>(user?.birthDate || "");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAge = birthDate ? calculateAge(birthDate) : null;
  const isAdult = currentAge !== null && currentAge >= 18;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) {
      setErrorMsg("Por favor, selecione sua data de nascimento.");
      return;
    }

    const age = calculateAge(birthDate);
    if (age < 18) {
      setErrorMsg("É necessário ter pelo menos 18 anos para acessar jogos adultos.");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg(null);
      await updateUserProfile({ birthDate });
      triggerSuccessHaptic();
      onVerified?.();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar data de nascimento:", err);
      setErrorMsg("Falha ao salvar. Tente novamente em instantes.");
    } finally {
      setSaving(false);
    }
  };

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#16181f] border border-white/10 rounded-2xl shadow-2xl p-6 overflow-hidden text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow decorativo no topo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1.5 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 rounded-full blur-sm" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h2 id="age-modal-title" className="text-lg font-black tracking-tight text-white flex items-center gap-2">
              Confirmação de Idade <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">+18</span>
            </h2>
            <p className="text-xs text-gray-400">Verificação de maioridade necessária</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 mb-5 leading-relaxed">
          Para liberar jogos com classificação para adultos (+18), informe sua data de nascimento.
          Essa informação é privada e utilizada estritamente para liberação de filtros e títulos maduros.
        </p>

        {/* Formulário */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
              Sua Data de Nascimento
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setErrorMsg(null);
                triggerSelectionHaptic();
              }}
              max={new Date().toISOString().split("T")[0]}
              min="1920-01-01"
              required
              className="w-full px-4 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white text-sm focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>

          {/* Feedback Dinâmico de Idade */}
          {currentAge !== null && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 transition-all ${
                isAdult
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
              }`}
            >
              {isAdult ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    Idade identificada: <strong>{currentAge} anos</strong>. Você é maior de idade e está apto a acessar conteúdo +18.
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                  <span>
                    Idade identificada: <strong>{currentAge} anos</strong>. Conteúdo adulto (+18) é restrito a maiores de 18 anos.
                  </span>
                </>
              )}
            </div>
          )}

          {/* Mensagem de Erro */}
          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !isAdult}
              className={`px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
                isAdult && !saving
                  ? "bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-lg shadow-red-500/20"
                  : "bg-white/10 text-gray-500 cursor-not-allowed"
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Confirmar Idade
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return null;
  return createPortal(modalContent, document.body);
}
