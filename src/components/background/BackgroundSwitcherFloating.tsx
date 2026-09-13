"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Layers, Gamepad2, EyeOff, X, Image as ImageIcon, Palette } from "lucide-react";
import { BackgroundTheme, BG_THEME_STORAGE_KEY } from "./BackgroundController";
import { PRESET_BACKGROUNDS, SOLID_COLOR_PRESETS, BackgroundConfig } from "@/lib/types/background.types";
import { triggerSelectionHaptic } from "@/lib/capacitor";

export default function BackgroundSwitcherFloating() {
  const [currentType, setCurrentType] = useState<string>("preset");
  const [currentValue, setCurrentValue] = useState<string>("/assets/bg/city.webp");
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(BG_THEME_STORAGE_KEY);
    if (saved) {
      setCurrentType("animated");
      setCurrentValue(saved);
    }
  }, []);

  const handleSelectAnimated = (themeId: BackgroundTheme) => {
    triggerSelectionHaptic();
    setCurrentType("animated");
    setCurrentValue(themeId);
    localStorage.setItem(BG_THEME_STORAGE_KEY, themeId);
    window.dispatchEvent(
      new CustomEvent<BackgroundTheme>("gv-background-theme-change", { detail: themeId })
    );
    setIsOpen(false);
  };

  const handleSelectPreset = (url: string) => {
    triggerSelectionHaptic();
    setCurrentType("preset");
    setCurrentValue(url);
    localStorage.removeItem(BG_THEME_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent<BackgroundConfig>("gv-background-config-change", {
        detail: { type: "preset", value: url, opacity: 0.35 },
      })
    );
    setIsOpen(false);
  };

  const handleSelectColor = (hex: string) => {
    triggerSelectionHaptic();
    setCurrentType("solid_color");
    setCurrentValue(hex);
    localStorage.removeItem(BG_THEME_STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent<BackgroundConfig>("gv-background-config-change", {
        detail: { type: "solid_color", value: hex },
      })
    );
    setIsOpen(false);
  };

  if (!mounted) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 z-40">
      {isOpen && (
        <div className="absolute bottom-14 right-0 w-72 max-h-[80vh] overflow-y-auto bg-[#141721]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-3.5 shadow-2xl space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-white/5 px-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#00E5FF] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Visualizador de Fundos
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-white rounded-lg transition-colors"
              aria-label="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Seção 1: Imagens Oficiais (/public/assets/bg) */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
              <ImageIcon className="w-3 h-3 text-[#00E5FF]" /> Imagens Oficiais (Assets)
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_BACKGROUNDS.map((bg) => {
                const isSelected = currentType === "preset" && currentValue === bg.url;
                return (
                  <button
                    key={bg.id}
                    onClick={() => handleSelectPreset(bg.url)}
                    className={`relative h-14 rounded-xl overflow-hidden border text-left group transition-all ${
                      isSelected
                        ? "border-[#00E5FF] ring-2 ring-[#00E5FF]/40"
                        : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={bg.thumbnail} alt={bg.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex items-end p-1">
                      <span className="text-[9px] font-bold text-white truncate w-full">{bg.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 2: Cores Sólidas Escuras */}
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
              <Palette className="w-3 h-3 text-purple-400" /> Cores Sólidas
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {SOLID_COLOR_PRESETS.map((sc) => {
                const isSelected = currentType === "solid_color" && currentValue.toLowerCase() === sc.hex.toLowerCase();
                return (
                  <button
                    key={sc.id}
                    onClick={() => handleSelectColor(sc.hex)}
                    className={`p-1.5 rounded-lg border text-center transition-all ${
                      isSelected
                        ? "border-purple-400 ring-2 ring-purple-400/40 bg-white/10"
                        : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-md mx-auto mb-1 border border-white/20"
                      style={{ backgroundColor: sc.hex }}
                    />
                    <span className="text-[9px] font-semibold text-gray-300 block truncate">{sc.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seção 3: Efeitos Dinâmicos */}
          <div className="space-y-1.5 pt-1 border-t border-white/5">
            <span className="text-[10px] font-mono text-gray-400 uppercase flex items-center gap-1">
              <Layers className="w-3 h-3 text-amber-400" /> Motores &amp; Animações
            </span>
            <div className="space-y-1">
              {[
                { id: "parallax" as BackgroundTheme, label: "Parallax Cósmico", icon: <Layers className="w-3.5 h-3.5 text-emerald-400" /> },
                { id: "sprites" as BackgroundTheme, label: "Sprites Retrô", icon: <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" /> },
                { id: "dust" as BackgroundTheme, label: "Space Dust 3D", icon: <Sparkles className="w-3.5 h-3.5 text-purple-400" /> },
                { id: "minimal" as BackgroundTheme, label: "Minimalista Escuro", icon: <EyeOff className="w-3.5 h-3.5 text-gray-400" /> },
              ].map((item) => {
                const active = currentType === "animated" && currentValue === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectAnimated(item.id)}
                    className={`w-full text-left p-1.5 px-2.5 rounded-xl flex items-center justify-between transition-all text-xs ${
                      active
                        ? "bg-emerald-500/15 border border-emerald-500/40 text-white font-semibold"
                        : "hover:bg-white/5 border border-transparent text-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.label}</span>
                    </div>
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Botão Gatilho Redondo */}
      <button
        onClick={() => {
          triggerSelectionHaptic();
          setIsOpen(!isOpen);
        }}
        title="Alternar efeito ou imagem de fundo"
        className="w-10 h-10 rounded-full bg-[#161a26]/90 hover:bg-[#1f2436] text-white border border-white/15 shadow-xl backdrop-blur-md flex items-center justify-center transition-transform hover:scale-105 active:scale-95 group"
        aria-label="Selecionar Efeito de Fundo"
      >
        <Sparkles className="w-4 h-4 text-[#00E5FF] group-hover:rotate-12 transition-transform" />
      </button>
    </div>
  );
}
