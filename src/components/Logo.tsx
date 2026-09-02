"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export default function Logo({
  size = "md",
  showText = true,
  className = "",
}: LogoProps) {
  const iconSize = {
    sm: "w-8 h-8",
    md: "w-9 h-9",
    lg: "w-12 h-12",
  }[size];

  const textSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 group ${className}`}>
      {/* SVG Icon do GameVault */}
      <div className={`${iconSize} relative rounded-2xl overflow-hidden flex-shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-lg shadow-cyan-500/20`}>
        <svg viewBox="0 0 512 512" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#090a0f"/>
              <stop offset="100%" stop-color="#161822"/>
            </linearGradient>
            <linearGradient id="logoShieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00E5FF"/>
              <stop offset="50%" stop-color="#3B82F6"/>
              <stop offset="100%" stop-color="#6366F1"/>
            </linearGradient>
            <linearGradient id="logoCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#00E5FF"/>
              <stop offset="100%" stop-color="#38BDF8"/>
            </linearGradient>
          </defs>

          {/* Fundo */}
          <rect width="512" height="512" rx="128" fill="url(#logoBg)"/>
          <rect width="504" height="504" x="4" y="4" rx="124" stroke="#00E5FF" stroke-width="6" stroke-opacity="0.3"/>

          {/* Escudo Vault */}
          <path d="M256 64 C350 64, 410 90, 410 140 C410 290, 340 390, 256 440 C172 390, 102 290, 102 140 C102 90, 162 64, 256 64 Z" 
                fill="#0d111d" 
                stroke="url(#logoShieldGrad)" 
                stroke-width="16" />

          {/* Controle Gamer em Neon */}
          <path d="M190 190 C220 180, 292 180, 322 190 C365 204, 395 240, 380 320 C370 375, 335 375, 310 335 C295 310, 280 295, 256 295 C232 295, 217 310, 202 335 C177 375, 142 375, 132 320 C117 240, 147 204, 190 190 Z" 
                fill="#161b26" 
                stroke="url(#logoCyan)" 
                stroke-width="14" 
                stroke-linejoin="round"/>

          {/* D-Pad */}
          <path d="M195 230 L210 230 L210 245 L225 245 L225 260 L210 260 L210 275 L195 275 L195 260 L180 260 L180 245 L195 245 Z" fill="#00E5FF" />

          {/* Botões */}
          <circle cx="317" cy="237" r="7" fill="#00E5FF"/>
          <circle cx="332" cy="252" r="7" fill="#00E5FF"/>
          <circle cx="302" cy="252" r="7" fill="#00E5FF"/>
          <circle cx="317" cy="267" r="7" fill="#00E5FF"/>

          {/* Analógicos */}
          <circle cx="215" cy="295" r="18" fill="#1e293b" stroke="#00E5FF" stroke-width="4"/>
          <circle cx="215" cy="295" r="6" fill="#00E5FF"/>

          <circle cx="297" cy="295" r="18" fill="#1e293b" stroke="#00E5FF" stroke-width="4"/>
          <circle cx="297" cy="295" r="6" fill="#00E5FF"/>

          {/* Fechadura do Vault */}
          <circle cx="256" cy="360" r="10" fill="#00E5FF"/>
          <path d="M250 366 L262 366 L266 384 L246 384 Z" fill="#00E5FF"/>
        </svg>
      </div>

      {/* Tipografia */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-display font-black ${textSize} tracking-tight text-white flex items-center gap-0.5 leading-none`}>
            GAME<span className="text-[#00E5FF]">VAULT</span>
          </span>
          <span className="text-[9px] uppercase tracking-[0.25em] text-gray-400 font-mono mt-0.5">
            MyGameList
          </span>
        </div>
      )}
    </div>
  );
}
