"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import LiveSearchInput from "@/components/LiveSearchInput";

interface NavSearchBarProps {
  className?: string;
}

/**
 * Busca da navbar — SEM popup.
 *
 * O modal anterior (SpotlightSearchModal) tinha dois problemas no mobile:
 *  1. Sobreposição em tela cheia disputa espaço com o teclado virtual, e o campo some
 *     atrás dele em telas menores.
 *  2. Num app empacotado com Capacitor, o botão VOLTAR do Android não fecha um modal —
 *     ele sai da tela ou do app. Isso quebra a expectativa mais básica de navegação nativa.
 *
 * Estratégia por contexto:
 *  - MOBILE: toque leva para /search, que é uma ROTA REAL. O botão voltar volta, o estado
 *    entra no histórico, a URL é compartilhável e o teclado tem a tela inteira.
 *  - DESKTOP: campo real com dropdown ancorado logo abaixo (LiveSearchInput). Sem overlay,
 *    sem roubo de foco, sem escurecer a página — o usuário continua vendo o contexto.
 */
export default function NavSearchBar({ className = "" }: NavSearchBarProps) {
  const router = useRouter();
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
    }
  }, []);

  // Atalho de teclado leva ao campo do desktop; no mobile não há teclado físico.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        const input = document.querySelector<HTMLInputElement>("[data-nav-search] input");
        if (input) input.focus();
        else router.push("/search");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  return (
    <div className={`flex items-center justify-center flex-1 max-w-sm lg:max-w-md mx-2 ${className}`}>
      {/* MOBILE: atalho para a rota real */}
      <button
        type="button"
        onClick={() => router.push("/search")}
        className="md:hidden w-full flex items-center gap-2 h-11 px-3 rounded-full bg-[#141822]/90 active:bg-[#1a202c] border border-white/10 text-neutral-400 transition-colors"
        aria-label="Buscar jogos"
      >
        <Search className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-sm truncate font-medium">Buscar jogos...</span>
      </button>

      {/* DESKTOP: campo real com dropdown ancorado */}
      <div className="hidden md:block w-full" data-nav-search>
        <LiveSearchInput variant="navbar" placeholder="Buscar jogos, plataformas..." />
      </div>
    </div>
  );
}
