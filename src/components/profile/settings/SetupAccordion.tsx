"use client";

import React, { useState } from "react";
import { Cpu, ChevronDown, Monitor, Keyboard, Mouse, Gamepad2, Headphones, Sparkles, Check, Trash2 } from "lucide-react";
import { GamerSetupConfig } from "@/lib/types/profile.types";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface SetupAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  setup: GamerSetupConfig;
  setSetup: React.Dispatch<React.SetStateAction<GamerSetupConfig>>;
}

export default function SetupAccordion({
  isOpen,
  onToggle,
  setup,
  setSetup,
}: SetupAccordionProps) {
  const updateField = (field: keyof GamerSetupConfig, val: string) => {
    setSetup((prev) => ({ ...prev, [field]: val }));
  };

  const clearSetup = () => {
    triggerSelectionHaptic();
    setSetup({});
  };

  return (
    <div
      className={`rounded-2xl bg-[#141822] border transition-all duration-300 overflow-hidden shadow-sm ${
        isOpen ? "border-cyan-400/40 ring-1 ring-cyan-400/20" : "border-white/10"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-[#1a2130]/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-white tracking-tight">
              Setup Gamer &amp; Hardware
            </h3>
            <p className="text-[11px] text-gray-400">
              Configure sua máquina, placa de vídeo, periféricos e monitor
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-cyan-400" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-white/5 animate-fadeIn">
          <p className="text-xs text-gray-300">
            Preencha os campos abaixo com as especificações do seu equipamento. Campos em branco não serão exibidos. Se nenhum campo for preenchido, o bloco é automaticamente ocultado do seu perfil público.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Processador (CPU)
              </label>
              <input
                type="text"
                value={setup.cpu || ""}
                onChange={(e) => updateField("cpu", e.target.value)}
                placeholder="Ex: AMD Ryzen 7 7800X3D / Core i7-14700K"
                className="w-full px-3 py-2 rounded-xl bg-[#0e121a] border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Placa de Vídeo (GPU)
              </label>
              <input
                type="text"
                value={setup.gpu || ""}
                onChange={(e) => updateField("gpu", e.target.value)}
                placeholder="Ex: NVIDIA GeForce RTX 4080 / Radeon RX 7900"
                className="w-full px-3 py-2 rounded-xl bg-[#0e121a] border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Monitor
              </label>
              <input
                type="text"
                value={setup.monitor || ""}
                onChange={(e) => updateField("monitor", e.target.value)}
                placeholder='Ex: Alienware 27" OLED 360Hz / LG UltraGear'
                className="w-full px-3 py-2 rounded-xl bg-[#0e121a] border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Teclado
              </label>
              <input
                type="text"
                value={setup.keyboard || ""}
                onChange={(e) => updateField("keyboard", e.target.value)}
                placeholder="Ex: Wooting 60HE / Keychron Q1"
                className="w-full px-3 py-2 rounded-xl bg-[#0e121a] border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Mouse
              </label>
              <input
                type="text"
                value={setup.mouse || ""}
                onChange={(e) => updateField("mouse", e.target.value)}
                placeholder="Ex: Logitech G Pro X Superlight / Razer Viper"
                className="w-full px-3 py-2 rounded-xl bg-[#0e121a] border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Controle
              </label>
              <input
                type="text"
                value={setup.controller || ""}
                onChange={(e) => updateField("controller", e.target.value)}
                placeholder="Ex: DualSense Edge / Xbox Elite 2"
                className="w-full px-3 py-2 rounded-xl bg-[#0e121a] border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] font-bold text-gray-400 block mb-1">
                Headset / Fone
              </label>
              <input
                type="text"
                value={setup.headset || ""}
                onChange={(e) => updateField("headset", e.target.value)}
                placeholder="Ex: Audeze Maxwell / Sennheiser HD 560S"
                className="w-full px-3 py-2 rounded-xl bg-[#0e121a] border border-white/10 text-white text-xs focus:border-cyan-400 outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={clearSetup}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar Setup</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
