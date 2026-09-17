/**
 * Flag de manutenção — controlada pelo PAINEL ADMIN, não por variável de ambiente.
 *
 * Fica no KV (e não no Firestore) porque o middleware consulta isso em TODA requisição:
 * ler do Firestore custaria 1 leitura por request, que é exatamente o custo que a
 * manutenção na borda existe para evitar. A leitura do KV usa `cacheTtl`, então na prática
 * é servida do cache do datacenter e quase nunca vira operação de KV de verdade.
 *
 * A var MAINTENANCE_MODE continua existindo como FREIO DE EMERGÊNCIA: se estiver "true",
 * bloqueia independentemente do KV. Serve para o caso de o próprio painel estar inacessível.
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";

const KV_KEY = "maintenance_mode";
/** Tempo que o valor fica cacheado na borda. Toggle no painel leva até isso para propagar. */
const CACHE_TTL_SECONDS = 30;

type ConfigKV = {
  get: (key: string, options?: { cacheTtl?: number }) => Promise<string | null>;
  put: (key: string, value: string) => Promise<void>;
};

function getConfigKV(): ConfigKV | null {
  try {
    const { env } = getCloudflareContext();
    return ((env as Record<string, unknown>).APP_CONFIG as ConfigKV) || null;
  } catch {
    // Fora do runtime do Worker (ex.: `next build`) não há binding.
    return null;
  }
}

/** Freio de emergência por variável de ambiente. Vence o KV. */
export function isMaintenanceForcedByEnv(): boolean {
  return String(process.env.MAINTENANCE_MODE || "").toLowerCase() === "true";
}

/**
 * Estado efetivo da manutenção.
 * Falha ABERTO de propósito: se o KV estiver indisponível, o site continua no ar em vez de
 * ficar bloqueado por um problema de infraestrutura. O freio por env cobre o caso oposto.
 */
export async function isMaintenanceOn(): Promise<boolean> {
  if (isMaintenanceForcedByEnv()) return true;

  const kv = getConfigKV();
  if (!kv) return false;

  try {
    const value = await kv.get(KV_KEY, { cacheTtl: CACHE_TTL_SECONDS });
    return value === "true";
  } catch {
    return false;
  }
}

/** Grava o estado. Usado pela rota admin autenticada. */
export async function setMaintenanceFlag(enabled: boolean): Promise<boolean> {
  const kv = getConfigKV();
  if (!kv) return false;

  try {
    await kv.put(KV_KEY, enabled ? "true" : "false");
    return true;
  } catch {
    return false;
  }
}

export const MAINTENANCE_CACHE_TTL_SECONDS = CACHE_TTL_SECONDS;
