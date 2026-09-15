/**
 * Serviço Centralizado de Notificações Direcionadas e E-mails (FASE 11 & FASE 13).
 * Executado SOMENTE no Servidor (Next.js API Routes e Background Jobs).
 * 
 * Unifica o envio de notificações in-app privadas (isoladas por usuário em users/{userId}/notifications)
 * e o envio simultâneo de e-mails via Resend com prevenção contra IDOR.
 */

import { getAdminDb } from "@/lib/firebaseAdmin";
import { getResendClient } from "@/lib/email";
import { NotificationCategory, SystemNotification } from "@/lib/types";

export interface TargetedNotificationInput {
  userId: string;
  title: string;
  message: string;
  category?: NotificationCategory;
  linkUrl?: string | null;
  linkLabel?: string | null;
  createdBy?: string;
  sendEmail?: boolean;
  userEmail?: string | null;
  userName?: string | null;
  emailSubject?: string;
}

export interface GroupNotificationInput {
  targetType: "all" | "vip" | "pro" | "steam_linked" | "custom_users";
  targetUserIds?: string[];
  title: string;
  message: string;
  category?: NotificationCategory;
  linkUrl?: string | null;
  linkLabel?: string | null;
  createdBy?: string;
  sendEmail?: boolean;
}

/**
 * Envia uma notificação privada e isolada para um usuário específico.
 * Grava na subcoleção users/{userId}/notifications/{id}, protegida por Firestore Rules.
 */
export async function sendTargetedNotification(input: TargetedNotificationInput): Promise<{ id: string; emailSent?: boolean }> {
  const db = getAdminDb();
  const notifRef = db.collection("users").doc(input.userId).collection("notifications").doc();
  const now = new Date().toISOString();

  const notificationData = {
    id: notifRef.id,
    userId: input.userId,
    title: input.title.trim(),
    message: input.message.trim(),
    category: input.category || "general",
    linkUrl: input.linkUrl?.trim() || null,
    linkLabel: input.linkLabel?.trim() || null,
    isRead: false,
    createdAt: now,
    createdBy: input.createdBy || "Sistema",
  };

  await notifRef.set(notificationData);

  let emailSent = false;

  // Envio opcional de E-mail via Resend
  if (input.sendEmail && input.userEmail) {
    try {
      const resend = getResendClient();
      if (resend) {
        const fromAddress = process.env.RESEND_FROM_EMAIL || "MyGameList <contato@mygameslist.com.br>";
        const subject = input.emailSubject || input.title;
        const html = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0b0d12; color: #ffffff; padding: 32px; border-radius: 16px; max-width: 580px; margin: 0 auto; border: 1px solid #222736;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
              <span style="font-size: 20px; font-weight: 900; color: #10B981; letter-spacing: -0.5px;">🎮 MyGameList</span>
            </div>
            <h2 style="font-size: 18px; font-weight: 800; color: #ffffff; margin-top: 0;">${input.title}</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #d1d5db; margin: 16px 0;">${input.message.replace(/\n/g, "<br/>")}</p>
            ${
              input.linkUrl
                ? `<div style="margin-top: 24px;">
                    <a href="${input.linkUrl.startsWith("http") ? input.linkUrl : `https://www.mygameslist.com.br${input.linkUrl}`}" style="display: inline-block; padding: 10px 22px; background: #10B981; color: #000000; font-weight: 700; font-size: 13px; text-decoration: none; border-radius: 9999px;">${input.linkLabel || "Visualizar no Site"}</a>
                  </div>`
                : ""
            }
            <hr style="border: none; border-top: 1px solid #1e2330; margin: 28px 0 16px 0;" />
            <p style="font-size: 11px; color: #6b7280; margin: 0;">Notificação de conta do Game Vault / MyGameList para @${input.userName || "Gamer"}.</p>
          </div>
        `;

        await resend.emails.send({
          from: fromAddress,
          to: [input.userEmail],
          subject,
          html,
        });
        emailSent = true;
      }
    } catch (err) {
      console.warn("[NotificationService] Falha ao enviar email:", err);
    }
  }

  return { id: notifRef.id, emailSent };
}

/**
 * Estima a quantidade de destinatários para um tipo de público antes do disparo
 */
export async function getAudienceEstimate(targetType: GroupNotificationInput["targetType"], customUserIds?: string[]): Promise<number> {
  const db = getAdminDb();

  if (targetType === "all") {
    const snap = await db.collection("users").count().get();
    return snap.data().count;
  }

  if (targetType === "vip") {
    const snap = await db.collection("users").where("plan", "==", "vip").count().get();
    return snap.data().count;
  }

  if (targetType === "pro") {
    const snap = await db.collection("users").where("plan", "==", "pro").count().get();
    return snap.data().count;
  }

  if (targetType === "steam_linked") {
    const snap = await db.collection("users").where("socialLinks.steam", ">", "").count().get();
    return snap.data().count;
  }

  if (targetType === "custom_users") {
    return customUserIds?.length || 0;
  }

  return 0;
}

/**
 * Dispara notificações para grupos de usuários ou em massa (Broadcast).
 */
export async function sendGroupNotification(input: GroupNotificationInput): Promise<{ totalSent: number; errors: number }> {
  const db = getAdminDb();

  // 1. Caso 'all': grava como notificação de sistema global
  if (input.targetType === "all") {
    const globalRef = db.collection("system_notifications").doc();
    const now = new Date().toISOString();
    await globalRef.set({
      id: globalRef.id,
      title: input.title.trim(),
      message: input.message.trim(),
      category: input.category || "general",
      linkUrl: input.linkUrl?.trim() || null,
      linkLabel: input.linkLabel?.trim() || null,
      createdAt: now,
      createdBy: input.createdBy || "Admin",
    });
    return { totalSent: 1, errors: 0 };
  }

  // 2. Busca lista de usuários para envio direcionado
  let userDocs: FirebaseFirestore.QueryDocumentSnapshot[] = [];

  if (input.targetType === "vip") {
    const snap = await db.collection("users").where("plan", "==", "vip").get();
    userDocs = snap.docs;
  } else if (input.targetType === "pro") {
    const snap = await db.collection("users").where("plan", "==", "pro").get();
    userDocs = snap.docs;
  } else if (input.targetType === "steam_linked") {
    const snap = await db.collection("users").where("socialLinks.steam", ">", "").get();
    userDocs = snap.docs;
  } else if (input.targetType === "custom_users" && input.targetUserIds?.length) {
    for (const uid of input.targetUserIds) {
      const d = await db.collection("users").doc(uid).get();
      if (d.exists) userDocs.push(d as any);
    }
  }

  let totalSent = 0;
  let errors = 0;

  for (const uDoc of userDocs) {
    try {
      const uData = uDoc.data();
      await sendTargetedNotification({
        userId: uDoc.id,
        title: input.title,
        message: input.message,
        category: input.category,
        linkUrl: input.linkUrl,
        linkLabel: input.linkLabel,
        createdBy: input.createdBy,
        sendEmail: input.sendEmail,
        userEmail: uData.email,
        userName: uData.displayName || uData.username,
      });
      totalSent++;
    } catch (err) {
      errors++;
      console.error(`[NotificationService] Erro ao enviar para ${uDoc.id}:`, err);
    }
  }

  return { totalSent, errors };
}
