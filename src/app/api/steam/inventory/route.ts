import { NextRequest, NextResponse } from "next/server";
import { SteamInventoryItem, SteamInventoryResponse, STEAM_SUPPORTED_APPS } from "@/lib/types";
import { resolveSteamId64, getSteamPlayerSummary, getSteamApiKey } from "@/lib/steam";

// Cache em memória simples para evitar rate limits estritos da Steam
interface CachedInventory {
  data: SteamInventoryResponse;
  timestamp: number;
}
const inventoryCache = new Map<string, CachedInventory>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const steamInput = searchParams.get("steamId") || searchParams.get("id") || "";
  const appId = parseInt(searchParams.get("appId") || "730", 10);
  const count = Math.min(100, Math.max(1, parseInt(searchParams.get("count") || "75", 10)));
  const startAssetId = searchParams.get("startAssetId") || "";
  const apiKey = getSteamApiKey(searchParams.get("apiKey") || undefined);

  // Encontra configuração do app suportado
  const supportedApp = STEAM_SUPPORTED_APPS.find((a) => a.id === appId) || STEAM_SUPPORTED_APPS[0];
  const contextId = supportedApp.contextId;

  if (!steamInput.trim()) {
    return NextResponse.json(
      {
        success: false,
        appId,
        totalCount: 0,
        items: [],
        error: "Informe um SteamID64 ou link de perfil da Steam para carregar o inventário.",
      } satisfies SteamInventoryResponse,
      { status: 400 }
    );
  }

  // 1. Resolve o perfil Steam com API oficial e fallback
  const steamId64 = await resolveSteamId64(steamInput, apiKey);
  if (!steamId64) {
    return NextResponse.json(
      {
        success: false,
        appId,
        totalCount: 0,
        items: [],
        error: "Perfil Steam não encontrado. Verifique se digitou seu SteamID64 ou URL personalizada corretamente.",
      } satisfies SteamInventoryResponse,
      { status: 404 }
    );
  }

  const cacheKey = `${steamId64}_${appId}_${contextId}_${startAssetId}`;

  // 2. Checa Cache
  const cached = inventoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  // 3. Dispara busca de resumo do jogador em paralelo com a consulta do inventário
  const playerProfilePromise = getSteamPlayerSummary(steamId64, apiKey);

  // 4. Chama a API de Inventário da Comunidade Steam
  try {
    const steamUrl = new URL(`https://steamcommunity.com/inventory/${steamId64}/${appId}/${contextId}`);
    steamUrl.searchParams.set("l", "brazilian");
    steamUrl.searchParams.set("count", String(count));
    if (startAssetId) {
      steamUrl.searchParams.set("start_assetid", startAssetId);
    }

    const res = await fetch(steamUrl.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Referer": `https://steamcommunity.com/profiles/${steamId64}/inventory/`,
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
      },
    });

    if (res.status === 429) {
      return NextResponse.json(
        {
          success: false,
          rateLimited: true,
          appId,
          totalCount: 0,
          items: [],
          error: "A Steam está limitando temporariamente as consultas de inventário (HTTP 429). Tente novamente em alguns instantes.",
        } satisfies SteamInventoryResponse,
        { status: 429 }
      );
    }

    if (res.status === 403) {
      return NextResponse.json(
        {
          success: false,
          isPrivate: true,
          appId,
          totalCount: 0,
          items: [],
          error: "Este inventário está privado na Steam. Acesse suas configurações de privacidade na Steam e defina 'Inventário' como Público.",
        } satisfies SteamInventoryResponse,
        { status: 403 }
      );
    }

    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          appId,
          totalCount: 0,
          items: [],
          error: `Falha ao carregar inventário da Steam (Status ${res.status}). Verifique se o perfil tem itens neste jogo.`,
        } satisfies SteamInventoryResponse,
        { status: res.status }
      );
    }

    const data = await res.json();
    if (!data || data === null || (data.success !== 1 && data.success !== true)) {
      return NextResponse.json(
        {
          success: false,
          isPrivate: true,
          appId,
          totalCount: 0,
          items: [],
          error: "Nenhum item encontrado ou o inventário é privado.",
        } satisfies SteamInventoryResponse
      );
    }

    // 5. Mapeia assets e descriptions
    const descriptionsMap = new Map<string, any>();
    if (Array.isArray(data.descriptions)) {
      for (const desc of data.descriptions) {
        const key = `${desc.classid}_${desc.instanceid || "0"}`;
        descriptionsMap.set(key, desc);
        descriptionsMap.set(desc.classid, desc); // Fallback por classid
      }
    }

    const items: SteamInventoryItem[] = [];
    if (Array.isArray(data.assets)) {
      for (const asset of data.assets) {
        const key = `${asset.classid}_${asset.instanceid || "0"}`;
        const desc = descriptionsMap.get(key) || descriptionsMap.get(asset.classid);
        if (!desc) continue;

        // Extrai Tags (Raridade, Arma, Exterior)
        let rarity: string | undefined;
        let rarityColor: string | undefined;
        let exterior: string | undefined;
        let weapon: string | undefined;

        if (Array.isArray(desc.tags)) {
          for (const t of desc.tags) {
            if (t.category === "Rarity") {
              rarity = t.localized_tag_name || t.name;
              if (t.color) rarityColor = `#${t.color}`;
            } else if (t.category === "Exterior") {
              exterior = t.localized_tag_name || t.name;
            } else if (t.category === "Weapon") {
              weapon = t.localized_tag_name || t.name;
            } else if (t.category === "Quality" && !rarity) {
              rarity = t.localized_tag_name || t.name;
              if (t.color) rarityColor = `#${t.color}`;
            }
          }
        }

        // Descrições formatadas
        const itemDescriptions = Array.isArray(desc.descriptions)
          ? desc.descriptions
              .filter((d: any) => d.value && d.value.trim() !== "")
              .map((d: any) => ({
                type: d.type,
                value: d.value,
                color: d.color,
              }))
          : [];

        const iconHash = desc.icon_url_large || desc.icon_url;
        const iconUrl = iconHash
          ? `https://community.cloudflare.steamstatic.com/economy/image/${iconHash}`
          : "";

        items.push({
          assetId: asset.assetid,
          classId: asset.classid,
          instanceId: asset.instanceid || "0",
          amount: parseInt(asset.amount || "1", 10),
          name: desc.name || desc.market_name || "Item Steam",
          marketName: desc.market_name || desc.name || "Item Steam",
          marketHashName: desc.market_hash_name || desc.market_name || desc.name,
          iconUrl,
          iconUrlLarge: desc.icon_url_large
            ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url_large}`
            : undefined,
          type: desc.type || "",
          rarity,
          rarityColor: rarityColor || (desc.name_color ? `#${desc.name_color}` : undefined),
          exterior,
          weapon,
          descriptions: itemDescriptions,
          tags: Array.isArray(desc.tags)
            ? desc.tags.map((t: any) => ({
                category: t.category,
                internalName: t.internal_name,
                localizedTagName: t.localized_tag_name || t.name,
                color: t.color,
              }))
            : [],
          tradable: desc.tradable === 1,
          marketable: desc.marketable === 1,
          appId,
          contextId,
        });
      }
    }

    const profile = await playerProfilePromise;
    const responsePayload: SteamInventoryResponse = {
      success: true,
      steamId64,
      profile: {
        personaname: profile.personaname || `Steam Gamer (${steamId64})`,
        avatarUrl: profile.avatarUrl || "https://avatars.fastly.steamstatic.com/c8582f8478cffe910a2fe196c32ff2e5ed34b1a9_full.jpg",
        profileUrl: profile.profileUrl || `https://steamcommunity.com/profiles/${steamId64}`,
        customURL: profile.customURL,
      },
      appId,
      totalCount: data.total_inventory_count || items.length,
      items,
    };

    // Salva no cache
    inventoryCache.set(cacheKey, {
      data: responsePayload,
      timestamp: Date.now(),
    });

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("[Steam Inventory] Erro na requisição:", error);
    return NextResponse.json(
      {
        success: false,
        appId,
        totalCount: 0,
        items: [],
        error: "Ocorreu um erro ao se comunicar com a Steam. Tente novamente mais tarde.",
      } satisfies SteamInventoryResponse,
      { status: 500 }
    );
  }
}
