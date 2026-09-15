"use client";

import React, { useState } from "react";
import { Gamepad2, ChevronDown, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
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
  const [isValidatingSteam, setIsValidatingSteam] = useState(false);
  const [steamValidation, setSteamValidation] = useState<{
    valid: boolean;
    personaname?: string;
    avatarUrl?: string;
    isPrivate?: boolean;
    gamesCount?: number;
    warning?: string | null;
    error?: string | null;
  } | null>(null);

  const updateField = (field: keyof SocialLinks, val: string) => {
    setSocials((prev) => ({ ...prev, [field]: val }));
  };

  const handleValidateSteam = async () => {
    if (!socials.steam?.trim()) return;
    setIsValidatingSteam(true);
    setSteamValidation(null);
    try {
      const res = await fetch("/api/steam/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steamInput: socials.steam.trim() }),
      });
      const data = await res.json();
      if (data.valid) {
        setSteamValidation({
          valid: true,
          personaname: data.profile?.personaname,
          avatarUrl: data.profile?.avatarUrl,
          isPrivate: data.isPrivate,
          gamesCount: data.gamesCount,
          warning: data.warning,
        });
        if (data.steamId64 && data.steamId64 !== socials.steam) {
          updateField("steam", data.steamId64);
        }
      } else {
        setSteamValidation({
          valid: false,
          error: data.error || "Perfil Steam não encontrado.",
        });
      }
    } catch {
      setSteamValidation({
        valid: false,
        error: "Erro de comunicação ao validar perfil.",
      });
    } finally {
      setIsValidatingSteam(false);
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
          {/* Steam com Pré-validação */}
          <div className="space-y-1.5 p-2.5 rounded-xl bg-[#1a2130] border border-white/10">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🎮</span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] text-gray-400 font-bold block">Steam Community</span>
                <input
                  type="text"
                  value={socials.steam || ""}
                  onChange={(e) => {
                    updateField("steam", e.target.value);
                    if (steamValidation) setSteamValidation(null);
                  }}
                  placeholder="ID ou URL do perfil Steam"
                  className="w-full bg-transparent text-xs text-white font-mono outline-none placeholder:text-gray-600"
                />
              </div>

              {socials.steam?.trim() && (
                <button
                  type="button"
                  onClick={handleValidateSteam}
                  disabled={isValidatingSteam}
                  className="px-2 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-[#00E5FF] text-[10px] font-bold transition-colors flex items-center gap-1 shrink-0"
                >
                  {isValidatingSteam ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    "Validar"
                  )}
                </button>
              )}

              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                socials.steam ? "bg-[#4edea3]/20 text-[#4edea3]" : "bg-white/5 text-gray-500"
              }`}>
                {socials.steam ? "CONECTADO" : "VINCULAR"}
              </span>
            </div>

            {/* Feedback de Pré-validação Steam */}
            {steamValidation && (
              <div className={`p-2 rounded-lg text-[11px] flex items-center justify-between gap-2 animate-fadeIn ${
                steamValidation.valid
                  ? steamValidation.isPrivate
                    ? "bg-amber-500/10 border border-amber-500/30 text-amber-300"
                    : "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                  : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
              }`}>
                <div className="flex items-center gap-2 min-w-0">
                  {steamValidation.valid ? (
                    steamValidation.isPrivate ? (
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="truncate">
                    {steamValidation.valid
                      ? `${steamValidation.personaname || "Perfil Localizado"} (${steamValidation.gamesCount || 0} jogos) — ${steamValidation.isPrivate ? "Biblioteca Privada" : "Pública"}`
                      : steamValidation.error}
                  </span>
                </div>
              </div>
            )}
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
