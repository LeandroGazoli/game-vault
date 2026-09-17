/**
 * Verificação de Firebase ID Tokens compatível com Edge / Cloudflare Workers.
 *
 * Substitui `getAuth().verifyIdToken()` do firebase-admin (que arrasta
 * dependências Node-only) por uma validação RS256 local feita com a Web Crypto
 * API, usando o JWK set público do Google Secure Token Service.
 */
import { parseServiceAccount } from "./firestoreRest";

const JWK_URL =
  "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

interface CachedKeys {
  keys: Record<string, CryptoKey>;
  expiresAt: number;
}

let keyCache: CachedKeys | null = null;

export interface DecodedIdToken {
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  [claim: string]: any;
}

function base64UrlToBytes(input: string): ArrayBuffer {
  const padded = input.replace(/-/g, "+").replace(/_/g, "/");
  const buf = Buffer.from(padded, "base64");
  const bytes = new Uint8Array(buf.byteLength);
  bytes.set(buf);
  return bytes.buffer;
}

function base64UrlToJson(input: string): any {
  return JSON.parse(Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
}

export function getFirebaseProjectId(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  if (fromEnv) return fromEnv;
  const sa = parseServiceAccount();
  if (sa?.project_id) return sa.project_id;
  throw new Error("Project ID do Firebase não configurado no servidor.");
}

async function getSigningKeys(): Promise<Record<string, CryptoKey>> {
  const now = Date.now();
  if (keyCache && keyCache.expiresAt > now) return keyCache.keys;

  const res = await fetch(JWK_URL);
  if (!res.ok) {
    throw new Error(`Não foi possível obter as chaves públicas do Google (HTTP ${res.status}).`);
  }

  const body = (await res.json()) as { keys?: any[] };
  const keys: Record<string, CryptoKey> = {};

  for (const jwk of body.keys || []) {
    if (!jwk.kid) continue;
    keys[jwk.kid] = await crypto.subtle.importKey(
      "jwk",
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"]
    );
  }

  // Respeita o max-age do Google; cai para 1h quando ausente.
  const cacheControl = res.headers.get("cache-control") || "";
  const maxAge = Number(/max-age=(\d+)/.exec(cacheControl)?.[1] || 3600);
  keyCache = { keys, expiresAt: now + maxAge * 1000 };

  return keys;
}

/**
 * Valida assinatura, emissor, audiência e validade temporal de um Firebase ID Token.
 * Lança em caso de token inválido — mesmo contrato do Admin SDK.
 */
export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
  if (!idToken || typeof idToken !== "string") {
    throw new Error("ID token ausente.");
  }

  const parts = idToken.split(".");
  if (parts.length !== 3) {
    throw new Error("ID token malformado.");
  }

  const [rawHeader, rawPayload, rawSignature] = parts;

  let header: any;
  let payload: any;
  try {
    header = base64UrlToJson(rawHeader);
    payload = base64UrlToJson(rawPayload);
  } catch {
    throw new Error("ID token malformado.");
  }

  if (header.alg !== "RS256") {
    throw new Error(`Algoritmo de assinatura inesperado: ${header.alg}.`);
  }
  if (!header.kid) {
    throw new Error("ID token sem 'kid' no cabeçalho.");
  }

  const projectId = getFirebaseProjectId();
  if (payload.aud !== projectId) {
    throw new Error("ID token emitido para outro projeto Firebase.");
  }
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error("Emissor do ID token inválido.");
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const SKEW = 60; // tolerância de relógio
  if (typeof payload.exp !== "number" || payload.exp + SKEW < nowSec) {
    throw new Error("ID token expirado.");
  }
  if (typeof payload.iat === "number" && payload.iat - SKEW > nowSec) {
    throw new Error("ID token emitido no futuro.");
  }
  if (!payload.sub || typeof payload.sub !== "string") {
    throw new Error("ID token sem 'sub' válido.");
  }

  const keys = await getSigningKeys();
  const key = keys[header.kid];
  if (!key) {
    throw new Error("Chave pública do ID token não encontrada (kid desconhecido).");
  }

  const valid = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlToBytes(rawSignature),
    new TextEncoder().encode(`${rawHeader}.${rawPayload}`)
  );

  if (!valid) {
    throw new Error("Assinatura do ID token inválida.");
  }

  return { ...payload, uid: payload.sub };
}
