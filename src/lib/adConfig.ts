export interface AdSlotConfig {
  id: string;
  name: string;
  format: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  slotId?: string;
  style?: React.CSSProperties;
}

export const ADSENSE_PUB_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "ca-pub-0000000000000000";

export const AD_SLOTS: Record<string, AdSlotConfig> = {
  HOME_TOP_LEADERBOARD: {
    id: "home-top-leaderboard",
    name: "Home Top Leaderboard",
    format: "horizontal",
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_TOP,
  },
  HOME_IN_FEED: {
    id: "home-in-feed",
    name: "Home In-Feed Banner",
    format: "auto",
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_FEED,
  },
  SIDEBAR_STICKY: {
    id: "sidebar-sticky",
    name: "Sidebar Ad",
    format: "rectangle",
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR,
  },
  GAME_DETAIL_IN_CONTENT: {
    id: "game-detail-content",
    name: "Game Detail Banner",
    format: "horizontal",
    slotId: process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAME_DETAIL,
  },
};

// Campanhas de afiliados e patrocínios gamers para fallback de receita imediata
export const FALLBACK_GAMING_DEALS = [
  {
    title: "Ofertas Gamer na Nuuvem & Steam",
    subtitle: "Até 85% OFF em lançamentos, keys oficiais e gift cards.",
    cta: "Ver Promoções →",
    tag: "DEAL GAMER",
    href: "https://www.nuuvem.com",
    badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  {
    title: "Monte seu Setup Gamer dos Sonhos",
    subtitle: "Hardware, periféricos e consoles em até 10x sem juros.",
    cta: "Conferir Ofertas →",
    tag: "SETUP & HARDWARE",
    href: "https://www.amazon.com.br",
    badgeColor: "bg-cyan-500/20 text-[#00E5FF] border-cyan-500/30",
  },
  {
    title: "PlayStation Store & Xbox Game Pass",
    subtitle: "Centenas de jogos inclusos para jogar no console ou PC.",
    cta: "Assinar com Desconto →",
    tag: "ASSINATURAS",
    href: "https://www.xbox.com",
    badgeColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
];
