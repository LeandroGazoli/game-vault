"use client";

import { useEffect } from "react";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export default function SecurityTokenInterceptor() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const originalFetch = window.fetch;

    // Intercepta chamadas de fetch no cliente para injetar o x-app-token de forma transparente
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
        const token = getCookie("__gv_app_token");
        if (token) {
          const headers = new Headers(init?.headers);
          if (!headers.has("x-app-token")) {
            headers.set("x-app-token", token);
          }
          return originalFetch(input, { ...init, headers });
        }
      }

      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  return null;
}
