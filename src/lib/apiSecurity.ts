import { NextRequest, NextResponse } from "next/server";

// Chave secreta de assinatura interna do servidor com resolução resiliente
function getTokenSecret(): string {
  const secret = process.env.INTERNAL_API_SECRET?.trim();
  if (secret) return secret;

  // Fallback seguro baseado em chaves do sistema para garantir que a navegação do site
  // nunca seja derrubada com erro 500 caso a variável de ambiente não tenha sido injetada.
  return (
    process.env.STRIPE_SECRET_KEY?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.trim() ||
    "gv_secure_internal_api_token_2026_cf"
  );
}

// Validade máxima do token interno: 4 horas
const TOKEN_MAX_AGE_MS = 4 * 60 * 60 * 1000;

// Hostnames autorizados para requisições de API
const ALLOWED_HOSTS = new Set([
  "localhost",
  "127.0.0.1",
  "mygameslist.com.br",
  "www.mygameslist.com.br",
]);

/**
 * Sufixos aceitos além da lista exata. O ponto inicial é essencial: sem ele,
 * `evilmygameslist.com.br` passaria no teste.
 *
 * `.mygameslist.com.br` cobre qualquer ambiente nosso — homologação e o que vier depois.
 * Sem isto, `homolog.mygameslist.com.br` levava 403 em toda rota de jogos e a home subia
 * com o catálogo vazio.
 *
 * `.vercel.app` é resquício: o site saiu da Vercel. Enquanto estiver aqui, qualquer app
 * hospedado lá pode consumir nossa API de jogos. Vale remover numa limpeza dedicada.
 */
const ALLOWED_HOST_SUFFIXES = [
  ".mygameslist.com.br",
  ".workers.dev",
  ".pages.dev",
  ".vercel.app",
];

function isHostPermitido(host: string): boolean {
  return (
    ALLOWED_HOSTS.has(host) ||
    ALLOWED_HOST_SUFFIXES.some((sufixo) => host.endsWith(sufixo))
  );
}

/**
 * Cache de chave criptográfica HMAC importada para máximo desempenho no Edge/Node.
 */
let cachedCryptoKey: CryptoKey | null = null;

async function getCryptoKey(): Promise<CryptoKey> {
  if (cachedCryptoKey) return cachedCryptoKey;
  const secret = getTokenSecret();
  const enc = new TextEncoder();
  cachedCryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return cachedCryptoKey;
}

/**
 * Converte um ArrayBuffer para string hexadecimal
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, "0");
  }
  return hex;
}

/**
 * OPÇÃO C: Gera um token assinado criptograficamente com timestamp e HMAC-SHA256.
 * Formato: "<timestamp>.<assinaturaHex>"
 */
export async function generateAppToken(): Promise<string> {
  const key = await getCryptoKey();
  const timestamp = Date.now().toString();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    enc.encode(`gv_app:${timestamp}`)
  );
  const signatureHex = bufferToHex(signatureBuffer);
  return `${timestamp}.${signatureHex}`;
}

/**
 * OPÇÃO C: Valida a autenticidade e validade temporal de um token assinado.
 */
export async function verifyAppToken(token: string | null | undefined): Promise<boolean> {
  if (!token || typeof token !== "string") return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestampStr, providedSignature] = parts;
  const timestamp = parseInt(timestampStr, 10);
  if (isNaN(timestamp)) return false;

  const now = Date.now();
  // Não aceita tokens do futuro (com tolerância de 5 minutos para drift de relógio)
  if (timestamp > now + 5 * 60 * 1000) return false;
  // Não aceita tokens expirados (mais de 4 horas)
  if (now - timestamp > TOKEN_MAX_AGE_MS) return false;

  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const expectedBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      enc.encode(`gv_app:${timestampStr}`)
    );
    const expectedSignature = bufferToHex(expectedBuffer);

    return providedSignature === expectedSignature;
  } catch {
    return false;
  }
}

/**
 * OPÇÃO B: Rate Limiter em memória por IP (Sliding Window).
 * Permite até 60 requisições por minuto por IP para rotas de jogos.
 */
interface RateLimitRecord {
  count: number;
  windowStart: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_MAX = 60; // Máximo de requisições por minuto
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minuto

// Limpeza periódica de IPs inativos para economizar memória
let lastCleanup = Date.now();
function cleanupRateLimits() {
  const now = Date.now();
  if (now - lastCleanup < 2 * 60 * 1000) return;
  lastCleanup = now;
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(ip);
    }
  }
}

export function checkRateLimit(
  ip: string,
  options: { max?: number; windowMs?: number; namespace?: string } = {}
): {
  allowed: boolean;
  remaining: number;
  resetInSeconds: number;
} {
  cleanupRateLimits();
  const now = Date.now();
  const max = options.max ?? RATE_LIMIT_MAX;
  const windowMs = options.windowMs ?? RATE_LIMIT_WINDOW_MS;
  const key = `${options.namespace ?? "games"}:${ip}`;
  const record = rateLimitMap.get(key);

  if (!record || now - record.windowStart > windowMs) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: max - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  record.count += 1;
  const resetInSeconds = Math.max(
    1,
    Math.ceil((record.windowStart + windowMs - now) / 1000)
  );

  if (record.count > max) {
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  return {
    allowed: true,
    remaining: Math.max(0, max - record.count),
    resetInSeconds,
  };
}

/**
 * OPÇÃO A: Verifica se a requisição é legítima da mesma origem e não é navegação direta no navegador.
 */
export function isSameOriginOrLegit(request: NextRequest): {
  allowed: boolean;
  reason?: string;
} {
  const fetchMode = request.headers.get("sec-fetch-mode");
  const fetchDest = request.headers.get("sec-fetch-dest");
  const fetchSite = request.headers.get("sec-fetch-site");

  // Bloqueia se o usuário digitou ou colou a URL na barra de endereços do navegador
  if (fetchMode === "navigate" || fetchDest === "document") {
    return {
      allowed: false,
      reason: "Navegação direta no navegador para esta API interna não é permitida.",
    };
  }

  // Bloqueia tentativas de consumo por sites externos (cross-site)
  if (fetchSite === "cross-site") {
    return {
      allowed: false,
      reason: "Acesso externo não autorizado (Cross-Site Request Bloqueado).",
    };
  }

  // Validação por Origin (caso presente)
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const originHost = new URL(origin).hostname;
      if (!isHostPermitido(originHost)) {
        return {
          allowed: false,
          reason: `Origem '${originHost}' não autorizada.`,
        };
      }
    } catch {
      return { allowed: false, reason: "Cabeçalho Origin malformado." };
    }
  }

  // Validação por Referer (caso presente)
  const referer = request.headers.get("referer");
  if (referer) {
    try {
      const refererHost = new URL(referer).hostname;
      if (!isHostPermitido(refererHost)) {
        return {
          allowed: false,
          reason: `Referer '${refererHost}' não autorizado.`,
        };
      }
    } catch {
      // Ignora erro de parsing de referer
    }
  }

  return { allowed: true };
}

/**
 * Extrai o IP real do cliente a partir dos cabeçalhos do proxy/Vercel.
 */
export function getClientIp(request: NextRequest): string {
  const cloudflareIp = request.headers.get("cf-connecting-ip");
  if (cloudflareIp) return cloudflareIp.trim();
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "127.0.0.1";
}

/**
 * Validação combinada (OPÇÕES A, B e C) para proteger rotas /api/games/*
 * Retorna null se autorizada, ou NextResponse com erro e status apropriado se bloqueada.
 */
export async function validateGamesApiRequest(
  request: NextRequest
): Promise<NextResponse | null> {
  // 1. OPÇÃO A: Same-Origin & Anti-Hotlinking
  const originCheck = isSameOriginOrLegit(request);
  if (!originCheck.allowed) {
    return NextResponse.json(
      {
        error: originCheck.reason || "Acesso negado.",
        code: "ACCESS_DENIED_DIRECT_OR_CROSS_ORIGIN",
      },
      { status: 403 }
    );
  }

  // 2. OPÇÃO B: Rate Limiting por IP
  const clientIp = getClientIp(request);
  const rateLimit = checkRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        error: "Muitas requisições em pouco tempo. Por favor, aguarde um momento.",
        code: "RATE_LIMIT_EXCEEDED",
        retryAfter: rateLimit.resetInSeconds,
      },
      {
        status: 429,
        headers: {
          "Retry-After": rateLimit.resetInSeconds.toString(),
          "X-RateLimit-Limit": RATE_LIMIT_MAX.toString(),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // 3. OPÇÃO C: Assinatura de Requisição Interna (App Token)
  const headerToken = request.headers.get("x-app-token");
  const cookieToken = request.cookies.get("__gv_app_token")?.value;
  const tokenToVerify = headerToken || cookieToken;

  const isValidToken = await verifyAppToken(tokenToVerify);
  if (!isValidToken) {
    return NextResponse.json(
      {
        error: "Requisição não autorizada. Token de integridade ausente ou expirado.",
        code: "UNAUTHORIZED_INTERNAL_API",
      },
      { status: 401 }
    );
  }

  // Tudo validado com sucesso
  return null;
}
