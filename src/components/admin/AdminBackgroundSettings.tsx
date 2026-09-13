"use client";

import React from "react";
import { PRESET_BACKGROUNDS, SOLID_COLOR_PRESETS, BackgroundConfig } from "@/lib/types/background.types";
import { Image as ImageIcon, Palette, Sparkles, Check, Link as LinkIcon, Layers } from "lucide-react";

interface AdminBackgroundSettingsProps {
  value: BackgroundConfig;
  onChange: (config: BackgroundConfig) => void;
}

export default function AdminBackgroundSettings({ value, onChange }: AdminBackgroundSettingsProps) {
  const currentConfig: BackgroundConfig = value || {
    type: "preset",
    value: "/assets/bg/city.webp",
    opacity: 0.35,
  };

  return (
    <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
            <span>Plano de Fundo Padrão da Plataforma</span>
          </h3>
          <p className="text-xs text-gray-400">
            Define o visual de fundo global exibido para todos os usuários não-customizados e visitantes.
          </p>
        </div>
        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300 font-mono">
          <span>Modo Atual:</span>
          <strong className="text-[#00E5FF] uppercase">{currentConfig.type}</strong>
        </div>
      </div>

      {/* Tipo de Fundo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() =>
            onChange({
              type: "preset",
              value: PRESET_BACKGROUNDS[0].url,
              opacity: 0.35,
            })
          }
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs ${
            currentConfig.type === "preset"
              ? "bg-[#00E5FF]/15 border-[#00E5FF]/40 text-white font-bold"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <ImageIcon className="w-4 h-4 text-[#00E5FF]" />
          <span>Presets Oficiais</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChange({
              type: "solid_color",
              value: SOLID_COLOR_PRESETS[0].hex,
            })
          }
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs ${
            currentConfig.type === "solid_color"
              ? "bg-purple-500/15 border-purple-500/40 text-white font-bold"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Palette className="w-4 h-4 text-purple-400" />
          <span>Cor Sólida</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChange({
              type: "custom_image",
              value: currentConfig.type === "custom_image" ? currentConfig.value : "",
              opacity: 0.35,
            })
          }
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs ${
            currentConfig.type === "custom_image"
              ? "bg-emerald-500/15 border-emerald-500/40 text-white font-bold"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <LinkIcon className="w-4 h-4 text-emerald-400" />
          <span>Link Customizado</span>
        </button>

        <button
          type="button"
          onClick={() =>
            onChange({
              type: "animated",
              value: "parallax",
              animationId: "parallax",
            })
          }
          className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all text-xs ${
            currentConfig.type === "animated"
              ? "bg-amber-500/15 border-amber-500/40 text-white font-bold"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Animação / Motor</span>
        </button>
      </div>

      {/* Conteúdo específico por tipo */}
      {currentConfig.type === "preset" && (
        <div className="space-y-3">
          <label className="text-xs font-mono text-gray-400 uppercase block">
            Escolha uma imagem oficial (/public/assets/bg)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_BACKGROUNDS.map((bg) => {
              const isSelected = currentConfig.value === bg.url;
              return (
                <button
                  key={bg.id}
                  type="button"
                  onClick={() =>
                    onChange({
                      ...currentConfig,
                      value: bg.url,
                    })
                  }
                  className={`group relative rounded-2xl overflow-hidden border-2 transition-all text-left ${
                    isSelected
                      ? "border-[#00E5FF] ring-2 ring-[#00E5FF]/30 scale-[1.02]"
                      : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
                  }`}
                >
                  <div className="h-24 w-full bg-[#0b0d12]">
                    <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-2.5 bg-[#141722]/90 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-white truncate">{bg.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#00E5FF] shrink-0" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {currentConfig.type === "solid_color" && (
        <div className="space-y-3">
          <label className="text-xs font-mono text-gray-400 uppercase block">
            Paleta de Cores Sólidas Escuras
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
            {SOLID_COLOR_PRESETS.map((color) => {
              const isSelected = currentConfig.value.toLowerCase() === color.hex.toLowerCase();
              return (
                <button
                  key={color.id}
                  type="button"
                  onClick={() => onChange({ ...currentConfig, value: color.hex })}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    isSelected
                      ? "border-purple-400 ring-2 ring-purple-400/40 bg-white/10 scale-105"
                      : "border-white/10 hover:border-white/20 bg-white/5"
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-xl mx-auto mb-2 border border-white/20 shadow-inner flex items-center justify-center"
                    style={{ backgroundColor: color.hex }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className="text-[11px] font-bold text-white block truncate">{color.name}</span>
                  <span className="text-[9px] font-mono text-gray-400">{color.hex}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-2 flex items-center gap-3">
            <span className="text-xs text-gray-400">Ou cor hexadecimal personalizada:</span>
            <input
              type="color"
              value={currentConfig.value.startsWith("#") ? currentConfig.value : "#0e0f12"}
              onChange={(e) => onChange({ ...currentConfig, value: e.target.value })}
              className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-white/20"
            />
            <input
              type="text"
              value={currentConfig.value}
              onChange={(e) => onChange({ ...currentConfig, value: e.target.value })}
              placeholder="#0e0f12"
              className="bg-[#0d0f14] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono w-32 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
      )}

      {currentConfig.type === "custom_image" && (
        <div className="space-y-3">
          <label className="text-xs font-mono text-gray-400 uppercase block">
            URL da Imagem de Fundo (HTTPS direta de Unsplash, Imgur, CDN)
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              value={currentConfig.value}
              onChange={(e) => onChange({ ...currentConfig, value: e.target.value })}
              placeholder="https://images.unsplash.com/... ou https://i.imgur.com/..."
              className="flex-1 bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-400"
            />
          </div>
          {currentConfig.value && (
            <div className="h-32 rounded-2xl overflow-hidden border border-white/10 relative bg-[#0a0b0e]">
              <img
                src={currentConfig.value}
                alt="Preview Custom"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 text-[10px] text-gray-300 font-mono">
                Pré-visualização do Link
              </div>
            </div>
          )}
        </div>
      )}

      {currentConfig.type === "animated" && (
        <div className="space-y-3">
          <label className="text-xs font-mono text-gray-400 uppercase block">
            Efeito Dinâmico do Motor
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "parallax", name: "Parallax Cósmico", desc: "Camadas 3D com aurora e grid synthwave" },
              { id: "sprites", name: "Sprites Retrô", desc: "Personagens e mascotes pixel art animados" },
              { id: "dust", name: "Space Dust 3D", desc: "Poeira espacial Three.js clássica" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onChange({
                    type: "animated",
                    value: item.id,
                    animationId: item.id as any,
                  })
                }
                className={`p-3 rounded-2xl border text-left transition-all ${
                  currentConfig.value === item.id
                    ? "bg-amber-500/15 border-amber-500/40 text-white font-bold"
                    : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
                }`}
              >
                <div className="text-xs font-bold text-white mb-1">{item.name}</div>
                <div className="text-[11px] text-gray-400 leading-tight">{item.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
