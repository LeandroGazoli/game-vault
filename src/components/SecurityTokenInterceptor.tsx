"use client";

import { useEffect } from "react";
import { auth } from "@/lib/firebase";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function SecurityTokenInterceptor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    // Intercepta chamadas de fetch no cliente para injetar o x-app-token e o token de autenticação de forma transparente
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      let url = "";
      if (typeof input === "string") {
        url = input;
      } else if (input instanceof URL) {
        url = input.toString();
      } else if (input && "url" in input) {
        url = input.url;
      }

      if (url.includes("/api/games")) {
        const headers = new Headers(init?.headers);
        const token = getCookie("__gv_app_token");
        if (token && !headers.has("x-app-token")) {
          headers.set("x-app-token", token);
        }

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
