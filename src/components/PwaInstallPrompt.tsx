"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import AdaptiveModal from "@/components/ui/AdaptiveModal";
import { isNativePlatform } from "@/lib/capacitor";
import {
  Download,
  X,
  Share2,
  PlusSquare,
  Smartphone,
  WifiOff,
  Zap,
  CheckCircle2,
  Copy,
  Check,
  ArrowDown,
  ArrowUp,
  AlertTriangle,
} from "lucide-react";

// Cache global do evento nativo para permitir disparo com 1 clique de qualquer botão
let globalDeferredPrompt: any = null;

/**
 * Disparador global para instalar ou abrir o guia PWA de qualquer lugar da aplicação
 */
export function triggerPwaInstall() {
  if (typeof window === "undefined") return;

  // 1. Se o prompt nativo do navegador já estiver disponível, dispara na hora com 1 clique!
  if (globalDeferredPrompt) {
    globalDeferredPrompt.prompt();
    globalDeferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] Aplicativo instalado com sucesso!");
        window.dispatchEvent(new CustomEvent("pwa-installed-success"));
      }
      globalDeferredPrompt = null;
    });
    return;
  }

  // 2. Caso contrário (iOS, prompt ainda não capturado ou navegador sem trigger automático),
  // abre o modal explicativo
  window.dispatchEvent(new CustomEvent("open-pwa-install"));
}

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isIpad, setIsIpad] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosPointer, setShowIosPointer] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Se estiver rodando dentro do WebView nativo do Capacitor, não mostra avisos de PWA
    if (isNativePlatform()) {
      setIsStandalone(true);
      return;
    }

    // Detecta se já está rodando como PWA (modo standalone)
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standaloneMode);

    // Detecta plataforma e navegador
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleIos =
      /iphone|ipad|ipod/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const isAppleIpad =
      /ipad/.test(userAgent) ||
      (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1 && !/iphone/.test(userAgent));
    const isSafari =
      /safari/.test(userAgent) && !/crios|fxios|edgios|opios|opt/i.test(userAgent);
    const inApp =
      /fban|fbav|instagram|tiktok|bytedance|line|twitter|snapchat/i.test(userAgent);

    setIsIos(isAppleIos);
    setIsIpad(isAppleIpad);
    setIsIosSafari(isAppleIos && isSafari && !inApp);
    setIsInAppBrowser(inApp);

    // Verifica se o banner foi dispensado nos últimos 7 dias
    const dismissedAt = localStorage.getItem("gamevault_pwa_dismissed");
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    const isRecentlyDismissed =
      dismissedAt && Date.now() - parseInt(dismissedAt, 10) < SEVEN_DAYS_MS;

    if (isRecentlyDismissed) {
      setIsDismissed(true);
    } else if (!standaloneMode) {
      // Exibe banner após 5 segundos de interação
      const timer = setTimeout(() => {
        setIsBannerVisible(true);
      }, 5000);
      return () => clearTimeout(timer);
    }

    // Captura o evento nativo de instalação do Chrome / Edge / Android
    const beforeInstallHandler = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      setDeferredPrompt(e);
      if (!standaloneMode && !isRecentlyDismissed) {
        setIsBannerVisible(true);
      }
    };

    // Listener customizado para abrir o modal sob demanda
    const openHandler = () => {
      setIsModalOpen(true);
    };

    // Sucesso de instalação
    const installSuccessHandler = () => {
      setIsStandalone(true);
      setIsModalOpen(false);
      setIsBannerVisible(false);
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    };

    window.addEventListener("beforeinstallprompt", beforeInstallHandler);
    window.addEventListener("open-pwa-install", openHandler);
    window.addEventListener("pwa-installed-success", installSuccessHandler);
    window.addEventListener("appinstalled", installSuccessHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallHandler);
      window.removeEventListener("open-pwa-install", openHandler);
      window.removeEventListener("pwa-installed-success", installSuccessHandler);
      window.removeEventListener("appinstalled", installSuccessHandler);
    };
  }, []);

  // Timer para sumir com o ponteiro animado do iOS após 10 segundos
  useEffect(() => {
    if (!showIosPointer) return;
    const timer = setTimeout(() => {
      setShowIosPointer(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, [showIosPointer]);

  // Ação de instalação acionada pelo modal
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsStandalone(true);
        setIsModalOpen(false);
        setIsBannerVisible(false);
      }
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    } else if (isIos) {
      // No iOS Safari, tenta disparar o menu de compartilhamento nativo
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: "MyGameList • Meu Gamer Log",
            text: "Adicione o MyGameList à sua tela de início!",
            url: window.location.origin,
          });
        } catch {
          // Usuário fechou a folha de compartilhamento
        }
      }
      // Fecha o modal e ativa o indicador visual animado apontando para a barra do Safari
      setIsModalOpen(false);
      setShowIosPointer(true);
    } else {
      // Caso não haja prompt automático em outros navegadores, fecha o modal com sucesso
      setIsModalOpen(false);
    }
  };

  // Ação de clique rápido no Smart Banner flutuante
  const handleBannerAction = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choice: any) => {
        if (choice.outcome === "accepted") {
          setIsStandalone(true);
          setIsBannerVisible(false);
        }
        setDeferredPrompt(null);
        globalDeferredPrompt = null;
      });
    } else {
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

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback
    }
  };

  return (
    <>
      {/* =========================================================
          1. SMART BANNER FLUTUANTE (Discreto & Não Invasivo)
      ========================================================= */}
      {isBannerVisible && !isStandalone && !isDismissed && (
        <div
          role="region"
          aria-label="Aviso de instalação do aplicativo"
          className="fixed bottom-[max(calc(env(safe-area-inset-bottom,0px)+4.75rem),5.5rem)] left-3 right-3 sm:left-auto sm:right-6 sm:max-w-sm z-30 animate-fadeIn"
        >
          <div className="bg-[#12151d]/95 backdrop-blur-xl border border-[#00E5FF]/30 rounded-2xl p-3 shadow-[0_10px_35px_rgba(0,0,0,0.8)] ring-1 ring-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center shrink-0 text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.3)]">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate flex items-center gap-1.5">
                  Instalar MyGameList
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF]">
                    APP
                  </span>
                </h4>
                <p className="text-[10px] text-gray-400 truncate mt-0.5">
                  {isIos
                    ? "Adicione à tela de início no Safari"
                    : "Acesso rápido e suporte offline"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleBannerAction}
                className="py-1.5 px-3 rounded-xl bg-[#00E5FF] hover:bg-[#33ebff] text-black font-black text-xs transition-all active:scale-95 shadow-md shadow-[#00E5FF]/25 cursor-pointer"
              >
                {isIos ? "Como Instalar" : deferredPrompt ? "Instalar" : "Ver Como"}
              </button>
              <button
                type="button"
                onClick={handleDismissBanner}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                title="Dispensar por 7 dias"
                aria-label="Dispensar banner de instalação"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          2. GUIA VISUAL FLUTUANTE DE COMPARTILHAMENTO DO SAFARI (iOS)
      ========================================================= */}
      {showIosPointer &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={() => setShowIosPointer(false)}
            className={`fixed ${
              isIpad
                ? "top-4 right-4"
                : "bottom-[max(env(safe-area-inset-bottom,0px)+12px,24px)] inset-x-4"
            } z-[110] flex flex-col items-center cursor-pointer animate-slideUp`}
          >
            <div className="bg-[#12151e]/95 backdrop-blur-xl border border-[#00E5FF]/50 text-white px-4 py-3 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.9)] flex items-center justify-between gap-3 max-w-sm w-full ring-2 ring-[#00E5FF]/20">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center shrink-0">
                  <Share2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white">
                    {isIpad
                      ? "Toque no botão Compartilhar acima ↑"
                      : "Toque em Compartilhar abaixo ↓"}
                  </p>
                  <p className="text-[11px] text-[#00E5FF] font-medium truncate">
                    Selecione &ldquo;Adicionar à Tela de Início&rdquo;
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowIosPointer(false);
                }}
                className="p-1 rounded-full text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seta indicadora apontando para a barra do navegador */}
            <div className={`flex justify-center ${isIpad ? "-order-1 pb-1" : "pt-1.5"}`}>
              {isIpad ? (
                <ArrowUp className="w-6 h-6 text-[#00E5FF] animate-bounce drop-shadow-[0_0_10px_#00E5FF]" />
              ) : (
                <ArrowDown className="w-6 h-6 text-[#00E5FF] animate-bounce drop-shadow-[0_0_10px_#00E5FF]" />
              )}
            </div>
          </div>,
          document.body
        )}

      {/* =========================================================
          3. MODAL COMPLETO DE INSTALAÇÃO PWA
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
              <div className="flex items-center gap-2 flex-1 justify-end">
                {/* Botão de Copiar Link (Útil para Safari ou envio a amigos) */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="py-3 px-3.5 rounded-2xl sm:rounded-full bg-white/5 hover:bg-white/10 text-gray-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[48px]"
                  title="Copiar link do MyGameList"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300 font-bold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>

                {/* Botão de Ação Principal Dinâmico */}
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex-1 py-3 px-5 rounded-2xl sm:rounded-full bg-amber-400 hover:bg-amber-300 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xl shadow-amber-500/20 active:scale-95 cursor-pointer min-h-[48px]"
                >
                  {isIos ? (
                    <>
                      <Share2 className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>Adicionar no Safari</span>
                    </>
                  ) : deferredPrompt ? (
                    <>
                      <Download className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>Instalar Agora (1 Clique)</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                      <span>Entendido</span>
                    </>
                  )}
                </button>
              </div>
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
                Experiência 100% nativa, rápida e em tela cheia sem barras de navegação.
              </p>
            </div>
          </div>

          {/* Vantagens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-[#00E5FF] flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Carregamento Instantâneo</h4>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Cache inteligente para abertura e navegação ultrarrápida.
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
                  Acesse sua biblioteca gamer mesmo se a conexão cair.
                </p>
              </div>
            </div>
          </div>

          {/* Conteúdo Dinâmico por Plataforma */}
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
              {/* ALERTA SE ESTIVER EM NAVEGADOR IN-APP (Instagram, TikTok, etc.) */}
              {isInAppBrowser && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-300 block font-bold mb-0.5">
                      Navegador interno detectado
                    </strong>
                    O iOS e aplicativos como Instagram/TikTok não permitem instalação direta.
                    Toque nos três pontinhos <strong>(...)</strong> do aplicativo e selecione{" "}
                    <strong>&ldquo;Abrir no Safari&rdquo;</strong> para instalar o app.
                  </div>
                </div>
              )}

              {/* GUIA PASSO A PASSO PARA iOS */}
              {isIos ? (
                <div className="p-4 rounded-2xl bg-gradient-to-b from-cyan-950/30 to-white/[0.02] border border-cyan-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00E5FF]">
                    <Share2 className="w-4 h-4" />
                    <span>Como adicionar no iPhone / iPad ({isIosSafari ? "Safari" : "Navegador iOS"}):</span>
                  </div>

                  <ol className="space-y-3 text-xs text-gray-300">
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
                        Role a lista de opções para baixo e toque em{" "}
                        <strong className="text-white">
                          &ldquo;Adicionar à Tela de Início&rdquo;
                        </strong>{" "}
                        <PlusSquare className="w-3.5 h-3.5 inline ml-1 text-emerald-400" />.
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
              ) : deferredPrompt ? (
                /* ANDROID / CHROME / EDGE COM PROMPT NATIVO PRONTO */
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Toque no botão <strong className="text-white">&ldquo;Instalar Agora&rdquo;</strong> abaixo para adicionar o MyGameList instantaneamente à sua tela inicial sem precisar da Play Store.
                  </p>
                </div>
              ) : (
                /* ANDROID / DESKTOP MANUAL (sem evento beforeinstallprompt automático) */
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#00E5FF]">
                    <Download className="w-4 h-4" />
                    <span>Instalação manual no navegador:</span>
                  </div>
                  <ol className="space-y-2 text-xs text-gray-300">
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                        1
                      </span>
                      <span>
                        Toque no menu de opções do navegador (três pontinhos <strong className="text-white">⋮</strong> no topo direito ou ícone de instalar na barra de URL).
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                        2
                      </span>
                      <span>
                        Selecione <strong className="text-white">&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong className="text-white">&ldquo;Adicionar à tela inicial&rdquo;</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0">
                        3
                      </span>
                      <span>Confirme em <strong className="text-[#00E5FF]">&ldquo;Instalar&rdquo;</strong>.</span>
                    </li>
                  </ol>
                </div>
              )}
            </>
          )}
        </div>
      </AdaptiveModal>
    </>
  );
}
