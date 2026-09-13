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
      next: { revalidate: 1800 }, // Cache de 30 min
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
        next: { revalidate: 1800 },
      });
      if (fallbackRes.ok) {
        const fallbackData: SteamNewsApiResponse = await fallbackRes.json();
        items = fallbackData.appnews?.newsitems || [];
      }
    }

    // 1. Filtragem estrita contra caracteres cirílicos (russo), CJK (chinês, japonês, coreano), árabe
    const allowedItems = items.filter((item) =>
      isAllowedLanguageNews(item.title, item.contents)
    );

    // 2. Tradução sob demanda e persistência no banco (Firestore + Memória)
    // Processa os primeiros 'count' itens
    const targetedItems = allowedItems.slice(0, Math.min(count, 10));

    const processedNews = await Promise.all(
      targetedItems.map(async (item) => {
        // Verifica se já temos tradução salva para este gid no Firestore
        const stored = await getStoredSteamNews(item.gid);
        if (stored && stored.translatedContents) {
          return {
            ...item,
            title: stored.translatedTitle || item.title,
            contents: stored.translatedContents,
            isTranslated: true,
          };
        }

        // Se já for originalmente em português, salva direto
        if (isPortugueseNews(item.title, item.contents)) {
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
            updatedAt: new Date().toISOString(),
          };
          saveTranslatedSteamNews(storedItem).catch(() => {});
          return {
            ...item,
            isTranslated: false,
          };
        }

        // Se estiver em inglês/outro idioma permitido, traduz o título e conteúdo
        try {
          const cleanText = cleanSteamBBCode(item.contents);
          // Traduz o título
          const translatedTitle = await translateToPortuguese(item.title);

          // Pega os parágrafos mais importantes para tradução limpa (até 1200 caracteres)
          const contentSample = cleanText.slice(0, 1200);
          const translatedBody = await translateToPortuguese(contentSample);

          const firstImg = extractFirstSteamImage(item.contents);

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
            updatedAt: new Date().toISOString(),
          };

          // Salva no Firestore de forma assíncrona (sem bloquear requisição)
          saveTranslatedSteamNews(storedItem).catch(() => {});

          return {
            ...item,
            title: translatedTitle || item.title,
            contents: translatedBody || cleanText,
            isTranslated: true,
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
