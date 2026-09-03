"use client";

import React, { useState } from "react";
import { User as UserIcon } from "lucide-react";

interface UserAvatarProps {
  photoURL?: string | null;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const SIZE_MAP = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-7 h-7 text-xs",
  md: "w-8 h-8 text-xs",
  lg: "w-10 h-10 text-sm",
  xl: "w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl",
};

export default function UserAvatar({
  photoURL,
  name = "Gamer",
  size = "md",
  className = "",
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const initial = (name || "G").charAt(0).toUpperCase();
  const sizeClasses = SIZE_MAP[size] || SIZE_MAP.md;

  // Se tem foto válida do Google e não falhou no carregamento
  if (photoURL && !photoURL.includes("unsplash.com") && !imgError) {
    return (
      <img
        src={photoURL}
        alt={name}
        onError={() => setImgError(true)}
        className={`rounded-2xl object-cover border border-white/10 shrink-0 aspect-square ${sizeClasses} ${className}`}
      />
    );
  }

  // Avatar limpo com inicial do usuário ou ícone gamer (Sem foto aleatória de pessoas)
  return (
    <div
      className={`rounded-2xl bg-gradient-to-br from-[#1f2128] to-[#121316] border border-white/15 text-white font-extrabold flex items-center justify-center select-none shadow-inner flex-shrink-0 ${sizeClasses} ${className}`}
    >
      <span className="font-mono text-[#00E5FF] drop-shadow-sm">{initial}</span>
    </div>
  );
}
