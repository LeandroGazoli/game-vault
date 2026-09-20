/**
 * Tipagens para o Módulo de Contato e Leads
 */

export type ContactSubject = "duvida" | "sugestao" | "bug" | "imprensa" | "privacidade";

export type ContactStatus = "novo" | "lido" | "respondido" | "arquivado";

export interface ContactMessage {
  id: string;
  nome: string;
  email: string;
  assunto: ContactSubject;
  mensagem: string;
  status: ContactStatus;
  canal?: "formulario" | "email_direto";
  destinatario?: string; // ex: contato@mygameslist.com.br ou parcerias@mygameslist.com.br
  createdAt: string; // ISO date string
  updatedAt?: string;
  readAt?: string;
  respondedAt?: string;
  responseSubject?: string;
  responseMessage?: string;
  respondedBy?: string; // Admin email/name
  userAgent?: string;
  ip?: string;
}

export const CONTACT_SUBJECT_LABELS: Record<ContactSubject, { label: string; color: string }> = {
  duvida: { label: "Dúvida ou Suporte", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
  sugestao: { label: "Sugestão / Novo Jogo", color: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  bug: { label: "Problema Técnico / Bug", color: "text-rose-400 bg-rose-500/10 border-rose-500/30" },
  imprensa: { label: "Imprensa & Parcerias", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30" },
  privacidade: { label: "Privacidade (LGPD)", color: "text-purple-400 bg-purple-500/10 border-purple-500/30" },
};
