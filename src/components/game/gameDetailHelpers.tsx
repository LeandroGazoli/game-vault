import React from "react";
import { AgeRatingItem, Game, DLCItem } from "@/lib/types";
import { getPrimaryAgeRating } from "@/lib/gameUtils";

export type GameWebsite = NonNullable<Game["websites"]>[number];
export type GameDlc = DLCItem;

export interface GalleryMediaItem {
  url: string;
  type: "artwork" | "screenshot";
  label: string;
  id: string;
}

export interface WebsiteMeta {
  label: string;
  color: string;
  isStore: boolean;
  category: "social" | "wiki" | "official" | "community";
}

// Helper para selo oficial de Classificação Indicativa (CLASS_IND Brasil, ESRB, PEGI)
export function getAgeRatingBadge(ageRatings?: AgeRatingItem[], isAdult?: boolean) {
  const primary = getPrimaryAgeRating(ageRatings);

  if (primary) {
    let displayText = primary.label;
    let badgeStyle = "bg-zinc-800/80 border-white/10 text-zinc-200";
    let icon: React.ReactNode = null;

    const raw = (primary.badgeText || primary.label || "").toUpperCase();

    if (raw.includes("18") || primary.isAdult || raw === "AO") {
      displayText = "18+ Anos";
      badgeStyle = "bg-red-950/70 border-red-500/30 text-red-300";
      icon = <span className="text-sm leading-none">🔞</span>;
    } else if (raw.includes("16")) {
      displayText = "16+ Anos";
      badgeStyle = "bg-orange-950/70 border-orange-500/30 text-orange-300";
    } else if (raw.includes("14") || raw === "M" || raw.includes("17")) {
      displayText = raw.includes("17") ? "17+ Anos" : "14+ Anos";
      badgeStyle = "bg-amber-950/70 border-amber-500/30 text-amber-300";
    } else if (raw.includes("12") || raw === "T" || raw.includes("13")) {
      displayText = raw === "T" || raw.includes("13") ? "13+ Anos" : "12+ Anos";
      badgeStyle = "bg-yellow-950/60 border-yellow-500/30 text-yellow-300";
    } else if (raw.includes("10") || raw === "E10+") {
      displayText = "10+ Anos";
      badgeStyle = "bg-blue-950/70 border-blue-500/30 text-blue-300";
    } else if (raw === "L" || raw === "E" || raw.includes("LIVRE") || raw.includes("EVERYONE")) {
      displayText = "Livre (Todos)";
      badgeStyle = "bg-emerald-950/70 border-emerald-500/30 text-emerald-300";
    } else {
      displayText = primary.label || primary.badgeText;
      badgeStyle = "bg-zinc-800/80 border-white/10 text-zinc-300";
    }

    return (
      <span
        className={`px-2.5 py-1 rounded-lg border text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all ${badgeStyle}`}
        title={`Classificação Indicativa (${primary.organization}): ${primary.description}`}
      >
        {icon}
        <span>{displayText}</span>
      </span>
    );
  }

  if (isAdult) {
    return (
      <span
        className="px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md"
        title="Classificado para maiores de 18 anos (+18 / Conteúdo Adulto)"
      >
        <span className="text-sm leading-none">🔞</span>
        <span>18+ Anos</span>
      </span>
    );
  }

  return null;
}

// Helper para verificar se a URL é de uma loja digital
export function isStoreWebsite(url: string) {
  const u = url.toLowerCase();
  return (
    u.includes("steampowered.com") ||
    u.includes("playstation.com") ||
    u.includes("xbox.com") ||
    u.includes("nintendo.com") ||
    u.includes("epicgames.com") ||
    u.includes("gog.com")
  );
}

// Helper para estilizar links oficiais e lojas de acordo com o domínio
export function getWebsiteMeta(url: string): WebsiteMeta {
  const u = url.toLowerCase();
  if (u.includes("steampowered.com")) {
    return { label: "Steam", color: "bg-[#171a21] hover:bg-[#202530] text-[#66c0f4] border-[#66c0f4]/40 hover:border-[#66c0f4] shadow-md", isStore: true, category: "official" };
  }
  if (u.includes("playstation.com")) {
    return { label: "PlayStation Store", color: "bg-[#003791] hover:bg-[#004bb5] text-white border-blue-400/40 hover:border-blue-400 shadow-md", isStore: true, category: "official" };
  }
  if (u.includes("xbox.com")) {
    return { label: "Xbox Store", color: "bg-[#107c10] hover:bg-[#159a15] text-white border-green-400/40 hover:border-green-400 shadow-md", isStore: true, category: "official" };
  }
  if (u.includes("nintendo.com")) {
    return { label: "Nintendo eShop", color: "bg-[#e60012] hover:bg-[#ff1a2d] text-white border-red-400/40 hover:border-red-400 shadow-md", isStore: true, category: "official" };
  }
  if (u.includes("epicgames.com")) {
    return { label: "Epic Games Store", color: "bg-[#2a2a2a] hover:bg-[#383838] text-white border-white/30 hover:border-white shadow-md", isStore: true, category: "official" };
  }
  if (u.includes("gog.com")) {
    return { label: "GOG.com", color: "bg-[#6c2c8f] hover:bg-[#8537b0] text-white border-purple-400/40 hover:border-purple-400 shadow-md", isStore: true, category: "official" };
  }

  // Redes Sociais
  if (u.includes("twitter.com") || u.includes("x.com")) {
    return { label: "X (Twitter)", color: "bg-black/60 hover:bg-black/80 text-white border-white/30 hover:border-white", isStore: false, category: "social" };
  }
  if (u.includes("instagram.com")) {
    return { label: "Instagram", color: "bg-gradient-to-r from-[#833ab4]/30 via-[#fd1d1d]/30 to-[#fcb045]/30 hover:from-[#833ab4]/45 hover:via-[#fd1d1d]/45 hover:to-[#fcb045]/45 text-pink-300 border-pink-500/40", isStore: false, category: "social" };
  }
  if (u.includes("facebook.com")) {
    return { label: "Facebook", color: "bg-[#1877f2]/20 hover:bg-[#1877f2]/35 text-[#60a5fa] border-[#1877f2]/40", isStore: false, category: "social" };
  }
  if (u.includes("tiktok.com")) {
    return { label: "TikTok", color: "bg-black/70 hover:bg-black/90 text-cyan-300 border-cyan-500/40", isStore: false, category: "social" };
  }
  if (u.includes("bsky.app") || u.includes("bluesky")) {
    return { label: "Bluesky", color: "bg-[#1185fe]/20 hover:bg-[#1185fe]/35 text-[#38bdf8] border-[#1185fe]/40", isStore: false, category: "social" };
  }
  if (u.includes("threads.net")) {
    return { label: "Threads", color: "bg-black/60 hover:bg-black/80 text-gray-200 border-white/30", isStore: false, category: "social" };
  }
  if (u.includes("youtube.com")) {
    return { label: "Canal no YouTube", color: "bg-[#ff0000]/20 hover:bg-[#ff0000]/35 text-red-300 border-red-500/40", isStore: false, category: "social" };
  }
  if (u.includes("twitch.tv")) {
    return { label: "Lives na Twitch", color: "bg-[#9146FF]/20 hover:bg-[#9146FF]/35 text-[#c084fc] border-[#9146FF]/40", isStore: false, category: "social" };
  }
  if (u.includes("discord")) {
    return { label: "Discord Oficial", color: "bg-[#5865F2]/20 hover:bg-[#5865F2]/35 text-[#818cf8] border-[#5865F2]/40", isStore: false, category: "community" };
  }
  if (u.includes("reddit.com")) {
    return { label: "Subreddit (Reddit)", color: "bg-[#ff4500]/20 hover:bg-[#ff4500]/35 text-[#fb923c] border-[#ff4500]/40", isStore: false, category: "community" };
  }
  if (u.includes("fandom.com") || u.includes("wiki")) {
    return { label: "Wiki & Guias de Troféus", color: "bg-amber-500/20 hover:bg-amber-500/35 text-amber-300 border-amber-500/40", isStore: false, category: "wiki" };
  }
  if (u.includes("wikipedia.org")) {
    return { label: "Artigo na Wikipédia", color: "bg-white/10 hover:bg-white/20 text-gray-200 border-white/20", isStore: false, category: "wiki" };
  }

  let domainLabel = "Site Oficial";
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    domainLabel = parsed.hostname.replace(/^www\./, "");
  } catch {
    // fallback
  }
  return { label: domainLabel, color: "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40", isStore: false, category: "official" };
}
