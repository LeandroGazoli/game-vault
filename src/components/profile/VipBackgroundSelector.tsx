"use client";

import React from "react";
import {
  PRESET_BACKGROUNDS,
  SOLID_COLOR_PRESETS,
  BackgroundConfig,
} from "@/lib/types/background.types";
import {
  Sparkles,
  Image as ImageIcon,
  Palette,
  Link as LinkIcon,
  Crown,
  Check,
  Layers,
  Lock,
} from "lucide-react";

interface VipBackgroundSelectorProps {
  isVipOrPro: boolean;
  value: BackgroundConfig | null;
  onChange: (config: BackgroundConfig) => void;
  onOpenUpgrade?: () => void;
}

export default function VipBackgroundSelector({
  isVipOrPro,
  value,
  onChange,
  onOpenUpgrade,
}: VipBackgroundSelectorProps) {
  const currentConfig: BackgroundConfig = value || {
    type: "preset",
    value: PRESET_BACKGROUNDS[0].url,
    opacity: 0.35,
  };

  const handleTypeSelect = (type: BackgroundConfig["type"]) => {
    if (!isVipOrPro) {
      onOpenUpgrade?.();
      return;
    }
    if (type === "preset") {
      onChange({ type: "preset", value: PRESET_BACKGROUNDS[0].url, opacity: 0.35 });
    } else if (type === "solid_color") {
      onChange({ type: "solid_color", value: SOLID_COLOR_PRESETS[0].hex });
    } else if (type === "custom_image") {
      onChange({ type: "custom_image", value: "", opacity: 0.35 });
    } else if (type === "animated") {
      onChange({ type: "animated", value: "parallax", animationId: "parallax" });
    }
  };

  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="space-y-0.5">
          <label className="text-xs font-bold uppercase tracking-wider text-gray-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Papel de Parede / Fundo do App
          </label>
          <p className="text-[11px] text-gray-400">
            Personalize o plano de fundo do site com artes oficiais, cores sólidas ou imagem própria via link.
          </p>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1">
          <Crown className="w-3 h-3 text-amber-400" /> Exclusivo VIP / PRO
        </span>
      </div>

      {/* Seletor de Tipo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          type="button"
          onClick={() => handleTypeSelect("preset")}
          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            currentConfig.type === "preset"
              ? "bg-[#00E5FF]/15 border-[#00E5FF]/40 text-[#00E5FF]"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Presets de Jogos</span>
        </button>

        <button
          type="button"
          onClick={() => handleTypeSelect("solid_color")}
          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            currentConfig.type === "solid_color"
              ? "bg-purple-500/15 border-purple-500/40 text-purple-300"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Cor Sólida</span>
        </button>

        <button
          type="button"
          onClick={() => handleTypeSelect("custom_image")}
          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            currentConfig.type === "custom_image"
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Meu Link (URL)</span>
        </button>

        <button
          type="button"
          onClick={() => handleTypeSelect("animated")}
          className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            currentConfig.type === "animated"
              ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
              : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Parallax &amp; Sprites</span>
        </button>
      </div>

      {/* Conteúdo de Presets */}
      {currentConfig.type === "preset" && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
          {PRESET_BACKGROUNDS.map((bg) => {
            const isSelected = currentConfig.value === bg.url;
            return (
              <button
                key={bg.id}
                type="button"
                onClick={() => {
                  if (!isVipOrPro) {
                    onOpenUpgrade?.();
                    return;
                  }
                  onChange({ ...currentConfig, type: "preset", value: bg.url });
                }}
                className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all text-left group ${
                  isSelected
                    ? "border-[#00E5FF] ring-2 ring-[#00E5FF]/40 scale-105"
                    : "border-white/10 hover:border-white/30 opacity-75 hover:opacity-100"
                }`}
              >
                <img src={bg.thumbnail} alt={bg.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-1.5">
                  <span className="text-[10px] font-bold text-white truncate w-full">{bg.name}</span>
                </div>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-[#00E5FF] text-black">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Conteúdo de Cores Sólidas */}
      {currentConfig.type === "solid_color" && (
        <div className="space-y-3 pt-1">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {SOLID_COLOR_PRESETS.map((sc) => {
              const isSelected = currentConfig.value.toLowerCase() === sc.hex.toLowerCase();
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => {
                    if (!isVipOrPro) {
                      onOpenUpgrade?.();
                      return;
                    }
                    onChange({ ...currentConfig, type: "solid_color", value: sc.hex });
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-purple-400 ring-2 ring-purple-400/40 bg-white/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div
                    className="w-6 h-6 rounded-lg mx-auto mb-1 border border-white/20"
                    style={{ backgroundColor: sc.hex }}
                  />
                  <span className="text-[10px] font-bold text-gray-200 block truncate">{sc.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-gray-400">Ou escolha no seletor:</span>
            <input
              type="color"
              disabled={!isVipOrPro}
              value={currentConfig.value.startsWith("#") ? currentConfig.value : "#0e0f12"}
              onChange={(e) =>
                onChange({ ...currentConfig, type: "solid_color", value: e.target.value })
              }
              className="w-8 h-8 rounded-lg bg-transparent cursor-pointer border border-white/20"
            />
            <input
              type="text"
              disabled={!isVipOrPro}
              value={currentConfig.value}
              onChange={(e) =>
                onChange({ ...currentConfig, type: "solid_color", value: e.target.value })
              }
              placeholder="#0e0f12"
              className="bg-[#121316] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white font-mono w-28 focus:outline-none focus:border-purple-400"
            />
          </div>
        </div>
      )}

      {/* Conteúdo Imagem Customizada */}
      {currentConfig.type === "custom_image" && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-3.5 h-3.5 text-emerald-400" />
            <input
              type="url"
              disabled={!isVipOrPro}
              placeholder="Cole o link da sua imagem de fundo (ex: https://i.imgur.com/...)"
              value={currentConfig.value}
              onChange={(e) =>
                onChange({ ...currentConfig, type: "custom_image", value: e.target.value })
              }
              className="flex-1 bg-[#121316] border border-white/10 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-400"
            />
          </div>
          {currentConfig.value && (
            <div className="h-24 rounded-xl overflow-hidden border border-white/10 relative bg-[#090b0f]">
              <img
                src={currentConfig.value}
                alt="Preview Fundo Customizado"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <div className="absolute bottom-1.5 left-2 px-2 py-0.5 rounded bg-black/70 text-[9px] text-gray-300 font-mono">
                Pré-visualização do Fundo
              </div>
            </div>
          )}
        </div>
      )}

      {/* Conteúdo Efeitos Dinâmicos */}
      {currentConfig.type === "animated" && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {[
            { id: "parallax", label: "Parallax Cósmico", desc: "Camadas reagindo ao scroll" },
            { id: "sprites", label: "Sprites Retrô", desc: "Pixel art procedural animado" },
            { id: "dust", label: "Space Dust 3D", desc: "Poeira espacial Three.js" },
          ].map((ani) => (
            <button
              key={ani.id}
              type="button"
              onClick={() => {
                if (!isVipOrPro) {
                  onOpenUpgrade?.();
                  return;
                }
                onChange({
                  type: "animated",
                  value: ani.id,
                  animationId: ani.id as any,
                });
              }}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                currentConfig.value === ani.id
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
            >
              <div className="text-xs font-bold text-white mb-0.5">{ani.label}</div>
              <div className="text-[10px] text-gray-400 leading-tight">{ani.desc}</div>
            </button>
          ))}
        </div>
      )}

      {!isVipOrPro && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Desbloqueie papéis de parede exclusivos e links personalizados sendo VIP ou PRO.</span>
          </div>
          <button
            type="button"
            onClick={onOpenUpgrade}
            className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-black font-bold text-[10px] shrink-0 transition-colors"
          >
            Ver Planos
          </button>
        </div>
      )}
    </div>
  );
}
