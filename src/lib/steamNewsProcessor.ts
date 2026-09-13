import {
  SteamNewsItem,
  cleanSteamBBCode,
  extractFirstSteamImage,
  isPortugueseNews,
} from "./steamNewsService";
import { translateToPortuguese } from "./translate";
import {
  getStoredSteamNews,
  saveTranslatedSteamNews,
  StoredSteamNewsItem,
} from "./steamNewsDb";

export async function processAndTranslateNewsItem(
  item: SteamNewsItem,
  fallbackAppId?: number,
  forceFresh: boolean = false
): Promise<SteamNewsItem> {
  const targetAppId = Number(item.appid || item.appId || fallbackAppId || 0);

  // 1. Verifica cache no Firestore se não for forceFresh
  if (!forceFresh && item.gid) {
    const stored = await getStoredSteamNews(item.gid);
    if (stored && stored.translatedContents) {
      const hasValidTranslation =
        stored.isTranslated &&
        stored.translatedTitle &&
        !isPortugueseNews(item.title, item.contents)
          ? stored.translatedTitle !== item.title
          : true;

      if (hasValidTranslation) {
        return {
          ...item,
          appid: targetAppId,
          appId: targetAppId,
          gameName: item.gameName || stored.gameName,
          title: stored.translatedTitle || item.title,
          contents: stored.translatedContents,
          isTranslated: Boolean(stored.isTranslated),
        };
      }
    }
  }

  // 2. Se já for nativamente em português
  const alreadyPt = isPortugueseNews(item.title, item.contents);
  if (alreadyPt) {
    const firstImg = extractFirstSteamImage(item.contents);
    const storedItem: StoredSteamNewsItem = {
      gid: item.gid,
      appId: targetAppId,
      title: item.title,
      translatedTitle: item.title,
      originalContents: item.contents,
      translatedContents: item.contents,
      author: item.author || "Steam Community",
      url: item.url,
      date: item.date,
      feedlabel: item.feedlabel || "Patch Note",
      feedname: item.feedname || "Steam Community",
      gameName: item.gameName,
      firstImage: firstImg,
      isTranslated: false,
      updatedAt: new Date().toISOString(),
    };
    saveTranslatedSteamNews(storedItem).catch(() => {});
    return {
      ...item,
      appid: targetAppId,
      appId: targetAppId,
      isTranslated: false,
    };
  }

  // 3. Traduz título e conteúdo para PT-BR
  try {
    const cleanText = cleanSteamBBCode(item.contents);
    const translatedTitle = await translateToPortuguese(item.title);

    // Amostra de texto para agilidade
    const contentSample = cleanText.slice(0, 1200);
    const translatedBody = await translateToPortuguese(contentSample);

    const firstImg = extractFirstSteamImage(item.contents);
    const isActuallyTranslated =
      translatedTitle !== item.title || translatedBody !== contentSample;

    const storedItem: StoredSteamNewsItem = {
      gid: item.gid,
      appId: targetAppId,
      title: item.title,
      translatedTitle: translatedTitle || item.title,
      originalContents: item.contents,
      translatedContents: translatedBody || cleanText,
      author: item.author || "Steam Community",
      url: item.url,
      date: item.date,
      feedlabel: item.feedlabel || "Patch Note",
      feedname: item.feedname || "Steam Community",
      gameName: item.gameName,
      firstImage: firstImg,
      isTranslated: isActuallyTranslated,
      updatedAt: new Date().toISOString(),
    };

    saveTranslatedSteamNews(storedItem).catch(() => {});

    return {
      ...item,
      appid: targetAppId,
      appId: targetAppId,
      title: translatedTitle || item.title,
      contents: translatedBody || cleanText,
      isTranslated: isActuallyTranslated,
    };
  } catch (err) {
    console.warn(`Erro ao traduzir notícia ${item.gid}:`, err);
    return {
      ...item,
      appid: targetAppId,
      appId: targetAppId,
    };
  }
}
