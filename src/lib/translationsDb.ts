import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sanitizeTranslation } from "./translate";

export interface StoredTranslation {
  gameId: string;
  gameName?: string;
  originalText?: string;
  translatedText?: string;
  originalStoryline?: string;
  translatedStoryline?: string;
  source: string;
  createdAt?: string;
  updatedAt: string;
}

export interface GameTranslations {
  description: string | null;
  storyline: string | null;
}

// Cache local em memória para evitar requisições repetidas ao Firestore na mesma sessão/instância
const memoryCache = new Map<string, GameTranslations>();

/**
 * Busca todas as traduções salvas de um jogo (Sinopse e Enredo) no Firestore.
 */
export async function getStoredGameTranslations(
  gameId: string | number
): Promise<GameTranslations> {
  if (!db || !gameId) return { description: null, storyline: null };

  const key = String(gameId);

  // 1. Verifica cache rápido de memória
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  try {
    // Timeout de 1.5s para garantir que lentidão de rede nunca trave a página
    const fetchPromise = getDoc(doc(db, "game_translations", key));
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );

    const docSnap: any = await Promise.race([fetchPromise, timeoutPromise]);

    if (docSnap && docSnap.exists && docSnap.exists()) {
      const data = docSnap.data() as StoredTranslation;
      const cleanDesc = sanitizeTranslation(data?.translatedText) || null;
      const cleanStoryline = sanitizeTranslation(data?.translatedStoryline) || null;

      const result: GameTranslations = {
        description: cleanDesc,
        storyline: cleanStoryline,
      };

      memoryCache.set(key, result);
      return result;
    }
  } catch (err) {
    console.warn(`Aviso ao buscar traduções do jogo ${key} no Firestore:`, err);
  }

  return { description: null, storyline: null };
}

/**
 * Busca a tradução persistida da sinopse de um jogo no Firestore (compatibilidade retroativa).
 */
export async function getStoredGameTranslation(
  gameId: string | number
): Promise<string | null> {
  const translations = await getStoredGameTranslations(gameId);
  return translations.description;
}

/**
 * Salva as traduções (sinopse e/ou enredo) no Firestore para persistência definitiva (100% gratuita).
 * Utiliza { merge: true } para não sobrepor outros campos já traduzidos.
 */
export async function saveGameTranslations(
  gameId: string | number,
  params: {
    originalDescription?: string;
    translatedDescription?: string;
    originalStoryline?: string;
    translatedStoryline?: string;
    gameName?: string;
  }
): Promise<void> {
  if (!db || !gameId) return;

  const key = String(gameId);
  const cleanDesc = params.translatedDescription
    ? sanitizeTranslation(params.translatedDescription)
    : undefined;
  const cleanStoryline = params.translatedStoryline
    ? sanitizeTranslation(params.translatedStoryline)
    : undefined;

  // Atualiza cache de memória imediatamente
  const currentCached = memoryCache.get(key) || { description: null, storyline: null };
  memoryCache.set(key, {
    description: cleanDesc !== undefined ? cleanDesc : currentCached.description,
    storyline: cleanStoryline !== undefined ? cleanStoryline : currentCached.storyline,
  });

  const docData: any = {
    gameId: key,
    source: "free_engine",
    updatedAt: new Date().toISOString(),
  };

  if (params.gameName) docData.gameName = params.gameName;
  if (params.originalDescription) docData.originalText = params.originalDescription;
  if (cleanDesc) docData.translatedText = cleanDesc;
  if (params.originalStoryline) docData.originalStoryline = params.originalStoryline;
  if (cleanStoryline) docData.translatedStoryline = cleanStoryline;

  try {
    await setDoc(doc(db, "game_translations", key), docData, { merge: true });
  } catch (err) {
    console.warn(`Erro ao salvar tradução do jogo ${key} no Firestore:`, err);
  }
}

/**
 * Salva a tradução da sinopse no Firestore (compatibilidade retroativa).
 */
export async function saveGameTranslation(
  gameId: string | number,
  originalText: string,
  translatedText: string,
  gameName?: string
): Promise<void> {
  return saveGameTranslations(gameId, {
    originalDescription: originalText,
    translatedDescription: translatedText,
    gameName,
  });
}
