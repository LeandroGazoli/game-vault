"use client";

import React, { useState } from "react";
import {
  FeedbackItem,
  FeedbackRewardType,
  DEFAULT_REWARD_TITLES,
} from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import PlanBadge from "@/components/PlanBadge";
import {
  X,
  Gift,
  Crown,
  Sparkles,
  Award,
  Check,
  Loader2,
  AlertCircle,
  Trophy,
} from "lucide-react";

interface GrantRewardModalProps {
  item: FeedbackItem | null;
  isOpen: boolean;
  onClose: () => void;
  onGrantReward: (data: {
    type: FeedbackRewardType;
    customTitle?: string;
    adminNote?: string;
  }) => Promise<void>;
}

export default function GrantRewardModal({
  item,
  isOpen,
  onClose,
  onGrantReward,
}: GrantRewardModalProps) {
  const [rewardType, setRewardType] = useState<FeedbackRewardType>("vip");
  const [customTitle, setCustomTitle] = useState("🐛 Bug Hunter Master");
  const [adminNote, setAdminNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      await onGrantReward({
        type: rewardType,
        customTitle: customTitle.trim() || undefined,
        adminNote: adminNote.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || "Erro ao conceder recompensa.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] !m-0 !mt-0 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl bg-[#14161e] border border-amber-500/40 p-5 sm:p-7 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho */}
        <div className="space-y-1 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            Concessão Oficial de Recompensa
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Premiar Contribuição de {item.authorName}
          </h3>
          <p className="text-xs text-neutral-400">
            A recompensa será aplicada diretamente no perfil do usuário no Firestore e exibida publicamente nesta sugestão.
          </p>
        </div>

        {/* Resumo do Feedback Premiado */}
        <div className="p-3.5 rounded-2xl bg-[#0e1015] border border-white/10 flex items-center gap-3">
          <UserAvatar photoURL={item.authorPhoto} name={item.authorName} size="md" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white truncate">
                {item.authorName}
              </span>
              <PlanBadge plan={item.authorPlan || "free"} size="sm" />
            </div>
            <p className="text-xs text-neutral-300 truncate font-medium">
              &ldquo;{item.title}&rdquo;
            </p>
          </div>
        </div>

        {/* Formulário de Recompensa */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Opções de Tipo de Recompensa */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Escolha o Tipo de Benefício
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* VIP Vitalício */}
              <button
                type="button"
                onClick={() => {
                  setRewardType("vip");
                  if (!customTitle) setCustomTitle("👑 Membro Fundador VIP");
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 active:scale-95 ${
                  rewardType === "vip"
                    ? "bg-amber-500/20 border-amber-400 text-amber-300 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10"
                    : "bg-white/5 border-white/10 hover:border-white/20 text-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Crown className="w-5 h-5 text-amber-400" />
                  {rewardType === "vip" && <Check className="w-4 h-4 text-amber-300" />}
                </div>
                <div>
                  <div className="text-xs font-black text-white">VIP Vitalício</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Sem anúncios + temas</div>
                </div>
              </button>

              {/* Plano PRO */}
              <button
                type="button"
                onClick={() => {
                  setRewardType("pro");
                  if (!customTitle) setCustomTitle("💎 PRO Contribuidor");
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 active:scale-95 ${
                  rewardType === "pro"
                    ? "bg-cyan-500/20 border-cyan-400 text-[#00E5FF] ring-2 ring-cyan-400/40 shadow-lg shadow-cyan-500/10"
                    : "bg-white/5 border-white/10 hover:border-white/20 text-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Sparkles className="w-5 h-5 text-[#00E5FF]" />
                  {rewardType === "pro" && <Check className="w-4 h-4 text-[#00E5FF]" />}
                </div>
                <div>
                  <div className="text-xs font-black text-white">Plano PRO</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Assinatura liberada</div>
                </div>
              </button>

              {/* Tag / Insígnia Customizada */}
              <button
                type="button"
                onClick={() => setRewardType("badge")}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2 active:scale-95 ${
                  rewardType === "badge"
                    ? "bg-purple-500/20 border-purple-400 text-purple-300 ring-2 ring-purple-400/40 shadow-lg shadow-purple-500/10"
                    : "bg-white/5 border-white/10 hover:border-white/20 text-neutral-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Award className="w-5 h-5 text-purple-400" />
                  {rewardType === "badge" && <Check className="w-4 h-4 text-purple-300" />}
                </div>
                <div>
                  <div className="text-xs font-black text-white">Tag Customizada</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">Insígnia de honra</div>
                </div>
              </button>
            </div>
          </div>

          {/* Nome da Tag / Insígnia para o Perfil */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Tag / Título Customizado Concedido ao Perfil
            </label>
            <input
              type="text"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="Ex: 🐛 Bug Hunter 2026"
              maxLength={36}
              className="w-full bg-[#0e1015] border border-white/10 focus:border-amber-400 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none transition-colors"
            />

            {/* Sugestões Rápidas de Títulos */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {DEFAULT_REWARD_TITLES.map((title) => (
                <button
                  key={title}
                  type="button"
                  onClick={() => setCustomTitle(title)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold border transition-all active:scale-95 ${
                    customTitle === title
                      ? "bg-amber-500/30 border-amber-400 text-amber-200 font-bold"
                      : "bg-white/5 border-white/5 hover:border-white/20 text-neutral-400 hover:text-white"
                  }`}
                >
                  {title}
                </button>
              ))}
            </div>
          </div>

          {/* Mensagem Oficial de Agradecimento */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Mensagem de Agradecimento da Equipe (Opcional)
            </label>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder="Ex: Muito obrigado por achar este bug e nos ajudar a tornar o MyGameList cada vez melhor!"
              rows={3}
              maxLength={300}
              className="w-full bg-[#0e1015] border border-white/10 focus:border-amber-400 rounded-2xl p-3 text-xs sm:text-sm text-white focus:outline-none transition-colors resize-none leading-relaxed"
            />
          </div>

          {/* Alerta de Erro */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-black text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Concedendo...</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4" />
                  <span>Confirmar &amp; Conceder Recompensa</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
