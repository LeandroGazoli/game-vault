"use client";

import React from "react";
import { Palette, ChevronDown, Sparkles } from "lucide-react";
import { ProfileTheme, ProfileLayout, PRESET_BANNERS } from "@/lib/types";
import { BackgroundConfig } from "@/lib/types/background.types";
import VipBackgroundSelector from "@/components/profile/VipBackgroundSelector";

interface VisualThemeAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  bannerURL: string;
  setBannerURL: (url: string) => void;
  customBannerUrl: string;
  setCustomBannerUrl: (url: string) => void;
  theme: ProfileTheme;
  setTheme: (theme: ProfileTheme) => void;
  layout: ProfileLayout;
  setLayout: (layout: ProfileLayout) => void;
  customBgConfig: BackgroundConfig | null;
  setCustomBgConfig: (config: BackgroundConfig) => void;
  isPremium: boolean;
  onOpenUpgrade?: () => void;
}

const ACCENT_COLORS: { id: ProfileTheme; hex: string; name: string }[] = [
  { id: "cyan", hex: "#00E5FF", name: "Ciano Cyber" },
  { id: "gold", hex: "#F59E0B", name: "Ouro Dourado" },
  { id: "purple", hex: "#8B5CF6", name: "Púrpura Neon" },
  { id: "crimson", hex: "#EF4444", name: "Rubi Carmim" },
  { id: "emerald", hex: "#10B981", name: "Verde Esmeralda" },
];

const LAYOUT_STYLES: { id: ProfileLayout; name: string; desc: string }[] = [
  { id: "default", name: "Cyber Vault", desc: "Painel HUD tecnológico" },
  { id: "cinematic", name: "Cinematic", desc: "Banners e pôsteres gigantes" },
  { id: "gamer_id", name: "Gamer ID Card", desc: "Estilo crachá e esports" },
  { id: "minimal", name: "Editorial", desc: "Minimalista e refinado" },
];

export default function VisualThemeAccordion({
  isOpen,
  onToggle,
  bannerURL,
  setBannerURL,
  customBannerUrl,
  setCustomBannerUrl,
  theme,
  setTheme,
  layout,
  setLayout,
  customBgConfig,
  setCustomBgConfig,
  isPremium,
  onOpenUpgrade,
}: VisualThemeAccordionProps) {
  return (
    <div className={`rounded-2xl bg-[#141822] border transition-all duration-300 overflow-hidden shadow-sm ${
      isOpen ? "border-[#00E5FF]/40 ring-1 ring-[#00E5FF]/20" : "border-white/10"
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-[#1a2130]/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#00E5FF]/10 text-[#00E5FF] flex items-center justify-center shrink-0 border border-[#00E5FF]/20">
            <Palette className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-white tracking-tight">
              2. Capa, Cores &amp; Temas Visuais
            </h3>
            <p className="text-[11px] text-gray-400">
              Presets de banner, 5 cores, wallpaper PRO e layout
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#00E5FF]" : ""
          }`}
        />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-white/5 animate-fadeIn">
          {/* Presets de Banner */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Presets de Banner Oficial
              </label>
              <span className="text-[10px] text-[#4edea3] font-mono">5 Temas MGL</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {PRESET_BANNERS.slice(0, 5).map((preset) => {
                const isSelected = bannerURL === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setBannerURL(preset.url);
                      setCustomBannerUrl("");
                    }}
                    className={`h-12 rounded-lg bg-cover bg-center overflow-hidden relative transition-all active:scale-95 ${
                      isSelected ? "border-2 border-[#4edea3] ring-1 ring-[#4edea3]" : "border border-white/10 opacity-70 hover:opacity-100"
                    }`}
                    style={{ backgroundImage: `url('${preset.preview || preset.url}')` }}
                  >
                    <span className="absolute bottom-0 inset-x-0 bg-black/75 text-[8px] font-mono py-0.5 text-center truncate text-white">
                      {preset.name.split(" ")[0]}
                    </span>
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customBannerUrl}
              onChange={(e) => {
                setCustomBannerUrl(e.target.value);
                if (e.target.value) setBannerURL(e.target.value);
              }}
              placeholder="Ou insira URL customizada de capa..."
              className="w-full bg-[#1a2130] text-xs rounded-lg px-2.5 py-1.5 border border-white/10 text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF] mt-1"
            />
          </div>

          {/* Seletor de Paletas de Destaque */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Cor de Destaque (Accent)
            </label>
            <div className="flex items-center gap-3">
              {ACCENT_COLORS.map((col) => {
                const isSelected = theme === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setTheme(col.id)}
                    title={col.name}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      isSelected
                        ? "scale-110 ring-2 ring-white shadow-lg"
                        : "ring-1 ring-white/20 hover:scale-105"
                    }`}
                    style={{ backgroundColor: col.hex }}
                  />
                );
              })}
              <span className="text-xs font-mono text-gray-400 ml-auto font-semibold">
                {ACCENT_COLORS.find((c) => c.id === theme)?.hex || "#00E5FF"}
              </span>
            </div>
          </div>

          {/* Papel de Parede PRO */}
          <VipBackgroundSelector
            isVipOrPro={isPremium}
            value={customBgConfig}
            onChange={setCustomBgConfig}
            onOpenUpgrade={onOpenUpgrade}
          />

          {/* 4 Estilos de Layout */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Estilos de Layout do Perfil
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {LAYOUT_STYLES.map((st) => {
                const isSelected = layout === st.id;
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setLayout(st.id)}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-0.5 transition-all ${
                      isSelected
                        ? "border-[#4edea3] bg-[#4edea3]/10 ring-1 ring-[#4edea3]/30"
                        : "border-white/10 bg-[#1a2130] hover:border-white/20"
                    }`}
                  >
                    <span className="font-bold text-white">{st.name}</span>
                    <span className={`text-[10px] ${isSelected ? "text-[#4edea3]" : "text-gray-400"}`}>
                      {st.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
