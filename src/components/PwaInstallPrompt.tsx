"use client";

import React, { useState, useEffect } from "react";
import Logo from "./Logo";
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
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn pt-[max(env(safe-area-inset-top,0px)+1rem,1.5rem)] pb-[max(env(safe-area-inset-bottom,0px)+1rem,1.5rem)]"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-[32px] bg-[#14161b] border border-white/15 p-6 sm:p-8 space-y-6 text-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col justify-between"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botão Fechar */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors z-10"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Conteúdo com rolagem suave se necessário */}
            <div className="space-y-6 overflow-y-auto pr-1">
              {/* Cabeçalho */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 shadow-lg shadow-cyan-500/10">
                  <Smartphone className="w-7 h-7 text-[#00E5FF]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">
                      GameVault App
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                      OFICIAL
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Instale no seu smartphone para a melhor experiência gamer.
                  </p>
                </div>
              </div>

              {/* Status se já instalado */}
              {isStandalone ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <div className="text-xs">
                    <strong className="block font-bold">Aplicativo Instalado!</strong>
                    Você já está utilizando a versão de aplicativo em tela cheia com recursos offline ativos.
                  </div>
                </div>
              ) : (
                <>
                  {/* Grid de Benefícios */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-cyan-300 text-xs font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        Super Rápido
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug">
                        Abre instantaneamente direto da sua tela inicial.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-300 text-xs font-bold">
                        <WifiOff className="w-3.5 h-3.5" />
                        Modo Offline
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug">
                        Consulte sua biblioteca e backlog mesmo sem internet.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-purple-300 text-xs font-bold">
                        <Smartphone className="w-3.5 h-3.5" />
                        Tela Cheia
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug">
                        Sem barras de URL, igual a um app nativo da App Store.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                        <Sparkles className="w-3.5 h-3.5" />
                        Leve (&lt;2 MB)
                      </div>
                      <p className="text-[11px] text-gray-400 leading-snug">
                        Não ocupa a memória de armazenamento do celular.
                      </p>
                    </div>
                  </div>

                  {/* Instruções específicas por plataforma */}
                  {isIos ? (
                    /* Guia Passo a Passo para iPhone / Safari */
                    <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                        <Share2 className="w-4 h-4 text-[#00E5FF]" />
                        Como instalar no iPhone (Safari):
                      </h4>

                      <ol className="space-y-2.5 text-xs text-gray-300">
                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            1
                          </span>
                          <span>
                            Toque no botão de <strong>Compartilhar</strong>{" "}
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-white">
                              <Share2 className="w-3 h-3 inline mr-1 text-[#00E5FF]" /> Compartilhar
                            </span>{" "}
                            na barra inferior do Safari.
                          </span>
                        </li>

                        <li className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5">
                            2
                          </span>
                          <span>
                            Role as opções para baixo e selecione{" "}
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
                            Toque em <strong className="text-[#00E5FF]">&ldquo;Adicionar&rdquo;</strong> no canto superior direito. Pronto! O GameVault aparecerá junto aos seus outros aplicativos.
                          </span>
                        </li>
                      </ol>
                    </div>
                  ) : (
                    /* Para Android / Chrome / Computador */
                    <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                      <p className="text-xs text-gray-300 leading-relaxed">
                        Toque no botão abaixo para adicionar o GameVault instantaneamente à sua tela inicial sem precisar da Play Store.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Rodapé / Botão de Ação */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2.5 rounded-full text-xs font-semibold text-gray-400 hover:text-white transition-colors"
              >
                {isStandalone ? "Fechar" : "Mais tarde"}
              </button>

              {!isStandalone && (
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-3 px-6 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  {isIos
                    ? "Entendido, Adicionar no Safari"
                    : deferredPrompt
                    ? "Instalar Aplicativo Agora"
                    : "Instalar no Dispositivo"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
