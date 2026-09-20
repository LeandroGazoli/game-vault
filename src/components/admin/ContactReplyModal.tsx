"use client";

import React, { useState } from "react";
import { ContactMessage } from "@/lib/types/contact.types";
import { X, Send, Mail, User, Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";

interface ContactReplyModalProps {
  message: ContactMessage | null;
  onClose: () => void;
  onReplied: (updated: { id: string; responseSubject: string; responseMessage: string }) => void;
  getIdToken: () => Promise<string | null>;
}

export default function ContactReplyModal({
  message,
  onClose,
  onReplied,
  getIdToken,
}: ContactReplyModalProps) {
  const [subject, setSubject] = useState(
    message ? `Re: Sua mensagem ao MyGameList - ${message.assunto}` : ""
  );
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!message) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) {
      setError("Digite a mensagem de resposta.");
      triggerWarningHaptic();
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      const token = await getIdToken();
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");

      const res = await fetch("/api/admin/contatos/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: message.id,
          subject: subject.trim(),
          message: replyText.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Falha ao enviar resposta.");
      }

      triggerSuccessHaptic();
      onReplied({
        id: message.id,
        responseSubject: subject.trim(),
        responseMessage: replyText.trim(),
      });
      onClose();
    } catch (err: any) {
      console.error("Erro ao responder mensagem:", err);
      setError(err?.message || "Erro desconhecido ao enviar resposta.");
      triggerWarningHaptic();
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-3xl bg-[#141822] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Responder Mensagem</h3>
              <p className="text-xs text-gray-400">
                Dispara e-mail oficial via Resend para {message.nome} &lt;{message.email}&gt;
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Mensagem Original */}
          <div className="rounded-2xl bg-black/40 border border-white/5 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-semibold text-gray-300">Mensagem de {message.nome}:</span>
              <span>{new Date(message.createdAt).toLocaleDateString("pt-BR")}</span>
            </div>
            <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
              {message.mensagem}
            </p>
          </div>

          {/* Formulário de Resposta */}
          <form onSubmit={handleSend} id="reply-form" className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Assunto do E-mail</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300">Mensagem de Resposta</label>
              <textarea
                rows={6}
                required
                placeholder="Olá, obrigado por entrar em contato conosco!..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white text-xs placeholder:text-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none leading-relaxed"
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-300 hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="reply-form"
            disabled={isSending}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Enviando Resposta...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" /> Enviar Resposta via Resend
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
