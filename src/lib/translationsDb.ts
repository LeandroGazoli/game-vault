/**
 * Traduções persistidas de jogos — SOMENTE SERVIDOR.
 *
 * Usa o transporte REST (firestoreAdminRest) em vez do SDK cliente: o SDK
 * resolve pela condição "node" no bundle de servidor e arrasta gRPC/protobufjs,
 * que quebram no isolate V8 do Cloudflare Workers.
 */
import { getRestFirestore } from "./firestoreAdminRest";
import { registerGameInSitemapIndex } from "./sitemapIndex";
import { sanitizeTranslation } from "./translate";

const TRANSLATIONS_COLLECTION = "game_translations";

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
const MAX_TRANSLATIONS_CACHE = 1000;
const memoryCache = new Map<string, GameTranslations>();

function setMemoryCache(key: string, data: GameTranslations) {
  if (memoryCache.size >= MAX_TRANSLATIONS_CACHE) {
    const oldestKey = memoryCache.keys().next().value;
    if (oldestKey) memoryCache.delete(oldestKey);
  }
  memoryCache.set(key, data);
}

/**
 * Busca todas as traduções salvas de um jogo (Sinopse e Enredo) no Firestore.
 */
export async function getStoredGameTranslations(
  gameId: string | number
): Promise<GameTranslations> {
  if (!gameId) return { description: null, storyline: null };

  const key = String(gameId);

  // 1. Verifica cache rápido de memória
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  try {
    // Timeout de 1.5s para garantir que lentidão de rede nunca trave a página
    const fetchPromise = getRestFirestore()
      .collection(TRANSLATIONS_COLLECTION)
      .doc(key)
      .get();
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );

    const docSnap = await Promise.race([fetchPromise, timeoutPromise]);

    if (docSnap && docSnap.exists) {
      const data = docSnap.data() as StoredTranslation;
      const cleanDesc = sanitizeTranslation(data?.translatedText) || null;
      const cleanStoryline = sanitizeTranslation(data?.translatedStoryline) || null;

      const result: GameTranslations = {
        description: cleanDesc,
        storyline: cleanStoryline,
      };

      setMemoryCache(key, result);
      return result;
    }
  } catch (err) {
    console.warn(`Aviso ao buscar traduções do jogo ${key} no Firestore:`, err);
    // Erro (ex.: 429) NÃO é cacheado: quando a cota voltar, queremos tentar de novo.
    return { description: null, storyline: null };
  }

  // Cacheia a AUSÊNCIA de tradução. Sem isto, todo jogo sem tradução custava 1 leitura do
  // Firestore por requisição, para sempre — e a maioria do catálogo não tem tradução.
  const empty: GameTranslations = { description: null, storyline: null };
  setMemoryCache(key, empty);
  return empty;
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
  if (!gameId) return;

  const key = String(gameId);
  const cleanDesc = params.translatedDescription
    ? sanitizeTranslation(params.translatedDescription)
    : undefined;
  const cleanStoryline = params.translatedStoryline
    ? sanitizeTranslation(params.translatedStoryline)
    : undefined;

  // Atualiza cache de memória imediatamente
  const currentCached = memoryCache.get(key) || { description: null, storyline: null };
  setMemoryCache(key, {
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
    await getRestFirestore()
      .collection(TRANSLATIONS_COLLECTION)
      .doc(key)
      .set(docData, { merge: true });

    // Mantém o índice do sitemap incremental: custa 1 leitura + 1 escrita apenas quando o
    // jogo é NOVO. Sem isto, o sitemap voltaria a varrer a coleção inteira para se montar.
    if (params.gameName) {
      await registerGameInSitemapIndex({
        i: key,
        n: params.gameName,
        u: docData.updatedAt,
      });
    }
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
