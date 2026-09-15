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
    bgSubtle: "bg-[#0d222b]",
    badgeBorder: "border-cyan-500/40",
    badgeBg: "bg-[#0d222b]",
    badgeText: "text-[#00E5FF]",
    avatarRing: "ring-[#00E5FF]",
    avatarBorder: "border-[#00E5FF]/50",
    activeTabBg: "bg-[#0e2730] text-[#00E5FF] border border-[#00E5FF] shadow-md font-bold",
    cardGlow: "shadow-cyan-500/15",
    borderGlow: "border-cyan-500/30",
    hudBorder: "border-cyan-500/40",
    hudText: "text-cyan-400",
    hudBg: "bg-[#0d222b]",
    hudButton: "bg-cyan-400 hover:bg-cyan-300 text-black shadow-lg shadow-cyan-400/20",
    badgeStyle: "bg-[#0d222b] border border-cyan-500/40 text-[#00E5FF]",
  },
  gold: {
    id: "gold",
    name: "Obsidian Gold VIP",
    primaryHex: "#F59E0B",
    textAccent: "text-amber-300",
    borderAccent: "border-amber-500/40",
    borderHover: "hover:border-amber-500/70",
    bgAccent: "bg-amber-400",
    bgSubtle: "bg-[#251e12]",
    badgeBorder: "border-amber-500/40",
    badgeBg: "bg-[#251e12]",
    badgeText: "text-amber-300",
    avatarRing: "ring-amber-400",
    avatarBorder: "border-amber-400/60",
    activeTabBg: "bg-[#2d2212] text-amber-300 border border-amber-500 shadow-md font-bold",
    cardGlow: "shadow-amber-500/15",
    borderGlow: "border-amber-500/30",
    hudBorder: "border-amber-500/40",
    hudText: "text-amber-300",
    hudBg: "bg-[#251e12]",
    hudButton: "bg-amber-400 hover:bg-amber-300 text-black shadow-lg shadow-amber-400/20",
    badgeStyle: "bg-[#251e12] border border-amber-500/40 text-amber-300",
  },
  purple: {
    id: "purple",
    name: "Midnight Purple",
    primaryHex: "#A855F7",
    textAccent: "text-purple-300",
    borderAccent: "border-purple-500/40",
    borderHover: "hover:border-purple-500/70",
    bgAccent: "bg-purple-500",
    bgSubtle: "bg-[#21152d]",
    badgeBorder: "border-purple-500/40",
    badgeBg: "bg-[#21152d]",
    badgeText: "text-purple-300",
    avatarRing: "ring-purple-400",
    avatarBorder: "border-purple-400/60",
    activeTabBg: "bg-[#2b193d] text-purple-300 border border-purple-500 shadow-md font-bold",
    cardGlow: "shadow-purple-500/15",
    borderGlow: "border-purple-500/30",
    hudBorder: "border-purple-500/40",
    hudText: "text-purple-300",
    hudBg: "bg-[#21152d]",
    hudButton: "bg-purple-500 hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20",
    badgeStyle: "bg-[#21152d] border border-purple-500/40 text-purple-300",
  },
  crimson: {
    id: "crimson",
    name: "Crimson Matrix",
    primaryHex: "#F43F5E",
    textAccent: "text-rose-300",
    borderAccent: "border-rose-500/40",
    borderHover: "hover:border-rose-500/70",
    bgAccent: "bg-rose-500",
    bgSubtle: "bg-[#2b1218]",
    badgeBorder: "border-rose-500/40",
    badgeBg: "bg-[#2b1218]",
    badgeText: "text-rose-300",
    avatarRing: "ring-rose-400",
    avatarBorder: "border-rose-400/60",
    activeTabBg: "bg-[#38151f] text-rose-300 border border-rose-500 shadow-md font-bold",
    cardGlow: "shadow-rose-500/15",
    borderGlow: "border-rose-500/30",
    hudBorder: "border-rose-500/40",
    hudText: "text-rose-300",
    hudBg: "bg-[#2b1218]",
    hudButton: "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20",
    badgeStyle: "bg-[#2b1218] border border-rose-500/40 text-rose-300",
  },
  emerald: {
    id: "emerald",
    name: "Emerald Forest",
    primaryHex: "#10B981",
    textAccent: "text-emerald-300",
    borderAccent: "border-emerald-500/40",
    borderHover: "hover:border-emerald-500/70",
    bgAccent: "bg-emerald-400",
    bgSubtle: "bg-[#0d241a]",
    badgeBorder: "border-emerald-500/40",
    badgeBg: "bg-[#0d241a]",
    badgeText: "text-emerald-300",
    avatarRing: "ring-emerald-400",
    avatarBorder: "border-emerald-400/60",
    activeTabBg: "bg-[#103322] text-emerald-300 border border-emerald-500 shadow-md font-bold",
    cardGlow: "shadow-emerald-500/15",
    borderGlow: "border-emerald-500/30",
    hudBorder: "border-emerald-500/40",
    hudText: "text-emerald-300",
    hudBg: "bg-[#0d241a]",
    hudButton: "bg-emerald-400 hover:bg-emerald-300 text-black shadow-lg shadow-emerald-400/20",
    badgeStyle: "bg-[#0d241a] border border-emerald-500/40 text-emerald-300",
  },
};

export function getThemeStyles(theme?: ProfileTheme | null): ThemeStyles {
  if (theme && THEME_STYLES[theme]) {
    return THEME_STYLES[theme];
  }
  return THEME_STYLES.cyan;
}
