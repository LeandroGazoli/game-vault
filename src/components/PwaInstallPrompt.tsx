"use client";

import React, { useState, useEffect } from "react";
import AdaptiveModal from "@/components/ui/AdaptiveModal";
import { isNativePlatform } from "@/lib/capacitor";
import {
  Download,
  Share2,
  PlusSquare,
  Smartphone,
  Zap,
  CheckCircle2,
  Copy,
  Check,
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Se estiver rodando dentro do WebView nativo do Capacitor, não exibe fluxo de PWA
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
    const inApp =
      /fban|fbav|instagram|tiktok|bytedance|line|twitter|snapchat/i.test(userAgent);

    setIsIos(isAppleIos);
    setIsInAppBrowser(inApp);

    // Captura o evento nativo de instalação do Chrome / Edge / Android
    const beforeInstallHandler = (e: Event) => {
      e.preventDefault();
      globalDeferredPrompt = e;
      setDeferredPrompt(e);
    };

    // Listener customizado para abrir o modal sob demanda
    const openHandler = () => {
      setIsModalOpen(true);
    };

    // Sucesso de instalação
    const installSuccessHandler = () => {
      setIsStandalone(true);
      setIsModalOpen(false);
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

  // Ação de instalação acionada pelo modal
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsStandalone(true);
        setIsModalOpen(false);
      }
      setDeferredPrompt(null);
      globalDeferredPrompt = null;
    } else if (isIos) {
      // No iOS, tenta abrir a folha de compartilhamento nativa onde fica "Adicionar à Tela de Início"
      if (typeof navigator !== "undefined" && navigator.share) {
        try {
          await navigator.share({
            title: "MyGameList • Meu Gamer Log",
            text: "Adicione o MyGameList à sua tela de início!",
            url: window.location.origin,
          });
        } catch {
          // Fechou o menu de compartilhamento
        }
      }
      setIsModalOpen(false);
    } else {
      setIsModalOpen(false);
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
    <AdaptiveModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Instalar Aplicativo"
      subtitle="MyGameList • Versão Web App"
      icon={<Smartphone className="w-5 h-5 text-[#00E5FF]" />}
      maxWidth="max-w-md"
      footer={
        <div className="w-full flex flex-col gap-2">
          {!isStandalone && (
            <button
              type="button"
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#00E5FF] hover:bg-[#33ebff] active:scale-[0.98] text-black font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00E5FF]/20 transition-all cursor-pointer min-h-[46px]"
            >
              {isIos ? (
                <>
                  <Share2 className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Compartilhar para Adicionar</span>
                </>
              ) : deferredPrompt ? (
                <>
                  <Download className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Instalar Aplicativo Agora</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                  <span>Entendido</span>
                </>
              )}
            </button>
          )}

          <div className="flex items-center gap-2 w-full">
            {!isStandalone && (
              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.98] text-gray-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[38px]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300 font-bold">Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-gray-400" />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className={`${
                isStandalone ? "w-full" : "px-4"
              } py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-semibold text-xs transition-colors cursor-pointer min-h-[38px]`}
            >
              Fechar
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3.5">
        {/* Vantagem rápida */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-cyan-200">
          <Zap className="w-4 h-4 text-[#00E5FF] shrink-0" />
          <span className="font-medium text-[11px] leading-snug">
            Experiência em tela cheia sem barras, carregamento instantâneo e suporte offline.
          </span>
        </div>

        {/* Conteúdo Dinâmico */}
        {isStandalone ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <p className="text-xs text-emerald-300 font-bold">
              Você já está usando o aplicativo instalado!
            </p>
            <p className="text-[11px] text-gray-400">
              Todos os recursos nativos, notificações e sincronização estão ativos.
            </p>
          </div>
        ) : (
          <>
            {/* Aviso se estiver no navegador do Instagram, TikTok, etc. */}
            {isInAppBrowser && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs text-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong className="text-amber-300 font-bold block mb-0.5">
                    Navegador do App Detectado
                  </strong>
                  Para instalar, toque nos três pontinhos <strong>(...)</strong> do aplicativo e selecione <strong>&ldquo;Abrir no Safari&rdquo;</strong>.
                </div>
              </div>
            )}

            {/* GUIA PASSO A PASSO PARA iOS */}
            {isIos ? (
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-3">
                <p className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Como instalar no iPhone / iPad (Safari):</span>
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="leading-snug">
                      Toque no botão <strong className="text-white">Compartilhar</strong> <Share2 className="w-3.5 h-3.5 inline text-cyan-400 mx-0.5" /> na barra inferior do Safari.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="leading-snug">
                      Role a lista e toque em <strong className="text-white">&ldquo;Adicionar à Tela de Início&rdquo;</strong> <PlusSquare className="w-3.5 h-3.5 inline text-emerald-400 mx-0.5" />.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-[#00E5FF]/20 text-[#00E5FF] font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="leading-snug">
                      Toque em <strong className="text-[#00E5FF]">&ldquo;Adicionar&rdquo;</strong> no canto superior direito.
                    </p>
                  </div>
                </div>
              </div>
            ) : deferredPrompt ? (
              /* ANDROID / CHROME / EDGE COM PROMPT PRONTO */
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 text-xs text-gray-300 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-[#00E5FF]" />
                  <span>Instalação Direta</span>
                </p>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Toque no botão abaixo para adicionar o MyGameList à sua tela de início sem precisar da Play Store.
                </p>
              </div>
            ) : (
              /* ANDROID / DESKTOP MANUAL */
              <div className="rounded-2xl bg-white/[0.04] border border-white/10 p-3.5 space-y-3">
                <p className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                  <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>Instalação manual no navegador:</span>
                </p>

                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      1
                    </span>
                    <p className="leading-snug">
                      Toque no menu do navegador (três pontinhos <strong className="text-white">⋮</strong> ou ícone na barra de URL).
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      2
                    </span>
                    <p className="leading-snug">
                      Selecione <strong className="text-white">&ldquo;Instalar aplicativo&rdquo;</strong> ou <strong className="text-white">&ldquo;Adicionar à tela inicial&rdquo;</strong>.
                    </p>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-white/10 text-white font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      3
                    </span>
                    <p className="leading-snug">
                      Confirme em <strong className="text-[#00E5FF]">&ldquo;Instalar&rdquo;</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdaptiveModal>
  );
}
