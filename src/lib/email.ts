/**
 * Utilitário de Envio de E-mails via Resend.
 * Somente Servidor (Node / Next.js API Routes).
 * 
 * Template de Alta Performance e Entregabilidade:
 * Inspirado em design systems de referência mundial (Linear, Vercel, Stripe, Raycast).
 * Tipografia clean, contraste balanceado, responsivo e testado em dark/light mode de clientes de e-mail.
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
 * Gera o HTML de e-mail no padrão Stripe/Linear/Vercel.
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
    ? "👑 Seu acesso VIP foi ativado no MyGameList"
    : "⚡ Seu acesso PRO foi ativado no MyGameList";

  const subject = templateOverride?.subject
    ? templateOverride.subject.replace("{username}", userName)
    : defaultSubject;

  const planName = isVip ? "Membro VIP" : "Membro PRO";
  const accentColor = isVip ? "#F59E0B" : "#10B981";
  const badgeText = templateOverride?.badgeText || (isVip ? "👑 ACESSO VIP EXCLUSIVO" : "⚡ PLANO PRO ATIVADO");
  
  const rawHeading = templateOverride?.heading || "Parabéns, {username}!";
  const heading = rawHeading.replace("{username}", escapeHtml(userName));

  const subheading =
    templateOverride?.subheading ||
    `Você agora faz parte do nível <strong>${planName}</strong> com todas as funcionalidades premium desbloqueadas.`;

  const benefits = templateOverride?.benefits?.length
    ? templateOverride.benefits
    : [
        "Zero anúncios em toda a plataforma e aplicativo",
        isVip ? "2.0x de XP em Dobro em todas as atividades" : "1.5x de XP Boost de progressão",
        "Insígnia exclusiva e destaque brilhante no perfil",
        "Estatísticas avançadas e backup completo da biblioteca",
      ];

  const ctaText = templateOverride?.ctaText || "Acessar Meu Painel →";
  const ctaUrl = templateOverride?.ctaUrl || "https://www.mygameslist.com.br/perfil";
  const displayMessage = customMessage?.trim() || templateOverride?.defaultMessage?.trim() || "";

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
  <style>
    @media only screen and (max-width: 600px) {
      .container { width: 100% !important; padding: 16px !important; }
      .card { padding: 24px 20px !important; }
      .title { font-size: 22px !important; }
      .cta-button { width: 100% !important; box-sizing: border-box !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0c0d12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #e5e7eb;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0c0d12; padding: 48px 12px;">
    <tr>
      <td align="center">
        
        <!-- Largura Máxima Padronizada (Linear / Vercel: 560px) -->
        <table role="presentation" class="container" width="100%" style="max-width: 560px; margin: 0 auto; text-align: left;">
          
          <!-- Logo / Topo Minimalista -->
          <tr>
            <td style="padding: 0 12px 28px 12px; text-align: center;">
              <a href="https://www.mygameslist.com.br" style="text-decoration: none; display: inline-flex; align-items: center; gap: 8px;">
                <span style="font-size: 17px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                  MYGAME<span style="color: #10B981;">LIST</span>
                </span>
              </a>
            </td>
          </tr>

          <!-- Card Principal com Borda Sutil e Fundo Escuro Nobre -->
          <tr>
            <td>
              <table role="presentation" class="card" width="100%" style="background-color: #13161f; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.08); padding: 36px 32px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);">
                
                <!-- Badge Superior Elegante (Pill) -->
                <tr>
                  <td>
                    <div style="display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); font-size: 11px; font-weight: 700; letter-spacing: 0.5px; color: ${accentColor}; text-transform: uppercase;">
                      ${escapeHtml(badgeText)}
                    </div>
                  </td>
                </tr>

                <!-- Título Hero -->
                <tr>
                  <td style="padding-top: 20px;">
                    <h1 class="title" style="margin: 0; font-size: 26px; font-weight: 800; color: #ffffff; letter-spacing: -0.6px; line-height: 1.25;">
                      ${heading}
                    </h1>
                    <p style="margin: 12px 0 0 0; font-size: 15px; color: #9ca3af; line-height: 1.55;">
                      ${subheading}
                    </p>
                  </td>
                </tr>

                <!-- Mensagem Personalizada da Moderação / Admin (Se houver) -->
                ${
                  displayMessage
                    ? `
                <tr>
                  <td style="padding-top: 24px;">
                    <div style="background-color: #0b0d13; border-radius: 14px; border: 1px solid rgba(255, 255, 255, 0.06); padding: 18px 20px;">
                      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #9ca3af; margin-bottom: 6px;">
                        Nota da Equipe:
                      </div>
                      <div style="font-size: 14px; color: #f3f4f6; line-height: 1.6; white-space: pre-wrap;">
                        ${escapeHtml(displayMessage)}
                      </div>
                    </div>
                  </td>
                </tr>
                `
                    : ""
                }

                <!-- Seção de Recursos Inclusos -->
                <tr>
                  <td style="padding-top: 28px;">
                    <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: #6b7280; margin-bottom: 14px;">
                      O que está incluso no seu acesso:
                    </div>

                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      ${benefits
                        .map(
                          (benefit) => `
                      <tr>
                        <td style="padding: 6px 0; vertical-align: top; width: 22px;">
                          <span style="color: #10B981; font-weight: bold; font-size: 15px; line-height: 1;">✓</span>
                        </td>
                        <td style="padding: 6px 0; font-size: 14px; color: #d1d5db; line-height: 1.45;">
                          ${escapeHtml(benefit)}
                        </td>
                      </tr>`
                        )
                        .join("")}
                    </table>
                  </td>
                </tr>

                <!-- Botão de Ação CTA (Linear Style) -->
                <tr>
                  <td style="padding-top: 32px; text-align: left;">
                    <a href="${escapeHtml(ctaUrl)}" class="cta-button" style="display: inline-block; background-color: #10B981; color: #000000; text-decoration: none; font-size: 14px; font-weight: 700; padding: 12px 28px; border-radius: 12px; text-align: center; transition: all 0.2s ease;">
                      ${escapeHtml(ctaText)}
                    </a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Rodapé Clean & Transparente -->
          <tr>
            <td style="padding: 32px 12px 0 12px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #4b5563; line-height: 1.5;">
                Você recebeu esta notificação porque sua conta foi atualizada no 
                <a href="https://www.mygameslist.com.br" style="color: #6b7280; text-decoration: underline;">MyGameList</a>.
              </p>
              <p style="margin: 6px 0 0 0; font-size: 11px; color: #374151;">
                © 2026 MyGameList. Todos os direitos reservados.
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
 * Dispara e-mail de concessão VIP/PRO estilizado com visual obsidian dark.
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
