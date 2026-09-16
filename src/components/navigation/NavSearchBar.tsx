"use client";

import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { openSpotlightSearch } from "@/components/SpotlightSearchModal";

interface NavSearchBarProps {
  className?: string;
}

export default function NavSearchBar({ className = "" }: NavSearchBarProps) {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
    }
  }, []);

  return (
    <div className={`flex items-center justify-center flex-1 max-w-sm lg:max-w-md mx-2 ${className}`}>
      <button
        type="button"
        onClick={() => openSpotlightSearch()}
        className="w-full flex items-center justify-between gap-2 h-9 px-3 rounded-full bg-[#141822]/90 hover:bg-[#1a202c] border border-white/10 hover:border-emerald-500/40 text-neutral-400 hover:text-neutral-200 transition-all duration-200 shadow-inner group cursor-pointer"
        title="Buscar jogos (Atalho: ⌘K ou Ctrl+K)"
        aria-label="Abrir busca de jogos"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Search className="w-3.5 h-3.5 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
          <span className="text-xs truncate font-medium text-neutral-400 group-hover:text-neutral-200">
            Buscar jogos, plataformas...
          </span>
        </div>

        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-400 shrink-0 group-hover:border-emerald-500/30 group-hover:text-emerald-400 transition-colors">
          {isMac ? "⌘K" : "Ctrl+K"}
        </kbd>
      </button>
    </div>
  );
}
