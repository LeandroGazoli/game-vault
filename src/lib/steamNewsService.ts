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
 * Detecta se o texto está predominantemente em português ou é elegível.
 */
export function isPortugueseNews(title: string, contents: string): boolean {
  const combined = `${title} ${contents}`.toLowerCase().slice(0, 800);

  // Palavras de alta frequência em português
  const ptMatches = combined.match(
    /\b(o|a|os|as|um|uma|de|do|da|dos|das|em|no|na|nos|nas|com|para|por|que|este|esta|jogo|jogos|atualização|atualizacoes|novidades|patch|versão|versao|correção|correcoes|melhorias|jogadores|lançamento|lancamento|grátis|gratis)\b/gi
  );

  return Boolean(ptMatches && ptMatches.length >= 2);
}

/**
 * Filtra matérias indesejadas (em cirílico/russo, chinês/japonês/coreano, árabe, etc.)
 */
export function isAllowedLanguageNews(title: string, contents: string): boolean {
  const sample = `${title} ${contents.slice(0, 400)}`;

  // Cirílico (Russo, Ucraniano, etc.)
  if (/[\u0400-\u04FF]/.test(sample)) return false;

  // CJK (Chinês, Japonês, Coreano)
  if (/[\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7AF]/.test(sample)) return false;

  // Árabe, Hebraico, Tailandês
  if (/[\u0600-\u06FF\u0590-\u05FF\u0E00-\u0E7F]/.test(sample)) return false;

  // Rejeita feeds agregadores conhecidos que não são comunicados de jogos
  const lower = sample.toLowerCase();
  if (lower.includes("gamemag.ru") || lower.includes("3dnews.ru")) return false;

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
