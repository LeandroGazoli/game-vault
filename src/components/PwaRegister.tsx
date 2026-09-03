"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      const register = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("GameVault PWA Service Worker registrado:", reg.scope);
          })
          .catch((err) => {
            console.warn("Falha no registro do Service Worker:", err);
          });
      };

      if (document.readyState === "complete") {
        register();
      } else {
        window.addEventListener("load", register);
        return () => window.removeEventListener("load", register);
      }
    }
  }, []);

  return null;
}
