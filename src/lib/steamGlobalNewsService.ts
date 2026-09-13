import { SteamNewsItem } from "./steamNewsService";

export interface TopSteamGame {
  appId: number;
  name: string;
}

export const POPULAR_ACTIVE_STEAM_GAMES: TopSteamGame[] = [
  { appId: 730, name: "Counter-Strike 2" },
  { appId: 570, name: "Dota 2" },
  { appId: 1867240, name: "WARDOGS" },
  { appId: 578080, name: "PUBG: BATTLEGROUNDS" },
  { appId: 892970, name: "Valheim" },
  { appId: 1091500, name: "Cyberpunk 2077" },
  { appId: 1245620, name: "ELDEN RING" },
  { appId: 1086940, name: "Baldur's Gate 3" },
  { appId: 2358720, name: "Black Myth: Wukong" },
  { appId: 1145350, name: "Hades II" },
  { appId: 367520, name: "Hollow Knight" },
  { appId: 252490, name: "Rust" },
  { appId: 2767030, name: "Marvel Rivals" },
  { appId: 1172470, name: "Apex Legends" },
  { appId: 359550, name: "Rainbow Six Siege" },
  { appId: 1623730, name: "Palworld" },
  { appId: 2357570, name: "Overwatch 2" },
  { appId: 1422450, name: "Deadlock" },
  { appId: 553850, name: "HELLDIVERS 2" },
  { appId: 440, name: "Team Fortress 2" },
];

/**
 * Obtém os AppIDs dos jogos mais jogados do momento na Steam via ISteamChartsService.
 */
async function fetchTrendingAppIds(): Promise<number[]> {
  try {
    const res = await fetch(
      "https://api.steampowered.com/ISteamChartsService/GetGamesByConcurrentPlayers/v1/",
      {
        headers: { "User-Agent": "GameVault/1.0" },
        next: { revalidate: 3600 },
        signal: AbortSignal.timeout(3000),
      }
    );
    if (!res.ok) return [];
    const data = await res.json();
    const ranks = data.response?.ranks || [];
    return ranks.slice(0, 15).map((r: { appid: number }) => r.appid);
  } catch {
    return [];
  }
}

/**
 * Busca notícias recentes de múltiplos jogos simultaneamente para compor
 * o feed de notícias mais recentes da Steam sem filtro de jogo.
 */
export async function fetchLatestGlobalSteamNews(
  limitCount: number = 20
): Promise<SteamNewsItem[]> {
  const dynamicIds = await fetchTrendingAppIds();
  const baseGames = POPULAR_ACTIVE_STEAM_GAMES;

  // Mapa de nomes para jogos conhecidos
  const nameMap = new Map<number, string>();
  baseGames.forEach((g) => nameMap.set(g.appId, g.name));

  // Lista unificada de AppIDs prioritários
  const targetIds = Array.from(
    new Set([...dynamicIds, ...baseGames.map((g) => g.appId)])
  ).slice(0, 22);

  const fetchPromises = targetIds.map(async (appId) => {
    try {
      const url = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=3&feeds=steam_community_announcements`;
      const res = await fetch(url, {
        headers: { "User-Agent": "GameVault/1.0" },
        next: { revalidate: 600 },
        signal: AbortSignal.timeout(3500),
      });

      if (!res.ok) return [];
      const data = await res.json();
      const items = data.appnews?.newsitems || [];

      return items.map((item: SteamNewsItem) => ({
        ...item,
        appid: Number(item.appid || appId),
        appId: Number(item.appid || appId),
        gameName: nameMap.get(Number(appId)) || `Steam Game #${appId}`,
      }));
    } catch {
      return [];
    }
  });

  const batches = await Promise.all(fetchPromises);
  const flattened = batches.flat();

  // Ordena por data decrescente (as mais recentes no topo)
  flattened.sort((a, b) => b.date - a.date);

  // Remove duplicados de gid
  const seenGids = new Set<string>();
  const uniqueItems: SteamNewsItem[] = [];

  for (const item of flattened) {
    if (!item.gid || seenGids.has(item.gid)) continue;
    seenGids.add(item.gid);
    uniqueItems.push(item);
    if (uniqueItems.length >= limitCount) break;
  }

  return uniqueItems;
}
