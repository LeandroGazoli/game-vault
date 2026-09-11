"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export const PREV_URL_STORAGE_KEY = "gv_prev_url";
export const CURRENT_URL_STORAGE_KEY = "gv_current_url";
export const NAV_COUNT_STORAGE_KEY = "gv_nav_count";

/**
 * Rastreador leve de histórico de rotas internas da aplicação no sessionStorage.
 * Permite que botões de retorno (como "Voltar para Navegação") saibam exatamente
 * para onde voltar mesmo se o usuário navegar entre abas ou links profundos.
 */
export default function NavigationTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || typeof window === "undefined") return;

    try {
      const fullUrl = `${pathname}${window.location.search || ""}`;
      const currentStored = sessionStorage.getItem(CURRENT_URL_STORAGE_KEY);

      if (currentStored && currentStored !== fullUrl) {
        sessionStorage.setItem(PREV_URL_STORAGE_KEY, currentStored);
        const count = parseInt(sessionStorage.getItem(NAV_COUNT_STORAGE_KEY) || "0", 10);
        sessionStorage.setItem(NAV_COUNT_STORAGE_KEY, String(count + 1));
      }

      sessionStorage.setItem(CURRENT_URL_STORAGE_KEY, fullUrl);
    } catch {
      // Ignora erro de cota ou navegação restrita
    }
  }, [pathname]);

  return null;
}
