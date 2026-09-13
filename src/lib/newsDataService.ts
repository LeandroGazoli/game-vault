import { getSystemSettings } from "./firebase";
import { incrementKeyUsage, getDailyKeyUsage, ApiQuotaStatus, maskApiKey } from "./apiKeyUsageTracker";

export interface NewsDataArticle {
  article_id: string;
  link: string;
  title: string;
  description: string | null;
  content: string | null;
  keywords: string[] | null;
  creator: string[] | null;
  language: string;
  country: string[];
  category: string[];
  datatype?: string;
  pubDate: string;
  image_url: string | null;
  video_url: string | null;
  source_id: string;
  source_name: string;
  source_url: string;
  source_icon: string | null;
  duplicate?: boolean;
}

export interface NewsDataApiResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
  quota?: ApiQuotaStatus;
}

export interface NewsDataSearchParams {
  q?: string;
  country?: string;
  language?: string;
  category?: string;
  page?: string;
  customApiKey?: string;
}

const DEFAULT_QUERY = "games OR jogo OR jogos OR video game";

export async function fetchNewsDataArticles(params: NewsDataSearchParams = {}): Promise<NewsDataApiResponse> {
  // 1. Hierarquia de resolução de chave:
  // Parâmetro do usuário/admin > Configuração gravada no Banco (system/settings) > Variável de Ambiente
  let apiKey = params.customApiKey?.trim();
  let keySource: "custom" | "system_db" | "env" = "custom";

  let dailyLimit = 100;

  if (!apiKey) {
    try {
      const settings = await getSystemSettings();
      if (settings.newsApiSettings?.newsdataApiKey?.trim()) {
        apiKey = settings.newsApiSettings.newsdataApiKey.trim();
        keySource = "system_db";
        dailyLimit = settings.newsApiSettings.newsdataDailyLimit || 100;
      }
    } catch {
      // Fallback gracioso
    }
  }

  if (!apiKey) {
    apiKey = process.env.NEWSDATA_API_KEY?.trim() || "pub_f6f2cf344e8b4d62a121a89953104b29";
    keySource = "env";
  }

  // 2. Verificação do limite diário baseado na chave
  const currentUsage = await getDailyKeyUsage("newsdata", apiKey);
  if (currentUsage.count >= (currentUsage.limit || dailyLimit)) {
    throw new Error(
      `Limite diário de requisições da NewsData atingido para esta chave (${currentUsage.count}/${currentUsage.limit || dailyLimit} reqs hoje). Forneça uma chave alternativa nas configurações ou tente amanhã.`
    );
  }

  const query = params.q?.trim() || DEFAULT_QUERY;
  const country = params.country || "br";
  const language = params.language || "pt";

  const searchParams = new URLSearchParams({
    apikey: apiKey,
    q: query,
    country,
    language,
  });

  if (params.category && params.category !== "all") {
    searchParams.set("category", params.category);
  }

  if (params.page) {
    searchParams.set("page", params.page);
  }

  const url = `https://newsdata.io/api/1/latest?${searchParams.toString()}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "GameVault/1.0",
      Accept: "application/json",
    },
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`NewsData API error ${res.status}: ${errorText}`);
  }

  // 3. Incrementa o contador da chave após requisição bem sucedida
  const updatedUsage = await incrementKeyUsage("newsdata", apiKey, dailyLimit);

  const data: NewsDataApiResponse = await res.json();
  data.quota = {
    service: "newsdata",
    count: updatedUsage.count,
    limit: updatedUsage.limit,
    remaining: Math.max(0, updatedUsage.limit - updatedUsage.count),
    isExceeded: updatedUsage.count >= updatedUsage.limit,
    activeKeyMasked: maskApiKey(apiKey),
    source: keySource,
  };

  return data;
}
