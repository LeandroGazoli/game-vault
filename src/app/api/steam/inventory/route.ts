import { NextRequest, NextResponse } from "next/server";
import { SteamInventoryItem, SteamInventoryResponse, STEAM_SUPPORTED_APPS } from "@/lib/types";

// Cache em memória simples para evitar rate limits estritos da Steam
interface CachedInventory {
  data: SteamInventoryResponse;
  timestamp: number;
}
const inventoryCache = new Map<string, CachedInventory>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos

// Curadoria de itens lendários para o Modo Demonstração
const DEMO_ITEMS: Record<number, SteamInventoryItem[]> = {
  // 730: Counter-Strike 2
  730: [
    {
      assetId: "cs2_demo_1",
      classId: "1001",
      instanceId: "0",
      amount: 1,
      name: "AWP | Dragon Lore",
      marketName: "AWP | Dragon Lore (Nova de Fábrica)",
      marketHashName: "AWP | Dragon Lore (Factory New)",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot621FABz7PLfYQJS5NO0m5O0m_7zO6-fzj9V7Pp8j-3I4IG72VDg_kBtZ2-hdtPAcwE4NA3Vq1m_w-rth57vup2anXBh7yU8pSGKqWp9v68",
      type: "Fuzil de Precisão Secreto",
      rarity: "Oculto (Covert)",
      rarityColor: "#EB4B4B",
      exterior: "Nova de Fábrica",
      weapon: "AWP",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 45.000,00",
      descriptions: [
        { value: "Exterior: Nova de Fábrica", color: "ffd700" },
        { value: "Um dragão cuspindo fogo com detalhes dourados no corpo nodoso.", color: "ffffff" },
        { value: "Coleção Cobblestone", color: "9acd32" },
      ],
      tags: [
        { category: "Rarity", internalName: "Rarity_Ancient_Weapon", localizedTagName: "Oculto", color: "eb4b4b" },
        { category: "Weapon", internalName: "weapon_awp", localizedTagName: "AWP" },
        { category: "Exterior", internalName: "WearCategory0", localizedTagName: "Nova de Fábrica" },
      ],
      appId: 730,
      contextId: 2,
    },
    {
      assetId: "cs2_demo_2",
      classId: "1002",
      instanceId: "0",
      amount: 1,
      name: "★ Karambit | Doppler (Fase 2)",
      marketName: "★ Karambit | Doppler (Pouco Usada)",
      marketHashName: "★ Karambit | Doppler (Minimal Wear)",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf2PLacDBA5ciJlY20hPbkI7PYhG5u5cRjiOXE_JbwjGu4ohQ0J3elcNecewU9MA7T_lTrxOvs1p-8uJufnHcw6XUj5Srem0G-hxpSLrs4NlqjM9g",
      type: "Faca Extraordinária Secreta",
      rarity: "Extraordinário (Covert Knife)",
      rarityColor: "#8650AC",
      exterior: "Pouco Usada",
      weapon: "Karambit",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 9.800,00",
      descriptions: [
        { value: "Exterior: Pouco Usada", color: "ffd700" },
        { value: "Pintada com acabamento em tons rosa-choque metálico com padrões de fumaça.", color: "ffffff" },
      ],
      tags: [
        { category: "Rarity", internalName: "Rarity_Ancient_Weapon", localizedTagName: "Extraordinário", color: "eb4b4b" },
        { category: "Weapon", internalName: "weapon_knife_karambit", localizedTagName: "Karambit" },
        { category: "Exterior", internalName: "WearCategory1", localizedTagName: "Pouco Usada" },
      ],
      appId: 730,
      contextId: 2,
    },
    {
      assetId: "cs2_demo_3",
      classId: "1003",
      instanceId: "0",
      amount: 1,
      name: "AK-47 | Fire Serpent",
      marketName: "AK-47 | Fire Serpent (Testada em Campo)",
      marketHashName: "AK-47 | Fire Serpent (Field-Tested)",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpot7HxfDhjxszJemkV08-5lpKKqPrxN7LEmyVQ7MEpiLuSrYmnjQO3-UdsZGHzLI-TcwdsY1iG_Fa2wOq7gMW5vs7MznQ2vHYm-z-DyG2tWkX6",
      type: "Rifle Secreto",
      rarity: "Oculto (Covert)",
      rarityColor: "#EB4B4B",
      exterior: "Testada em Campo",
      weapon: "AK-47",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 4.200,00",
      descriptions: [
        { value: "Exterior: Testada em Campo", color: "ffd700" },
        { value: "Seja corajoso como uma serpente cuspidora de fogo maia.", color: "ffffff" },
        { value: "Coleção Bravo", color: "9acd32" },
      ],
      tags: [
        { category: "Rarity", internalName: "Rarity_Ancient_Weapon", localizedTagName: "Oculto", color: "eb4b4b" },
        { category: "Weapon", internalName: "weapon_ak47", localizedTagName: "AK-47" },
        { category: "Exterior", internalName: "WearCategory2", localizedTagName: "Testada em Campo" },
      ],
      appId: 730,
      contextId: 2,
    },
    {
      assetId: "cs2_demo_4",
      classId: "1004",
      instanceId: "0",
      amount: 1,
      name: "M4A4 | Howl",
      marketName: "M4A4 | Howl (Testada em Campo)",
      marketHashName: "M4A4 | Howl (Field-Tested)",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpou-6kejhjxszFJTwW09izh5SEhcj5Nr_Yg2Yf6cck2L-Vp9St3wPl-UdrNjymddfDe1dsMFrS_AC2wujthZXvvpvKyXZiuCE8pSGKj2p331U",
      type: "Fuzil Contrabando",
      rarity: "Contrabando (Contraband)",
      rarityColor: "#E4AE39",
      exterior: "Testada em Campo",
      weapon: "M4A4",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 22.000,00",
      descriptions: [
        { value: "Exterior: Testada em Campo", color: "ffd700" },
        { value: "Pintada sob medida com a imagem de um lobo rugindo em chamas infernais.", color: "ffffff" },
        { value: "Item raro de colecionador retirado do jogo.", color: "ff4444" },
      ],
      tags: [
        { category: "Rarity", internalName: "Rarity_Contraband", localizedTagName: "Contrabando", color: "e4ae39" },
        { category: "Weapon", internalName: "weapon_m4a1", localizedTagName: "M4A4" },
      ],
      appId: 730,
      contextId: 2,
    },
    {
      assetId: "cs2_demo_5",
      classId: "1005",
      instanceId: "0",
      amount: 1,
      name: "Desert Eagle | Printstream",
      marketName: "Desert Eagle | Printstream (Nova de Fábrica)",
      marketHashName: "Desert Eagle | Printstream (Factory New)",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgposr-kLAtl7PDdTjlH_864mr-Kmsj4OrzZglRd4cJ5nqfHptSnjQW3-xFqZzvycY_AdVJtYQ2C-wK2w-_mhcO7v87IzXU2vSQ8pSGKqWpP1bY",
      type: "Pistola Secreta",
      rarity: "Oculto (Covert)",
      rarityColor: "#EB4B4B",
      exterior: "Nova de Fábrica",
      weapon: "Desert Eagle",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 480,00",
      descriptions: [
        { value: "Exterior: Nova de Fábrica", color: "ffd700" },
        { value: "Design monocromático elegante com efeito perolado holográfico.", color: "ffffff" },
      ],
      tags: [
        { category: "Rarity", internalName: "Rarity_Ancient_Weapon", localizedTagName: "Oculto", color: "eb4b4b" },
        { category: "Weapon", internalName: "weapon_deagle", localizedTagName: "Desert Eagle" },
      ],
      appId: 730,
      contextId: 2,
    },
    {
      assetId: "cs2_demo_6",
      classId: "1006",
      instanceId: "0",
      amount: 1,
      name: "★ Luvas Esportivas | Vice",
      marketName: "★ Luvas Esportivas | Vice (Pouco Usada)",
      marketHashName: "★ Sport Gloves | Vice (Minimal Wear)",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJfwOfBfUEv7d6_kIGZkOTLP7LWnn8fvcEm0r2S9tugiQW2qBJuNW-mLYWQJwA_NFiErli_kri-0JC4v5TIzCdmvnEm5i2IzBGpwUYbQ2O4v6E",
      type: "Luvas Extraordinárias",
      rarity: "Extraordinário (Covert)",
      rarityColor: "#8650AC",
      exterior: "Pouco Usada",
      weapon: "Luvas Esportivas",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 18.500,00",
      descriptions: [
        { value: "Exterior: Pouco Usada", color: "ffd700" },
        { value: "Tecido esportivo de alta performance com padrão vibrante azul-petróleo e rosa neon.", color: "ffffff" },
      ],
      tags: [
        { category: "Rarity", internalName: "Rarity_Ancient_Weapon", localizedTagName: "Extraordinário", color: "eb4b4b" },
        { category: "Type", internalName: "Type_Hands", localizedTagName: "Luvas" },
      ],
      appId: 730,
      contextId: 2,
    },
  ],
  // 440: Team Fortress 2
  440: [
    {
      assetId: "tf2_demo_1",
      classId: "2001",
      instanceId: "0",
      amount: 1,
      name: "★ Unusual Burning Flames Team Captain",
      marketName: "Unusual Team Captain (Burning Flames)",
      marketHashName: "Unusual Team Captain",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEIdfcYTRbvuS5Wh836Pv2MCOQ_hNk08MYCijJnwg1_NrKyYGA2fQCTD6NfDaJkoFu1W3ZluJ5tV9m7pOsEf1np5tTAYrcpZNwZSsmDU_DXZwio6kgxiKUKJpGB9m-7iT64b2kOWw",
      type: "Chapéu Incomum Nível 100",
      rarity: "Incomum (Unusual)",
      rarityColor: "#8650AC",
      weapon: "Todas as Classes",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 38.000,00",
      descriptions: [
        { value: "★ Efeito Incomum: Chamas Ardentes (Burning Flames)", color: "ffd700" },
        { value: "O chapéu mais lendário e cobiçado de toda a história do Team Fortress 2.", color: "7ea9d1" },
      ],
      tags: [
        { category: "Quality", internalName: "rarity4", localizedTagName: "Incomum", color: "8650ac" },
      ],
      appId: 440,
      contextId: 2,
    },
    {
      assetId: "tf2_demo_2",
      classId: "2002",
      instanceId: "0",
      amount: 1,
      name: "Australium Rocket Launcher",
      marketName: "Strange Australium Rocket Launcher",
      marketHashName: "Strange Australium Rocket Launcher",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEIdfcVURbquj1Rh83vMv2MCOQ_hNk08M1B3G5m1xFnZb_mNDdncVTGEfNfA6FqpFi4CnJluJ5tUtfv8ugHeF-6sdeTMrksMIlFGZHSX6XQZACu70pt0aZdfZSN8yq51S65Pj8OWw2k_T0K2m8",
      type: "Lança-Foguetes Estranho de Australium",
      rarity: "Australium (Estranho)",
      rarityColor: "#D4AF37",
      weapon: "Soldier",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 520,00",
      descriptions: [
        { value: "Feito de ouro Australium puro obtido em Mann vs Machine Tour.", color: "e5b80b" },
        { value: "Vítimas Registradas: 14.820", color: "ffd700" },
      ],
      tags: [
        { category: "Quality", internalName: "strange", localizedTagName: "Estranho", color: "cf6a32" },
      ],
      appId: 440,
      contextId: 2,
    },
    {
      assetId: "tf2_demo_3",
      classId: "2003",
      instanceId: "0",
      amount: 1,
      name: "Golden Frying Pan",
      marketName: "Strange Golden Frying Pan",
      marketHashName: "Strange Golden Frying Pan",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/fWFc82js0fmoRAP-qOIPu5THSWqfSmTELLqcUywGkijVjZULUrsm1j-9xgEIdfcVURbquj1Rh83vMv2MCOQ_hNk08M1B3G5m1xFnZb_mNDdncVTGEfNfA6FqpFi4CnJluJ5tUtfv8ugHeF-6sdeTMrksMIlFGZHSX6XQZACu70pt0aZdfZSN8yq51S65Pj8OWw2k_T0K2m8",
      type: "Arma Corpo a Corpo Australium Dourada",
      rarity: "Lendário (Gold)",
      rarityColor: "#D4AF37",
      weapon: "Todas as Classes",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 32.000,00",
      descriptions: [
        { value: "Transforma os inimigos abatidos em estátuas de ouro puro Australium!", color: "ffd700" },
      ],
      tags: [
        { category: "Quality", internalName: "strange", localizedTagName: "Estranho", color: "cf6a32" },
      ],
      appId: 440,
      contextId: 2,
    },
  ],
  // 252490: Rust
  252490: [
    {
      assetId: "rust_demo_1",
      classId: "3001",
      instanceId: "0",
      amount: 1,
      name: "Big Grin",
      marketName: "Big Grin Mask",
      marketHashName: "Big Grin",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byKQipLTiSeqIGHy5Vr3xFOGvmbY44DFJLsbURUoNXpaBwUASCgiPqqV-zA49fA448PZ05j69sR2w5S1C_bU_Qeey2i6a9F9zP8k",
      type: "Máscara Facial de Metal",
      rarity: "Mítico",
      rarityColor: "#D32CE6",
      weapon: "Metal Facemask",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 4.500,00",
      descriptions: [
        { value: "A máscara mais icônica e temida nos servidores de Rust.", color: "ffd700" },
      ],
      tags: [],
      appId: 252490,
      contextId: 2,
    },
    {
      assetId: "rust_demo_2",
      classId: "3002",
      instanceId: "0",
      amount: 1,
      name: "Alien Red AK47",
      marketName: "Alien Red Assault Rifle",
      marketHashName: "Alien Red",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/6TMcQ7eX6E0EZl2byKQipLTiSeqIGHy5Vr3xFOGvmbY44DFJLsbURUoNXpaBwUASCgiPqqV_zA85fh448PZ05j69sR2w5S1C8bY7ReOy1iOf8VI",
      type: "Fuzil de Assalto",
      rarity: "Raro",
      rarityColor: "#EB4B4B",
      weapon: "Assault Rifle",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 890,00",
      descriptions: [
        { value: "Mira de ferro com brilho vermelho neon fosforescente no escuro.", color: "eb4b4b" },
      ],
      tags: [],
      appId: 252490,
      contextId: 2,
    },
  ],
  // 570: Dota 2
  570: [
    {
      assetId: "dota_demo_1",
      classId: "4001",
      instanceId: "0",
      amount: 1,
      name: "Dragonclaw Hook",
      marketName: "Dragonclaw Hook",
      marketHashName: "Dragonclaw Hook",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/W_I_5GLm4NpBoSnzsUCrwBt_SI8mmRVQggYLIJUfCE846M_3LkNXUrWnzS14DgVfG2TfvGhTHwf85AZN65qDB6HG-RamQ1-6W-t_5yR-j4x7MOUH37F9VjT9P6c5",
      type: "Gancho Imortal",
      rarity: "Imortal (Immortal)",
      rarityColor: "#E4AE39",
      weapon: "Pudge",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 1.100,00",
      descriptions: [
        { value: "Forjado a partir de uma garra de dragão ancestral para o Pudge.", color: "ffd700" },
      ],
      tags: [],
      appId: 570,
      contextId: 2,
    },
  ],
  // 753: Cartas Steam
  753: [
    {
      assetId: "steam_cards_demo_1",
      classId: "5001",
      instanceId: "0",
      amount: 1,
      name: "Carta Colecionável Foil: Geralt of Rivia",
      marketName: "The Witcher 3: Wild Hunt (Foil Trading Card)",
      marketHashName: "The Witcher 3 Foil Card",
      iconUrl: "https://community.cloudflare.steamstatic.com/economy/image/W_I_5GLm4NpBoSnzsUCrwBt_SI8mmRVQggYLIJUfCE846M_3LkNXUrWnzS14DgVfG2TfvGhTHwf85AZN65qDB6HG-RamQ1-6W-t_5yR-j4x7MOUH37F9VjT9P6c5",
      type: "Carta Colecionável Brilhante",
      rarity: "Foil Rara",
      rarityColor: "#00E5FF",
      tradable: true,
      marketable: true,
      marketPrice: "R$ 25,00",
      descriptions: [
        { value: "Carta colecionável brilhante oficial da Comunidade Steam.", color: "00e5ff" },
      ],
      tags: [],
      appId: 753,
      contextId: 6,
    },
  ],
};

/**
 * Resolve qualquer entrada do usuário (SteamID64 numérico, URL completa ou Custom Vanity URL)
 * para um SteamID64 e dados públicos de avatar.
 */
async function resolveSteamProfile(input: string): Promise<{
  steamId64: string | null;
  personaname?: string;
  avatarUrl?: string;
  customURL?: string;
}> {
  const clean = input.trim();
  if (!clean) return { steamId64: null };

  // 1. Se já for puramente 17 dígitos
  if (/^\d{17}$/.test(clean)) {
    return { steamId64: clean };
  }

  // 2. Se for uma URL completa /profiles/7656119...
  const profilesMatch = clean.match(/steamcommunity\.com\/profiles\/(\d{17})/i);
  if (profilesMatch && profilesMatch[1]) {
    return { steamId64: profilesMatch[1] };
  }

  // 3. Se for uma URL /id/vanity_name ou nome direto
  let vanity = clean;
  const idMatch = clean.match(/steamcommunity\.com\/id\/([^/?#]+)/i);
  if (idMatch && idMatch[1]) {
    vanity = idMatch[1];
  } else {
    // Remove possíveis barras ou espaços
    vanity = vanity.replace(/https?:\/\//, "").replace(/\/$/, "");
  }

  try {
    const res = await fetch(`https://steamcommunity.com/id/${encodeURIComponent(vanity)}/?xml=1`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const xml = await res.text();
      const steamIdMatch = xml.match(/<steamID64>(\d{17})<\/steamID64>/);
      const personaMatch = xml.match(/<steamID><!\[CDATA\[(.*?)\]\]><\/steamID>/);
      const avatarMatch = xml.match(/<avatarFull><!\[CDATA\[(.*?)\]\]><\/avatarFull>/);
      const customUrlMatch = xml.match(/<customURL><!\[CDATA\[(.*?)\]\]><\/customURL>/);

      if (steamIdMatch && steamIdMatch[1]) {
        return {
          steamId64: steamIdMatch[1],
          personaname: personaMatch?.[1] || vanity,
          avatarUrl: avatarMatch?.[1],
          customURL: customUrlMatch?.[1] || vanity,
        };
      }
    }
  } catch (e) {
    console.error("[Steam Resolve] Erro ao resolver perfil vanity:", e);
  }

  return { steamId64: null };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const steamInput = searchParams.get("steamId") || searchParams.get("id") || "";
  const appId = parseInt(searchParams.get("appId") || "730", 10);
  const isDemo = searchParams.get("demo") === "true";
  const count = Math.min(100, Math.max(1, parseInt(searchParams.get("count") || "75", 10)));
  const startAssetId = searchParams.get("startAssetId") || "";

  // Encontra configuração do app suportado
  const supportedApp = STEAM_SUPPORTED_APPS.find((a) => a.id === appId) || STEAM_SUPPORTED_APPS[0];
  const contextId = supportedApp.contextId;

  // Se o usuário solicitou expressamente o modo demonstração ou não forneceu ID
  if (isDemo || (!steamInput && searchParams.get("load") !== "true")) {
    const demoItems = DEMO_ITEMS[appId] || DEMO_ITEMS[730];
    return NextResponse.json({
      success: true,
      appId,
      totalCount: demoItems.length,
      items: demoItems,
      isDemo: true,
      profile: {
        personaname: "Gamer Demo (Colecionador)",
        avatarUrl: "https://avatars.fastly.steamstatic.com/c8582f8478cffe910a2fe196c32ff2e5ed34b1a9_full.jpg",
        profileUrl: "https://steamcommunity.com",
      },
    } satisfies SteamInventoryResponse);
  }

  // 1. Resolve o perfil Steam
  const resolved = await resolveSteamProfile(steamInput);
  if (!resolved.steamId64) {
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

  const steamId64 = resolved.steamId64;
  const cacheKey = `${steamId64}_${appId}_${contextId}_${startAssetId}`;

  // 2. Checa Cache
  const cached = inventoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  // 3. Chama a API de Inventário da Comunidade Steam
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
          error: "A Steam está limitando temporariamente as consultas de inventário (HTTP 429). Tente novamente em alguns instantes ou explore o Modo Demonstração!",
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

    // 4. Mapeia assets e descriptions
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

    const responsePayload: SteamInventoryResponse = {
      success: true,
      steamId64,
      profile: {
        personaname: resolved.personaname || `Steam Gamer (${steamId64})`,
        avatarUrl: resolved.avatarUrl || "https://avatars.fastly.steamstatic.com/c8582f8478cffe910a2fe196c32ff2e5ed34b1a9_full.jpg",
        profileUrl: resolved.customURL
          ? `https://steamcommunity.com/id/${resolved.customURL}`
          : `https://steamcommunity.com/profiles/${steamId64}`,
        customURL: resolved.customURL,
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
