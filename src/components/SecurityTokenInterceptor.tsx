"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function SecurityTokenInterceptor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    // O token de integridade é um cookie HttpOnly e acompanha fetches same-origin
    // automaticamente. Aqui só anexamos o ID token onde há autenticação de usuário.
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      let url = "";
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input && "url" in input) {
        url = input.url;
      }

      const requiresUserToken =
        url.includes("/api/games") ||
        url.includes("/api/articles/rewrite") ||
        url.includes("/api/newsdata") ||
        url.includes("/api/gnews");

      if (requiresUserToken) {
        const headers = new Headers(init?.headers);
        if (auth?.currentUser && !headers.has("Authorization") && !headers.has("authorization")) {
          try {
            const idToken = await auth.currentUser.getIdToken();
            if (idToken) {
              headers.set("Authorization", `Bearer ${idToken}`);
            }
          } catch {}
        }

        return originalFetch(input, { ...init, headers });
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
