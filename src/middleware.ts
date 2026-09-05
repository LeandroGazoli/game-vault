import { NextRequest, NextResponse } from "next/server";
import {
  validateGamesApiRequest,
  generateAppToken,
  verifyAppToken,
} from "@/lib/apiSecurity";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|icon.svg|manifest.webmanifest|manifest.json|sw.js|offline.html).*)",
  ],
};
