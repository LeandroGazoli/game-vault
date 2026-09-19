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
import { withSharedCache, setSharedCache } from "./edgeCache";

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

const TRANSLATIONS_CACHE_TTL = 14 * 24 * 3600; // 14 dias no cache de borda (KV + Cache API)

/**
 * Busca todas as traduções salvas de um jogo (Sinopse e Enredo) no Firestore.
 */
export async function getStoredGameTranslations(
  gameId: string | number
): Promise<GameTranslations> {
  if (!gameId) return { description: null, storyline: null };

  const key = String(gameId);

  // 1. Verifica cache rápido de memória do isolate
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  // 2. Camada L1 (Cache API por datacenter) + L2 (Cloudflare KV global)
  // Reduz drasticamente as leituras em game_translations no Firestore
  const cached = await withSharedCache<GameTranslations>(
    "gv-trans",
    key,
    TRANSLATIONS_CACHE_TTL,
    async () => {
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

          return {
            description: cleanDesc,
            storyline: cleanStoryline,
          };
        }
      } catch (err) {
        console.warn(`Aviso ao buscar traduções do jogo ${key} no Firestore:`, err);
      }

      return { description: null, storyline: null };
    }
  );

  const result = cached || { description: null, storyline: null };
  setMemoryCache(key, result);
  return result;
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

  // Atualiza cache de memória e cache de borda imediatamente
  const currentCached = memoryCache.get(key) || { description: null, storyline: null };
  const updatedTranslations: GameTranslations = {
    description: cleanDesc !== undefined ? cleanDesc : currentCached.description,
    storyline: cleanStoryline !== undefined ? cleanStoryline : currentCached.storyline,
  };
  setMemoryCache(key, updatedTranslations);
  void setSharedCache("gv-trans", key, TRANSLATIONS_CACHE_TTL, updatedTranslations);

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
