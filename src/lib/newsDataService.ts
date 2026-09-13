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
}

export interface NewsDataSearchParams {
  q?: string;
  country?: string;
  language?: string;
  category?: string;
  page?: string;
}

const DEFAULT_QUERY = "games OR jogo OR jogos OR video game";

export async function fetchNewsDataArticles(params: NewsDataSearchParams = {}): Promise<NewsDataApiResponse> {
  const apiKey = process.env.NEWSDATA_API_KEY?.trim() || "pub_f6f2cf344e8b4d62a121a89953104b29";
  
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

  const data: NewsDataApiResponse = await res.json();
  return data;
}
