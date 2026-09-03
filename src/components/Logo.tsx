"use client";

import React from "react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export default function Logo({
  size = "md",
  showText = true,
  className = "",
}: LogoProps) {
  const heightClass = {
    sm: "h-7",
    md: "h-9",
    lg: "h-11",
    xl: "h-14",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {/* Insígnia MGL Oficial (Crystalline Neon Green) */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <img
          src="/logo-mgl.png"
          alt="MGL - Meu Gamer Log"
          className={`${heightClass} w-auto object-contain filter drop-shadow-[0_0_12px_rgba(16,185,129,0.4)] group-hover:drop-shadow-[0_0_16px_rgba(16,185,129,0.7)] transition-all`}
        />
      </div>

      {/* Rótulo Textual Opcional */}
      {showText && (
        <div className="flex flex-col justify-center">
          <span className="font-display font-black text-base sm:text-lg tracking-tight text-white flex items-center gap-1 leading-none">
            MGL
          </span>
          <span className="text-[8px] uppercase tracking-[0.22em] text-emerald-400 font-mono font-bold mt-0.5">
            Meu Gamer Log
          </span>
        </div>
      )}
    </div>
  );
}
