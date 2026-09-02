import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { sanitizeTranslation } from "./translate";

export interface StoredTranslation {
  gameId: string;
  gameName?: string;
  originalText: string;
  translatedText: string;
  source: string;
  createdAt: string;
  updatedAt: string;
}

// Cache local em memória para evitar requisições repetidas ao Firestore na mesma sessão/instância
const memoryCache = new Map<string, string>();

/**
 * Busca a tradução persistida de um jogo no Firestore.
 * Retorna null se ainda não houver tradução salva.
 */
export async function getStoredGameTranslation(
  gameId: string | number
): Promise<string | null> {
  if (!db || !gameId) return null;

  const key = String(gameId);

  // 1. Verifica cache rápido de memória
  if (memoryCache.has(key)) {
    return memoryCache.get(key)!;
  }

  try {
    // Timeout de 1.5s para garantir que uma lentidão de rede nunca trave a página
    const fetchPromise = getDoc(doc(db, "game_translations", key));
    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), 1500)
    );

    const docSnap: any = await Promise.race([fetchPromise, timeoutPromise]);

    if (docSnap && docSnap.exists && docSnap.exists()) {
      const data = docSnap.data() as StoredTranslation;
      const clean = sanitizeTranslation(data?.translatedText);
      if (clean && clean.length > 0) {
        memoryCache.set(key, clean);
        return clean;
      }
    }
  } catch (err) {
    console.warn(`Aviso ao buscar tradução do jogo ${key} no Firestore:`, err);
  }

  return null;
}

/**
 * Salva a tradução no Firestore para persistência definitiva (100% gratuita).
 * Uma vez gravada, todos os futuros visitantes receberão a tradução diretamente do banco.
 */
export async function saveGameTranslation(
  gameId: string | number,
  originalText: string,
  translatedText: string,
  gameName?: string
): Promise<void> {
  if (!db || !gameId || !translatedText) return;

  const key = String(gameId);
  const clean = sanitizeTranslation(translatedText);
  if (!clean) return;

  // Atualiza cache de memória imediatamente
  memoryCache.set(key, clean);

  try {
    await setDoc(
      doc(db, "game_translations", key),
      {
        gameId: key,
        gameName: gameName || "",
        originalText,
        translatedText: clean,
        source: "free_engine",
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn(`Erro ao salvar tradução do jogo ${key} no Firestore:`, err);
  }
}
