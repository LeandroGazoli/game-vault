/**
 * Firebase Admin SDK — SOMENTE SERVIDOR.
 *
 * Roda no servidor Next.js (ex.: funções serverless da Vercel) e autentica com uma
 * Service Account, ignorando as Security Rules do Firestore. É a base de confiança para
 * escritas sensíveis (XP/nível, plano premium) que NUNCA devem ser aceitas do cliente.
 *
 * NÃO importe este arquivo em nenhum componente client. Ele depende de `firebase-admin`,
 * que só existe no ambiente Node.
 *
 * Configuração (env do host — Vercel → Settings → Environment Variables):
 *   FIREBASE_SERVICE_ACCOUNT_KEY = <conteúdo do JSON da service account>
 *   (aceita o JSON puro OU o JSON codificado em base64)
 */
import { cert, getApps, initializeApp, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore, FieldValue } from "firebase-admin/firestore";
import { getAuth, type Auth } from "firebase-admin/auth";

let cachedApp: App | null = null;

function parseServiceAccount(): ServiceAccount & { project_id?: string } {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw || !raw.trim()) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY não configurada. Adicione a chave da service account nas variáveis de ambiente do servidor."
    );
  }

  let jsonStr = raw.trim();
  // Suporta valor em base64 (útil para colar em painéis que não gostam de multilinha)
  if (!jsonStr.startsWith("{")) {
    try {
      jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
    } catch {
      /* segue para o parse direto abaixo, que lançará erro claro */
    }
  }

  let parsed: any;
  try {
    parsed = JSON.parse(jsonStr);
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_KEY inválida: não foi possível fazer parse do JSON.");
  }

  // Chaves privadas coladas em .env costumam vir com \n escapado
  if (typeof parsed.private_key === "string") {
    parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  }
  return parsed;
}

export function getAdminApp(): App {
  if (cachedApp) return cachedApp;
  const existing = getApps();
  if (existing.length > 0) {
    cachedApp = existing[0];
    return cachedApp;
  }
  const sa = parseServiceAccount();
  cachedApp = initializeApp({
    credential: cert(sa),
    projectId: (sa as any).project_id,
  });
  return cachedApp;
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

/** Verifica um Firebase ID token e retorna o uid, ou lança em caso de token inválido. */
export async function verifyIdToken(idToken: string): Promise<{ uid: string; email?: string }> {
  const decoded = await getAdminAuth().verifyIdToken(idToken);
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
 * Escreve (merge) no doc do usuário via Admin SDK — ignora as Security Rules.
 * Use para campos travados no cliente (plan, isPremium, hideAds, gamerXp, bonusXp, ...).
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

/** Admin: aplica moderação (ban/suspensão) — campos travados no cliente. */
export async function adminUpdateUserModeration(
  uid: string,
  data: { banned?: boolean; suspended?: boolean; moderationReason?: string | null }
): Promise<void> {
  await adminSaveUserProfile(uid, { ...data, moderatedAt: new Date().toISOString() });
}

export { FieldValue };
