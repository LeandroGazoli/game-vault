"use client";

import React from "react";
import { Gamepad2, ChevronDown } from "lucide-react";
import { SocialLinks } from "@/lib/types";

interface ConnectedAccountsAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  socials: SocialLinks;
  setSocials: React.Dispatch<React.SetStateAction<SocialLinks>>;
}

export default function ConnectedAccountsAccordion({
  isOpen,
  onToggle,
  socials,
  setSocials,
}: ConnectedAccountsAccordionProps) {
  const updateField = (field: keyof SocialLinks, val: string) => {
    setSocials((prev) => ({ ...prev, [field]: val }));
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
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-white tracking-tight">
              5. Gamertags &amp; Redes Conectadas
            </h3>
            <p className="text-[11px] text-gray-400">
              Steam, PSN, Xbox, Switch, Discord, Twitch, etc.
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
        <div className="p-4 space-y-3 border-t border-white/5 animate-fadeIn">
          {/* Steam */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1a2130] border border-white/10">
            <span className="text-lg">🎮</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-400 font-bold block">Steam Community</span>
              <input
                type="text"
                value={socials.steam || ""}
                onChange={(e) => updateField("steam", e.target.value)}
                placeholder="ID ou URL do perfil Steam"
                className="w-full bg-transparent text-xs text-white font-mono outline-none placeholder:text-gray-600"
              />
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              socials.steam ? "bg-[#4edea3]/20 text-[#4edea3]" : "bg-white/5 text-gray-500"
            }`}>
              {socials.steam ? "CONECTADO" : "VINCULAR"}
            </span>
          </div>

          {/* PlayStation */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1a2130] border border-white/10">
            <span className="text-lg">🕹️</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-400 font-bold block">PlayStation Network (PSN)</span>
              <input
                type="text"
                value={socials.psn || ""}
                onChange={(e) => updateField("psn", e.target.value)}
                placeholder="PSN Online ID"
                className="w-full bg-transparent text-xs text-white font-mono outline-none placeholder:text-gray-600"
              />
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              socials.psn ? "bg-[#4edea3]/20 text-[#4edea3]" : "bg-white/5 text-gray-500"
            }`}>
              {socials.psn ? "CONECTADO" : "VINCULAR"}
            </span>
          </div>

          {/* Xbox Live */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1a2130] border border-white/10">
            <span className="text-lg">🟢</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-400 font-bold block">Xbox Live Gamertag</span>
              <input
                type="text"
                value={socials.xbox || ""}
                onChange={(e) => updateField("xbox", e.target.value)}
                placeholder="Xbox Gamertag"
                className="w-full bg-transparent text-xs text-white font-mono outline-none placeholder:text-gray-600"
              />
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              socials.xbox ? "bg-[#4edea3]/20 text-[#4edea3]" : "bg-white/5 text-gray-500"
            }`}>
              {socials.xbox ? "CONECTADO" : "SYNC"}
            </span>
          </div>

          {/* Nintendo Switch */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1a2130] border border-white/10">
            <span className="text-lg">🔴</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-400 font-bold block">Nintendo Switch Friend Code</span>
              <input
                type="text"
                value={socials.switch || ""}
                onChange={(e) => updateField("switch", e.target.value)}
                placeholder="SW-XXXX-XXXX-XXXX"
                className="w-full bg-transparent text-xs text-white font-mono outline-none placeholder:text-gray-600"
              />
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              socials.switch ? "bg-[#4edea3]/20 text-[#4edea3]" : "bg-white/5 text-gray-500"
            }`}>
              {socials.switch ? "CONECTADO" : "VINCULAR"}
            </span>
          </div>

          {/* Discord */}
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#1a2130] border border-white/10">
            <span className="text-lg">💬</span>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-gray-400 font-bold block">Discord Tag</span>
              <input
                type="text"
                value={socials.discord || ""}
                onChange={(e) => updateField("discord", e.target.value)}
                placeholder="usuario"
                className="w-full bg-transparent text-xs text-white font-mono outline-none placeholder:text-gray-600"
              />
            </div>
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
              socials.discord ? "bg-[#4edea3]/20 text-[#4edea3]" : "bg-white/5 text-gray-500"
            }`}>
              {socials.discord ? "VINCULADO" : "CONECTAR"}
            </span>
          </div>

          {/* Twitch / YouTube / X */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 block font-semibold">🟣 Twitch</span>
              <input
                type="text"
                value={socials.twitch || ""}
                onChange={(e) => updateField("twitch", e.target.value)}
                placeholder="canal"
                className="w-full bg-[#1a2130] rounded-lg px-2.5 py-1.5 text-xs text-white border border-white/10 focus:outline-none focus:border-[#4edea3]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 block font-semibold">🔴 YouTube</span>
              <input
                type="text"
                value={socials.youtube || ""}
                onChange={(e) => updateField("youtube", e.target.value)}
                placeholder="@canal"
                className="w-full bg-[#1a2130] rounded-lg px-2.5 py-1.5 text-xs text-white border border-white/10 focus:outline-none focus:border-[#4edea3]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-gray-400 block font-semibold">✖️ X / Twitter</span>
              <input
                type="text"
                value={socials.twitter || ""}
                onChange={(e) => updateField("twitter", e.target.value)}
                placeholder="@perfil"
                className="w-full bg-[#1a2130] rounded-lg px-2.5 py-1.5 text-xs text-white border border-white/10 focus:outline-none focus:border-[#4edea3]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
