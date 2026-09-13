import { db } from "./firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export interface ApiKeyUsage {
  apiKeyHash: string; // Hash seguro ou prefixo+sufixo mascarado da chave para indexação
  date: string; // Formato YYYY-MM-DD
  count: number;
  limit: number;
  service: "newsdata" | "gnews" | "gemini";
  lastUsedAt: string;
}

export interface ApiQuotaStatus {
  service: "newsdata" | "gnews";
  count: number;
  limit: number;
  remaining: number;
  isExceeded: boolean;
  activeKeyMasked: string;
  source: "custom" | "system_db" | "env";
}

/**
 * Cria uma identificação compacta para indexar a chave no Firestore sem expor o segredo completo
 */
export function hashApiKey(key: string): string {
  if (!key) return "unknown";
  const clean = key.trim();
  if (clean.length <= 8) return clean;
  const start = clean.slice(0, 4);
  const end = clean.slice(-4);
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  return `${start}_${Math.abs(hash)}_${end}`;
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  const clean = key.trim();
  if (clean.length <= 8) return "••••••••";
  return `${clean.slice(0, 4)}••••••••${clean.slice(-4)}`;
}

export function getTodayDateString(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Obtém o consumo do dia para uma dada chave de API
 */
export async function getDailyKeyUsage(service: "newsdata" | "gnews", key: string): Promise<ApiKeyUsage> {
  const date = getTodayDateString();
  const keyHash = hashApiKey(key);
  const docId = `${service}_${keyHash}_${date}`;

  const defaultUsage: ApiKeyUsage = {
    apiKeyHash: keyHash,
    date,
    count: 0,
    limit: 100,
    service,
    lastUsedAt: new Date().toISOString(),
  };

  if (!db) return defaultUsage;

  try {
    const snap = await getDoc(doc(db, "system_api_usage", docId));
    if (snap.exists()) {
      return { ...defaultUsage, ...snap.data() } as ApiKeyUsage;
    }
  } catch (e) {
    console.warn(`[apiKeyUsageTracker] Falha ao ler cota da chave ${service}:`, e);
  }

  return defaultUsage;
}

/**
 * Incrementa em 1 requisição o contador da chave para o dia corrente
 */
export async function incrementKeyUsage(service: "newsdata" | "gnews", key: string, limit = 100): Promise<ApiKeyUsage> {
  const date = getTodayDateString();
  const keyHash = hashApiKey(key);
  const docId = `${service}_${keyHash}_${date}`;
  const now = new Date().toISOString();

  let currentCount = 0;

  if (db) {
    try {
      const snap = await getDoc(doc(db, "system_api_usage", docId));
      if (snap.exists()) {
        currentCount = snap.data().count || 0;
      }
      const newCount = currentCount + 1;
      const payload: ApiKeyUsage = {
        apiKeyHash: keyHash,
        date,
        count: newCount,
        limit,
        service,
        lastUsedAt: now,
      };
      await setDoc(doc(db, "system_api_usage", docId), payload, { merge: true });
      return payload;
    } catch (e) {
      console.warn(`[apiKeyUsageTracker] Erro ao incrementar uso da API ${service}:`, e);
    }
  }

  return {
    apiKeyHash: keyHash,
    date,
    count: currentCount + 1,
    limit,
    service,
    lastUsedAt: now,
  };
}
