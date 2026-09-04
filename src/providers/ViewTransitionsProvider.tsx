"use client";

import React, {
  createContext,
  useContext,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const navigateWithTransition = useCallback(
    (href: string, options?: { replace?: boolean; scroll?: boolean }) => {
      const shouldScroll = options?.scroll ?? true;

      // Se a API não for suportada, navega diretamente
      if (
        typeof document === "undefined" ||
        !("startViewTransition" in document) ||
        typeof document.startViewTransition !== "function"
      ) {
        if (options?.replace) {
          router.replace(href, { scroll: shouldScroll });
        } else {
          router.push(href, { scroll: shouldScroll });
        }
        return;
      }

      // Execução suave e não-bloqueante via View Transition nativa
      try {
        document.startViewTransition(() => {
          if (options?.replace) {
            router.replace(href, { scroll: shouldScroll });
          } else {
            router.push(href, { scroll: shouldScroll });
          }
        });
      } catch {
        if (options?.replace) {
          router.replace(href, { scroll: shouldScroll });
        } else {
          router.push(href, { scroll: shouldScroll });
        }
      }
    },
    [router]
  );

  return (
    <ViewTransitionContext.Provider value={{ navigateWithTransition }}>
      {children}
    </ViewTransitionContext.Provider>
  );
}
