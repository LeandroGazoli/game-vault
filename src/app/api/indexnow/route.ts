import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import { recordAuditLog } from "@/lib/firebase";
import {
  collectSitemapUrls,
  getIndexNowKey,
  getKeyLocation,
  getIndexNowState,
  normalizeIndexNowUrls,
  submitDeltaToIndexNow,
  submitToIndexNow,
} from "@/lib/indexnow";

export const dynamic = "force-dynamic";

/**
 * Autoriza a chamada por um dos dois caminhos:
 *  - admin logado (botão no painel), via Bearer <idToken>;
 *  - automação (cron/CI), via header `x-indexnow-secret` == INDEXNOW_SECRET.
 */
async function authorize(
  request: NextRequest
): Promise<
  | { ok: true; via: "admin" | "secret"; email?: string; uid?: string }
  | { ok: false; error: string; status: number }
> {
  const secret = process.env.INDEXNOW_SECRET;
  const provided =
    request.headers.get("x-indexnow-secret") ||
    new URL(request.url).searchParams.get("secret");

  if (secret && provided && provided === secret) {
    return { ok: true, via: "secret" };
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const authCheck = await requireAdminUser(request);
    if (authCheck.authenticated && authCheck.user) {
      return { ok: true, via: "admin", email: authCheck.user.email, uid: authCheck.user.uid };
    }
    return {
      ok: false,
      error: authCheck.error || "Acesso restrito a administradores.",
      status: authCheck.status,
    };
  }

  return { ok: false, error: "Credencial ausente para disparar o IndexNow.", status: 401 };
}

/**
 * GET  → status da configuração (admin) ou disparo do sitemap completo (?all=1 com secret).
 */
export async function GET(request: NextRequest) {
  const auth = await authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const params = new URL(request.url).searchParams;
  const shouldSubmitAll = params.get("all") === "1" || params.get("all") === "true";

  if (!shouldSubmitAll) {
    const state = await getIndexNowState();
    return NextResponse.json({
      configured: Boolean(getIndexNowKey()),
      keyLocation: getKeyLocation(),
      keyPreview: `${getIndexNowKey().slice(0, 6)}…${getIndexNowKey().slice(-4)}`,
      secretConfigured: Boolean(process.env.INDEXNOW_SECRET),
      endpoint: "https://api.indexnow.org/indexnow",
      delta: state,
    });
  }

  const urls = await collectSitemapUrls();
  const result = await submitToIndexNow(urls);
  return NextResponse.json(result, { status: result.ok ? 200 : 502 });
}

/**
 * POST → envia URLs específicas (`{ urls: [...] }`) ou o sitemap inteiro (`{ all: true }`).
 */
export async function POST(request: NextRequest) {
  const auth = await authorize(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  let body: any = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // Modo padrão de rotina: só as páginas de jogos registradas desde o último envio.
  if (body?.mode === "delta") {
    const result = await submitDeltaToIndexNow({
      limit: typeof body?.limit === "number" ? body.limit : undefined,
      dryRun: body?.dryRun === true,
    });

    if (result.submitted > 0 && auth.via === "admin" && auth.email) {
      await recordAuditLog({
        adminEmail: auth.email,
        adminUid: auth.uid || "",
        action: "IndexNow acionado (delta)",
        category: "settings",
        details: {
          since: result.since,
          cursor: result.cursor,
          submitted: result.submitted,
          hasMore: result.hasMore,
        },
      });
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  }

  let urls: string[] = Array.isArray(body?.urls) ? body.urls.map(String) : [];

  if (body?.all === true || urls.length === 0) {
    urls = await collectSitemapUrls();
  }

  if (urls.length === 0) {
    return NextResponse.json(
      { error: "Nenhuma URL para enviar ao IndexNow." },
      { status: 400 }
    );
  }

  // `dryRun` mostra exatamente o que seria enviado, sem notificar os buscadores.
  if (body?.dryRun === true) {
    const { valid, skipped } = normalizeIndexNowUrls(urls);
    return NextResponse.json({
      dryRun: true,
      count: valid.length,
      skipped,
      keyLocation: getKeyLocation(),
      sample: valid.slice(0, 20),
    });
  }

  try {
    const result = await submitToIndexNow(urls);
    console.log(
      `[indexnow] ${result.submitted}/${urls.length} URLs enviadas (via ${auth.via}${
        auth.email ? `: ${auth.email}` : ""
      })`
    );

    // Disparos manuais do painel ficam rastreados na auditoria; cron/CI não polui o log.
    if (auth.via === "admin" && auth.email) {
      await recordAuditLog({
        adminEmail: auth.email,
        adminUid: auth.uid || "",
        action: "IndexNow acionado",
        category: "settings",
        details: {
          requested: urls.length,
          submitted: result.submitted,
          batches: result.batches,
        },
      });
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch (error: any) {
    console.error("Erro na API /api/indexnow [POST]:", error);
    return NextResponse.json(
      { error: "Erro interno ao notificar o IndexNow." },
      { status: 500 }
    );
  }
}
