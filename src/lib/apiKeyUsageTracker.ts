/**
 * Controle de cota das chaves de API externas — SOMENTE SERVIDOR.
 * Usa o transporte REST; o SDK cliente arrasta gRPC/protobufjs para o bundle de
 * servidor e quebra no workerd. Componentes client importam apenas o tipo
 * ApiQuotaStatus daqui (via `import type`), sem carregar este módulo em runtime.
 */
import { getRestFirestore } from "./firestoreAdminRest";

const USAGE_COLLECTION = "system_api_usage";

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

  const serviceLimit = service === "newsdata" ? 200 : 100;
  const defaultUsage: ApiKeyUsage = {
    apiKeyHash: keyHash,
    date,
    count: 0,
    limit: serviceLimit,
    service,
    lastUsedAt: new Date().toISOString(),
  };

  try {
    const snap = await getRestFirestore().collection(USAGE_COLLECTION).doc(docId).get();
    if (snap.exists) {
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
export async function incrementKeyUsage(service: "newsdata" | "gnews", key: string, limit?: number): Promise<ApiKeyUsage> {
  const date = getTodayDateString();
  const keyHash = hashApiKey(key);
  const docId = `${service}_${keyHash}_${date}`;
  const now = new Date().toISOString();
  const effectiveLimit = limit ?? (service === "newsdata" ? 200 : 100);

  let currentCount = 0;

  try {
    const usageRef = getRestFirestore().collection(USAGE_COLLECTION).doc(docId);
    const snap = await usageRef.get();
    if (snap.exists) {
      currentCount = (snap.data() as ApiKeyUsage)?.count || 0;
    }
    const payload: ApiKeyUsage = {
      apiKeyHash: keyHash,
      date,
      count: currentCount + 1,
      limit: effectiveLimit,
      service,
      lastUsedAt: now,
    };
    await usageRef.set(payload, { merge: true });
    return payload;
  } catch (e) {
    console.warn(`[apiKeyUsageTracker] Erro ao incrementar uso da API ${service}:`, e);
  }

  return {
    apiKeyHash: keyHash,
    date,
    count: currentCount + 1,
    limit: effectiveLimit,
    service,
    lastUsedAt: now,
  };
}
