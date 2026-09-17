import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import {
  isMaintenanceForcedByEnv,
  setMaintenanceFlag,
  isMaintenanceOn,
  MAINTENANCE_CACHE_TTL_SECONDS,
} from "@/lib/maintenanceFlag";
import { recordAuditLogServer, updateSystemSettingsServer } from "@/lib/serverData";

export const dynamic = "force-dynamic";

/** GET — estado atual, para o painel refletir a realidade da borda (não só o Firestore). */
export async function GET(request: NextRequest) {
  const authCheck = await requireAdminUser(request);
  if (!authCheck.authenticated || !authCheck.user) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  return NextResponse.json({
    maintenanceMode: await isMaintenanceOn(),
    forcedByEnv: isMaintenanceForcedByEnv(),
    propagationSeconds: MAINTENANCE_CACHE_TTL_SECONDS,
  });
}

/**
 * POST — liga/desliga o bloqueio de verdade (o que o middleware consulta na borda).
 *
 * Grava no KV e espelha em `system/settings.maintenanceMode` para o overlay e o painel
 * continuarem coerentes. Sem isto, o toggle do painel mexia só no overlay visual — a
 * página continuava renderizando e lendo o Firestore, e crawlers ignoravam por completo.
 */
export async function POST(request: NextRequest) {
  const authCheck = await requireAdminUser(request);
  if (!authCheck.authenticated || !authCheck.user) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
  }

  const body = (await request.json().catch(() => ({}))) as { enabled?: unknown };
  if (typeof body.enabled !== "boolean") {
    return NextResponse.json(
      { error: "Campo 'enabled' (boolean) é obrigatório." },
      { status: 400 }
    );
  }
  const enabled = body.enabled;

  const saved = await setMaintenanceFlag(enabled);
  if (!saved) {
    return NextResponse.json(
      { error: "Binding APP_CONFIG (KV) indisponível — o bloqueio de borda não foi alterado." },
      { status: 503 }
    );
  }

  // Espelha no Firestore para o overlay/painel não divergirem do estado real.
  try {
    await updateSystemSettingsServer({ maintenanceMode: enabled }, authCheck.user.email);
  } catch {
    // O KV é a fonte de verdade da borda; divergir o espelho não justifica falhar a operação.
  }

  try {
    await recordAuditLogServer({
      adminEmail: authCheck.user.email,
      adminUid: authCheck.user.uid,
      action: enabled ? "Ativou modo manutenção" : "Desativou modo manutenção",
      category: "settings",
    });
  } catch {
    /* auditoria é best-effort */
  }

  return NextResponse.json({
    success: true,
    maintenanceMode: enabled,
    // Se a var estiver ligada, ela vence o KV — o admin precisa saber disso.
    forcedByEnv: isMaintenanceForcedByEnv(),
    propagationSeconds: MAINTENANCE_CACHE_TTL_SECONDS,
  });
}
