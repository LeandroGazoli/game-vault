"use client";

import { useEffect, useRef } from "react";
import { isNativePlatform } from "@/lib/capacitor";

export default function PwaRegister() {
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

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

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");

        // Se já houver um worker em espera, ativa silenciosamente sem pop-ups
        if (reg.waiting && navigator.serviceWorker.controller) {
          waitingWorkerRef.current = reg.waiting;
          reg.waiting.postMessage({ type: "SKIP_WAITING" });
          reg.waiting.postMessage("SKIP_WAITING");
        }

        // Monitora novas versões encontradas e atualiza silenciosamente em segundo plano
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker;
              newWorker.postMessage({ type: "SKIP_WAITING" });
              newWorker.postMessage("SKIP_WAITING");
            }
          });
        });

        // Verificação periódica suave de atualizações ao retornar à aba
        const handleVisibilityChange = () => {
          if (document.visibilityState === "visible") {
            reg.update().catch(() => {});
          }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Intervalo de verificação a cada 1 hora
        const intervalId = setInterval(() => {
          reg.update().catch(() => {});
        }, 60 * 60 * 1000);

        return () => {
          clearInterval(intervalId);
          document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
      } catch (err) {
        console.warn("[PWA] Falha no registro do Service Worker:", err);
      }
    };

    if (document.readyState === "complete") {
      registerSW();
    } else {
      window.addEventListener("load", registerSW);
      return () => {
        window.removeEventListener("load", registerSW);
      };
    }
  }, []);

  // PwaRegister opera 100% silenciosamente em segundo plano, sem pop-ups ou toasts
  return null;
}
