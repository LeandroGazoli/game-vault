"use client";

import React from "react";
import { AlertTriangle, Send, X, Mail, Bell, Loader2 } from "lucide-react";
import { NotificationCategory, GroupNotificationInput } from "@/lib/types";

interface AdminNotificationConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSending: boolean;
  title: string;
  message: string;
  category: NotificationCategory;
  targetType: GroupNotificationInput["targetType"];
  targetCount: number;
  sendEmail: boolean;
  sendPush: boolean;
}

const TARGET_LABELS: Record<GroupNotificationInput["targetType"], string> = {
  all: "Toda a Base de Usuários",
  vip: "Membros VIP",
  pro: "Membros PRO",
  steam_linked: "Usuários com Steam Vinculada",
  custom_users: "Usuários Específicos",
};

export default function AdminNotificationConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isSending,
  title,
  message,
  category,
  targetType,
  targetCount,
  sendEmail,
  sendPush,
}: AdminNotificationConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg rounded-3xl bg-[#141822] border border-white/10 p-6 space-y-5 shadow-2xl animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Confirmar Disparo em Massa</h3>
              <p className="text-xs text-gray-400">Revise os detalhes antes de enviar</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Resumo do Disparo */}
        <div className="p-4 rounded-2xl bg-[#0b0d12] border border-white/5 space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Público-Alvo:</span>
            <span className="font-bold text-white font-mono bg-white/5 px-2 py-0.5 rounded">
              {TARGET_LABELS[targetType]}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Destinatários Estimados:</span>
            <span className="font-bold text-emerald-400 font-mono">
              ~{targetCount} usuários
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-400">Categoria:</span>
            <span className="font-bold text-cyan-300 uppercase text-[10px] tracking-wider font-mono">
              {category}
            </span>
          </div>

          {/* Canais Ativados */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5">
            <span className="text-gray-400">Canais:</span>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">
                <Bell className="w-3 h-3" /> In-App
              </span>
              {sendPush && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">
                  Push Web
                </span>
              )}
              {sendEmail && (
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                  <Mail className="w-3 h-3" /> E-mail (Resend)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Preview do Conteúdo */}
        <div className="p-3.5 rounded-2xl bg-[#18191c] border border-white/10 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block font-mono">
            Preview do Conteúdo
          </span>
          <p className="text-xs font-bold text-white">{title}</p>
          <p className="text-xs text-gray-300 line-clamp-3 leading-relaxed">{message}</p>
        </div>

        {sendEmail && (
          <p className="text-[11px] text-amber-400/90 leading-tight">
            ⚠️ O disparo simultâneo de e-mail consumirá a cota de envios do Resend para todos os destinatários elegíveis com e-mail cadastrado.
          </p>
        )}

        {/* Ações */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSending}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Despachando...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Confirmar e Despachar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
