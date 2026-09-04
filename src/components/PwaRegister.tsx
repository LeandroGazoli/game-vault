"use client";

import React, { useEffect, useState, useRef } from "react";
import { isNativePlatform } from "@/lib/capacitor";
import { RefreshCw, X, Sparkles } from "lucide-react";

export default function PwaRegister() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const waitingWorkerRef = useRef<ServiceWorker | null>(null);

  useEffect(() => {
    // Se estiver rodando dentro do WebView nativo do Capacitor (iOS ou Android),
    // não registra o Service Worker para evitar concorrência e conflitos de cache com o app nativo.
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      isNativePlatform() ||
      process.env.NODE_ENV !== "production"
    ) {
      return;
    }

    let refreshing = false;

    // Escuta a mudança de controller (quando o novo SW ativa via SKIP_WAITING)
    const handleControllerChange = () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    const registerSW = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");

        // Se já houver um worker em espera logo após abrir a página
        if (reg.waiting && navigator.serviceWorker.controller) {
          waitingWorkerRef.current = reg.waiting;
          setUpdateAvailable(true);
        }

        // Monitora novas versões encontradas
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            // Se o novo worker foi instalado e já existe um controlador ativo,
            // significa que é um update (não a primeira instalação)
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              waitingWorkerRef.current = newWorker;
              setUpdateAvailable(true);
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
        navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
      };
    }

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, []);

  const handleApplyUpdate = () => {
    if (waitingWorkerRef.current) {
      setIsUpdating(true);
      waitingWorkerRef.current.postMessage({ type: "SKIP_WAITING" });
    } else {
      window.location.reload();
    }
  };

  // Se não houver atualização ou o usuário optou por dispensar
  if (!updateAvailable || isDismissed) {
    return null;
  }

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:w-96 z-50 animate-fadeIn"
    >
      <div className="relative bg-[#14161b]/95 backdrop-blur-md border border-[#00E5FF]/40 rounded-2xl p-4 shadow-2xl shadow-black/80 flex flex-col gap-3">
        <button
          onClick={() => setIsDismissed(true)}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Dispensar por enquanto"
          aria-label="Dispensar aviso de atualização"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center flex-shrink-0 text-[#00E5FF]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-0.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Nova Versão Disponível
              <span className="inline-block w-2 h-2 rounded-full bg-[#00E5FF] animate-pulse" />
            </h4>
            <p className="text-xs text-gray-300 leading-snug">
              Melhorias de desempenho e novas funções prontas. Atualize agora para carregar as novidades.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => setIsDismissed(true)}
            className="flex-1 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-medium text-xs transition-colors"
          >
            Mais tarde
          </button>
          <button
            onClick={handleApplyUpdate}
            disabled={isUpdating}
            className="flex-1 py-2 px-3 rounded-xl bg-[#00E5FF] hover:bg-[#33ebff] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-75 shadow-lg shadow-[#00E5FF]/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? "animate-spin" : ""}`} />
            {isUpdating ? "Atualizando..." : "Atualizar Agora"}
          </button>
        </div>
      </div>
    </div>
  );
}
