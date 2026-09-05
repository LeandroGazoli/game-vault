"use client";

import React from "react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

export interface PlatformFilterChipsProps {
  selectedPlatform: string;
  onSelectPlatform: (platform: string) => void;
}

const PLATFORMS = [
  { id: "all", label: "Todos", icon: "🌐" },
  { id: "pc", label: "PC", icon: "💻" },
  { id: "ps5", label: "PS5", icon: "🎮" },
  { id: "xbox-series", label: "Xbox", icon: "🟢" },
  { id: "switch", label: "Switch", icon: "🔴" },
  { id: "retro", label: "Retrô", icon: "🕹️" },
];

export default function PlatformFilterChips({
  selectedPlatform,
  onSelectPlatform,
}: PlatformFilterChipsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-3 px-3 sm:mx-0 sm:px-0">
      {PLATFORMS.map((p) => {
        const isSelected = selectedPlatform === p.id;
        return (
          <button
            key={p.id}
            type="button"
            onClick={() => {
              triggerSelectionHaptic();
              onSelectPlatform(p.id);
            }}
            className={`min-h-[40px] px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 shrink-0 select-none cursor-pointer flex items-center gap-1.5 active:scale-95 ${
              isSelected
                ? "bg-[#00E5FF]/20 border border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.45)] ring-1 ring-[#00E5FF]/30"
                : "bg-[#11141c] border border-white/10 text-gray-400 hover:text-white hover:border-white/20 hover:bg-[#161a24]"
            }`}
          >
            <span className="text-xs">{p.icon}</span>
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
