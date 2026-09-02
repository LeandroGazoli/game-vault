"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const consent = localStorage.getItem("gamevault_cookie_consent");
      if (!consent) {
        // Mostra o banner após 1 segundo
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("gamevault_cookie_consent", "accepted");
    }
  };

  const handleDecline = () => {
    setIsVisible(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("gamevault_cookie_consent", "essential_only");
    }
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Consentimento de Cookies"
      className="fixed bottom-24 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 animate-fadeIn"
    >
      <div className="relative rounded-3xl bg-[#18191c]/95 border border-white/15 p-5 shadow-2xl backdrop-blur-xl space-y-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex-shrink-0">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Privacidade &amp; Cookies</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              Utilizamos cookies e tecnologias semelhantes para personalizar conteúdo, veicular anúncios relevantes do Google AdSense e melhorar sua experiência no GameVault.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5">
          <Link
            href="/cookies"
            className="text-[11px] text-gray-400 hover:text-[#00E5FF] underline transition-colors"
          >
            Política de Cookies
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-colors"
            >
              Apenas Essenciais
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-1.5 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md"
            >
              Aceitar Todos
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
