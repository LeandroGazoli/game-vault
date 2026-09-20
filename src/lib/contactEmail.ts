/**
 * Utilitário de disparo de e-mails para Contato e Leads via Resend.
 * Somente Servidor (Node / Next.js API Routes).
 */

import { getResendClient } from "./email";
import { ContactSubject, CONTACT_SUBJECT_LABELS } from "./types/contact.types";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export interface SendContactNotificationParams {
  id: string;
  nome: string;
  email: string;
  assunto: ContactSubject;
  mensagem: string;
  createdAt: string;
}

/**
 * Envia notificação ao administrador quando um novo contato/lead é recebido pelo site.
 */
export async function sendContactNotificationToAdmin(params: SendContactNotificationParams) {
  try {
    const resend = getResendClient();
    if (!resend) {
      console.warn("[ContactEmail] Resend não inicializado, ignorando envio.");
      return { success: false, error: "Resend não configurado" };
    }

    const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || "leandro.gazoli@outlook.com";
    const fromAddress = process.env.RESEND_FROM_EMAIL || "MyGameList <contato@mygameslist.com.br>";
    const subjectLabel = CONTACT_SUBJECT_LABELS[params.assunto]?.label || params.assunto;

    const subject = `📬 Novo Contato [${subjectLabel}]: ${params.nome}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0d12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    .card { max-width: 600px; margin: 24px auto; background-color: #141822; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; overflow: hidden; padding: 32px 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-size: 22px; font-weight: 800; color: #ffffff; margin: 0 0 8px 0; }
    p { margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #94a3b8; }
    .meta-box { background: rgba(0, 0, 0, 0.3); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 16px; padding: 16px; margin: 20px 0; }
    .meta-item { margin-bottom: 8px; font-size: 13px; color: #cbd5e1; }
    .meta-item strong { color: #ffffff; }
    .message-box { background: rgba(16, 185, 129, 0.03); border: 1px solid rgba(16, 185, 129, 0.2); border-radius: 16px; padding: 20px; font-size: 14px; color: #f1f5f9; white-space: pre-wrap; line-height: 1.6; }
    .btn { display: inline-block; background-color: #10b981; color: #000000; font-size: 14px; font-weight: 800; text-decoration: none; padding: 12px 24px; border-radius: 14px; margin-top: 24px; }
    .btn-secondary { display: inline-block; background-color: rgba(255,255,255,0.08); color: #ffffff; font-size: 13px; font-weight: 600; text-decoration: none; padding: 12px 20px; border-radius: 14px; margin-top: 24px; margin-left: 8px; }
    .footer { margin-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">NOVO LEAD / CONTATO RECEBIDO</div>
    <h1>${escapeHtml(params.nome)} enviou uma mensagem</h1>
    <p>Uma nova mensagem foi enviada através do formulário de contato do MyGameList.</p>

    <div class="meta-box">
      <div class="meta-item"><strong>Remetente:</strong> ${escapeHtml(params.nome)} &lt;${escapeHtml(params.email)}&gt;</div>
      <div class="meta-item"><strong>Finalidade:</strong> ${escapeHtml(subjectLabel)}</div>
      <div class="meta-item"><strong>Data:</strong> ${new Date(params.createdAt).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</div>
    </div>

    <p style="margin-bottom: 6px; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #10b981;">Conteúdo da Mensagem:</p>
    <div class="message-box">${escapeHtml(params.mensagem)}</div>

    <div style="margin-top: 16px;">
      <a href="https://www.mygameslist.com.br/admin/contatos" class="btn">Abrir no Painel Admin →</a>
      <a href="mailto:${escapeHtml(params.email)}?subject=Re: Contato MyGameList - ${encodeURIComponent(subjectLabel)}" class="btn-secondary">Responder via E-mail</a>
    </div>

    <div class="footer">
      MyGameList Central de Contatos • Mensagem ID: ${escapeHtml(params.id)}
    </div>
  </div>
</body>
</html>
`;

    const data = await resend.emails.send({
      from: fromAddress,
      to: [adminEmail],
      replyTo: params.email,
      subject,
      html,
    });

    if (data.error) {
      console.error("[ContactEmail] Erro ao enviar notificação Resend:", data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error("[ContactEmail] Exceção ao enviar notificação:", err);
    return { success: false, error: err?.message || "Falha no envio de notificação" };
  }
}

export interface SendContactReplyParams {
  toEmail: string;
  toName: string;
  originalSubject: string;
  originalMessage: string;
  replySubject: string;
  replyMessage: string;
}

/**
 * Envia uma resposta do admin diretamente ao lead/usuário via Resend.
 */
export async function sendContactReplyToUser(params: SendContactReplyParams) {
  try {
    const resend = getResendClient();
    if (!resend) {
      return { success: false, error: "Resend não configurado" };
    }

    const fromAddress = process.env.RESEND_FROM_EMAIL || "MyGameList <contato@mygameslist.com.br>";
    const subject = params.replySubject || `Re: Sua mensagem ao MyGameList`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(subject)}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #0b0d12; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #e2e8f0; }
    .card { max-width: 600px; margin: 24px auto; background-color: #141822; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; overflow: hidden; padding: 32px 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-bottom: 16px; }
    h1 { font-size: 20px; font-weight: 800; color: #ffffff; margin: 0 0 12px 0; }
    p { margin: 0 0 16px 0; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
    .reply-box { background: rgba(255, 255, 255, 0.03); border-left: 3px solid #10b981; border-radius: 8px; padding: 18px; margin: 20px 0; font-size: 14px; color: #ffffff; white-space: pre-wrap; line-height: 1.6; }
    .original-box { background: rgba(0, 0, 0, 0.25); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 14px; margin-top: 24px; font-size: 12px; color: #94a3b8; }
    .footer { margin-top: 32px; border-top: 1px solid rgba(255, 255, 255, 0.05); padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">RESPOSTA OFICIAL MYGAMELIST</div>
    <h1>Olá, ${escapeHtml(params.toName)}!</h1>
    <p>Nossa equipe analisou sua mensagem enviada através da nossa central de contato. Confira nosso retorno abaixo:</p>

    <div class="reply-box">${escapeHtml(params.replyMessage)}</div>

    <div class="original-box">
      <div style="font-weight: bold; margin-bottom: 6px; color: #cbd5e1;">Sua mensagem original:</div>
      <div style="white-space: pre-wrap;">${escapeHtml(params.originalMessage)}</div>
    </div>

    <div class="footer">
      MyGameList • <a href="https://www.mygameslist.com.br" style="color: #10b981; text-decoration: none;">www.mygameslist.com.br</a><br/>
      Caso precise de mais informações, você pode responder diretamente a este e-mail.
    </div>
  </div>
</body>
</html>
`;

    const data = await resend.emails.send({
      from: fromAddress,
      to: [params.toEmail],
      replyTo: "contato@mygameslist.com.br",
      subject,
      html,
    });

    if (data.error) {
      console.error("[ContactEmail] Erro ao enviar resposta Resend:", data.error);
      return { success: false, error: data.error.message };
    }

    return { success: true, id: data.data?.id };
  } catch (err: any) {
    console.error("[ContactEmail] Exceção ao enviar resposta:", err);
    return { success: false, error: err?.message || "Falha no envio de resposta" };
  }
}
