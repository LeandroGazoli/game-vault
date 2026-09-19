"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

const SCROLL_POSITIONS_KEY = "gv_scroll_positions";
const LAST_GAME_ID_KEY = "gv_last_game_id";
const IS_POP_STATE_KEY = "gv_is_pop_state";

interface ScrollPositionsMap {
  [url: string]: number;
}

function getStoredPositions(): ScrollPositionsMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SCROLL_POSITIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveStoredPositions(positions: ScrollPositionsMap) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(SCROLL_POSITIONS_KEY, JSON.stringify(positions));
  } catch {}
}

/**
 * Hook global de restauração inteligente de scroll.
 * 
 * Previne que o Next.js App Router force o retorno ao topo em páginas dinâmicas
 * ou com dados carregados via client-side fetch ao voltar de rotas como /game/[id].
 */
export function useScrollRestoration() {
  const pathname = usePathname();
  const searchStr = typeof window !== "undefined" ? window.location.search : "";
  const fullUrl = `${pathname || ""}${searchStr}`;
  const currentUrlRef = useRef(fullUrl);
  currentUrlRef.current = fullUrl;

  // Configura history.scrollRestoration para manual
  useEffect(() => {
    if (typeof window === "undefined" || !("scrollRestoration" in window.history)) return;
    const original = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = original;
    };
  }, []);

  // Monitora eventos popstate (usuário clicou em voltar/avançar no browser ou router.back)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePopState = () => {
      try {
        sessionStorage.setItem(IS_POP_STATE_KEY, "true");
      } catch {}
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  // Monitora cliques em cards de jogos para salvar o ID do card clicado e scroll antes da navegação
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;

      const card = target.closest<HTMLElement>("[data-game-id]");
      if (card) {
        const gameId = card.getAttribute("data-game-id");
        if (gameId) {
          try {
            sessionStorage.setItem(LAST_GAME_ID_KEY, gameId);
            const positions = getStoredPositions();
            positions[currentUrlRef.current] = window.scrollY;
            saveStoredPositions(positions);
          } catch {}
        }
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true, passive: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, []);

  // Listener de scroll contínuo com debounce para persistir o scroll da URL atual
  useEffect(() => {
    if (typeof window === "undefined") return;

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const handleScroll = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const y = window.scrollY;
        const positions = getStoredPositions();
        positions[currentUrlRef.current] = y;
        saveStoredPositions(positions);
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fullUrl]);

  // Ao mudar a URL, verifica se viemos de um popstate (retorno) e restaura o scroll
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isPopState = false;
    try {
      isPopState = sessionStorage.getItem(IS_POP_STATE_KEY) === "true";
      sessionStorage.removeItem(IS_POP_STATE_KEY);
    } catch {}

    if (!isPopState) return;

    const positions = getStoredPositions();
    const targetScrollY = positions[fullUrl] || 0;
    let targetGameId: string | null = null;

    try {
      targetGameId = sessionStorage.getItem(LAST_GAME_ID_KEY);
      sessionStorage.removeItem(LAST_GAME_ID_KEY);
    } catch {}

    if (targetScrollY <= 0 && !targetGameId) return;

    const tryRestore = (): boolean => {
      if (targetGameId) {
        const card = document.getElementById(`game-card-${targetGameId}`);
        if (card) {
          card.scrollIntoView({ block: "center", behavior: "instant" });
          return true;
        }
      }

      if (targetScrollY > 0) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll >= targetScrollY - 50) {
          window.scrollTo({ top: targetScrollY, behavior: "instant" });
          return true;
        }
      }

      return false;
    };

    // Tentativa imediata e em intervalos curtos
    const restored = tryRestore();
    if (restored) return;

    const timeouts = [60, 150, 300, 600, 1000];
    const timerIds: ReturnType<typeof setTimeout>[] = [];

    timeouts.forEach((delay) => {
      const id = setTimeout(() => {
        tryRestore();
      }, delay);
      timerIds.push(id);
    });

    // Observer para páginas que carregam conteúdo assincronamente e expandem o DOM
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(() => {
        if (tryRestore()) {
          observer?.disconnect();
        }
      });
      observer.observe(document.body);
    }

    // Timeout de segurança para desconectar o observer
    const cleanupTimeout = setTimeout(() => {
      observer?.disconnect();
    }, 1500);

    return () => {
      timerIds.forEach(clearTimeout);
      clearTimeout(cleanupTimeout);
      observer?.disconnect();
    };
  }, [fullUrl]);
}
