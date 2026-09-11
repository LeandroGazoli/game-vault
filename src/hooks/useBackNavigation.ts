"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import {
  PREV_URL_STORAGE_KEY,
  NAV_COUNT_STORAGE_KEY,
} from "@/components/NavigationTracker";

interface BackNavigationOptions {
  fallbackUrl?: string;
}

/**
 * Hook resiliente para navegação reversa inteligente (botão Voltar).
 * 
 * Se o usuário possui histórico interno ativo na mesma sessão/aba, utiliza `router.back()`,
 * com salvaguarda de timeout: caso o navegador não altere a URL após 250ms (por exemplo,
 * por histórico vazio, redirecionamentos ou recarregamento prévio), direciona para a última
 * rota interna conhecida ou rota de fallback padrão.
 * 
 * Se o usuário acessou diretamente (URL direta, nova aba, ou referência externa sem histórico),
 * direciona imediatamente para o catálogo ou fallback sem travar a interface.
 */
export function useBackNavigation(defaultFallback: string = "/search") {
  const router = useRouter();

  const goBack = useCallback(
    (options?: BackNavigationOptions | React.SyntheticEvent) => {
      triggerSelectionHaptic();

      const fallback =
        options && "fallbackUrl" in options && options.fallbackUrl
          ? options.fallbackUrl
          : defaultFallback;

      if (typeof window === "undefined") {
        router.push(fallback);
        return;
      }

      let navCount = 0;
      let prevUrl: string | null = null;

      try {
        navCount = parseInt(sessionStorage.getItem(NAV_COUNT_STORAGE_KEY) || "0", 10);
        prevUrl = sessionStorage.getItem(PREV_URL_STORAGE_KEY);
      } catch {
        // Fallback silencioso para ambientes com armazenamento restrito
      }

      const hasHistoryLength = window.history.length > 1;
      const hasInternalReferrer = Boolean(
        document.referrer && document.referrer.startsWith(window.location.origin)
      );

      // Determina a melhor rota de fallback garantida
      let targetUrl = fallback;
      const currentPath = window.location.pathname;

      if (prevUrl && !prevUrl.startsWith(currentPath)) {
        targetUrl = prevUrl;
      } else if (hasInternalReferrer) {
        try {
          const refUrl = new URL(document.referrer);
          const refPath = refUrl.pathname + refUrl.search;
          if (!refPath.startsWith(currentPath)) {
            targetUrl = refPath;
          }
        } catch {}
      }

      // Se comprovadamente NÃO há navegação anterior válida neste app nesta aba
      const hasInternalHistory = (navCount > 0 || hasInternalReferrer) && hasHistoryLength;

      if (!hasInternalHistory) {
        router.push(targetUrl);
        return;
      }

      // Com histórico interno identificado, executa router.back() com timer de segurança
      let navigated = false;
      let safetyTimer: ReturnType<typeof setTimeout> | undefined;

      const onPopState = () => {
        navigated = true;
        if (safetyTimer) clearTimeout(safetyTimer);
      };

      window.addEventListener("popstate", onPopState, { once: true });

      router.back();

      // Se após 250ms a página continuar inalterada, aciona navegação direta
      safetyTimer = setTimeout(() => {
        window.removeEventListener("popstate", onPopState);
        if (!navigated && window.location.pathname === currentPath) {
          router.push(targetUrl);
        }
      }, 250);
    },
    [router, defaultFallback]
  );

  return goBack;
}
