/**
 * Leituras de dados para páginas renderizadas no SERVIDOR — via Firestore REST API.
 *
 * Por que este módulo existe: as páginas de servidor liam o Firestore pelo SDK
 * *cliente* (`@/lib/firebase`, `@/lib/indieService`), e isso não funciona em
 * nenhuma das duas pontas do deploy no Cloudflare:
 *
 *   - resolvido pela condição "node", o SDK usa gRPC + protobufjs, que chamam
 *     `new Function` — proibido no workerd ("Code generation from strings
 *     disallowed") e causa de HTTP 500 em produção;
 *   - resolvido para o build de browser, ele usa WebChannel (long-polling), que
 *     trava durante `next build` e estoura o timeout de 60s da geração estática.
 *
 * O transporte REST funciona nos dois ambientes e falha rápido (sem retry) quando
 * o Firestore devolve 429, em vez de segurar o build.
 *
 * As funções do SDK cliente seguem intactas para os componentes client — este
 * módulo NÃO deve ser importado de nenhum componente com "use client", porque
 * depende de APIs de servidor (Buffer) no caminho da service account.
 */
import { cache } from "react";
import { firestoreRestGet, firestoreRestQuery } from "./firestoreRest";
import { getRestFirestore } from "./firestoreAdminRest";
import type { IndieGame } from "./types/indie.types";
import { DEFAULT_SYSTEM_SETTINGS } from "./types";
import type { AuditLogEntry, SystemSettings, UserGame, UserProfile } from "./types";
import { DEFAULT_PLANS_CONFIG, type PlansConfig } from "./plans.types";
import { withSharedCache, invalidateSharedCache } from "./edgeCache";

const INDIES_COLLECTION = "indie_games";

/** Filtro de igualdade por string, no formato da structuredQuery. */
function equals(fieldPath: string, value: string) {
  return {
    fieldFilter: {
      field: { fieldPath },
      op: "EQUAL",
      value: { stringValue: value },
    },
  };
}

/**
 * Indies aprovados, ordenados por votos ou por data.
 * Espelha `fetchApprovedIndies` de indieService (inclusive a ordenação em JS,
 * que evita exigir índice composto no Firestore).
 */
export async function fetchApprovedIndiesServer(
  sortBy: "votes" | "recent" = "votes"
): Promise<IndieGame[]> {
  const games = await firestoreRestQuery<IndieGame>(INDIES_COLLECTION, {
    where: equals("status", "approved"),
  });

  if (sortBy === "votes") {
    return games.sort((a, b) => (b.votesCount || 0) - (a.votesCount || 0));
  }
  return games.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Indie por id do documento ou por slug.
 * Espelha `fetchIndieBySlug`: tenta o id direto e, não achando, consulta o campo slug.
 */
async function fetchIndieBySlugServer_uncached(slugOrId: string): Promise<IndieGame | null> {
  const direct = await firestoreRestGet<IndieGame>(INDIES_COLLECTION, slugOrId);
  if (direct) return direct;

  const bySlug = await firestoreRestQuery<IndieGame>(INDIES_COLLECTION, {
    where: equals("slug", slugOrId),
    limit: 1,
  });
  return bySlug[0] || null;
}

/**
 * Perfil público por username.
 * Espelha `getUserProfileByUsername` de firebase.ts, incluindo o fallback para
 * usernames antigos gravados com maiúsculas.
 */
async function getUserProfileByUsernameServer_uncached(
  username: string
): Promise<UserProfile | null> {
  if (!username || !username.trim()) return null;

  const raw = username.trim();
  const clean = raw.toLowerCase();

  const found = await firestoreRestQuery<UserProfile>("users", {
    where: equals("username", clean),
    limit: 1,
  });
  if (found[0]) return found[0];

  if (clean !== raw) {
    const exact = await firestoreRestQuery<UserProfile>("users", {
      where: equals("username", raw),
      limit: 1,
    });
    if (exact[0]) return exact[0];
  }

  return null;
}

/* -------------------------------------------------------------------------- */
/*  Configurações do sistema                                                   */
/* -------------------------------------------------------------------------- */

/** Espelha `getSystemSettings` de firebase.ts com cache de borda (TTL 1h). */
export async function getSystemSettingsServer(): Promise<SystemSettings> {
  return withSharedCache<SystemSettings>("system", "settings", 3600, async () => {
    try {
      const snap = await getRestFirestore().collection("system").doc("settings").get();
      if (snap.exists) {
        return { ...DEFAULT_SYSTEM_SETTINGS, ...snap.data() } as SystemSettings;
      }
    } catch (e) {
      console.error("Erro ao obter configurações do sistema:", e);
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });
}

/** Espelha `updateSystemSettings` de firebase.ts — propaga o erro e invalida o cache de borda. */
export async function updateSystemSettingsServer(
  settings: Partial<SystemSettings>,
  adminEmail: string
): Promise<void> {
  try {
    await getRestFirestore()
      .collection("system")
      .doc("settings")
      .set(
        { ...settings, updatedAt: new Date().toISOString(), updatedBy: adminEmail },
        { merge: true }
      );
    await invalidateSharedCache("system", "settings");
  } catch (e) {
    console.error("Erro ao atualizar configurações do sistema:", e);
    throw e;
  }
}

/* -------------------------------------------------------------------------- */
/*  Auditoria                                                                  */
/* -------------------------------------------------------------------------- */

/** Espelha `recordAuditLog` — nunca propaga erro, para não derrubar a ação auditada. */
export async function recordAuditLogServer(
  log: Omit<AuditLogEntry, "id" | "createdAt">
): Promise<void> {
  try {
    const docRef = getRestFirestore().collection("audit_logs").doc();
    await docRef.set({ ...log, id: docRef.id, createdAt: new Date().toISOString() });
  } catch (e) {
    console.error("Erro ao registrar log de auditoria:", e);
  }
}

/** Espelha `getAuditLogs`. */
export async function getAuditLogsServer(limitCount = 50): Promise<AuditLogEntry[]> {
  try {
    const snap = await getRestFirestore()
      .collection("audit_logs")
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();
    return snap.docs.map((d) => d.data() as AuditLogEntry);
  } catch (e) {
    console.error("Erro ao buscar logs de auditoria:", e);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*  Usuários                                                                   */
/* -------------------------------------------------------------------------- */

/** Espelha `getUserProfile`. */
export async function getUserProfileServer(userId: string): Promise<UserProfile | null> {
  if (!userId) return null;
  try {
    const snap = await getRestFirestore().collection("users").doc(userId).get();
    if (snap.exists) return snap.data() as UserProfile;
  } catch (e) {
    console.error("Erro ao buscar perfil no Firestore:", e);
  }
  return null;
}

/**
 * Espelha `getAllUsersForAdmin`, inclusive a contagem de jogos por usuário.
 *
 * Atenção de cota: é 1 leitura por usuário mais 1 agregação por usuário. A
 * agregação count() é cobrada bem mais barato que ler a subcoleção inteira,
 * mas continua sendo O(nº de usuários) em chamadas.
 */
export async function getAllUsersForAdminServer(): Promise<UserProfile[]> {
  try {
    const db = getRestFirestore();
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map((d) => d.data() as UserProfile);

    const counts = await Promise.allSettled(
      users.map(async (u) => {
        if (!u.uid) return 0;
        const agg = await db.collection("users").doc(u.uid).collection("games").count().get();
        return agg.data().count;
      })
    );

    users.forEach((u, i) => {
      const res = counts[i];
      u.gamesCount = res.status === "fulfilled" ? res.value : 0;
    });

    return users;
  } catch (e) {
    console.error("Erro ao listar usuários para o admin:", e);
    return [];
  }
}

/* -------------------------------------------------------------------------- */
/*  Biblioteca pública de um usuário                                           */
/* -------------------------------------------------------------------------- */

/**
 * Resolve um perfil a partir do UID direto ou do campo username (com fallback
 * para o username gravado com maiúsculas). Devolve também o id do documento,
 * necessário para alcançar a subcoleção de jogos.
 */
export async function resolveUserServer(
  usernameOrId: string
): Promise<{ userId: string; profile: UserProfile } | null> {
  const raw = (usernameOrId || "").trim();
  if (!raw) return null;

  const direct = await getRestFirestore().collection("users").doc(raw).get();
  if (direct.exists) {
    return { userId: direct.id, profile: direct.data() as UserProfile };
  }

  const clean = raw.toLowerCase();
  for (const candidate of clean !== raw ? [clean, raw] : [clean]) {
    const found = await firestoreRestQuery<UserProfile>("users", {
      where: equals("username", candidate),
      limit: 1,
    });
    if (found[0]) {
      return { userId: found[0].id, profile: found[0] };
    }
  }

  return null;
}

/** Todos os jogos da subcoleção users/{uid}/games. */
export async function getUserGamesServer(userId: string): Promise<UserGame[]> {
  if (!userId) return [];
  const snap = await getRestFirestore()
    .collection("users")
    .doc(userId)
    .collection("games")
    .get();
  return snap.docs.map((d) => d.data() as UserGame);
}

/* -------------------------------------------------------------------------- */
/*  Planos                                                                     */
/* -------------------------------------------------------------------------- */

const PLANS_DOC_REF = "plans_config";

/** Espelha `getPlansConfig` de plans.ts com cache de borda (TTL 1h). */
export async function getPlansConfigServer(): Promise<PlansConfig> {
  return withSharedCache<PlansConfig>("system", "plans_config", 3600, async () => {
    try {
      const snap = await getRestFirestore().collection("system").doc(PLANS_DOC_REF).get();
      if (snap.exists) {
        const data = (snap.data() || {}) as Partial<PlansConfig>;
        return {
          pro_monthly: { ...DEFAULT_PLANS_CONFIG.pro_monthly, ...data.pro_monthly },
          pro_single_month: { ...DEFAULT_PLANS_CONFIG.pro_single_month, ...data.pro_single_month },
          pro_annual: { ...DEFAULT_PLANS_CONFIG.pro_annual, ...data.pro_annual },
          vip_lifetime: { ...DEFAULT_PLANS_CONFIG.vip_lifetime, ...data.vip_lifetime },
          updatedAt: data.updatedAt,
        };
      }
    } catch (error) {
      console.error("Erro ao buscar configurações de planos no Firestore:", error);
    }
    return DEFAULT_PLANS_CONFIG;
  });
}

/** Espelha `savePlansConfig` — propaga o erro e invalida o cache de borda. */
export async function savePlansConfigServer(config: PlansConfig): Promise<boolean> {
  try {
    await getRestFirestore()
      .collection("system")
      .doc(PLANS_DOC_REF)
      .set({ ...config, updatedAt: new Date().toISOString() });
    await invalidateSharedCache("system", "plans_config");
    return true;
  } catch (error) {
    console.error("Erro ao salvar configurações de planos no Firestore:", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/*  Deduplicação por requisição                                                */
/* -------------------------------------------------------------------------- */

/**
 * `generateMetadata` e o corpo da página são executados na MESMA requisição e chamam as
 * mesmas funções — sem isto, toda página dinâmica pagava 2x as leituras do Firestore.
 * A memoização automática do Next cobre apenas `fetch` GET, o que não alcança estas
 * funções (usam POST em :runQuery).
 */
export const fetchIndieBySlugServer = cache(fetchIndieBySlugServer_uncached);
export const getUserProfileByUsernameServer = cache(getUserProfileByUsernameServer_uncached);

/* -------------------------------------------------------------------------- */
/*  PII isolada (users/{uid}/private/data)                                     */
/* -------------------------------------------------------------------------- */

/** Campos que saíram do doc público do usuário por serem dados pessoais. */
export interface UserPrivateData {
  /** Só `birthDate`. O e-mail vive no Firebase Auth — ver `listAuthUserEmails`. */
  birthDate?: string | null;
}

export const USER_PRIVATE_DOC = "data";

/**
 * Lê a PII de UM usuário. Durante a transição cai de volta no doc público, para o site não
 * quebrar enquanto a migração não rodou — a remoção dos campos do doc público é o passo que
 * de fato fecha a exposição.
 */
export async function getUserPrivateDataServer(uid: string): Promise<UserPrivateData> {
  if (!uid) return {};

  try {
    const snap = await getRestFirestore()
      .collection("users")
      .doc(uid)
      .collection("private")
      .doc(USER_PRIVATE_DOC)
      .get();
    if (snap.exists) {
      const d = snap.data() as UserPrivateData;
      if (d && d.birthDate != null) return d;
    }
  } catch (e) {
    console.warn("[serverData] Falha ao ler PII privada:", e);
  }

  // Fallback de transição.
  const legacy = await getUserProfileServer(uid);
  return { birthDate: (legacy as any)?.birthDate ?? null };
}

/** Grava a PII no doc privado. */
export async function saveUserPrivateDataServer(
  uid: string,
  data: UserPrivateData
): Promise<void> {
  if (!uid) throw new Error("uid ausente.");
  await getRestFirestore()
    .collection("users")
    .doc(uid)
    .collection("private")
    .doc(USER_PRIVATE_DOC)
    .set({ ...data, updatedAt: new Date().toISOString() }, { merge: true });
}
