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
    <div className={`flex items-center group select-none ${className}`}>
      {/* Insígnia MGL Oficial (Crystalline Neon Green) */}
      <div className="relative flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
        <img
          src="/logo-mgl.png"
          alt="MGL"
          className={`${heightClass} w-auto object-contain filter drop-shadow-[0_0_12px_rgba(16,185,129,0.45)] group-hover:drop-shadow-[0_0_18px_rgba(16,185,129,0.75)] transition-all`}
        />
      </div>
    </div>
  );
}
