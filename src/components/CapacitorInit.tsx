"use client";

import { useEffect } from "react";
import { isNativePlatform } from "@/lib/capacitor";

export default function CapacitorInit() {
  useEffect(() => {
    if (!isNativePlatform()) return;

    let cleanupListeners: (() => void) | undefined;

    const setupNativeEnvironment = async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        const { SplashScreen } = await import("@capacitor/splash-screen");
        const { App } = await import("@capacitor/app");

        // Configuração da barra de status no tema escuro do GameVault (#0b0d11)
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: "#0b0d11" });
        } catch {
          // Ignora se não suportado na plataforma atual
        }

        // Oculta a Splash Screen nativa de forma suave após a renderização inicial do React
        try {
          setTimeout(async () => {
            await SplashScreen.hide({ fadeOutDuration: 300 });
          }, 400);
        } catch {
          // Ignora
        }

        // Gerenciamento inteligente do botão Voltar nativo do Android
        try {
          const backListener = await App.addListener("backButton", ({ canGoBack }) => {
            // Se houver modal aberto na tela (identificado por classes comuns ou overlay), fecha primeiro
            const activeModal = document.querySelector("[role='dialog'], [data-modal-open='true']");
            if (activeModal) {
              const closeBtn = activeModal.querySelector("button[aria-label*='Fechar'], button[aria-label*='Close']") as HTMLElement | null;
              if (closeBtn) {
                closeBtn.click();
                return;
              }
            }

            if (canGoBack && window.location.pathname !== "/") {
              window.history.back();
            } else {
              App.exitApp();
            }
          });

          cleanupListeners = () => {
            backListener.remove();
          };
        } catch {
          // Ignora
        }
      } catch (err) {
        console.warn("Falha ao inicializar plugins nativos do Capacitor:", err);
      }
    };

    setupNativeEnvironment();

    return () => {
      if (cleanupListeners) {
        cleanupListeners();
      }
    };
  }, []);

  return null;
}
