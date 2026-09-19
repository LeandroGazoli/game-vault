"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface IndieSpotlightViewAllCardProps {
  href?: string;
  totalCount?: number;
  className?: string;
}

export default function IndieSpotlightViewAllCard({
  href = "/indies",
  totalCount,
  className = "",
}: IndieSpotlightViewAllCardProps) {
  return (
    <Link
      href={href}
      className={`group relative flex-shrink-0 w-64 sm:w-72 md:w-80 aspect-video rounded-2xl bg-[#141822] hover:bg-[#191f2c] border border-white/10 hover:border-emerald-500/50 p-4 flex flex-col items-center justify-center text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-950/20 select-none cursor-pointer snap-start ${className}`}
      aria-label="Ver todos os jogos indie da comunidade"
    >
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#1c2333] border border-white/10 group-hover:border-emerald-500/40 flex items-center justify-center text-neutral-300 group-hover:text-emerald-400 group-hover:scale-110 transition-all shadow-md mb-2">
        <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
      </div>

      <span className="text-xs sm:text-sm font-extrabold text-white group-hover:text-emerald-300 transition-colors uppercase tracking-wider">
        Ver Todos os Indies
      </span>

      {typeof totalCount === "number" && totalCount > 0 ? (
        <span className="text-[11px] font-mono font-bold text-gray-400 group-hover:text-gray-200 mt-1">
          {totalCount} {totalCount === 1 ? "destaque ativo" : "destaques ativos"}
        </span>
      ) : (
        <span className="text-[11px] text-gray-400 group-hover:text-gray-300 mt-1 flex items-center gap-1 font-medium">
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Apoie criadores independentes
        </span>
      )}
    </Link>
  );
}
