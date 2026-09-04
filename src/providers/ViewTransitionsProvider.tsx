"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useTransition,
} from "react";
import { usePathname, useRouter } from "next/navigation";

interface ViewTransitionContextValue {
  navigateWithTransition: (
    href: string,
    options?: { replace?: boolean; scroll?: boolean }
  ) => void;
}

const ViewTransitionContext = createContext<ViewTransitionContextValue | null>(
  null
);

export function useViewTransition() {
  const ctx = useContext(ViewTransitionContext);
  return ctx;
}

export default function ViewTransitionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [, startReactTransition] = useTransition();
  const [isNavigating, setIsNavigating] = useState(false);

  // Referência para resolver a transição pendente do navegador
  const finishTransitionRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Quando o pathname muda, resolvemos a transição pendente para que o navegador capture a nova snapshot
  useEffect(() => {
    setIsNavigating(false);
    if (finishTransitionRef.current) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      finishTransitionRef.current();
      finishTransitionRef.current = null;
    }
  }, [pathname]);

  // Limpeza no unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (finishTransitionRef.current) finishTransitionRef.current();
    };
  }, []);

  const navigateWithTransition = useCallback(
    (href: string, options?: { replace?: boolean; scroll?: boolean }) => {
      // Se a API não for suportada, navega normalmente
      if (
        typeof document === "undefined" ||
        !("startViewTransition" in document) ||
        typeof document.startViewTransition !== "function"
      ) {
        const shouldScroll = options?.scroll ?? true;
        if (options?.replace) {
          router.replace(href, { scroll: shouldScroll });
        } else {
          router.push(href, { scroll: shouldScroll });
        }
        return;
      }

      // Se houver transição pendente anterior, conclui antes de iniciar a nova
      if (finishTransitionRef.current) {
        finishTransitionRef.current();
        finishTransitionRef.current = null;
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Inicia a transição e aguarda a montagem da nova rota pelo React
      setIsNavigating(true);
      const shouldScroll = options?.scroll ?? true;
      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            finishTransitionRef.current = resolve;

            // Timeout de segurança: nunca trava a tela caso a rota demore
            timeoutRef.current = setTimeout(() => {
              setIsNavigating(false);
              if (finishTransitionRef.current) {
                finishTransitionRef.current();
                finishTransitionRef.current = null;
              }
            }, 1500);

            startReactTransition(() => {
              if (options?.replace) {
                router.replace(href, { scroll: shouldScroll });
              } else {
                router.push(href, { scroll: shouldScroll });
              }
            });
          })
      );
    },
    [router]
  );

  // Suporte a voltar/avançar no navegador e gestos de swipe no mobile (popstate)
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("startViewTransition" in document) ||
      typeof document.startViewTransition !== "function"
    ) {
      return;
    }

    const handlePopState = () => {
      setIsNavigating(true);
      if (finishTransitionRef.current) {
        finishTransitionRef.current();
      }
      document.startViewTransition(
        () =>
          new Promise<void>((resolve) => {
            finishTransitionRef.current = resolve;
            timeoutRef.current = setTimeout(() => {
              setIsNavigating(false);
              if (finishTransitionRef.current) {
                finishTransitionRef.current();
                finishTransitionRef.current = null;
              }
            }, 1500);
          })
      );
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Interceptador global em fase de captura para todos os links internos da aplicação
  useEffect(() => {
    if (
      typeof document === "undefined" ||
      !("startViewTransition" in document) ||
      typeof document.startViewTransition !== "function"
    ) {
      return;
    }

    const handleClick = (e: MouseEvent) => {
      // Ignora clique com botão direito ou teclas modificadoras (Cmd/Ctrl/Shift/Alt)
      if (
        e.defaultPrevented ||
        e.button !== 0 ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const rawHref = target.getAttribute("href");
      if (
        !rawHref ||
        rawHref.startsWith("#") ||
        rawHref.startsWith("mailto:") ||
        rawHref.startsWith("tel:") ||
        target.getAttribute("target") === "_blank" ||
        target.getAttribute("download") !== null ||
        target.getAttribute("rel")?.includes("external")
      ) {
        return;
      }

      // Valida se é URL da mesma origem (interna)
      let url: URL;
      try {
        url = new URL(target.href, window.location.href);
      } catch {
        return;
      }

      if (url.origin !== window.location.origin) {
        return;
      }

      // Ignora se for apenas âncora na mesma página
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash !== ""
      ) {
        return;
      }

      // Ignora clique no mesmo link que já está ativo
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash === window.location.hash
      ) {
        return;
      }

      // Intercepta e executa transição fluida
      e.preventDefault();
      const destination = url.pathname + url.search + url.hash;
      navigateWithTransition(destination);
    };

    // Escuta na fase de captura (true) para interceptar antes dos handlers padrão
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [navigateWithTransition]);

  return (
    <ViewTransitionContext.Provider value={{ navigateWithTransition }}>
      {isNavigating && (
        <div className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none overflow-hidden bg-cyan-950/20">
          <div className="vt-progress-bar h-full w-full bg-gradient-to-r from-transparent via-[#00E5FF] to-cyan-300 shadow-[0_0_12px_#00E5FF]" />
        </div>
      )}
      {children}
    </ViewTransitionContext.Provider>
  );
}
