"use client";

import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import AdaptiveModal from "@/components/ui/AdaptiveModal";
import {
  Download,
  X,
  Sparkles,
  Share2,
  PlusSquare,
  Smartphone,
  WifiOff,
  Zap,
  CheckCircle2,
} from "lucide-react";

/**
 * Disparador global para abrir a tela de instalação PWA de qualquer lugar da aplicação
 */
export function triggerPwaInstall() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-pwa-install"));
  }
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detecta se já está rodando como PWA (standalone)
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneMode);

    // Detecta se é dispositivo iOS (iPhone, iPad, iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleIos =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    setIsIos(isAppleIos);

    // Verifica se o banner já foi dispensado anteriormente
    const dismissed = localStorage.getItem("gamevault_pwa_dismissed");
    if (dismissed) {
      setIsDismissed(true);
    } else if (!standaloneMode) {
      // Delay de 6 segundos para não ser invasivo
      const timer = setTimeout(() => {
        setIsBannerVisible(true);
      }, 6000);
      return () => clearTimeout(timer);
    }

    // Captura o evento nativo de instalação do Chrome / Edge / Android
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!standaloneMode && !dismissed) {
        setIsBannerVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Listener para o evento customizado que permite qualquer botão abrir o modal
    const openHandler = () => {
      setIsModalOpen(true);
    };
    window.addEventListener("open-pwa-install", openHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("open-pwa-install", openHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("GameVault PWA instalado com sucesso!");
        setIsStandalone(true);
      }
      setDeferredPrompt(null);
      setIsModalOpen(false);
      setIsBannerVisible(false);
    } else {
      // Se não há prompt nativo pronto (ex: iOS ou navegador sem trigger automático), abre o modal com o guia
      setIsModalOpen(true);
    }
  };

  const handleDismissBanner = () => {
    setIsBannerVisible(false);
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("gamevault_pwa_dismissed", Date.now().toString());
    }
  };

  return (
    <>
      {/* =========================================================
          MODAL INTERATIVO COMPLETO DE INSTALAÇÃO PWA (Sob Demanda)
      ========================================================= */}
      <AdaptiveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="max-w-lg"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-full text-xs font-semibold text-gray-400 hover:text-white transition-colors cursor-pointer min-h-[44px]"
            >
              {isStandalone ? "Fechar" : "Mais tarde"}
            </button>

            {!isStandalone && (
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex-1 py-3 px-6 rounded-2xl sm:rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer min-h-[48px]"
              >
                <Download className="w-4 h-4 text-black stroke-[2.5]" />
                <span>
                  {isIos
                    ? "Entendido, Adicionar no Safari"
                    : deferredPrompt
                    ? "Instalar Aplicativo Agora"
                    : "Instalar no Dispositivo"}
                </span>
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-6">
          {/* Cabeçalho */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
              <Smartphone className="w-7 h-7 text-[#00E5FF]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-extrabold text-white tracking-tight">
                  MyGameList App
                </h3>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                  PWA OFICIAL
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Experiência 100% nativa, rápida e sem barras do navegador.
              </p>
            </div>
          </div>

          {/* Vantagens / Recursos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-[#00E5FF] flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Carregamento Instantâneo</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Cache inteligente para abertura ultrarrápida.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 flex-shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Suporte Offline</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Acesse sua biblioteca mesmo sem conexão.
                </p>
              </div>
            </div>
          </div>

          {/* Instruções Dinâmicas por Plataforma */}
          {isStandalone ? (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <p className="text-xs text-emerald-300 font-bold">
                Você já está usando a versão PWA instalada do MyGameList!
              </p>
              <p className="text-[11px] text-gray-400">
                Todos os recursos nativos, notificações e sincronização estão ativos.
              </p>
            </div>
          ) : (
            <>
              {isIos ? (
                /* Guia Especial Passo a Passo para iOS Safari */
                <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/30 to-white/[0.02] border border-cyan-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00E5FF]">
                    <Share2 className="w-4 h-4" />
                    <span>Como instalar no iPhone / iPad (Safari):</span>
                  </div>

                  <ol className="space-y-2.5 text-xs text-gray-300">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Toque no botão <strong className="text-white">Compartilhar</strong> na barra inferior do Safari{" "}
                        <Share2 className="w-3.5 h-3.5 inline ml-1 text-cyan-400" />.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Role um pouco para baixo e toque em{" "}
                        <strong className="text-white">
                          &ldquo;Adicionar à Tela de Início&rdquo;
                        </strong>{" "}
                        <PlusSquare className="w-3 h-3 inline ml-1 text-emerald-400" />.
                      </span>
                    </li>

                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        3
                      </span>
                      <span>
                        Toque em <strong className="text-[#00E5FF]">&ldquo;Adicionar&rdquo;</strong> no canto superior direito. Pronto! O MyGameList aparecerá junto aos seus outros aplicativos.
                      </span>
                    </li>
                  </ol>
                </div>
              ) : (
                /* Para Android / Chrome / Computador */
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Toque no botão abaixo para adicionar o MyGameList instantaneamente à sua tela inicial sem precisar da Play Store.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </AdaptiveModal>
    </>
  );
}
