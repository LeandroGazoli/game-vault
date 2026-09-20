"use client";

import React from "react";
import Image from "next/image";
import { CheckCircle2, Sparkles } from "lucide-react";
import { ProfileLayout, ProfileTheme } from "@/lib/types";
import { getThemeStyles } from "@/lib/themeStyles";

interface ProfilePreviewCardProps {
  bannerURL: string;
  photoURL?: string | null;
  displayName: string;
  username: string;
  equippedTitles: string[];
  layout: ProfileLayout;
  theme?: ProfileTheme;
  customCss?: string;
}

const LAYOUT_NAMES: Record<ProfileLayout, string> = {
  default: "Cyber Vault",
  cinematic: "Cinematic",
  gamer_id: "Gamer ID Card",
  minimal: "Editorial",
};

export default function ProfilePreviewCard({
  bannerURL,
  photoURL,
  displayName,
  username,
  equippedTitles,
  layout,
  theme = "cyan",
  customCss,
}: ProfilePreviewCardProps) {
  const fallbackAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";
  const themeStyles = getThemeStyles(theme);

  return (
    <section className={`relative w-full rounded-2xl overflow-hidden bg-[#141822] border border-white/10 shadow-2xl transition-all ${themeStyles.cardGlow}`}>
      {/* Dynamic Banner */}
      <div
        className="relative h-28 w-full bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(11,13,18,0.2) 0%, rgba(20,24,34,0.95) 100%), url('${bannerURL}')`,
        }}
      >
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-[#4edea3] border border-white/10 flex items-center gap-1.5 font-bold tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4edea3] animate-pulse"></span>
            LIVE PREVIEW
          </span>
        </div>
      </div>

      <div className="px-3.5 pb-3.5 pt-0 relative flex flex-col">
        {/* Avatar & Badges */}
        <div className="flex items-end justify-between -mt-9 mb-1.5">
          <div className="relative">
            <div className={`w-16 h-16 rounded-2xl bg-[#1a2130] overflow-hidden ring-4 ring-[#141822] shadow-xl relative border-2 ${themeStyles.avatarBorder}`}>
              <img
                src={photoURL || fallbackAvatar}
                alt={displayName || "Avatar"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackAvatar;
                }}
              />
            </div>
            <span
              className={`absolute top-0 right-0 w-3 h-3 rounded-full ring-2 ring-[#141822] ${themeStyles.bgAccent}`}
              title="Online"
            />
          </div>

          {/* Badges Preview (Slots 3/3) */}
          <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-[200px]">
            {equippedTitles.length > 0 ? (
              equippedTitles.map((title, i) => (
                <span
                  key={`${title}-${i}`}
                  className="px-2 py-0.5 rounded-md bg-[#1a2130] border border-white/10 text-[11px] font-semibold text-gray-200 flex items-center gap-1 shadow-sm"
                >
                  <span className="truncate max-w-[90px]">{title}</span>
                </span>
              ))
            ) : (
              <span className="text-[10px] text-gray-500 italic">Sem insígnias equipadas</span>
            )}
          </div>
        </div>

        {/* Name, Handle & Selected Layout */}
        <div className="flex items-center justify-between mt-1">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-[16px] text-white tracking-tight truncate">
                {displayName || "Jogador"}
              </h2>
              <CheckCircle2 className={`w-4 h-4 shrink-0 ${themeStyles.textAccent}`} />
            </div>
            <p className={`font-mono text-xs font-medium truncate ${themeStyles.textAccent}`}>
              @{username || "jogador"}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-gray-400 block font-medium">Layout Selecionado</span>
            <span className={`font-bold text-[11px] font-mono ${themeStyles.textAccent}`}>
              {LAYOUT_NAMES[layout] || "Cyber Vault"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
