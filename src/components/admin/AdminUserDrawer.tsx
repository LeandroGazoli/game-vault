"use client";

import React, { useState } from "react";
import { UserProfile, UserPlan } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import PlanBadge from "@/components/PlanBadge";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  Crown,
  Sparkles,
  Calendar,
  Mail,
  User as UserIcon,
  ExternalLink,
  Ban,
  CheckCircle2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface AdminUserDrawerProps {
  user: UserProfile | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlan: (user: UserProfile, newPlan: UserPlan) => Promise<void>;
  onUpdateModeration: (
    user: UserProfile,
    action: { banned?: boolean; suspended?: boolean; reason?: string | null }
  ) => Promise<void>;
}

export default function AdminUserDrawer({
  user,
  isOpen,
  onClose,
  onUpdatePlan,
  onUpdateModeration,
}: AdminUserDrawerProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [showBanInput, setShowBanInput] = useState(false);

  if (!isOpen || !user) return null;

  const currentPlan = user.plan || "free";

  const handlePlanChange = async (plan: UserPlan) => {
    setIsUpdating(true);
    try {
      await onUpdatePlan(user, plan);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleBan = async (banned: boolean) => {
    setIsUpdating(true);
    try {
      await onUpdateModeration(user, {
        banned,
        reason: banned ? banReason || "Violação dos Termos da Comunidade" : null,
      });
      setShowBanInput(false);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop com blur escuro */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fadeIn"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-[#12141a] border-l border-white/10 h-full p-6 sm:p-8 flex flex-col justify-between shadow-2xl overflow-y-auto z-10">
        <div className="space-y-6">
          {/* Header do Drawer */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-mono uppercase text-gray-400">
              <UserIcon className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Ficha Detalhada do Usuário</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Fechar gaveta"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Perfil & Status Principal */}
          <div className="flex items-start gap-4 p-4 rounded-3xl bg-white/[0.03] border border-white/5">
            <UserAvatar photoURL={user.photoURL} name={user.displayName} size="lg" />
            <div className="space-y-1 overflow-hidden">
              <h3 className="text-lg font-bold text-white truncate">
                {user.displayName}
              </h3>
              <div className="text-xs text-gray-400 font-mono truncate">
                @{user.username}
              </div>
              <div className="pt-1 flex items-center gap-2">
                <PlanBadge plan={currentPlan} size="sm" />
                {user.banned && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-bold">
                    BANIDO
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dados & Identificadores */}
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-gray-400">UID (Firebase)</span>
              <div className="font-mono text-gray-200 select-all break-all text-[11px]">
                {user.uid}
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-gray-400">E-mail Cadastrado</span>
              <div className="font-mono text-gray-200 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                <span className="break-all">{user.email || "Não informado"}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-white/5 border border-white/5 space-y-1">
              <span className="text-[10px] uppercase font-mono text-gray-400">Data de Cadastro</span>
              <div className="text-gray-200 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                <span>
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Data desconhecida"}
                </span>
              </div>
            </div>
          </div>

          {/* Alteração Rápida de Plano */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
              Gestão de Nível / Assinatura
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePlanChange("free")}
                disabled={isUpdating || currentPlan === "free"}
                className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold min-h-[44px] ${
                  currentPlan === "free"
                    ? "bg-white/15 border-white/30 text-white"
                    : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                Free
              </button>
              <button
                type="button"
                onClick={() => handlePlanChange("pro")}
                disabled={isUpdating || currentPlan === "pro"}
                className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                  currentPlan === "pro"
                    ? "bg-cyan-500/20 border-cyan-500/40 text-[#00E5FF]"
                    : "bg-white/5 border-white/5 text-gray-400 hover:text-[#00E5FF] hover:bg-cyan-500/10"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ativar PRO</span>
              </button>
              <button
                type="button"
                onClick={() => handlePlanChange("vip")}
                disabled={isUpdating || currentPlan === "vip"}
                className={`p-3 rounded-2xl border text-center transition-all text-xs font-bold min-h-[44px] flex flex-col items-center justify-center gap-1 ${
                  currentPlan === "vip"
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                    : "bg-white/5 border-white/5 text-gray-400 hover:text-amber-300 hover:bg-amber-500/10"
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Ativar VIP</span>
              </button>
            </div>
          </div>

          {/* Área de Moderação e Segurança */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-mono flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Controle de Moderação</span>
            </h4>

            {user.banned ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <div className="text-xs text-rose-300">
                  <span className="font-bold">Motivo do Banimento: </span>
                  {user.moderationReason || "Sem motivo registrado"}
                </div>
                <button
                  type="button"
                  onClick={() => handleToggleBan(false)}
                  disabled={isUpdating}
                  className="w-full py-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-colors min-h-[44px]"
                >
                  Desbanir Conta
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {!showBanInput ? (
                  <button
                    type="button"
                    onClick={() => setShowBanInput(true)}
                    className="w-full py-2.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-colors flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    <Ban className="w-3.5 h-3.5" />
                    <span>Aplicar Banimento na Conta</span>
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                    <input
                      type="text"
                      placeholder="Motivo do banimento (ex: Spam, ofensas)..."
                      value={banReason}
                      onChange={(e) => setBanReason(e.target.value)}
                      className="w-full bg-[#0b0c10] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggleBan(true)}
                        disabled={isUpdating}
                        className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors min-h-[44px]"
                      >
                        Confirmar Banimento
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowBanInput(false)}
                        className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 hover:text-white text-xs min-h-[44px]"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rodapé com Link Público */}
        <div className="pt-6 border-t border-white/10">
          <a
            href={`/perfil/${user.username || user.uid}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors min-h-[44px]"
          >
            <span>Ver Perfil Público</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
