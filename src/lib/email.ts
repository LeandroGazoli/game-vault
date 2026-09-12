/**
 * Utilitário de Envio de E-mails via Resend.
 * Somente Servidor (Node / Next.js API Routes).
 */

import { Resend } from "resend";
import { EmailTemplateConfig } from "./types";

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[Email] RESEND_API_KEY não configurada no ambiente.");
    return null;
  }
  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

export interface SendVipWelcomeEmailParams {
  to: string;
  userName: string;
  plan: "vip" | "pro";
  customSubject?: string;
  customMessage?: string;
  lifetime?: boolean;
  templateOverride?: EmailTemplateConfig;
}

/**
 * Gera o HTML do e-mail com base nas opções e configurações do template.
 */
export function generateEmailHtml({
  userName,
  plan,
  customMessage,
  templateOverride,
}: {
  userName: string;
  plan: "vip" | "pro";
  customMessage?: string;
  templateOverride?: EmailTemplateConfig;
}): { html: string; subject: string } {
  const isVip = plan === "vip";
  const defaultSubject = isVip
    ? "👑 Você recebeu acesso VIP no MyGameList!"
    : "⚡ Seu acesso PRO foi ativado no MyGameList!";

  const subject = templateOverride?.subject
    ? templateOverride.subject.replace("{username}", userName)
    : defaultSubject;

  const badgeText =
    templateOverride?.badgeText || (isVip ? "👑 ACESSO VIP CONCEDIDO" : "⚡ ACESSO PRO ATIVADO");
  const badgeColor = templateOverride?.accentColor || (isVip ? "#F59E0B" : "#00E5FF");
  const badgeBg = isVip ? "rgba(245, 158, 11, 0.15)" : "rgba(0, 229, 255, 0.15)";

  const rawHeading = templateOverride?.heading || "Parabéns, {username}!";
  const heading = rawHeading.replace("{username}", escapeHtml(userName));

  const planName = isVip ? "VIP Vitalício" : "PRO";
  const subheading =
    templateOverride?.subheading ||
    `Você acabou de receber acesso exclusivo de nível <strong>${planName}</strong> no MyGameList.`;

  const benefits = templateOverride?.benefits?.length
    ? templateOverride.benefits
    : [
        "Zero Anúncios em toda a plataforma",
        isVip ? "2.0x de XP em Dobro para subir de nível" : "1.5x de XP Boost nas atividades",
        "Insígnia Dourada e destaque exclusivo no seu perfil",
        "Estatísticas Avançadas e backup total da sua biblioteca",
      ];

  const ctaText = templateOverride?.ctaText || "Acessar Meu Perfil VIP →";
  const ctaUrl = templateOverride?.ctaUrl || "https://www.mygameslist.com.br/perfil";
  const displayMessage = customMessage?.trim() || templateOverride?.defaultMessage?.trim() || "";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0d12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f3f4f6;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0d12; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Container Principal -->
        <table role="presentation" width="100%" style="max-width: 580px; background-color: #141822; border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
          
          <!-- Banner Superior / Header -->
          <tr>
            <td style="padding: 32px 32px 24px 32px; text-align: center; background: radial-gradient(circle at top, rgba(16, 185, 129, 0.15), transparent 70%);">
              <div style="display: inline-block; padding: 8px 16px; border-radius: 9999px; background-color: ${badgeBg}; border: 1px solid ${badgeColor}; color: ${badgeColor}; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px;">
                ${escapeHtml(badgeText)}
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                ${heading}
              </h1>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #9ca3af; line-height: 1.5;">
                ${subheading}
              </p>
            </td>
          </tr>

          <!-- Mensagem Personalizada do Admin (se houver) -->
          ${
            displayMessage
              ? `
          <tr>
            <td style="padding: 0 32px 24px 32px;">
              <div style="background-color: rgba(255, 255, 255, 0.04); border-left: 3px solid ${badgeColor}; padding: 16px 20px; border-radius: 12px;">
                <div style="font-size: 11px; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                  Mensagem da Moderação:
                </div>
                <div style="font-size: 14px; color: #e5e7eb; line-height: 1.6; white-space: pre-wrap;">
                  ${escapeHtml(displayMessage)}
                </div>
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Benefícios Inclusos -->
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <div style="background-color: #0f121a; border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.05); padding: 20px;">
                <h3 style="margin: 0 0 14px 0; font-size: 13px; font-weight: 700; color: #d1d5db; text-transform: uppercase; letter-spacing: 0.5px;">
                  Vantagens Ativadas na sua Conta:
                </h3>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${benefits
                    .map(
                      (b) => `
                  <tr>
                    <td style="padding: 6px 0; font-size: 13px; color: #d1d5db;">
                      ✨ ${escapeHtml(b)}
                    </td>
                  </tr>`
                    )
                    .join("")}
                </table>
              </div>

              <!-- Botão CTA -->
              <div style="text-align: center; margin-top: 28px;">
                <a href="${escapeHtml(ctaUrl)}" style="display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: #ffffff; text-decoration: none; font-weight: 800; font-size: 14px; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 10px 25px rgba(16, 185, 129, 0.3);">
                  ${escapeHtml(ctaText)}
                </a>
              </div>
            </td>
          </tr>

          <!-- Rodapé -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0b0d12; border-top: 1px solid rgba(255, 255, 255, 0.05); text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #6b7280;">
                MyGameList • O cofre definitivo para o seu catálogo gamer.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 10px; color: #4b5563;">
                Este e-mail foi enviado automaticamente após a concessão de privilégios de acesso.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { html, subject };
}

/**
 * Dispara e-mail de concessão VIP/PRO estilizado com visual obsidian dark e verde esmeralda / dourado.
 */
export async function sendVipWelcomeEmail({
  to,
  userName,
  plan,
  customSubject,
  customMessage,
  templateOverride,
}: SendVipWelcomeEmailParams): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: "Serviço de e-mail não configurado." };
    }

    const { html, subject: generatedSubject } = generateEmailHtml({
      userName,
      plan,
      customMessage,
      templateOverride,
    });

    const finalSubject = customSubject?.trim() || generatedSubject;
    const fromAddress = process.env.RESEND_FROM_EMAIL || "MyGameList <contato@mygameslist.com.br>";

    const data = await resend.emails.send({
      from: fromAddress,
      to: [to],
      subject: finalSubject,
      html,
    });

    if (data.error) {
      console.error("[Email Resend Error]:", data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error("[Email Dispatch Exception]:", err);
    return { success: false, error: err?.message || "Erro desconhecido ao despachar e-mail." };
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
