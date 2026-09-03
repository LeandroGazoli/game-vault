import { NextRequest } from "next/server";
import { ADMIN_EMAILS } from "./types";

export interface AuthenticatedUser {
  uid: string;
  email: string;
  emailVerified: boolean;
  displayName?: string;
}

export interface AuthResult {
  authenticated: boolean;
  user?: AuthenticatedUser;
  error?: string;
  status: number;
}

/**
 * Extrai e valida o Firebase ID Token enviado no cabeçalho Authorization.
 * Valida a integridade, expiração e revogação diretamente junto à API oficial do Google Identity Toolkit.
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<AuthResult> {
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      authenticated: false,
      error: "Cabeçalho de autorização ausente ou malformado. Use 'Bearer <idToken>'.",
      status: 401,
    };
  }

  const idToken = authHeader.split(" ")[1]?.trim();
  if (!idToken) {
    return {
      authenticated: false,
      error: "Token de acesso ausente.",
      status: 401,
    };
  }

  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!apiKey) {
    console.error("[serverAuth] NEXT_PUBLIC_FIREBASE_API_KEY não configurada no servidor.");
    return {
      authenticated: false,
      error: "Configuração de autenticação indisponível no servidor.",
      status: 500,
    };
  }

  try {
    const lookupUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`;
    const response = await fetch(lookupUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData?.error?.message || "Token inválido";
      return {
        authenticated: false,
        error: `Falha na verificação da sessão: ${message}`,
        status: 401,
      };
    }

    const data = await response.json();
    const userRecord = data?.users?.[0];

    if (!userRecord || !userRecord.localId) {
      return {
        authenticated: false,
        error: "Usuário não encontrado para este token.",
        status: 401,
      };
    }

    const user: AuthenticatedUser = {
      uid: userRecord.localId,
      email: (userRecord.email || "").toLowerCase(),
      emailVerified: Boolean(userRecord.emailVerified),
      displayName: userRecord.displayName,
    };

    return {
      authenticated: true,
      user,
      status: 200,
    };
  } catch (error: any) {
    console.error("[serverAuth] Erro ao validar token com Google Identity Toolkit:", error);
    return {
      authenticated: false,
      error: "Erro de comunicação ao verificar credenciais.",
      status: 500,
    };
  }
}

/**
 * Garante que a requisição seja proveniente de um administrador autenticado e com e-mail verificado.
 */
export async function requireAdminUser(request: NextRequest): Promise<AuthResult> {
  const authCheck = await getAuthenticatedUser(request);
  if (!authCheck.authenticated || !authCheck.user) {
    return authCheck;
  }

  const { user } = authCheck;

  if (!user.emailVerified) {
    return {
      authenticated: false,
      error: "Acesso administrativo requer e-mail verificado.",
      status: 403,
    };
  }

  if (!ADMIN_EMAILS.includes(user.email)) {
    return {
      authenticated: false,
      error: "Acesso não autorizado. Esta área requer permissões de administrador.",
      status: 403,
    };
  }

  return {
    authenticated: true,
    user,
    status: 200,
  };
}
