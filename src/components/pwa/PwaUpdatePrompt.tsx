"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, X, ChevronDown, ChevronUp } from "lucide-react";
import { APP_VERSION, RECENT_CHANGELOG } from "@/lib/version";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";

export default function PwaUpdatePrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Apenas deve ser exibido em modo aplicativo instalado (PWA Standalone)
    const isPwa =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (!isPwa) return;

    // Se já foi dispensado nesta sessão do navegador, respeita a escolha
    const isDismissed = sessionStorage.getItem("pwa_update_dismissed") === "true";
    if (isDismissed) return;

    // 1. Ouvinte para eventos customizados disparados pelo PwaRegister
    const handleUpdateEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ registration?: ServiceWorkerRegistration }>;
      if (customEvent.detail?.registration?.waiting) {
        setWaitingWorker(customEvent.detail.registration.waiting);
      }
      setShowPrompt(true);
    };

    window.addEventListener("pwa-update-available", handleUpdateEvent);

    // 2. Verificação direta se já existe um Service Worker aguardando ativação
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistration().then((reg) => {
        if (reg?.waiting) {
          setWaitingWorker(reg.waiting);
          setShowPrompt(true);
        }
      });
    }

    return () => {
      window.removeEventListener("pwa-update-available", handleUpdateEvent);
    };
  }, []);

  const handleUpdateNow = async () => {
    triggerSuccessHaptic();
    setIsUpdating(true);

    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      waitingWorker.postMessage("SKIP_WAITING");
    } else if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
    }

    // Salva a versão atualizada no armazenamento local
    localStorage.setItem("gv_installed_version", APP_VERSION);

    // Recarrega o app de forma suave para aplicar os novos ativos
    setTimeout(() => {
      window.location.reload();
    }, 350);
  };

  const handleDismiss = () => {
    triggerSelectionHaptic();
    sessionStorage.setItem("pwa_update_dismissed", "true");
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  const latestChangelog = RECENT_CHANGELOG[0];

  return (
    <div
      role="dialog"
      aria-label="Atualização disponível"
      className="fixed left-3 right-3 sm:left-auto sm:right-6 bottom-[max(calc(env(safe-area-inset-bottom,0px)+4.75rem),5.5rem)] sm:bottom-6 sm:w-96 z-[9999] animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div className="bg-[#12151e]/95 backdrop-blur-xl border border-emerald-500/30 rounded-2xl p-3.5 sm:p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7)] text-gray-100 flex flex-col gap-3">
        {/* Cabeçalho do Card */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                  Nova Versão
                </span>
                <span className="text-xs font-mono font-semibold text-emerald-400">
                  {APP_VERSION}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white leading-tight mt-0.5">
                Atualização Disponível
              </h4>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            aria-label="Fechar aviso"
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumo rápido */}
        <p className="text-[11px] text-gray-300 leading-relaxed">
          {latestChangelog ? latestChangelog.title : "Melhorias de desempenho e novas correções disponíveis."}
        </p>

        {/* Acordeão de Novidades (Progressive Disclosure) */}
        {latestChangelog && (
          <div className="border-t border-white/5 pt-1.5">
            <button
              onClick={() => {
                triggerSelectionHaptic();
                setShowDetails(!showDetails);
              }}
              className="flex items-center justify-between w-full text-[10px] font-medium text-emerald-400/90 hover:text-emerald-300 transition-colors py-0.5"
            >
              <span>Ver novidades do que foi desenvolvido</span>
              {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDetails && (
              <ul className="mt-2 space-y-1.5 text-[11px] text-gray-300 bg-[#0c0e14]/80 rounded-xl p-2.5 border border-white/5">
                {latestChangelog.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 mt-0.5">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleUpdateNow}
            disabled={isUpdating}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-black text-xs font-bold py-2.5 px-3 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
            <span>{isUpdating ? "Atualizando..." : "Atualizar Agora"}</span>
          </button>

          <button
            onClick={handleDismiss}
            disabled={isUpdating}
            className="text-xs font-medium text-gray-400 hover:text-white px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
          >
            Mais tarde
          </button>
        </div>
      </div>
    </div>
  );
}
