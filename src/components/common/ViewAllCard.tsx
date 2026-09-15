"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface ViewAllCardProps {
  href?: string;
  onClick?: () => void;
  title?: string;
  count?: number;
  label?: string;
  className?: string;
}

/**
 * Card de acao no final do fluxo horizontal estilo streaming.
 * Mantem rigorosamente a proporcao de poster 3:4 e base solida sem transparencias.
 */
export default function ViewAllCard({
  href,
  onClick,
  title = "Ver todos",
  count,
  label = "Explorar lista completa",
  className = "",
}: ViewAllCardProps) {
  const content = (
    <div
      className={`group relative flex-shrink-0 w-32 sm:w-40 md:w-44 aspect-[3/4] rounded-2xl bg-[#161a26] hover:bg-[#1f2638] border border-white/10 hover:border-emerald-500/50 p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-xl active:scale-[0.98] select-none cursor-pointer ${className}`}
      role="button"
      aria-label={`${title} - ${label}`}
    >
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-[#1c2232] border border-white/10 group-hover:border-emerald-500/40 flex items-center justify-center text-gray-300 group-hover:text-emerald-400 group-hover:scale-110 transition-all shadow-md mb-3">
        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </div>

      <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors uppercase tracking-wider">
        {title}
      </span>

      {typeof count === "number" && (
        <span className="text-[11px] font-mono font-bold text-gray-400 group-hover:text-gray-200 mt-1">
          {count} {count === 1 ? "título" : "jogos"}
        </span>
      )}

      <span className="text-[10px] text-gray-500 group-hover:text-gray-400 mt-1.5 line-clamp-1 font-medium">
        {label}
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="flex-shrink-0 block outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl">
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex-shrink-0 block text-left outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-2xl p-0 bg-transparent border-0"
    >
      {content}
    </button>
  );
}
