import { NextRequest, NextResponse } from "next/server";
import {
  validateGamesApiRequest,
  generateAppToken,
  verifyAppToken,
} from "@/lib/apiSecurity";
import { isMaintenanceOn } from "@/lib/maintenanceFlag";

/**
 * Modo de manutenção APLICADO NA BORDA.
 *
 * O `MaintenanceOverlay` é um componente client: ele desenha uma tela por cima, mas a
 * página já renderizou no servidor e o app já inicializou — AuthContext, os listeners de
 * `system/settings`, o NotificationBell e a home continuam lendo o Firestore. E crawlers
 * ignoram o overlay por completo. Resultado observado: 76k leituras até as 9h com o site
 * "bloqueado".
 *
 * Aqui o corte acontece antes de qualquer renderização, custando ZERO leitura do Firestore.
 * O estado vem do KV (ver src/lib/maintenanceFlag.ts), alternável pelo painel admin.
 */

/** Caminhos que seguem acessíveis durante a manutenção (admin precisa entrar e desligar). */
const MAINTENANCE_ALLOWLIST = [
  "/admin",
  "/api/admin", // inclui /api/admin/maintenance, que é como o painel desliga o bloqueio
  "/api/auth",
  "/login",
  "/_next",
  "/offline.html",
];

const MAINTENANCE_HTML = `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Em manutencao - MyGameList</title>
<style>body{background:#0b0d11;color:#f0f2f5;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;padding:24px}h1{font-size:20px;margin:0 0 8px}p{color:#9ca3af;font-size:14px;margin:0}</style>
</head><body><div><h1>Estamos em manutencao</h1><p>Voltamos em instantes.</p></div></body></html>`;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    !MAINTENANCE_ALLOWLIST.some((p) => pathname.startsWith(p)) &&
    (await isMaintenanceOn())
  ) {
    // 503 + Retry-After é o que crawler entende: ele volta depois em vez de
    // desindexar, e para de bater no sitemap enquanto isso.
    return new NextResponse(MAINTENANCE_HTML, {
      status: 503,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Retry-After": "3600",
        "Cache-Control": "no-store",
      },
    });
  }

  // 1. Intercepta e protege estritamente todas as rotas internas /api/games/*
  // Aplica as Opções A (Same-Origin & Anti-Direct Access), B (Rate Limit) e C (App Token)
  if (pathname.startsWith("/api/games")) {
    const blockResponse = await validateGamesApiRequest(request);
    if (blockResponse) {
      return blockResponse;
    }
    return NextResponse.next();
  }

  // 2. Para requisições de páginas HTML navegadas pelo usuário:
  // Garante que o cookie seguro __gv_app_token esteja sempre presente e válido
  const response = NextResponse.next();
  const existingCookieToken = request.cookies.get("__gv_app_token")?.value;
  const isCookieValid = await verifyAppToken(existingCookieToken);

  if (!isCookieValid) {
    const newToken = await generateAppToken();
    response.cookies.set("__gv_app_token", newToken, {
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 4 * 60 * 60, // 4 horas
      httpOnly: false, // Permite que o frontend leia para enviar no cabeçalho x-app-token
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt, icon.svg, manifest.webmanifest, manifest.json, sw.js, offline.html
     * - a chave de verificacao do IndexNow na raiz (<32 hex>.txt), que precisa ser
     *   servida crua para Bing/Yandex validarem a posse do dominio
     */
    // sitemap.xml e robots.txt PRECISAM passar por aqui: são justamente o que os
    // crawlers pedem, e o sitemap é a rota mais cara do site em leituras do Firestore.
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|manifest.json|sw.js|offline.html|[a-f0-9]{32}\.txt).*)",
  ],
};
