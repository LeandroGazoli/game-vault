import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

export interface StoredSteamNewsItem {
  gid: string;
  appId: number;
  title: string;
  translatedTitle: string;
  originalContents: string;
  translatedContents: string;
  author: string;
  url: string;
  date: number; // unix timestamp
  feedlabel: string;
  feedname: string;
  gameName?: string;
  firstImage?: string | null;
  isTranslated?: boolean;
  updatedAt: string;
}

const COLLECTION_NAME = "steam_news";

// Cache em memória para acesso ultrarrápido
const memoryCache = new Map<string, StoredSteamNewsItem>();

/**
 * Salva ou atualiza uma notícia da Steam com tradução no Firestore.
 */
export async function saveTranslatedSteamNews(
  item: StoredSteamNewsItem
): Promise<void> {
  if (!item.gid) return;

  // Atualiza cache em memória
  memoryCache.set(item.gid, item);

  if (!db) return;

  try {
    const docRef = doc(db, COLLECTION_NAME, item.gid);
    await setDoc(docRef, item, { merge: true });
  } catch (error) {
    console.warn(`[SteamNewsDb] Erro ao salvar notícia ${item.gid}:`, error);
  }
}

/**
 * Busca uma notícia da Steam já traduzida pelo ID (gid).
 */
export async function getStoredSteamNews(
  gid: string
): Promise<StoredSteamNewsItem | null> {
  if (!gid) return null;

  if (memoryCache.has(gid)) {
    return memoryCache.get(gid)!;
  }

  if (!db) return null;

  try {
    const docRef = doc(db, COLLECTION_NAME, gid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as StoredSteamNewsItem;
      memoryCache.set(gid, data);
      return data;
    }
  } catch (error) {
    console.warn(`[SteamNewsDb] Erro ao buscar notícia ${gid}:`, error);
  }

  return null;
}

/**
 * Retorna as últimas postagens salvas e traduzidas no sistema.
 * Útil para o feed geral de novidades e para o Painel Admin.
 */
export async function getRecentSteamNews(
  maxItems: number = 15
): Promise<StoredSteamNewsItem[]> {
  if (!db) return [];

  try {
    const q = query(
      collection(db, COLLECTION_NAME),
      orderBy("date", "desc"),
      limit(maxItems)
    );

    const snapshot = await getDocs(q);
    const results: StoredSteamNewsItem[] = [];

    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as StoredSteamNewsItem;
      results.push(data);
      memoryCache.set(data.gid, data);
    });

    return results;
  } catch (error) {
    console.warn("[SteamNewsDb] Erro ao buscar notícias recentes:", error);
    return [];
  }
}
