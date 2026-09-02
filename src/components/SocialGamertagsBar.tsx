"use client";

import React, { useState } from "react";
import { SocialLinks } from "@/lib/types";
import {
  Gamepad2,
  Tv,
  Youtube,
  Twitter,
  MessageSquare,
  Check,
  Copy,
  ExternalLink,
} from "lucide-react";

interface SocialGamertagsBarProps {
  socials?: SocialLinks;
  className?: string;
}

export default function SocialGamertagsBar({
  socials,
  className = "",
}: SocialGamertagsBarProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!socials) return null;

  const hasAnySocial = Object.values(socials).some((v) => v && v.trim() !== "");
  if (!hasAnySocial) return null;

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 pt-1 ${className}`}>
      {/* 1. Steam */}
      {socials.steam && (
        <a
          href={socials.steam.startsWith("http") ? socials.steam : `https://steamcommunity.com/id/${socials.steam}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1b2838]/80 hover:bg-[#1b2838] border border-blue-500/30 text-blue-200 text-xs font-semibold transition-all shadow-sm group"
          title="Ver perfil na Steam"
        >
          <span className="font-mono text-[10px] bg-blue-500/20 px-1.5 py-0.2 rounded text-blue-300">STEAM</span>
          <span>{socials.steam.replace(/https?:\/\/steamcommunity\.com\/id\/?/, "").replace(/\/$/, "")}</span>
          <ExternalLink className="w-3 h-3 text-blue-400 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
      )}

      {/* 2. PlayStation Network (PSN) */}
      {socials.psn && (
        <button
          type="button"
          onClick={() => handleCopy(socials.psn!, "psn")}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003791]/30 hover:bg-[#003791]/50 border border-blue-600/40 text-blue-200 text-xs font-semibold transition-all shadow-sm"
          title="Clique para copiar PSN ID"
        >
          <span className="font-mono text-[10px] bg-blue-600/30 px-1.5 py-0.2 rounded text-blue-300">PSN</span>
          <span>{socials.psn}</span>
          {copiedKey === "psn" ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-blue-400 opacity-60" />
          )}
        </button>
      )}

      {/* 3. Xbox Live */}
      {socials.xbox && (
        <button
          type="button"
          onClick={() => handleCopy(socials.xbox!, "xbox")}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#107c10]/30 hover:bg-[#107c10]/50 border border-emerald-500/40 text-emerald-200 text-xs font-semibold transition-all shadow-sm"
          title="Clique para copiar Xbox Gamertag"
        >
          <span className="font-mono text-[10px] bg-emerald-500/30 px-1.5 py-0.2 rounded text-emerald-300">XBOX</span>
          <span>{socials.xbox}</span>
          {copiedKey === "xbox" ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-emerald-400 opacity-60" />
          )}
        </button>
      )}

      {/* 4. Nintendo Switch */}
      {socials.switch && (
        <button
          type="button"
          onClick={() => handleCopy(socials.switch!, "switch")}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e60012]/20 hover:bg-[#e60012]/40 border border-rose-500/40 text-rose-200 text-xs font-semibold transition-all shadow-sm"
          title="Clique para copiar Nintendo Friend Code"
        >
          <span className="font-mono text-[10px] bg-rose-500/30 px-1.5 py-0.2 rounded text-rose-300">SWITCH</span>
          <span>{socials.switch}</span>
          {copiedKey === "switch" ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-rose-400 opacity-60" />
          )}
        </button>
      )}

      {/* 5. Discord */}
      {socials.discord && (
        <button
          type="button"
          onClick={() => handleCopy(socials.discord!, "discord")}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5865F2]/20 hover:bg-[#5865F2]/40 border border-indigo-500/40 text-indigo-200 text-xs font-semibold transition-all shadow-sm"
          title="Clique para copiar Discord Tag"
        >
          <MessageSquare className="w-3 h-3 text-[#5865F2]" />
          <span>{socials.discord}</span>
          {copiedKey === "discord" ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3 text-indigo-400 opacity-60" />
          )}
        </button>
      )}

      {/* 6. Twitch */}
      {socials.twitch && (
        <a
          href={socials.twitch.startsWith("http") ? socials.twitch : `https://twitch.tv/${socials.twitch}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#9146FF]/20 hover:bg-[#9146FF]/40 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-all shadow-sm group"
          title="Canal da Twitch"
        >
          <Tv className="w-3 h-3 text-purple-400" />
          <span>{socials.twitch.replace(/https?:\/\/twitch\.tv\/?/, "").replace(/\/$/, "")}</span>
          <ExternalLink className="w-3 h-3 text-purple-400 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
      )}

      {/* 7. YouTube */}
      {socials.youtube && (
        <a
          href={socials.youtube.startsWith("http") ? socials.youtube : `https://youtube.com/@${socials.youtube.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/30 text-rose-200 text-xs font-semibold transition-all shadow-sm group"
          title="Canal do YouTube"
        >
          <Youtube className="w-3 h-3 text-rose-400" />
          <span>{socials.youtube.replace(/https?:\/\/(www\.)?youtube\.com\/(@)?/, "").replace(/\/$/, "")}</span>
          <ExternalLink className="w-3 h-3 text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
      )}

      {/* 8. Twitter / X */}
      {socials.twitter && (
        <a
          href={socials.twitter.startsWith("http") ? socials.twitter : `https://x.com/${socials.twitter.replace(/^@/, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-200 text-xs font-semibold transition-all shadow-sm group"
          title="Perfil no X / Twitter"
        >
          <Twitter className="w-3 h-3 text-gray-300" />
          <span>@{socials.twitter.replace(/https?:\/\/(www\.)?(twitter|x)\.com\/?/, "").replace(/^@/, "")}</span>
          <ExternalLink className="w-3 h-3 text-gray-400 opacity-60 group-hover:opacity-100 transition-opacity" />
        </a>
      )}
    </div>
  );
}
