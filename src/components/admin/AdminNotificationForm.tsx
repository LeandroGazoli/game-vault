"use client";

import React from "react";
import { NotificationCategory, GroupNotificationInput } from "@/lib/types";
import AdminAudienceSelector from "./AdminAudienceSelector";
import AdminNotificationCategorySelector from "./AdminNotificationCategorySelector";
import { Volume2, Send, Mail } from "lucide-react";

export interface AdminNotificationFormProps {
  title: string;
  setTitle: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  category: NotificationCategory;
  setCategory: (v: NotificationCategory) => void;
  linkUrl: string;
  setLinkUrl: (v: string) => void;
  linkLabel: string;
  setLinkLabel: (v: string) => void;
  isPinned: boolean;
  setIsPinned: (v: boolean) => void;
  sendPush: boolean;
  setSendPush: (v: boolean) => void;
  sendEmail: boolean;
  setSendEmail: (v: boolean) => void;
  targetType: GroupNotificationInput["targetType"];
  setTargetType: (v: GroupNotificationInput["targetType"]) => void;
  customUserIds: string;
  setCustomUserIds: (v: string) => void;
  audienceEstimate: number | null;
  isLoadingEstimate: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onTestPush: () => void;
}

export default function AdminNotificationForm({
  title,
  setTitle,
  message,
  setMessage,
  category,
  setCategory,
  linkUrl,
  setLinkUrl,
  linkLabel,
  setLinkLabel,
  isPinned,
  setIsPinned,
  sendPush,
  setSendPush,
  sendEmail,
  setSendEmail,
  targetType,
  setTargetType,
  customUserIds,
  setCustomUserIds,
  audienceEstimate,
  isLoadingEstimate,
  onSubmit,
  onTestPush,
}: AdminNotificationFormProps) {
  return (
    <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">Central de Disparo &amp; Segmentação</h3>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase font-mono">
              BROADCASTER v2
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Despache comunicados privados in-app, Web Push e e-mails para segmentos ou usuários específicos.
          </p>
        </div>

        <button
          type="button"
          onClick={onTestPush}
          className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 transition-colors flex items-center gap-1.5 shrink-0"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
          <span>Testar Push</span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {/* Seletor de Audiência */}
        <AdminAudienceSelector
          targetType={targetType}
          setTargetType={setTargetType}
          customUserIds={customUserIds}
          setCustomUserIds={setCustomUserIds}
          audienceEstimate={audienceEstimate}
          isLoadingEstimate={isLoadingEstimate}
        />

        {/* Categoria */}
        <AdminNotificationCategorySelector
          category={category}
          setCategory={setCategory}
        />

        {/* Título & Mensagem */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-neutral-300 block">
            Título <span className="text-emerald-400">*</span>
          </label>
          <input
            type="text"
            placeholder="Ex: Novo recurso: Importação da Steam aprimorada!"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
            className="w-full bg-[#121316] border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold text-neutral-300 block">
            Mensagem Detalhada <span className="text-emerald-400">*</span>
          </label>
          <textarea
            placeholder="Ex: Seu perfil agora conta com o novo Game Tracker mobile-first..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            maxLength={400}
            rows={3}
            className="w-full bg-[#121316] border border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 resize-none leading-relaxed"
          />
        </div>

        {/* Links Opcionais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Link de Ação (ex: /perfil)"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
          />
          <input
            type="text"
            placeholder="Texto do Botão (ex: Ver Meu Perfil →)"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Checkboxes de Canais */}
        <div className="flex items-center gap-6 pt-1 flex-wrap">
          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sendPush}
              onChange={(e) => setSendPush(e.target.checked)}
              className="rounded border-white/20 text-emerald-500 focus:ring-0"
            />
            <span>Web Push</span>
          </label>

          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded border-white/20 text-emerald-500 focus:ring-0"
            />
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span>Enviar E-mail (Resend)</span>
            </span>
          </label>

          {targetType === "all" && (
            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-white/20 text-emerald-500 focus:ring-0"
              />
              <span>Fixar no Topo</span>
            </label>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black flex items-center gap-2 transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Revisar e Despachar</span>
          </button>
        </div>
      </form>
    </div>
  );
}
