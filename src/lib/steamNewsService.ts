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
    // Common Steam URL formats:
    // https://store.steampowered.com/app/1245620/ELDEN_RING/
    // https://steamcommunity.com/app/1245620
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
 * Extracts the first image URL found in the Steam news BBCode.
 */
export function extractFirstSteamImage(contents: string): string | null {
  if (!contents) return null;
  const imgMatch = contents.match(/\[img\](.*?)\[\/img\]/i);
  if (imgMatch && imgMatch[1]) {
    return resolveSteamClanImageUrl(imgMatch[1].trim());
  }
  return null;
}

/**
 * Cleans Steam BBCode to readable formatted plain text or markdown.
 */
export function cleanSteamBBCode(bbcode: string): string {
  if (!bbcode) return "";

  let text = bbcode;

  // Resolve clan images first
  text = resolveSteamClanImageUrl(text);

  // Replace [img]url[/img] with empty or markdown
  text = text.replace(/\[img\](.*?)\[\/img\]/gi, "");

  // Replace [url=LINK]TEXT[/url]
  text = text.replace(/\[url=(.*?)\](.*?)\[\/url\]/gi, "$2 ($1)");

  // Replace [h1], [h2], [h3]
  text = text.replace(/\[h1\](.*?)\[\/h1\]/gi, "\n\n### $1\n");
  text = text.replace(/\[h2\](.*?)\[\/h2\]/gi, "\n\n### $1\n");
  text = text.replace(/\[h3\](.*?)\[\/h3\]/gi, "\n\n#### $1\n");

  // Bold, italic, underline, strike
  text = text.replace(/\[b\](.*?)\[\/b\]/gi, "**$1**");
  text = text.replace(/\[i\](.*?)\[\/i\]/gi, "*$1*");
  text = text.replace(/\[u\](.*?)\[\/u\]/gi, "$1");
  text = text.replace(/\[strike\](.*?)\[\/strike\]/gi, "~~$1~~");

  // Lists
  text = text.replace(/\[list\]/gi, "\n");
  text = text.replace(/\[\/list\]/gi, "\n");
  text = text.replace(/\[\*\]/gi, "• ");

  // Remove any remaining unrecognized tags [tag] or [/tag]
  text = text.replace(/\[\/?[\w=]+\]/gi, "");

  // Clean excessive blank lines
  text = text.replace(/\n{3,}/g, "\n\n").trim();

  return text;
}
