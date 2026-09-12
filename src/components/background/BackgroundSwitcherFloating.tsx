"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Layers, Gamepad2, EyeOff, X } from "lucide-react";
import { BackgroundTheme, BG_THEME_STORAGE_KEY } from "./BackgroundController";
import { triggerSelectionHaptic } from "@/lib/capacitor";

const THEMES: { id: BackgroundTheme; label: string; icon: React.ReactNode; desc: string }[] = [
  {
    id: "parallax",
    label: "Parallax Cósmico",
    icon: <Layers className="w-4 h-4 text-emerald-400" />,
    desc: "Profundidade 3D em camadas com Aurora e Grid",
  },
  {
    id: "sprites",
    label: "Sprites Retrô",
    icon: <Gamepad2 className="w-4 h-4 text-cyan-400" />,
    desc: "Mascotes e elementos pixel art em movimento",
  },
  {
    id: "dust",
    label: "Space Dust 3D",
    icon: <Sparkles className="w-4 h-4 text-purple-400" />,
    desc: "Poeira espacial Three.js clássica do Vault",
  },
  {
    id: "minimal",
    label: "Minimalista Escuro",
    icon: <EyeOff className="w-4 h-4 text-gray-400" />,
    desc: "Fundo limpo sem animações",
  },
];

export default function BackgroundSwitcherFloating() {
  const [currentTheme, setCurrentTheme] = useState<BackgroundTheme>("parallax");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(BG_THEME_STORAGE_KEY) as BackgroundTheme | null;
    if (saved && ["parallax", "sprites", "dust", "minimal"].includes(saved)) {
      setCurrentTheme(saved);
    }
  }, []);

  const handleSelect = (themeId: BackgroundTheme) => {
    triggerSelectionHaptic();
    setCurrentTheme(themeId);
    localStorage.setItem(BG_THEME_STORAGE_KEY, themeId);
    window.dispatchEvent(
      new CustomEvent<BackgroundTheme>("gv-background-theme-change", { detail: themeId })
    );
    setIsOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-64 bg-[#141721]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3 shadow-2xl space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Tema de Fundo
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            {THEMES.map((item) => {
              const active = currentTheme === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.id)}
                  className={`w-full text-left p-2 rounded-xl flex items-center gap-2.5 transition-all text-xs ${
                    active
                      ? "bg-emerald-500/15 border border-emerald-500/40 text-white font-semibold"
                      : "hover:bg-white/5 border border-transparent text-gray-300"
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                      {item.desc}
                    </div>
                  </div>
                  {active && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Botão Gatilho Redondo */}
      <button
        onClick={() => {
          triggerSelectionHaptic();
          setIsOpen(!isOpen);
        }}
        title="Alternar efeito do fundo"
        className="w-10 h-10 rounded-full bg-[#161a26]/90 hover:bg-[#1f2436] text-white border border-white/15 shadow-xl backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group"
        aria-label="Selecionar Efeito de Fundo"
      >
        <Sparkles className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
