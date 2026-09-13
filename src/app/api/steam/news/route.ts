import { NextRequest, NextResponse } from "next/server";
import {
  SteamNewsApiResponse,
  isAllowedLanguageNews,
  isPortugueseNews,
  cleanSteamBBCode,
  extractFirstSteamImage,
} from "@/lib/steamNewsService";
import { translateToPortuguese } from "@/lib/translate";
import {
  getStoredSteamNews,
  saveTranslatedSteamNews,
  getRecentSteamNews,
  StoredSteamNewsItem,
} from "@/lib/steamNewsDb";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");
    const count = parseInt(searchParams.get("count") || "5", 10);
    const mode = searchParams.get("mode"); // "recent" para listar as últimas salvas no site
    const forceFresh = searchParams.get("fresh") === "true";

    // Se o cliente pedir as notícias salvas mais recentes no sistema (para o painel admin ou feed geral)
    if (mode === "recent") {
      const recentStored = await getRecentSteamNews(Math.min(count, 30));
      return NextResponse.json({
        count: recentStored.length,
        news: recentStored,
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

    // 1. Filtragem contra blogs agregadores de spam
    const allowedItems = items.filter((item) =>
      isAllowedLanguageNews(item.title, item.contents)
    );

    // 2. Processa os primeiros 'count' itens
    const targetedItems = allowedItems.slice(0, Math.min(count, 10));

    const processedNews = await Promise.all(
      targetedItems.map(async (item) => {
        // Verifica se já temos tradução válida salva para este gid no Firestore
        if (!forceFresh) {
          const stored = await getStoredSteamNews(item.gid);
          if (stored && stored.translatedContents) {
            // Se o item armazenado tem translatedTitle diferente do original ou já foi traduzido
            const hasValidTranslation =
              stored.isTranslated &&
              stored.translatedTitle &&
              !isPortugueseNews(item.title, item.contents)
                ? stored.translatedTitle !== item.title
                : true;

            if (hasValidTranslation) {
              return {
                ...item,
                title: stored.translatedTitle || item.title,
                contents: stored.translatedContents,
                isTranslated: Boolean(stored.isTranslated),
              };
            }
          }
        }

        // Se já for genuinamente em português brasileiro
        const alreadyPt = isPortugueseNews(item.title, item.contents);
        if (alreadyPt) {
          const firstImg = extractFirstSteamImage(item.contents);
          const storedItem: StoredSteamNewsItem = {
            gid: item.gid,
            appId: Number(appId),
            title: item.title,
            translatedTitle: item.title,
            originalContents: item.contents,
            translatedContents: item.contents,
            author: item.author || "Steam Community",
            url: item.url,
            date: item.date,
            feedlabel: item.feedlabel || "Patch Note",
            feedname: item.feedname || "Steam Community",
            firstImage: firstImg,
            isTranslated: false,
            updatedAt: new Date().toISOString(),
          };
          saveTranslatedSteamNews(storedItem).catch(() => {});
          return {
            ...item,
            isTranslated: false,
          };
        }

        // Se estiver em inglês ou qualquer outro idioma estrangeiro, traduz
        try {
          const cleanText = cleanSteamBBCode(item.contents);

          // Tradução do título para PT-BR
          const translatedTitle = await translateToPortuguese(item.title);

          // Tradução do corpo para PT-BR (até 1200 caracteres para velocidade e clareza)
          const contentSample = cleanText.slice(0, 1200);
          const translatedBody = await translateToPortuguese(contentSample);

          const firstImg = extractFirstSteamImage(item.contents);
          const isActuallyTranslated =
            translatedTitle !== item.title || translatedBody !== contentSample;

          const storedItem: StoredSteamNewsItem = {
            gid: item.gid,
            appId: Number(appId),
            title: item.title,
            translatedTitle: translatedTitle || item.title,
            originalContents: item.contents,
            translatedContents: translatedBody || cleanText,
            author: item.author || "Steam Community",
            url: item.url,
            date: item.date,
            feedlabel: item.feedlabel || "Patch Note",
            feedname: item.feedname || "Steam Community",
            firstImage: firstImg,
            isTranslated: isActuallyTranslated,
            updatedAt: new Date().toISOString(),
          };

          saveTranslatedSteamNews(storedItem).catch(() => {});

          return {
            ...item,
            title: translatedTitle || item.title,
            contents: translatedBody || cleanText,
            isTranslated: isActuallyTranslated,
          };
        } catch (err) {
          console.warn(`Erro ao traduzir notícia ${item.gid}:`, err);
          return item;
        }
      })
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
