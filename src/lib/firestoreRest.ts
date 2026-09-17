/**
 * Cliente REST ultraleve para Cloudflare Workers / Edge / Node.js.
 * Elimina totalmente dependências de gRPC e protobufjs no servidor.
 */

export interface ServiceAccountData {
  project_id: string;
  client_email: string;
  private_key: string;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

function base64UrlEncode(strOrBuffer: string | Uint8Array): string {
  const buf = typeof strOrBuffer === "string" ? Buffer.from(strOrBuffer, "utf8") : Buffer.from(strOrBuffer);
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** Memoiza o parse por valor bruto: getFirestoreEndpoint() é chamado a cada request. */
let cachedServiceAccount: { raw: string; parsed: ServiceAccountData | null } | null = null;

export function parseServiceAccount(): ServiceAccountData | null {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw || !raw.trim()) return null;
  if (cachedServiceAccount && cachedServiceAccount.raw === raw) return cachedServiceAccount.parsed;

  let jsonStr = raw.trim();
  if (!jsonStr.startsWith("{")) {
    try {
      jsonStr = Buffer.from(jsonStr, "base64").toString("utf8");
    } catch {
      cachedServiceAccount = { raw, parsed: null };
      return null;
    }
  }

  try {
    const parsed = JSON.parse(jsonStr);
    if (typeof parsed.private_key === "string") {
      parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
    }
    cachedServiceAccount = { raw, parsed };
    return parsed;
  } catch {
    cachedServiceAccount = { raw, parsed: null };
    return null;
  }
}

/**
 * Gera ou recupera um Google OAuth2 Access Token via troca de JWT assinado com RSA SHA-256.
 * Usa Web Crypto API nativa (crypto.subtle), compatível 100% com V8 isolates do Cloudflare.
 */
export async function getGoogleAccessToken(sa?: ServiceAccountData): Promise<string | null> {
  const nowSec = Math.floor(Date.now() / 1000);
  if (cachedToken && cachedToken.expiresAt > nowSec + 60) {
    return cachedToken.token;
  }

  const account = sa || parseServiceAccount();
  if (!account || !account.private_key || !account.client_email) {
    return null;
  }

  try {
    const header = { alg: "RS256", typ: "JWT" };
    const payload = {
      iss: account.client_email,
      sub: account.client_email,
      aud: "https://oauth2.googleapis.com/token",
      iat: nowSec,
      exp: nowSec + 3600,
      scope: "https://www.googleapis.com/auth/datastore",
    };

    const encHeader = base64UrlEncode(JSON.stringify(header));
    const encPayload = base64UrlEncode(JSON.stringify(payload));
    const signingInput = `${encHeader}.${encPayload}`;

    // Limpa delimitadores PEM
    const pemContents = account.private_key
      .replace(/-----BEGIN [A-Z ]+-----/g, "")
      .replace(/-----END [A-Z ]+-----/g, "")
      .replace(/\s+/g, "");

    const binaryDer = Buffer.from(pemContents, "base64");

    const cryptoKey = await crypto.subtle.importKey(
      "pkcs8",
      binaryDer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const sigBuffer = await crypto.subtle.sign(
      "RSASSA-PKCS1-v1_5",
      cryptoKey,
      new TextEncoder().encode(signingInput)
    );

    const encSig = base64UrlEncode(new Uint8Array(sigBuffer));
    const assertion = `${signingInput}.${encSig}`;

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion,
      }).toString(),
      signal: AbortSignal.timeout(FIRESTORE_TIMEOUT_MS),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[firestoreRest] Falha ao obter token OAuth2:", res.status, errText);
      return null;
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = {
      token: data.access_token,
      expiresAt: nowSec + (data.expires_in || 3600),
    };
    return cachedToken.token;
  } catch (err: any) {
    console.warn("[firestoreRest] Erro ao assinar JWT para OAuth2:", err?.message || err);
    return null;
  }
}

/**
 * Converte valor JS puro para objeto de formato de campo do Firestore REST API.
 */
export function jsValueToFirestore(val: any): Record<string, any> {
  if (val === null || val === undefined) return { nullValue: null };
  if (val instanceof Date) return { timestampValue: val.toISOString() };
  if (typeof val === "boolean") return { booleanValue: val };
  if (typeof val === "number") {
    return Number.isInteger(val) ? { integerValue: String(val) } : { doubleValue: val };
  }
  if (typeof val === "string") return { stringValue: val };
  if (Array.isArray(val)) {
    return { arrayValue: { values: val.map(jsValueToFirestore) } };
  }
  if (typeof val === "object") {
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (v !== undefined) fields[k] = jsValueToFirestore(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(val) };
}

/**
 * Converte campo retornado pela Firestore REST API de volta para valor JS puro.
 */
export function firestoreValueToJs(fieldObj: any): any {
  if (!fieldObj || typeof fieldObj !== "object") return null;
  if ("stringValue" in fieldObj) return fieldObj.stringValue;
  if ("booleanValue" in fieldObj) return fieldObj.booleanValue;
  if ("integerValue" in fieldObj) return parseInt(fieldObj.integerValue, 10);
  if ("doubleValue" in fieldObj) return parseFloat(fieldObj.doubleValue);
  if ("nullValue" in fieldObj) return null;
  if ("timestampValue" in fieldObj) return fieldObj.timestampValue;
  if ("arrayValue" in fieldObj) {
    return (fieldObj.arrayValue.values || []).map(firestoreValueToJs);
  }
  if ("mapValue" in fieldObj) {
    const res: Record<string, any> = {};
    const fields = fieldObj.mapValue.fields || {};
    for (const [k, v] of Object.entries(fields)) {
      res[k] = firestoreValueToJs(v);
    }
    return res;
  }
  return null;
}

export function firestoreDocToJs<T = any>(doc: any): (T & { id: string }) | null {
  if (!doc || !doc.fields) return null;
  const res: any = {};
  for (const [k, v] of Object.entries(doc.fields)) {
    res[k] = firestoreValueToJs(v);
  }
  const parts = (doc.name || "").split("/");
  res.id = parts[parts.length - 1] || "";
  return res as T & { id: string };
}

export function getFirestoreEndpoint(): { baseUrl: string; projectId: string } {
  const sa = parseServiceAccount();
  const projectId = sa?.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "gamevault-profile";
  return {
    baseUrl: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`,
    projectId,
  };
}

/**
 * Autenticação para LEITURAS públicas.
 *
 * Preferência: Bearer da service account (ignora as Security Rules). Sem ela,
 * cai para a API key pública via `?key=` — a REST API do Firestore então aplica
 * as Security Rules como usuário anônimo, que é exatamente o que as coleções
 * públicas (articles, game_translations, system) permitem. Sem nenhum dos dois
 * a API responde 401, então esse fallback evita listas vazias silenciosas.
 */
export async function buildReadRequest(
  url: string
): Promise<{ url: string; headers: Record<string, string> }> {
  const token = await getGoogleAccessToken();
  if (token) return { url, headers: { Authorization: `Bearer ${token}` } };

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (apiKey) {
    const withKey = new URL(url);
    withKey.searchParams.set("key", apiKey);
    return { url: withKey.toString(), headers: {} };
  }

  return { url, headers: {} };
}

/**
 * Executa uma structuredQuery no Firestore REST API com paginação/limite/ordenação.
 */
export async function firestoreRestQuery<T = any>(
  collectionId: string,
  structuredQuery: Record<string, any>
): Promise<(T & { id: string })[]> {
  try {
    const { projectId } = getFirestoreEndpoint();
    const endpoint = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
    const { url, headers } = await buildReadRequest(endpoint);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId }],
          ...structuredQuery,
        },
      }),
      signal: AbortSignal.timeout(FIRESTORE_TIMEOUT_MS),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.warn("[firestoreRestQuery] Erro ao consultar coleção", collectionId, res.status, errText);
      return [];
    }

    const results = (await res.json()) as any[];
    if (!Array.isArray(results)) return [];

    const items: (T & { id: string })[] = [];
    for (const item of results) {
      if (item.document) {
        const parsed = firestoreDocToJs<T>(item.document);
        if (parsed) items.push(parsed);
      }
    }
    countFirestoreReads(items.length, `query ${collectionId}`);
    return items;
  } catch (err) {
    console.warn("[firestoreRestQuery] Falha de conexão:", err);
    return [];
  }
}

/**
 * Grava ou atualiza um documento no Firestore via REST API (equivalente a set merge: true).
 */
export async function firestoreRestPatch(
  collectionPath: string,
  docId: string,
  data: Record<string, any>
): Promise<boolean> {
  try {
    const { baseUrl } = getFirestoreEndpoint();
    const token = await getGoogleAccessToken();
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const fieldMask = Object.keys(data)
      .filter((k) => data[k] !== undefined)
      .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
      .join("&");

    const url = `${baseUrl}/${collectionPath}/${encodeURIComponent(docId)}?${fieldMask}`;
    const fields: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) fields[k] = jsValueToFirestore(v);
    }

    const res = await fetch(url, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ fields }),
      signal: AbortSignal.timeout(FIRESTORE_TIMEOUT_MS),
    });

    return res.ok;
  } catch (err) {
    console.warn("[firestoreRestPatch] Falha ao atualizar doc:", err);
    return false;
  }
}

/**
 * Obtém um documento individual do Firestore via REST API.
 */
export async function firestoreRestGet<T = any>(
  collectionPath: string,
  docId: string
): Promise<(T & { id: string }) | null> {
  try {
    const { baseUrl } = getFirestoreEndpoint();
    const endpoint = `${baseUrl}/${collectionPath}/${encodeURIComponent(docId)}`;
    const { url, headers } = await buildReadRequest(endpoint);

    const res = await fetch(url, { method: "GET", headers,
      signal: AbortSignal.timeout(FIRESTORE_TIMEOUT_MS),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return firestoreDocToJs<T>(data);
  } catch (err) {
    console.warn("[firestoreRestGet] Falha ao obter doc:", err);
    return null;
  }
}



/* -------------------------------------------------------------------------- */
/*  Núcleo de transporte REST (usado pelo shim compatível com o Admin SDK)     */
/* -------------------------------------------------------------------------- */


/* -------------------------------------------------------------------------- */
/*  Contador de leituras (diagnóstico)                                         */
/* -------------------------------------------------------------------------- */

/**
 * Conta documentos lidos, para saber o custo real de um build ou de uma rota.
 * Só imprime quando FIRESTORE_READ_LOG=1 — em produção fica inerte.
 *
 * Existe porque a fatura do Firestore é por DOCUMENTO lido, e isso é invisível no código:
 * uma linha inocente como `collection.get()` pode custar dezenas de milhares.
 */
/**
 * Teto de espera para qualquer chamada ao Firestore/Google.
 *
 * Um fetch sem timeout que pendura trava a requisição INTEIRA do Worker, até o runtime
 * matá-la com "your Worker's code had hung and would never generate a response" — e o
 * cliente recebe um RSC truncado ("Connection closed."). Como isto aqui está no caminho de
 * TODA renderização de servidor, é onde mais dói.
 *
 * 10s é generoso para uma chamada que normalmente leva dezenas de ms: o objetivo é cortar o
 * pendurado, não a lentidão ocasional.
 */
const FIRESTORE_TIMEOUT_MS = 10_000;

let readCount = 0;
const READ_LOG = process.env.FIRESTORE_READ_LOG === "1";

export function countFirestoreReads(n: number, label: string): void {
  if (!READ_LOG) return;
  readCount += n;
  if (n > 0) console.log(`[firestore-reads] +${n} (${label}) — total ${readCount}`);
}

export function getFirestoreReadCount(): number {
  return readCount;
}

/** Erro de transporte com o status HTTP devolvido pela Firestore REST API. */
export class FirestoreRestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "FirestoreRestError";
    this.status = status;
  }
}

const MISSING_SA_MESSAGE =
  "FIREBASE_SERVICE_ACCOUNT_KEY não configurada. Adicione a chave da service account nas variáveis de ambiente do servidor.";

/** Igual a getGoogleAccessToken, mas lança quando a service account não está disponível. */
export async function requireGoogleAccessToken(): Promise<string> {
  const token = await getGoogleAccessToken();
  if (!token) throw new Error(MISSING_SA_MESSAGE);
  return token;
}

/** `projects/{pid}/databases/(default)/documents` — raiz de todo caminho de documento. */
export function getDocumentsRoot(): string {
  const { projectId } = getFirestoreEndpoint();
  return `projects/${projectId}/databases/(default)/documents`;
}

/** Converte `users/abc` no nome completo `projects/.../documents/users/abc`. */
export function toDocumentName(path: string): string {
  return `${getDocumentsRoot()}/${path.replace(/^\/+/, "")}`;
}

/** Extrai `users/abc` de um nome completo devolvido pela API. */
export function fromDocumentName(name: string): string {
  const marker = "/documents/";
  const idx = (name || "").indexOf(marker);
  return idx === -1 ? name || "" : name.slice(idx + marker.length);
}

/**
 * @param allowApiKey  Leituras aceitam cair para a API key pública quando não há
 *   service account — o Firestore então aplica as Security Rules como anônimo.
 *   Escritas nunca usam esse caminho: exigem a service account.
 */
async function firestoreFetch(
  url: string,
  init: RequestInit & { headers?: Record<string, string> } = {},
  allowApiKey = false
): Promise<any> {
  let target = url;
  let auth: Record<string, string> = {};

  if (allowApiKey) {
    const built = await buildReadRequest(url);
    target = built.url;
    auth = built.headers;
  } else {
    auth = { Authorization: `Bearer ${await requireGoogleAccessToken()}` };
  }

  const res = await fetch(target, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...auth,
      ...(init.headers || {}),
    },
      signal: AbortSignal.timeout(FIRESTORE_TIMEOUT_MS),
    });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new FirestoreRestError(
      `Firestore REST ${res.status}: ${detail.slice(0, 500)}`,
      res.status
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

function docUrl(path: string, query?: Record<string, string | undefined>): string {
  const { baseUrl } = getFirestoreEndpoint();
  const segments = path
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(query || {})) {
    if (v !== undefined) params.set(k, v);
  }
  const qs = params.toString();
  return `${baseUrl}/${segments}${qs ? `?${qs}` : ""}`;
}

/** URL de um método `:verbo` aplicado a um parent (vazio = raiz de documentos). */
function methodUrl(parentPath: string, method: string): string {
  const { baseUrl } = getFirestoreEndpoint();
  const clean = (parentPath || "").replace(/^\/+|\/+$/g, "");
  const suffix = clean
    ? `/${clean.split("/").map(encodeURIComponent).join("/")}`
    : "";
  return `${baseUrl}${suffix}:${method}`;
}

/** Lê um documento. Devolve `null` quando ele não existe (404). */
export async function restGetDocument(
  path: string,
  opts: { transaction?: string } = {}
): Promise<any | null> {
  try {
    const doc = await firestoreFetch(
      docUrl(path, { transaction: opts.transaction }),
      { method: "GET" },
      // Leitura dentro de transação depende da service account de qualquer forma.
      !opts.transaction
    );
    countFirestoreReads(1, `get ${path}`);
    return doc;
  } catch (err) {
    if (err instanceof FirestoreRestError && err.status === 404) return null;
    throw err;
  }
}

/**
 * Executa uma structuredQuery sob um parent arbitrário (raiz ou subcoleção)
 * e devolve os documentos crus da REST API.
 */
export async function restRunQuery(
  parentPath: string,
  structuredQuery: Record<string, any>
): Promise<any[]> {
  const data = await firestoreFetch(
    methodUrl(parentPath, "runQuery"),
    { method: "POST", body: JSON.stringify({ structuredQuery }) },
    true
  );

  if (!Array.isArray(data)) return [];
  const docs = data.filter((row) => row && row.document).map((row) => row.document);
  countFirestoreReads(docs.length, `runQuery ${parentPath || "/"}:${structuredQuery?.from?.[0]?.collectionId ?? "?"}`);
  return docs;
}

/** Roda uma aggregation query (usada por `.count()`) e devolve o total. */
export async function restCountQuery(
  parentPath: string,
  structuredQuery: Record<string, any>
): Promise<number> {
  const data = await firestoreFetch(
    methodUrl(parentPath, "runAggregationQuery"),
    {
      method: "POST",
      body: JSON.stringify({
        structuredAggregationQuery: {
          structuredQuery,
          aggregations: [{ alias: "count", count: {} }],
        },
      }),
    },
    true
  );

  if (!Array.isArray(data)) return 0;
  for (const row of data) {
    const raw = row?.result?.aggregateFields?.count;
    if (raw) return Number(firestoreValueToJs(raw)) || 0;
  }
  return 0;
}

export async function restBeginTransaction(): Promise<string> {
  const data = await firestoreFetch(methodUrl("", "beginTransaction"), {
    method: "POST",
    body: JSON.stringify({ options: { readWrite: {} } }),
  });
  return data?.transaction || "";
}

export async function restRollback(transaction: string): Promise<void> {
  try {
    await firestoreFetch(methodUrl("", "rollback"), {
      method: "POST",
      body: JSON.stringify({ transaction }),
    });
  } catch {
    /* rollback é best-effort: a transação expira sozinha no servidor */
  }
}

/** Aplica um lote de writes atomicamente (com ou sem transação). */
export async function restCommit(writes: any[], transaction?: string): Promise<void> {
  if (!writes.length && !transaction) return;
  await firestoreFetch(methodUrl("", "commit"), {
    method: "POST",
    body: JSON.stringify(transaction ? { writes, transaction } : { writes }),
  });
}

/* ----------------------------- sentinelas ----------------------------------- */

const SENTINEL = Symbol.for("gamevault.firestore.sentinel");

export type SentinelKind = "delete" | "serverTimestamp" | "increment" | "arrayUnion" | "arrayRemove";

export interface FieldSentinel {
  [SENTINEL]: true;
  kind: SentinelKind;
  value?: any;
}

export function makeSentinel(kind: SentinelKind, value?: any): FieldSentinel {
  return { [SENTINEL]: true, kind, value } as FieldSentinel;
}

export function asSentinel(val: any): FieldSentinel | null {
  return val && typeof val === "object" && (val as any)[SENTINEL] ? (val as FieldSentinel) : null;
}

/** Envolve o fieldPath em crases quando ele não é um identificador simples. */
function quoteFieldPath(path: string): string {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(path) ? path : `\`${path.replace(/`/g, "\\`")}\``;
}

export interface BuildWriteOptions {
  /** true = comportamento de `set(..., { merge: true })` (envia updateMask). */
  merge?: boolean;
  /** Pré-condição de existência do documento (usada por `update()`). */
  exists?: boolean;
}

/**
 * Monta um objeto `Write` da REST API a partir de um objeto JS.
 *
 * Observação sobre merge: o updateMask usa caminhos de primeiro nível, então um
 * campo do tipo objeto é substituído por inteiro (e não mesclado folha a folha).
 * É exatamente a semântica que os chamadores deste projeto esperam — eles gravam
 * objetos completos (template de perfil, ordem de seções, etc.).
 */
export function buildDocumentWrite(
  path: string,
  data: Record<string, any>,
  opts: BuildWriteOptions = {}
): any {
  const fields: Record<string, any> = {};
  const maskPaths: string[] = [];
  const transforms: any[] = [];

  for (const [key, value] of Object.entries(data || {})) {
    if (value === undefined) continue;

    const sentinel = asSentinel(value);
    if (!sentinel) {
      fields[key] = jsValueToFirestore(value);
      maskPaths.push(quoteFieldPath(key));
      continue;
    }

    if (sentinel.kind === "delete") {
      // Presente no mask e ausente em fields => o campo é removido.
      maskPaths.push(quoteFieldPath(key));
      continue;
    }

    const fieldPath = quoteFieldPath(key);
    if (sentinel.kind === "serverTimestamp") {
      transforms.push({ fieldPath, setToServerValue: "REQUEST_TIME" });
    } else if (sentinel.kind === "increment") {
      transforms.push({ fieldPath, increment: jsValueToFirestore(sentinel.value ?? 0) });
    } else if (sentinel.kind === "arrayUnion") {
      transforms.push({
        fieldPath,
        appendMissingElements: { values: (sentinel.value || []).map(jsValueToFirestore) },
      });
    } else if (sentinel.kind === "arrayRemove") {
      transforms.push({
        fieldPath,
        removeAllFromArray: { values: (sentinel.value || []).map(jsValueToFirestore) },
      });
    }
  }

  const write: any = { update: { name: toDocumentName(path), fields } };
  if (opts.merge) write.updateMask = { fieldPaths: maskPaths };
  if (transforms.length) write.updateTransforms = transforms;
  if (opts.exists !== undefined) write.currentDocument = { exists: opts.exists };
  return write;
}

export function buildDeleteWrite(path: string): any {
  return { delete: toDocumentName(path) };
}

/**
 * Gera um ID automático no mesmo formato do Firestore (20 chars alfanuméricos),
 * usando crypto.getRandomValues — disponível tanto em Node quanto em workerd.
 */
export function newFirestoreId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += chars[bytes[i] % chars.length];
  return out;
}
