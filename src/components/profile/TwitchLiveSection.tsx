"use client";

import React, { useState } from "react";
import { Radio, ExternalLink, Volume2, ChevronDown, ChevronUp } from "lucide-react";

export interface TwitchLiveSectionProps {
  channel: string;
  streamTitle?: string;
  currentGame?: string;
  viewerCount?: number;
  className?: string;
}

export default function TwitchLiveSection({
  channel,
  streamTitle,
  currentGame,
  viewerCount,
  className = "",
}: TwitchLiveSectionProps) {
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(true);
  const cleanChannel = channel.replace(/^https?:\/\/(www\.)?twitch\.tv\//i, "").replace(/[^a-zA-Z0-9_]/g, "");

  if (!cleanChannel) return null;

  const currentHost = typeof window !== "undefined" ? window.location.hostname : "localhost";

  return (
    <div
      className={`rounded-3xl bg-[#141822] border border-purple-500/30 overflow-hidden shadow-xl shadow-purple-950/20 transition-all ${className}`}
    >
      {/* Header com Selo LIVE pulsante e Métricas da Transmissão */}
      <div className="p-3.5 sm:p-4 bg-gradient-to-r from-purple-950/40 via-[#181a24] to-[#141822] flex items-center justify-between gap-3 border-b border-white/5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative flex items-center justify-center">
            <span className="absolute inline-flex h-full w-full rounded-full bg-purple-500 opacity-75 animate-ping" />
            <span className="relative inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-600 text-white font-black font-mono text-[10px] tracking-wider uppercase shadow-md">
              <Radio className="w-3 h-3 animate-pulse" />
              LIVE
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-white tracking-tight">
                Transmitindo na Twitch:
              </span>
              <span className="text-xs font-mono font-bold text-purple-400 truncate">
                twitch.tv/{cleanChannel}
              </span>
            </div>
            {currentGame && (
              <p className="text-[11px] text-gray-400 truncate">
                Jogando: <span className="text-emerald-400 font-semibold">{currentGame}</span>
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={`https://twitch.tv/${cleanChannel}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-bold flex items-center gap-1 transition-colors"
          >
            <span>Abrir App</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={() => setIsPlayerExpanded(!isPlayerExpanded)}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
            title={isPlayerExpanded ? "Recolher player" : "Expandir player"}
            aria-label="Alternar player Twitch"
          >
            {isPlayerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Player Twitch Embutido */}
      {isPlayerExpanded && (
        <div className="relative aspect-video w-full bg-black/60">
          <iframe
            src={`https://player.twitch.tv/?channel=${cleanChannel}&parent=${currentHost}&muted=true&autoplay=false`}
            title={`Live de ${cleanChannel}`}
            className="w-full h-full border-0"
            allowFullScreen
          />
        </div>
      )}
    </div>
  );
}
