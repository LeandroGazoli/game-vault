import { getSystemSettings } from "./firebase";
import { incrementKeyUsage, getDailyKeyUsage, ApiQuotaStatus, maskApiKey } from "./apiKeyUsageTracker";

export interface GNewsSource {
  id: string;
  name: string;
  url: string;
  country?: string;
}

export interface GNewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string | null;
  publishedAt: string;
  lang: string;
  source: GNewsSource;
}

export interface GNewsApiResponse {
  totalArticles: number;
  articles: GNewsArticle[];
  information?: {
    realTimeArticles?: {
      message: string;
    };
  };
  quota?: ApiQuotaStatus;
}

export interface GNewsSearchParams {
  q?: string;
  lang?: string;
  country?: string;
  max?: number;
  customApiKey?: string;
}

const DEFAULT_QUERY = "jogos OR video game";

export async function fetchGNewsArticles(params: GNewsSearchParams = {}): Promise<GNewsApiResponse> {
  // 1. Hierarquia de resolução de chave:
  let apiKey = params.customApiKey?.trim();
  let keySource: "custom" | "system_db" | "env" = "custom";
  let dailyLimit = 100;

  if (!apiKey) {
    try {
      const settings = await getSystemSettings();
      if (settings.newsApiSettings?.gnewsApiKey?.trim()) {
        apiKey = settings.newsApiSettings.gnewsApiKey.trim();
        keySource = "system_db";
        dailyLimit = settings.newsApiSettings.gnewsDailyLimit || 100;
      }
    } catch {
      // Fallback gracioso
    }
  }

  if (!apiKey) {
    apiKey = process.env.GNEWS_API_KEY?.trim() || "0600cfe9b21879c95f36213718b366f3";
    keySource = "env";
  }

  // 2. Verificação do limite diário baseado na chave
  const currentUsage = await getDailyKeyUsage("gnews", apiKey);
  if (currentUsage.count >= (currentUsage.limit || dailyLimit)) {
    throw new Error(
      `Limite diário de requisições do GNews atingido para esta chave (${currentUsage.count}/${currentUsage.limit || dailyLimit} reqs hoje). Forneça uma chave alternativa nas configurações ou tente amanhã.`
    );
  }

  const query = params.q?.trim() || DEFAULT_QUERY;
  const lang = params.lang || "pt";
  const max = params.max || 10;

  const searchParams = new URLSearchParams({
    apikey: apiKey,
    q: query,
    lang,
    max: String(max),
  });

  if (params.country) {
    searchParams.set("country", params.country);
  }

  const url = `https://gnews.io/api/v4/search?${searchParams.toString()}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "GameVault/1.0",
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`GNews API error ${res.status}: ${errorText}`);
  }

  // 3. Incrementa o contador da chave após sucesso
  const updatedUsage = await incrementKeyUsage("gnews", apiKey, dailyLimit);

  const data: GNewsApiResponse = await res.json();
  data.quota = {
    service: "gnews",
    count: updatedUsage.count,
    limit: updatedUsage.limit,
    remaining: Math.max(0, updatedUsage.limit - updatedUsage.count),
    isExceeded: updatedUsage.count >= updatedUsage.limit,
    activeKeyMasked: maskApiKey(apiKey),
    source: keySource,
  };

  return data;
}
