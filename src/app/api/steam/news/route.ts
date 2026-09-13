import { NextRequest, NextResponse } from "next/server";
import {
  SteamNewsApiResponse,
  isAllowedLanguageNews,
  isPortugueseNews,
} from "@/lib/steamNewsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");
    const count = parseInt(searchParams.get("count") || "5", 10);
    const langFilter = searchParams.get("lang"); // "pt", "pt_en" ou vazio

    if (!appId || !/^\d+$/.test(appId)) {
      return NextResponse.json(
        { error: "Parâmetro 'appId' numérico é obrigatório" },
        { status: 400 }
      );
    }

    // Buscamos prioritariamente anúncios da comunidade Steam oficiais (steam_community_announcements)
    // Buscamos um número maior para filtrar línguas indesejadas (russo, chinês) e manter a quantidade pedida
    const fetchLimit = Math.max(count * 5, 25);
    const targetUrl = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${fetchLimit}&feeds=steam_community_announcements`;

    let res = await fetch(targetUrl, {
      headers: { "User-Agent": "GameVault/1.0" },
      next: { revalidate: 1800 }, // Cache de 30 min
    });

    let data: SteamNewsApiResponse = res.ok ? await res.json() : { appnews: { appid: Number(appId), newsitems: [], count: 0 } };
    let items = data.appnews?.newsitems || [];

    // Fallback: se não houver comunicados oficiais da comunidade, busca sem o filtro de feed mas filtra o russo/chinês
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
    let filtered = items.filter((item) =>
      isAllowedLanguageNews(item.title, item.contents)
    );

    // 2. Se for solicitado estritamente português ("pt")
    if (langFilter === "pt") {
      const onlyPt = filtered.filter((item) =>
        isPortugueseNews(item.title, item.contents)
      );
      // Se houver matérias em português, entrega apenas elas
      if (onlyPt.length > 0) {
        filtered = onlyPt;
      }
    }

    // Limita à quantidade solicitada
    const finalItems = filtered.slice(0, Math.min(count, 15));

    return NextResponse.json({
      appId: Number(appId),
      count: finalItems.length,
      news: finalItems,
    });
  } catch (error: any) {
    console.error("Erro ao buscar notícias da Steam:", error);
    return NextResponse.json(
      { error: "Falha interna ao comunicar com a Steam API" },
      { status: 500 }
    );
  }
}
