"use client";

import React from "react";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import {
  X,
  Sparkles,
  Crown,
  Palette,
  Dices,
  Download,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Settings,
} from "lucide-react";

interface ProfileToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  isPremium: boolean;
  isAdmin: boolean;
  onOpenManagePlan: () => void;
  onOpenUpgrade: () => void;
  onOpenCustomizer: () => void;
  onOpenRoulette: () => void;
  onOpenWrapped: () => void;
  onOpenExport: () => void;
  onInstallPwa: () => void;
}

export default function ProfileToolsModal({
  isOpen,
  onClose,
  user,
  isPremium,
  isAdmin,
  onOpenManagePlan,
  onOpenUpgrade,
  onOpenCustomizer,
  onOpenRoulette,
  onOpenWrapped,
  onOpenExport,
  onInstallPwa,
}: ProfileToolsModalProps) {
  if (!isOpen) return null;

  const handleAction = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <div className="fixed inset-0 z-[999] !m-0 !mt-0 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      {/* Backdrop click */}
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal / Bottom Sheet Container */}
      <div
        className="relative z-10 w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-[#14161a] border border-white/15 p-5 sm:p-7 shadow-2xl space-y-5 overflow-hidden max-h-[90vh] sm:max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Mobile handle indicator */}
        <div className="sm:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-1 flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-shrink-0 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-md">
              <SlidersHorizontal className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Ações &amp; Ferramentas
              </h3>
              <p className="text-xs text-gray-400">
                Ajustes e utilitários do seu perfil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="overflow-y-auto space-y-2 pr-1 -mr-1 py-1">
          {/* 1. Plano / Assinatura */}
          {isPremium ? (
            <button
              onClick={() => handleAction(onOpenManagePlan)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/20 hover:bg-cyan-950/40 border border-[#00E5FF]/25 hover:border-[#00E5FF]/50 transition-all text-left group active:scale-[0.99] min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                      Gerenciar Meu Plano
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00E5FF] text-black">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Detalhes do passe, validade e faturas
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          ) : (
            <button
              onClick={() => handleAction(onOpenUpgrade)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:from-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 transition-all text-left group active:scale-[0.99] min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-sm">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Fazer Upgrade (Seja PRO)
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-black">
                      VIP
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Zero anúncios, selo neon e temas exclusivos
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* 2. Personalizar Tema e Capa */}
          <button
            onClick={() => handleAction(onOpenCustomizer)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Personalizar Perfil
                </span>
                <p className="text-[11px] text-gray-400">
                  Capa, temas, títulos, insígnias e links sociais
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 3. Roleta do Backlog */}
          <button
            onClick={() => handleAction(onOpenRoulette)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Dices className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  Roleta do Backlog
                </span>
                <p className="text-[11px] text-gray-400">
                  Sorteie o próximo jogo para zerar da sua lista
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 4. Retrospectiva Gamer Wrapped */}
          <button
            onClick={() => handleAction(onOpenWrapped)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00E5FF] flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00E5FF] transition-colors">
                  Retrospectiva Gamer
                </span>
                <p className="text-[11px] text-gray-400">
                  Veja suas estatísticas do ano em cartões visuais
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 5. Exportar Biblioteca */}
          <button
            onClick={() => handleAction(onOpenExport)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Exportar Biblioteca
                </span>
                <p className="text-[11px] text-gray-400">
                  Baixe em Excel (CSV), JSON ou gere link dinâmico
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 6. Instalar PWA */}
          <button
            onClick={() => handleAction(onInstallPwa)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                    Instalar no Celular (PWA)
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300">
                    App
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Adicione à tela inicial com acesso rápido offline
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 7. Painel de Administrador (se admin) */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-left group active:scale-[0.99] min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-amber-300">
                    Painel do Administrador
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Configuração de planos, preços e usuários
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
