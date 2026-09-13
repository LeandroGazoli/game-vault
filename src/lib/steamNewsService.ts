export interface SteamNewsItem {
  gid: string;
  title: string;
  url: string;
  is_external_url: boolean;
  author: string;
  contents: string;
  feedlabel: string;
  date: number; // Unix timestamp in seconds
  feedname: string;
  feed_type: number;
  appid: number;
  isTranslated?: boolean;
}

export interface SteamNewsApiResponse {
  appnews: {
    appid: number;
    newsitems: SteamNewsItem[];
    count: number;
  };
}

/**
 * Extracts the Steam App ID from game websites or store links.
 */
export function extractSteamAppId(
  websites?: { id?: number; category?: number; url: string; label?: string }[]
): string | null {
  if (!websites || websites.length === 0) return null;

  for (const site of websites) {
    if (!site?.url) continue;
    const match =
      site.url.match(/store\.steampowered\.com\/app\/(\d+)/i) ||
      site.url.match(/steamcommunity\.com\/app\/(\d+)/i);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
 * Resolves Steam Clan Images from {STEAM_CLAN_IMAGE}/...
 */
export function resolveSteamClanImageUrl(rawUrl: string): string {
  if (!rawUrl) return "";
  if (rawUrl.includes("{STEAM_CLAN_IMAGE}")) {
    return rawUrl.replace(
      "{STEAM_CLAN_IMAGE}",
      "https://clan.cloudflare.steamstatic.com/images"
    );
  }
  return rawUrl;
}

/**
 * Extracts the first image URL found in the Steam news BBCode or HTML.
 */
export function extractFirstSteamImage(contents: string): string | null {
  if (!contents) return null;

  // 1. BBCode: [img]...[/img]
  const bbMatch = contents.match(/\[img\](.*?)\[\/img\]/i);
  if (bbMatch && bbMatch[1]) {
    return resolveSteamClanImageUrl(bbMatch[1].trim());
  }

  // 2. HTML: <img src="..." />
  const htmlMatch = contents.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (htmlMatch && htmlMatch[1]) {
    return resolveSteamClanImageUrl(htmlMatch[1].trim());
  }

  return null;
}

/**
 * Detecta se o texto está genuinamente em português analisando vocabulário específico
 * e evitando falsos positivos com preposições inglesas como "a" ou "in".
 */
export function isPortugueseNews(title: string, contents: string): boolean {
  const clean = `${title} ${contents}`
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]*\]/g, " ");
  const sample = clean.toLowerCase().slice(0, 1000);

  // Stopwords e termos típicos em inglês
  const englishMatches = sample.match(
    /\b(the|and|is|are|in|with|of|to|for|from|by|which|their|players|gameplay|features|patch|update|look at|announcing|returns|adventure|explore|discover|we are|will be)\b/g
  );

  // Termos fortemente indicativos de português (não ambíguos)
  const portugueseMatches = sample.match(
    /\b(um|uma|de|do|da|dos|das|no|na|nos|nas|com|para|por|que|este|esta|jogo|jogos|atualização|atualizações|novidades|versão|versões|correção|correções|melhorias|jogadores|lançamento|grátis|está|estão|mais|sobre|veja|conheça|chegando|estará)\b/g
  );

  const engCount = englishMatches ? englishMatches.length : 0;
  const ptCount = portugueseMatches ? portugueseMatches.length : 0;

  // Só é considerado português se tiver termos claros em português e mais termos em PT do que em inglês
  return ptCount >= 3 && ptCount > engCount;
}

/**
 * Valida se a matéria é elegível para exibição e tradução (evitando blogs de spam irrelevantes).
 * Aceita matérias em qualquer idioma estrangeiro (inglês, russo, chinês, japonês, etc.)
 * pois serão traduzidas sob demanda e salvas em PT-BR.
 */
export function isAllowedLanguageNews(title: string, contents: string): boolean {
  const sample = `${title} ${contents.slice(0, 400)}`.toLowerCase();

  // Rejeita unicamente feeds de agregadores de pirataria ou blogs conhecidos por não serem notas de jogos
  if (sample.includes("3dnews.ru/assets") || sample.includes("warez") || sample.includes("crackwatch")) {
    return false;
  }

  return true;
}

/**
 * Cleans Steam BBCode & HTML to readable formatted plain text or markdown.
 */
export function cleanSteamBBCode(bbcode: string): string {
  if (!bbcode) return "";

  let text = bbcode;

  // Resolve clan images first
  text = resolveSteamClanImageUrl(text);

  // Replace [img]url[/img] and <img ...> with empty
  text = text.replace(/\[img\](.*?)\[\/img\]/gi, "");
  text = text.replace(/<img[^>]*>/gi, "");

  // Replace [url=LINK]TEXT[/url] and <a href="LINK">TEXT</a>
  text = text.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, "$2 ($1)");
  text = text.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, "$2 ($1)");

  // Replace headers [h1], [h2], [h3]
  text = text.replace(/\[h1\](.*?)\[\/h1\]/gi, "\n\n### $1\n");
  text = text.replace(/\[h2\](.*?)\[\/h2\]/gi, "\n\n### $1\n");
  text = text.replace(/\[h3\](.*?)\[\/h3\]/gi, "\n\n#### $1\n");

  // Bold, italic, underline, strike
  text = text.replace(/\[b\](.*?)\[\/b\]/gi, "**$1**");
  text = text.replace(/\[i\](.*?)\[\/i\]/gi, "*$1*");
  text = text.replace(/\[u\](.*?)\[\/u\]/gi, "$1");
  text = text.replace(/\[strike\](.*?)\[\/strike\]/gi, "~~$1~~");

  // HTML tags to simple text
  text = text.replace(/<strong>(.*?)<\/strong>/gi, "**$1**");
  text = text.replace(/<b>(.*?)<\/b>/gi, "**$1**");
  text = text.replace(/<em>(.*?)<\/em>/gi, "*$1*");
  text = text.replace(/<i>(.*?)<\/i>/gi, "*$1*");
  text = text.replace(/<p>/gi, "\n\n");
  text = text.replace(/<\/p>/gi, "");
  text = text.replace(/<br\s*\/?>/gi, "\n");

  // Lists
  text = text.replace(/\[list\]/gi, "\n");
  text = text.replace(/\[\/list\]/gi, "\n");
  text = text.replace(/\[\*\]/gi, "• ");
  text = text.replace(/<li>(.*?)<\/li>/gi, "• $1\n");

  // Remove any remaining tags
  text = text.replace(/\[\/?[\w=]+\]/gi, "");
  text = text.replace(/<[^>]+>/g, "");

  // Decode common HTML entities
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Clean excessive blank lines
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}
