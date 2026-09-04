import { ProfileTheme } from "./types";

export interface ThemeStyles {
  id: ProfileTheme;
  name: string;
  primaryHex: string;
  textAccent: string;
  borderAccent: string;
  borderHover: string;
  bgAccent: string;
  bgSubtle: string;
  badgeBorder: string;
  badgeBg: string;
  badgeText: string;
  avatarRing: string;
  avatarBorder: string;
  activeTabBg: string;
  cardGlow: string;
  borderGlow: string;
  hudBorder: string;
  hudText: string;
  hudBg: string;
  hudButton: string;
  badgeStyle: string;
}

export const THEME_STYLES: Record<ProfileTheme, ThemeStyles> = {
  cyan: {
    id: "cyan",
    name: "Cyberpunk Cyan",
    primaryHex: "#00E5FF",
    textAccent: "text-[#00E5FF]",
    borderAccent: "border-[#00E5FF]/40",
    borderHover: "hover:border-[#00E5FF]/70",
    bgAccent: "bg-[#00E5FF]",
    bgSubtle: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/40",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-[#00E5FF]",
    avatarRing: "ring-[#00E5FF]",
    avatarBorder: "border-[#00E5FF]/50",
    activeTabBg: "bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/25 font-black",
    cardGlow: "shadow-cyan-500/15",
    borderGlow: "border-cyan-500/30",
    hudBorder: "border-cyan-500/40",
    hudText: "text-cyan-400",
    hudBg: "bg-cyan-950/40",
    hudButton: "bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-400/20",
    badgeStyle: "bg-cyan-500/15 border border-cyan-500/40 text-[#00E5FF]",
  },
  gold: {
    id: "gold",
    name: "Obsidian Gold VIP",
    primaryHex: "#F59E0B",
    textAccent: "text-amber-300",
    borderAccent: "border-amber-500/40",
    borderHover: "hover:border-amber-500/70",
    bgAccent: "bg-amber-400",
    bgSubtle: "bg-amber-500/10",
    badgeBorder: "border-amber-500/40",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-300",
    avatarRing: "ring-amber-400",
    avatarBorder: "border-amber-400/60",
    activeTabBg: "bg-gradient-to-r from-amber-400 to-yellow-400 text-black shadow-lg shadow-amber-500/25 font-black",
    cardGlow: "shadow-amber-500/15",
    borderGlow: "border-amber-500/30",
    hudBorder: "border-amber-500/40",
    hudText: "text-amber-300",
    hudBg: "bg-amber-950/40",
    hudButton: "bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20",
    badgeStyle: "bg-amber-500/15 border border-amber-500/40 text-amber-300",
  },
  purple: {
    id: "purple",
    name: "Midnight Purple",
    primaryHex: "#A855F7",
    textAccent: "text-purple-300",
    borderAccent: "border-purple-500/40",
    borderHover: "hover:border-purple-500/70",
    bgAccent: "bg-purple-500",
    bgSubtle: "bg-purple-500/10",
    badgeBorder: "border-purple-500/40",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-300",
    avatarRing: "ring-purple-400",
    avatarBorder: "border-purple-400/60",
    activeTabBg: "bg-purple-500 text-white shadow-lg shadow-purple-500/25 font-black",
    cardGlow: "shadow-purple-500/15",
    borderGlow: "border-purple-500/30",
    hudBorder: "border-purple-500/40",
    hudText: "text-purple-300",
    hudBg: "bg-purple-950/40",
    hudButton: "bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20",
    badgeStyle: "bg-purple-500/15 border border-purple-500/40 text-purple-300",
  },
  crimson: {
    id: "crimson",
    name: "Crimson Matrix",
    primaryHex: "#F43F5E",
    textAccent: "text-rose-300",
    borderAccent: "border-rose-500/40",
    borderHover: "hover:border-rose-500/70",
    bgAccent: "bg-rose-500",
    bgSubtle: "bg-rose-500/10",
    badgeBorder: "border-rose-500/40",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-300",
    avatarRing: "ring-rose-400",
    avatarBorder: "border-rose-400/60",
    activeTabBg: "bg-rose-500 text-white shadow-lg shadow-rose-500/25 font-black",
    cardGlow: "shadow-rose-500/15",
    borderGlow: "border-rose-500/30",
    hudBorder: "border-rose-500/40",
    hudText: "text-rose-300",
    hudBg: "bg-rose-950/40",
    hudButton: "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20",
    badgeStyle: "bg-rose-500/15 border border-rose-500/40 text-rose-300",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Forest",
    primaryHex: "#10B981",
    textAccent: "text-emerald-300",
    borderAccent: "border-emerald-500/40",
    borderHover: "hover:border-emerald-500/70",
    bgAccent: "bg-emerald-400",
    bgSubtle: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/40",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-300",
    avatarRing: "ring-emerald-400",
    avatarBorder: "border-emerald-400/60",
    activeTabBg: "bg-emerald-400 text-black shadow-lg shadow-emerald-500/25 font-black",
    cardGlow: "shadow-emerald-500/15",
    borderGlow: "border-emerald-500/30",
    hudBorder: "border-emerald-500/40",
    hudText: "text-emerald-300",
    hudBg: "bg-emerald-950/40",
    hudButton: "bg-emerald-400 hover:bg-emerald-300 text-black shadow-lg shadow-emerald-400/20",
    badgeStyle: "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300",
  },
};

export function getThemeStyles(theme?: ProfileTheme | null): ThemeStyles {
  if (theme && THEME_STYLES[theme]) {
    return THEME_STYLES[theme];
  }
  return THEME_STYLES.cyan;
}
