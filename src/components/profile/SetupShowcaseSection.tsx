"use client";

import React from "react";
import { GamerSetupConfig } from "@/lib/types/profile.types";
import { Cpu, Monitor, Keyboard, Mouse, Gamepad2, Headphones, Sparkles } from "lucide-react";

interface SetupShowcaseSectionProps {
  setup?: GamerSetupConfig | null;
  isOwner?: boolean;
}

const DEFAULT_SETUP: GamerSetupConfig = {
  cpu: "AMD Ryzen 7 7800X3D",
  gpu: "NVIDIA GeForce RTX 4080 Super",
  ram: "32GB DDR5 6000MHz",
  monitor: 'Alienware 27" OLED 360Hz',
  keyboard: "Wooting 60HE Hall Effect",
  mouse: "Logitech G Pro X Superlight 2",
  controller: "DualSense Edge / Xbox Elite 2",
  headset: "Audeze Maxwell Wireless",
};

export default function SetupShowcaseSection({ setup = DEFAULT_SETUP }: SetupShowcaseSectionProps) {
  const currentSetup = setup || DEFAULT_SETUP;

  const items = [
    { label: "Processador", val: currentSetup.cpu, icon: Cpu },
    { label: "Placa de Vídeo", val: currentSetup.gpu, icon: Sparkles },
    { label: "Monitor", val: currentSetup.monitor, icon: Monitor },
    { label: "Teclado", val: currentSetup.keyboard, icon: Keyboard },
    { label: "Mouse", val: currentSetup.mouse, icon: Mouse },
    { label: "Controle", val: currentSetup.controller, icon: Gamepad2 },
  ].filter((item) => Boolean(item.val));

  return (
    <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Setup Gamer & Hardware</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold">
                Hardware
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Máquina de combate e periféricos oficiais utilizados pelo jogador
            </p>
          </div>
        </div>
      </div>

      {/* Grid de Hardware Key-Value */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[#181d28] border border-white/5 space-y-1 transition-colors hover:border-cyan-500/30"
            >
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span>{item.label}</span>
              </div>
              <p className="text-xs font-bold text-white truncate" title={item.val}>
                {item.val}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
