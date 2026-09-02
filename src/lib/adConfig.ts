export interface AdSlotConfig {
  id: string;
  name: string;
  format: "auto" | "rectangle" | "horizontal" | "vertical" | "fluid";
  slotId?: string;
  style?: React.CSSProperties;
}

export const ADSENSE_PUB_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || "ca-pub-9170433007408098";

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
