"use client";

import React from "react";
import AdaptiveModal from "@/components/ui/AdaptiveModal";
import { ShieldCheck, RefreshCw, Hourglass, HelpCircle, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";

interface SyncExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
}

export default function SyncExplainerModal({
  isOpen,
  onClose,
  onContinue,
}: SyncExplainerModalProps) {
  if (!isOpen) return null;

  return (
    <AdaptiveModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Header com badge de passo */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono font-bold uppercase tracking-wider">
            Guia Rápido • Ecossistema
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Como a Sincronização Funciona
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Veja o que você precisa saber antes de conectar suas contas de jogos.
          </p>
        </div>

        {/* 3 Cards de Diretrizes */}
        <div className="space-y-3">
          {/* Passo 1 */}
          <div className="p-4 rounded-2xl bg-[#141822] border border-white/10 space-y-2">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs sm:text-sm font-bold text-white">
                  1. Deixe Seus Perfis Públicos
                </h4>
                <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                  O Game Vault só consegue ler perfis públicos. Acesse a privacidade da sua conta (Steam, PSN, Xbox, etc.) e garanta que sua biblioteca e conquistas estejam visíveis.
                </p>
              </div>
            </div>
            <div className="pt-2 flex flex-wrap gap-2 border-t border-white/5">
              <Link
                href="/artigos"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-gray-300 transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Tutoriais de Privacidade</span>
              </Link>
              <Link
                href="/feedback"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] font-semibold text-gray-300 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Perguntas Frequentes</span>
              </Link>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="p-4 rounded-2xl bg-[#141822] border border-white/10 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white">
                2. Clique em &quot;Sincronizar Agora&quot;
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                A sincronização acontece sob demanda. Após colar seu ID nas configurações, utilize o botão de sincronização para puxar jogos e troféus atualizados.
              </p>
            </div>
          </div>

          {/* Passo 3 */}
          <div className="p-4 rounded-2xl bg-[#141822] border border-white/10 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <Hourglass className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-bold text-white">
                3. A Primeira Sincronização Leva Alguns Minutos
              </h4>
              <p className="text-[11px] text-gray-400 leading-relaxed mt-1">
                Dependendo do tamanho da sua biblioteca, a primeira busca detalhada pode demorar um pouco. O processamento roda em segundo plano e você não precisa esperar na mesma tela.
              </p>
            </div>
          </div>
        </div>

        {/* Botão de Conclusão */}
        <button
          type="button"
          onClick={() => {
            onContinue?.();
            onClose();
          }}
          className="w-full py-3 px-4 rounded-full bg-[#10b981] hover:bg-emerald-400 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 cursor-pointer"
        >
          <span>Entendi, Continuar</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </AdaptiveModal>
  );
}
