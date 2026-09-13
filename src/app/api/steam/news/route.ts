import { NextRequest, NextResponse } from "next/server";
import {
  SteamNewsApiResponse,
  isAllowedLanguageNews,
} from "@/lib/steamNewsService";
import { getRecentSteamNews } from "@/lib/steamNewsDb";
import { fetchLatestGlobalSteamNews } from "@/lib/steamGlobalNewsService";
import { processAndTranslateNewsItem } from "@/lib/steamNewsProcessor";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");
    const count = parseInt(searchParams.get("count") || "10", 10);
    const mode = searchParams.get("mode");
    const forceFresh = searchParams.get("fresh") === "true";

    // Modo "recent": notícias já salvas no banco
    if (mode === "recent") {
      const recentStored = await getRecentSteamNews(Math.min(count, 30));
      return NextResponse.json({
        count: recentStored.length,
        news: recentStored,
      });
    }

    // Modo "latest" ou sem appId: busca as notícias mais recentes de qualquer jogo na Steam
    if (mode === "latest" || (!appId && !mode)) {
      const globalNews = await fetchLatestGlobalSteamNews(Math.min(count * 2, 30));
      const allowedGlobal = globalNews.filter((item) =>
        isAllowedLanguageNews(item.title, item.contents)
      );
      const targetItems = allowedGlobal.slice(0, Math.min(count, 15));

      const processed = await Promise.all(
        targetItems.map((item) =>
          processAndTranslateNewsItem(item, item.appId || item.appid, forceFresh)
        )
      );

      return NextResponse.json({
        mode: "latest",
        count: processed.length,
        news: processed,
      });
    }

    if (!appId || !/^\d+$/.test(appId)) {
      return NextResponse.json(
        { error: "Parâmetro 'appId' numérico é obrigatório" },
        { status: 400 }
      );
    }

    const fetchLimit = Math.max(count * 4, 20);
    const targetUrl = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${fetchLimit}&feeds=steam_community_announcements`;

    let res = await fetch(targetUrl, {
      headers: { "User-Agent": "GameVault/1.0" },
      next: { revalidate: 900 },
    });

    let data: SteamNewsApiResponse = res.ok
      ? await res.json()
      : { appnews: { appid: Number(appId), newsitems: [], count: 0 } };
    let items = data.appnews?.newsitems || [];

    // Fallback se o feed específico não retornar
    if (items.length === 0) {
      const fallbackUrl = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${fetchLimit}`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: { "User-Agent": "GameVault/1.0" },
        next: { revalidate: 900 },
      });
      if (fallbackRes.ok) {
        const fallbackData: SteamNewsApiResponse = await fallbackRes.json();
        items = fallbackData.appnews?.newsitems || [];
      }
    }

    const allowedItems = items.filter((item) =>
      isAllowedLanguageNews(item.title, item.contents)
    );

    const targetedItems = allowedItems.slice(0, Math.min(count, 10));

    const processedNews = await Promise.all(
      targetedItems.map((item) =>
        processAndTranslateNewsItem(item, Number(appId), forceFresh)
      )
    );

    return NextResponse.json({
      appId: Number(appId),
      count: processedNews.length,
      news: processedNews,
    });
  } catch (error: any) {
    console.error("Erro ao buscar notícias da Steam:", error);
    return NextResponse.json(
      { error: "Falha interna ao comunicar com a Steam API" },
      { status: 500 }
    );
  }
}
