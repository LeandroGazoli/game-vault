import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyIdToken, adminSaveUserProfile } from "@/lib/firebaseAdmin";
import { resolveSteamId64, getSteamPlayerSummary, getSteamOwnedGames, getSteamApiKey } from "@/lib/steam";
import { sendTargetedNotification } from "@/lib/notificationsService";

const ADMIN_EMAILS = ["leandro.gazolig@gmail.com"];

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const { uid, email } = await verifyIdToken(token);
    if (!email || !ADMIN_EMAILS.includes(email)) {
      return NextResponse.json({ error: "Acesso negado. Apenas administradores podem executar a auditoria." }, { status: 403 });
    }

    const db = getAdminDb();
    const apiKey = getSteamApiKey();

    // 1. Busca todos os usuários com Steam vinculada
    const usersSnap = await db.collection("users").get();
    const steamUsers = usersSnap.docs
      .map((doc) => ({ uid: doc.id, ...doc.data() }))
      .filter((u: any) => u.socialLinks?.steam && String(u.socialLinks.steam).trim().length > 0);

    const auditResults = {
      totalAudited: steamUsers.length,
      valid: 0,
      privateProfiles: 0,
      invalidAccounts: 0,
      notificationsSent: 0,
      errors: [] as { uid: string; username: string; steamInput: string; reason: string }[],
    };

    const now = new Date();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    for (const u of steamUsers as any[]) {
      const steamInput = String(u.socialLinks.steam).trim();
      let errorReason: string | null = null;

      try {
        // Resolve Steam ID
        const steamId64 = await resolveSteamId64(steamInput, apiKey);
        if (!steamId64) {
          errorReason = "Conta Steam não encontrada (ID ou link inválido).";
          auditResults.invalidAccounts++;
        } else {
          // Checa perfil e visibilidade da biblioteca
          const [profile, gamesResult] = await Promise.all([
            getSteamPlayerSummary(steamId64, apiKey),
            getSteamOwnedGames(steamId64, apiKey),
          ]);

          if (!profile.personaname && !profile.avatarUrl) {
            errorReason = "Dados cadastrais da Steam inacessíveis.";
            auditResults.invalidAccounts++;
          } else if (gamesResult.isPrivate) {
            errorReason = "Biblioteca de jogos da Steam configurada como Privada.";
            auditResults.privateProfiles++;
          } else {
            auditResults.valid++;
          }
        }
      } catch (err: any) {
        errorReason = `Falha de conexão com a Steam: ${err.message}`;
      }

      // Se detectou erro, registra e comunica o usuário afetado
      if (errorReason) {
        auditResults.errors.push({
          uid: u.uid,
          username: u.username || u.displayName || u.uid,
          steamInput,
          reason: errorReason,
        });

        // Prevenção de duplicidade: só notifica se não tiver notificado nos últimos 7 dias
        const lastAlert = u.lastSteamAuditAlertAt ? new Date(u.lastSteamAuditAlertAt).getTime() : 0;
        if (now.getTime() - lastAlert > SEVEN_DAYS_MS) {
          await sendTargetedNotification({
            userId: u.uid,
            title: "Atenção com sua integração Steam",
            message: `Identificamos uma inconsistência na sua conta Steam vinculada: ${errorReason}. Acesse as configurações para atualizar seu link ou torná-lo público.`,
            category: "update",
            linkUrl: "/perfil/editar?tab=socials",
            linkLabel: "Revisar Integração",
            createdBy: "Auditoria do Sistema",
            sendEmail: Boolean(u.email),
            userEmail: u.email,
            userName: u.displayName || u.username,
            emailSubject: "⚠️ Ajuste necessário na sua integração Steam - MyGameList",
          });

          await adminSaveUserProfile(u.uid, {
            lastSteamAuditAlertAt: now.toISOString(),
            steamSyncStatus: "error",
            steamSyncError: errorReason,
          });

          auditResults.notificationsSent++;
        }
      } else {
        // Marca como sincronização saudável
        if (u.steamSyncStatus === "error") {
          await adminSaveUserProfile(u.uid, {
            steamSyncStatus: "healthy",
            steamSyncError: null,
          });
        }
      }

      // Delay de 200ms para evitar rate limiting na Steam API
      await new Promise((r) => setTimeout(r, 200));
    }

    // 2. Grava registro na trilha de auditoria administrativa
    const auditLogRef = db.collection("audit_logs").doc();
    await auditLogRef.set({
      id: auditLogRef.id,
      adminEmail: email,
      action: "Auditoria Periódica da Steam",
      createdAt: now.toISOString(),
      details: auditResults,
    });

    return NextResponse.json({
      success: true,
      results: auditResults,
    });
  } catch (error: any) {
    console.error("[Steam Audit API] Erro na auditoria:", error);
    return NextResponse.json({ error: error?.message || "Erro interno na auditoria." }, { status: 500 });
  }
}
