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
}

export interface GNewsSearchParams {
  q?: string;
  lang?: string;
  country?: string;
  max?: number;
}

const DEFAULT_QUERY = "jogos OR video game";

export async function fetchGNewsArticles(params: GNewsSearchParams = {}): Promise<GNewsApiResponse> {
  const apiKey = process.env.GNEWS_API_KEY?.trim() || "0600cfe9b21879c95f36213718b366f3";

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

  const data: GNewsApiResponse = await res.json();
  return data;
}
