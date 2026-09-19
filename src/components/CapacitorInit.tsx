"use client";

import { useEffect } from "react";
import { isNativePlatform } from "@/lib/capacitor";

export default function CapacitorInit() {
  // react-doctor-disable-next-line react-doctor/effect-needs-cleanup -- listener is cleaned up via backListenerPromise.then()
  useEffect(() => {
    if (!isNativePlatform()) return;

    let isMounted = true;
    let splashTimer: ReturnType<typeof setTimeout> | undefined;
    let backListenerPromise: Promise<{ remove: () => Promise<void> | void }> | undefined;

    const setupNativeEnvironment = async () => {
      try {
        const [{ StatusBar, Style }, { SplashScreen }, { App }] = await Promise.all([
          import("@capacitor/status-bar"),
          import("@capacitor/splash-screen"),
          import("@capacitor/app"),
        ]);

        if (!isMounted) return;

        // Configuração da barra de status no tema escuro do GameVault (#0b0d11)
        try {
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: "#0b0d11" });
        } catch {
          // Ignora se não suportado na plataforma atual
        }

        // Oculta a Splash Screen nativa de forma suave após a renderização inicial do React
        try {
          splashTimer = setTimeout(async () => {
            await SplashScreen.hide({ fadeOutDuration: 300 });
          }, 400);
        } catch {
          // Ignora
        }

        // Gerenciamento inteligente do botão Voltar nativo do Android
        try {
          backListenerPromise = App.addListener("backButton", ({ canGoBack }) => {
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
        } catch {
          // Ignora
        }
      } catch (err) {
        console.warn("Falha ao inicializar plugins nativos do Capacitor:", err);
      }
    };

    setupNativeEnvironment();

    return () => {
      isMounted = false;
      if (splashTimer) {
        clearTimeout(splashTimer);
      }
      if (backListenerPromise) {
        backListenerPromise.then((handle) => handle.remove()).catch(() => {});
      }
    };
  }, []);

  return null;
}
