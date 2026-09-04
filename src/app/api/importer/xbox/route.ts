import { NextRequest, NextResponse } from "next/server";

const OPENXBL_HOST = "https://api.xbl.io";

// Aplicativos e ferramentas que não devem entrar na biblioteca de jogos
const NON_GAME_PATTERNS = [
  "youtube",
  "netflix",
  "spotify",
  "twitch",
  "disney+",
  "prime video",
  "amazon prime",
  "apple tv",
  "crunchyroll",
  "xbox accessories",
  "acessórios xbox",
  "microsoft edge",
  "settings",
  "configurações",
  "media player",
  "reprodutor de mídia",
  "blu-ray player",
  "reprodutor de blu-ray",
  "rewards",
  "avatar editor",
  "editor de avatar",
  "film & tv",
  "filmes e tv",
  "xbox insider hub",
  "feedback hub",
  "dolby access",
];

async function callOpenXBL(endpoint: string, apiKey: string) {
  const url = `${OPENXBL_HOST}${endpoint}`;
  return await fetch(url, {
    headers: {
      "X-Authorization": apiKey,
      Accept: "application/json",
      "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
    },
    cache: "no-store",
  });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gamertag = searchParams.get("gamertag")?.trim();
    const apiKey =
      searchParams.get("apiKey")?.trim() ||
      req.headers.get("x-authorization")?.trim() ||
      process.env.XBL_API_KEY?.trim() ||
      process.env.OPENXBL_API_KEY?.trim();

    if (!gamertag) {
      return NextResponse.json(
        { success: false, error: "Gamertag do Xbox é obrigatória." },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json({
        success: false,
        requiresApiKey: true,
        error:
          "Chave OpenXBL necessária para sincronizar automaticamente da nuvem. Insira sua chave no campo 'Opções Avançadas' (obtenha gratuitamente em xbl.io) ou configure XBL_API_KEY no painel da Vercel.",
      });
    }

    // 1. Validar a chave e obter perfil da conta autenticada
    const accountRes = await callOpenXBL("/v2/account", apiKey);

    if (accountRes.status === 401) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Chave de API OpenXBL inválida ou expirada. Verifique sua chave no dashboard do xbl.io.",
        },
        { status: 401 }
      );
    }

    if (accountRes.status === 429) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Limite de requisições do OpenXBL / Xbox atingido. Aguarde alguns instantes e tente novamente.",
        },
        { status: 429 }
      );
    }

    let authXuid: string | null = null;
    let authGamertag: string | null = null;

    if (accountRes.ok) {
      try {
        const accountData = await accountRes.json();
        const profile = accountData?.content?.profileUsers?.[0];
        authXuid = profile?.id || null;
        authGamertag =
          profile?.settings?.find((s: any) => s.id === "Gamertag")?.value || null;
      } catch (err) {
        console.warn("Falha ao ler perfil do OpenXBL:", err);
      }
    }

    // Verifica se o gamertag solicitado é a própria conta do usuário autenticado
    const isNumericXuid = /^\d{12,}$/.test(gamertag);
    const isSelf =
      (authGamertag && authGamertag.toLowerCase() === gamertag.toLowerCase()) ||
      (authXuid && authXuid === gamertag) ||
      gamertag.toLowerCase() === "me";

    let targetXuid: string | null = isSelf ? authXuid : isNumericXuid ? gamertag : null;
    let resolvedGamertag: string = authGamertag || gamertag;

    // 2. Se não for a própria conta e não for um XUID numérico, resolver Gamertag -> XUID
    if (!targetXuid && !isSelf) {
      const encodedTag = encodeURIComponent(gamertag);

      // 2.1 Tentativa com /v2/friends/search?gt=...
      const searchRes = await callOpenXBL(`/v2/friends/search?gt=${encodedTag}`, apiKey);
      if (searchRes.ok) {
        try {
          const sData = await searchRes.json();
          const pUser = sData?.content?.profileUsers?.[0];
          if (pUser?.id) {
            targetXuid = pUser.id;
            const foundTag = pUser.settings?.find(
              (s: any) => s.id === "Gamertag"
            )?.value;
            if (foundTag) resolvedGamertag = foundTag;
          }
        } catch {}
      }

      // 2.2 Tentativa com /v2/friends/search/{gamertag}
      if (!targetXuid) {
        const pathSearchRes = await callOpenXBL(
          `/v2/friends/search/${encodedTag}`,
          apiKey
        );
        if (pathSearchRes.ok) {
          try {
            const sData = await pathSearchRes.json();
            const pUser = sData?.content?.profileUsers?.[0];
            if (pUser?.id) {
              targetXuid = pUser.id;
              const foundTag = pUser.settings?.find(
                (s: any) => s.id === "Gamertag"
              )?.value;
              if (foundTag) resolvedGamertag = foundTag;
            }
          } catch {}
        }
      }

      // 2.3 Tentativa com fuzzy search /v2/search/{gamertag}
      if (!targetXuid) {
        const fuzzyRes = await callOpenXBL(`/v2/search/${encodedTag}`, apiKey);
        if (fuzzyRes.ok) {
          try {
            const fData = await fuzzyRes.json();
            const people = fData?.content?.people || [];
            if (Array.isArray(people) && people.length > 0) {
              const exact = people.find(
                (p: any) => p.gamertag?.toLowerCase() === gamertag.toLowerCase()
              );
              const match = exact || people[0];
              if (match?.xuid) {
                targetXuid = match.xuid;
                if (match.gamertag) resolvedGamertag = match.gamertag;
              }
            }
          } catch {}
        }
      }
    }

    if (!targetXuid && !isSelf) {
      return NextResponse.json(
        {
          success: false,
          error: `Gamertag "${gamertag}" não foi encontrado na Xbox Live. Verifique a ortografia ou certifique-se de que a conta existe e é pública.`,
        },
        { status: 404 }
      );
    }

    // 3. Buscar títulos jogados na OpenXBL
    let titlesRaw: any[] = [];

    // 3.1 Endpoint de títulos oficial: /v2/titles (self) ou /v2/titles/{xuid} (outro jogador)
    const titlesEndpoint = isSelf ? "/v2/titles" : `/v2/titles/${targetXuid}`;
    const titlesRes = await callOpenXBL(titlesEndpoint, apiKey);

    if (titlesRes.ok) {
      try {
        const titlesData = await titlesRes.json();
        if (Array.isArray(titlesData?.content?.titles)) {
          titlesRaw = titlesData.content.titles;
        } else if (Array.isArray(titlesData?.content)) {
          titlesRaw = titlesData.content;
        } else if (Array.isArray(titlesData?.titles)) {
          titlesRaw = titlesData.titles;
        }
      } catch (err) {
        console.warn("Falha no parse dos títulos Xbox:", err);
      }
    }

    // 3.2 Se títulos estiverem vazios, tentar histórico por conquistas (/v2/achievements)
    if (titlesRaw.length === 0) {
      const achEndpoint = isSelf
        ? "/v2/achievements"
        : `/v2/achievements/player/${targetXuid}`;
      const achRes = await callOpenXBL(achEndpoint, apiKey);

      if (achRes.ok) {
        try {
          const achData = await achRes.json();
          const achTitles = achData?.content?.titles || achData?.titles;
          if (Array.isArray(achTitles) && achTitles.length > 0) {
            titlesRaw = achTitles;
          }
        } catch {}
      }
    }

    // 3.3 Fallback: endpoint legado /v2/player/titleHistory
    if (titlesRaw.length === 0) {
      const legEndpoint = isSelf
        ? "/v2/player/titleHistory"
        : `/v2/player/titleHistory/${targetXuid}`;
      const legRes = await callOpenXBL(legEndpoint, apiKey);

      if (legRes.ok) {
        try {
          const legData = await legRes.json();
          const legTitles =
            legData?.content?.titles || legData?.content || legData?.titles;
          if (Array.isArray(legTitles) && legTitles.length > 0) {
            titlesRaw = legTitles;
          }
        } catch {}
      }
    }

    if (titlesRaw.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Nenhum jogo encontrado para o Gamertag "${resolvedGamertag}". Verifique se o seu histórico de jogos está definido como público nas configurações de privacidade do Xbox (Configurações > Conta > Privacidade > Histórico de jogos e apps).`,
      });
    }

    // 4. Filtrar aplicativos de streaming/sistema e mapear campos
    const games = titlesRaw
      .filter((t: any) => {
        const name = (t.name || t.titleName || "").trim();
        if (!name) return false;
        if (t.type && String(t.type).toLowerCase() === "application") return false;
        const lower = name.toLowerCase();
        if (NON_GAME_PATTERNS.some((p) => lower === p || lower.startsWith(p + " "))) {
          return false;
        }
        return true;
      })
      .map((t: any) => {
        const devices: string[] = Array.isArray(t.devices) ? t.devices : [];
        let platform = "Xbox Series";
        if (devices.includes("XboxSeriesX") || devices.includes("XboxSeriesS")) {
          platform = "Xbox Series";
        } else if (devices.includes("XboxOne")) {
          platform = "Xbox One";
        } else if (devices.includes("Xbox360")) {
          platform = "Xbox 360";
        } else if (
          devices.includes("PC") ||
          devices.includes("Win32") ||
          devices.includes("WindowsOneCore")
        ) {
          platform = "PC";
        }

        return {
          name: (t.name || t.titleName || "").trim(),
          titleId: String(t.titleId || ""),
          logoUrl: t.displayImage || t.imageUri || t.boxArt || null,
          platform,
          devices,
          lastPlayed: t.titleHistory?.lastTimePlayed || null,
          progressPercentage: t.achievement?.progressPercentage || 0,
          currentGamerscore: t.achievement?.currentGamerscore || 0,
          totalGamerscore: t.achievement?.totalGamerscore || 0,
          isGamePass: Boolean(t.gamePass?.isGamePass),
          source: "xbox",
        };
      });

    return NextResponse.json({
      success: true,
      gamertag: resolvedGamertag,
      xuid: targetXuid,
      count: games.length,
      games,
    });
  } catch (error: any) {
    console.error("Erro na rota /api/importer/xbox:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Erro interno ao processar sincronização Xbox.",
      },
      { status: 500 }
    );
  }
}
