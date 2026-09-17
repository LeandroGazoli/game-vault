/**
 * Camada administrativa do Firestore — SOMENTE SERVIDOR.
 *
 * Autentica com a Service Account e ignora as Security Rules do Firestore. É a
 * base de confiança para escritas sensíveis (XP/nível, plano premium) que NUNCA
 * devem ser aceitas do cliente.
 *
 * Transporte: HTTP puro contra a Firestore REST API v1 (`fetch` nativo), via o
 * shim `firestoreAdminRest`. O `firebase-admin` / `@google-cloud/firestore` NÃO
 * é mais usado aqui porque depende de gRPC + protobufjs, que quebram no isolate
 * V8 do Cloudflare Workers (workerd) — a causa dos HTTP 500 nas rotas de servidor.
 *
 * A superfície pública deste módulo (nomes, assinaturas e retornos) é idêntica à
 * anterior: nenhum consumidor precisou ser alterado.
 *
 * NÃO importe este arquivo em nenhum componente client.
 *
 * Configuração (env do host):
 *   FIREBASE_SERVICE_ACCOUNT_KEY = <conteúdo do JSON da service account>
 *   (aceita o JSON puro OU o JSON codificado em base64)
 *
 * No Cloudflare Workers, defina como secret:
 *   npx wrangler secret put FIREBASE_SERVICE_ACCOUNT_KEY
 */
import {
  getRestFirestore,
  RestFieldValue,
  type RestFirestore,
} from "./firestoreAdminRest";
import {
  getFirestoreEndpoint,
  parseServiceAccount,
  requireGoogleAccessToken,
  type ServiceAccountData,
} from "./firestoreRest";
import { verifyFirebaseIdToken } from "./firebaseAuthRest";

/** Credenciais efetivas usadas pelo adaptador REST. */
export interface AdminApp {
  projectId: string;
  clientEmail: string;
}

let cachedApp: AdminApp | null = null;

/**
 * Valida que a service account está presente e utilizável.
 * Mantido para o health check de `/api/gamification/sync` (GET).
 */
export function getAdminApp(): AdminApp {
  if (cachedApp) return cachedApp;

  const sa: ServiceAccountData | null = parseServiceAccount();
  if (!sa) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY não configurada. Adicione a chave da service account nas variáveis de ambiente do servidor."
    );
  }
  if (!sa.project_id || !sa.client_email || !sa.private_key) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY inválida: project_id, client_email e private_key são obrigatórios."
    );
  }

  cachedApp = { projectId: sa.project_id, clientEmail: sa.client_email };
  return cachedApp;
}

/** Instância do Firestore administrativo (REST). Mesma API encadeável de antes. */
export function getAdminDb(): RestFirestore {
  return getRestFirestore();
}

/** Superfície mínima de auth usada no projeto. */
export function getAdminAuth(): { verifyIdToken: typeof verifyFirebaseIdToken } {
  return { verifyIdToken: verifyFirebaseIdToken };
}

/** Verifica um Firebase ID token e retorna o uid, ou lança em caso de token inválido. */
export async function verifyIdToken(idToken: string): Promise<{ uid: string; email?: string }> {
  const decoded = await verifyFirebaseIdToken(idToken);
  return { uid: decoded.uid, email: decoded.email };
}

/** Remove chaves com valor `undefined` (o Firestore rejeita undefined). Preserva null. */
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const out: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) out[k] = v;
  }
  return out;
}

/**
 * Escreve (merge) no doc do usuário via credenciais administrativas — ignora as
 * Security Rules. Use para campos travados no cliente (plan, isPremium, hideAds,
 * gamerXp, bonusXp, ...).
 */
export async function adminSaveUserProfile(
  uid: string,
  data: Record<string, any>
): Promise<void> {
  if (!uid) throw new Error("uid ausente.");
  await getAdminDb()
    .collection("users")
    .doc(uid)
    .set(stripUndefined({ ...data, updatedAt: new Date().toISOString() }), { merge: true });
}

/** Admin: altera o plano do usuário (campos travados no cliente). */
export async function adminUpdateUserPlan(
  uid: string,
  plan: "free" | "pro" | "vip"
): Promise<void> {
  const isPremium = plan === "pro" || plan === "vip";
  await adminSaveUserProfile(uid, { plan, isPremium, hideAds: isPremium });
}

export type AdminPlanSource = "purchase" | "trial" | "courtesy" | "contributor" | "custom" | "admin";

export interface AdminGrantInput {
  plan: "free" | "pro" | "vip";
  source?: AdminPlanSource;
  label?: string | null;
  /** ISO de expiração; null = vitalício (quando plan != free) */
  premiumUntil?: string | null;
  grantedByEmail?: string | null;
}

/**
 * Admin: concede/ajusta acesso premium com tipo, rótulo e vigência (campos travados no cliente).
 * plan="free" revoga o acesso e limpa os campos de concessão.
 */
export async function adminGrantAccess(uid: string, input: AdminGrantInput): Promise<void> {
  const { plan } = input;
  if (plan === "free") {
    await adminSaveUserProfile(uid, {
      plan: "free",
      isPremium: false,
      hideAds: false,
      premiumUntil: null,
      planSource: null,
      planLabel: null,
      grantedBy: null,
      grantedAt: null,
    });
    return;
  }

  const isPremium = true;
  await adminSaveUserProfile(uid, {
    plan,
    isPremium,
    hideAds: true,
    premiumUntil: input.premiumUntil ?? null, // null = vitalício
    planSource: input.source || "admin",
    planLabel: input.label ? String(input.label).slice(0, 60) : null,
    grantedBy: input.grantedByEmail || null,
    grantedAt: new Date().toISOString(),
  });
}

/**
 * Desabilita/reabilita a conta no Firebase Auth via Identity Toolkit.
 *
 * É o que dá EFEITO REAL ao banimento: sem isso o campo `banned` era cosmético — as
 * Security Rules não o consultam, nenhuma rota o checa, e o usuário seguia com um ID token
 * válido, bastando bloquear o modal no DevTools (ou usar o SDK direto) para continuar
 * escrevendo em users, feedback, indie_games e chamando as rotas de API.
 *
 * Por que aqui e não nas rules: consultar `banned` numa rule exigiria
 * `get(/databases/$(db)/documents/users/$(uid))`, e cada `get()` de regra é cobrado como
 * leitura — encareceria TODA escrita do site. Desabilitar no Auth custa uma chamada só no
 * momento da moderação: o token do usuário deixa de ser renovável e expira em até 1h.
 */
async function setAuthAccountDisabled(uid: string, disabled: boolean): Promise<void> {
  const token = await requireGoogleAccessToken();
  const { projectId } = getFirestoreEndpoint();

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ localId: uid, disableUser: disabled }),
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Falha ao ${disabled ? "desabilitar" : "reabilitar"} a conta no Auth: ${res.status} ${detail.slice(0, 300)}`
    );
  }
}

/** Admin: aplica moderação (ban/suspensão) — campos travados no cliente. */
export async function adminUpdateUserModeration(
  uid: string,
  data: { banned?: boolean; suspended?: boolean; moderationReason?: string | null }
): Promise<void> {
  await adminSaveUserProfile(uid, { ...data, moderatedAt: new Date().toISOString() });

  // Só mexe no Auth quando `banned` foi explicitamente informado — uma suspensão isolada
  // não deve derrubar a conta.
  if (typeof data.banned === "boolean") {
    await setAuthAccountDisabled(uid, data.banned);
  }
}

/** Admin: cria notificação de sistema (global ou direcionada) */
export async function adminCreateNotification(
  data: Omit<import("./types").SystemNotification, "id" | "createdAt">
): Promise<string> {
  const docRef = getAdminDb().collection("system_notifications").doc();
  const now = new Date().toISOString();
  await docRef.set({
    ...data,
    id: docRef.id,
    createdAt: now,
  });
  return docRef.id;
}

/** Sentinelas de campo (increment, arrayUnion, serverTimestamp, delete). */
export const FieldValue = RestFieldValue;
