"use client";

import { useEffect, useRef } from "react";
import { isNativePlatform } from "@/lib/capacitor";

export default function PwaRegister() {
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // Se estiver rodando dentro do WebView nativo do Capacitor (iOS ou Android),
    // não registra o Service Worker para evitar concorrência e conflitos de cache com o app nativo.
    const isTestingPwa =
      typeof window !== "undefined" &&
      (window.location.search.includes("pwa=1") ||
        window.location.search.includes("sw=1") ||
        localStorage.getItem("gamevault_force_sw") === "true");

    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      isNativePlatform() ||
      (process.env.NODE_ENV !== "production" && !isTestingPwa)
    ) {
      return;
    }

    let isMounted = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let handleVisibilityChange: (() => void) | null = null;
    let handleControllerChange: (() => void) | null = null;

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        if (!isMounted) return;

        const notifyUpdate = (worker: ServiceWorker) => {
          waitingWorkerRef.current = worker;
          const isPwa =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;

          if (isPwa) {
            // No PWA instalado, aciona o prompt visual com a versão para o usuário decidir
            window.dispatchEvent(
              new CustomEvent("pwa-update-available", {
                detail: { registration: reg, worker },
              })
            );
          } else {
            // No navegador tradicional, atualiza silenciosamente em background
            worker.postMessage({ type: "SKIP_WAITING" });
            worker.postMessage("SKIP_WAITING");
          }
        };

        // Se já houver um worker em espera
        if (reg.waiting && navigator.serviceWorker.controller) {
          notifyUpdate(reg.waiting);
        }

        // Monitora novas versões encontradas
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              notifyUpdate(newWorker);
            }
          });
        });

        // Verificação periódica suave de atualizações ao retornar à aba
        handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            reg.update().catch(() => {});
          }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Intervalo de verificação a cada 1 hora
        intervalId = setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 60 * 1000);

        // Recarrega suavemente a página quando uma nova versão do Service Worker assume o controle.
        // Se a página iniciou sem controller prévio (primeira instalação do SW), não recarrega
        // para não interromper a navegação inicial do usuário.
        let hadController = Boolean(navigator.serviceWorker.controller);
        let refreshing = false;
        handleControllerChange = () => {
          if (!hadController) {
            hadController = true;
            return;
          }
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        };
        navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);
      } catch (err) {
        console.warn("[PWA] Falha no registro do Service Worker:", err);
      }
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
    }

    return () => {
      isMounted = false;
      window.removeEventListener("load", registerSW);
      if (intervalId) clearInterval(intervalId);
      if (handleVisibilityChange) {
        document.removeEventListener("visibilitychange", handleVisibilityChange);
      }
      if (handleControllerChange) {
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      }
    };
  }, []);

  // PwaRegister opera 100% silenciosamente em segundo plano, sem pop-ups ou toasts
  return null;
}
