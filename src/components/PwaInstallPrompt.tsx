"use client";

import React, { useState, useEffect } from "react";
import Logo from "./Logo";
import { Download, X, Sparkles } from "lucide-react";

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Checa se já foi dispensado nesta sessão
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (dismissed) {
        setIsDismissed(true);
        return;
      }
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      console.log("PWA instalado pelo usuário");
    }
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pwa_install_dismissed", "true");
    }
  };

  if (!isVisible || isDismissed) return null;

  return (
    <aside
      aria-label="Instalar Aplicativo GameVault"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 animate-fadeIn"
    >
      <div className="relative rounded-3xl bg-[#18191c]/95 border border-white/15 p-4 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-3">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <Logo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-white">Instalar GameVault</h4>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-[#00E5FF]/20 text-[#00E5FF]">
                APP
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Acesso rápido com modo offline e tela cheia no seu dispositivo.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleInstall}
            className="flex-1 py-2 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            Instalar Aplicativo
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-colors"
          >
            Mais tarde
          </button>
        </div>
      </div>
    </aside>
  );
}
