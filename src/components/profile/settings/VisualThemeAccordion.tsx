"use client";

import React, { useRef } from "react";
import { Palette, ChevronDown, Sparkles, Code, Crown, Wand2, Upload } from "lucide-react";
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
  const bannerFileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setCustomBannerUrl(reader.result);
          setBannerURL(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
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
            <div className="flex gap-2 items-center mt-2">
              <input
                ref={bannerFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBannerUpload}
              />
              <button
                type="button"
                onClick={() => bannerFileInputRef.current?.click()}
                className="px-3 py-1.5 rounded-lg bg-[#1a2130] hover:bg-[#1e2433] text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 active:scale-95 transition-all shrink-0"
              >
                <Upload className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Upload Imagem</span>
              </button>
              <input
                type="text"
                value={customBannerUrl}
                onChange={(e) => {
                  setCustomBannerUrl(e.target.value);
                  if (e.target.value) setBannerURL(e.target.value);
                }}
                placeholder="Ou insira link de imagem/GIF..."
                className="w-full bg-[#1a2130] text-xs rounded-lg px-2.5 py-1.5 border border-white/10 text-white font-mono placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
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

          {/* 5. Suporte a Estilização CSS Scoped (Exclusivo VIP/PRO) */}
          <div className="space-y-2.5 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="space-y-0.5">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-cyan-400" /> Estilização CSS Customizada (Scoped)
                </label>
                <p className="text-[11px] text-gray-400">
                  Adicione regras CSS personalizadas aplicadas exclusivamente ao container do seu perfil (#profile).
                </p>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" /> VIP &amp; PRO
              </span>
            </div>

            {/* Snippets Rápidos de CSS */}
            {isPremium && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                  <Wand2 className="w-3 h-3 text-cyan-400" /> Snippets:
                </span>
                {CSS_SNIPPETS.map((snip) => (
                  <button
                    key={snip.label}
                    type="button"
                    onClick={() => {
                      if (setCustomCss) {
                        setCustomCss(customCss ? `${customCss}\n\n${snip.code}` : snip.code);
                      }
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-cyan-500/10 text-gray-300 hover:text-cyan-300 border border-white/10 hover:border-cyan-500/30 text-[10px] font-mono transition-all shrink-0 cursor-pointer active:scale-95"
                  >
                    {snip.label}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <textarea
                rows={4}
                disabled={!isPremium}
                value={customCss || ""}
                onChange={(e) => setCustomCss?.(e.target.value)}
                placeholder={
                  isPremium
                    ? "/* Digite seu CSS aqui (escopado automaticamente em #profile) */\n#profile .profile-hero {\n  border: 1px solid #00e5ff;\n}"
                    : "🔒 Recurso exclusivo para membros VIP e PRO. Faça upgrade para desbloquear estilização livre via CSS."
                }
                className="w-full bg-[#090b10] rounded-xl p-3 font-mono text-xs text-cyan-300 border border-white/10 focus:outline-none focus:border-[#00E5FF] leading-relaxed resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between items-center text-[10px] text-gray-500 px-1 pt-0.5">
                <span>Blindagem de escopo com #profile ativa</span>
                <span>{(customCss || "").length} caracteres</span>
              </div>
            </div>

            {!isPremium && (
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between gap-2">
                <span>Personalize o design do seu perfil com CSS customizado e cores exclusivas.</span>
                <button
                  type="button"
                  onClick={onOpenUpgrade}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10px] shrink-0 transition-colors cursor-pointer"
                >
                  Ver Planos
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
