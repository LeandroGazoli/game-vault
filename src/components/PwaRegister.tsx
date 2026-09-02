"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("GameVault PWA Service Worker registrado:", reg.scope);
          })
          .catch((err) => {
            console.warn("Falha no registro do Service Worker:", err);
          });
      });
    }
  }, []);

  return null;
}
