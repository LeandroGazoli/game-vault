import { NextRequest, NextResponse } from "next/server";
import { SteamNewsApiResponse } from "@/lib/steamNewsService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const appId = searchParams.get("appId");
    const count = parseInt(searchParams.get("count") || "5", 10);

    if (!appId || !/^\d+$/.test(appId)) {
      return NextResponse.json(
        { error: "Parâmetro 'appId' numérico é obrigatório" },
        { status: 400 }
      );
    }

    const targetUrl = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${Math.min(
      Math.max(count, 1),
      15
    )}`;

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "GameVault/1.0",
      },
      next: { revalidate: 1800 }, // Cache de 30 min
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Erro na Steam API: status ${res.status}` },
        { status: res.status }
      );
    }

    const data: SteamNewsApiResponse = await res.json();
    const items = data.appnews?.newsitems || [];

    return NextResponse.json({
      appId: Number(appId),
      count: items.length,
      news: items,
    });
  } catch (error: any) {
    console.error("Erro ao buscar notícias da Steam:", error);
    return NextResponse.json(
      { error: "Falha interna ao comunicar com a Steam API" },
      { status: 500 }
    );
  }
}
