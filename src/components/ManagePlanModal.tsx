"use client";

import React, { useState, useEffect, useCallback } from "react";
import { UserProfile, getEffectiveAccess, GRANT_TYPE_META } from "@/lib/types";
import { auth } from "@/lib/firebase";
import {
  X,
  Sparkles,
  Crown,
  CheckCircle2,
  Calendar,
  CreditCard,
  ExternalLink,
  Clock,
  Gift,
  Loader2,
  ArrowUpCircle,
  AlertTriangle,
} from "lucide-react";
import AdaptiveModal from "./ui/AdaptiveModal";

interface ManagePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpgrade?: () => void;
}

interface SubscriptionData {
  hasSubscription: boolean;
  status?: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  amount?: number | null;
  currency?: string;
  interval?: string | null;
}

function formatDate(iso?: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function ManagePlanModal({ isOpen, onClose, user, onUpgrade }: ManagePlanModalProps) {
  const access = getEffectiveAccess(user);
  const isVip = access.plan === "vip";
  const source = access.source;
  // "Compra" = origem purchase OU legado sem planSource (comprou antes do controle de grants)
  const isPurchase = source === "purchase" || (!source && access.plan !== "free");
  const isGift = !!source && source !== "purchase";

  const [sub, setSub] = useState<SubscriptionData | null>(null);
  const [loadingSub, setLoadingSub] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelDone, setCancelDone] = useState(false);

  const fetchSubscription = useCallback(async () => {
    setLoadingSub(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/billing/subscription", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (res.ok) setSub(data);
    } catch {
      /* silencioso — cai no fallback do doc do usuário */
    } finally {
      setLoadingSub(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && isPurchase && access.plan !== "free") {
      fetchSubscription();
    }
    if (!isOpen) {
      setConfirmCancel(false);
      setCancelDone(false);
      setError(null);
    }
  }, [isOpen, isPurchase, access.plan, fetchSubscription]);

  const handleCancel = async () => {
    setCanceling(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/billing/cancel", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Não foi possível cancelar agora.");
      setCancelDone(true);
      setConfirmCancel(false);
      await fetchSubscription();
    } catch (e: any) {
      setError(e?.message || "Erro ao processar o cancelamento.");
    } finally {
      setCanceling(false);
    }
  };

  const handleOpenPortal = async () => {
    setPortalLoading(true);
    setError(null);
    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setError(data.error || "Não foi possível abrir o portal de faturas.");
    } catch (e: any) {
      setError(e?.message || "Erro ao abrir o portal.");
    } finally {
      setPortalLoading(false);
    }
  };

  if (!isOpen) return null;

  const recurring = sub?.hasSubscription === true;
  const nextPayment = recurring && !sub?.cancelAtPeriodEnd ? sub?.currentPeriodEnd : null;
  const accentBadge = isVip ? "bg-amber-500/20 text-amber-300" : "bg-cyan-500/20 text-[#00E5FF]";
  const Icon = isVip ? Crown : Sparkles;

  return (
    <AdaptiveModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg" hideCloseButton={true}>
      <div className="space-y-6 relative">
        <div className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none ${isVip ? "bg-amber-500/15" : "bg-[#00E5FF]/15"}`} />

        {/* Cabeçalho */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border ${isVip ? "bg-amber-500/20 border-amber-500/40 text-amber-300" : "bg-cyan-500/20 border-cyan-500/40 text-[#00E5FF]"}`}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">Meu Acesso</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">Ativo</span>
              </div>
              <p className="text-xs text-gray-400">Status e gestão do seu plano no MyGameList</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card do acesso */}
        <div className={`rounded-2xl p-5 border space-y-3 ${isVip ? "bg-gradient-to-b from-amber-950/30 to-black/40 border-amber-500/30" : "bg-gradient-to-b from-cyan-950/30 to-black/40 border-cyan-500/30"}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${accentBadge}`}>
                {isGift ? GRANT_TYPE_META[source!].label : recurring ? "Assinatura Recorrente" : access.lifetime ? "Acesso Vitalício" : "Acesso por Período"}
              </span>
              <h4 className="text-lg font-black text-white mt-1">
                {access.label || (isVip ? "MyGameList VIP" : "MyGameList PRO")}
              </h4>
            </div>
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {access.plan.toUpperCase()}
            </span>
          </div>

          <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-gray-300" />
                {recurring ? (sub?.cancelAtPeriodEnd ? "Acesso até" : "Próxima cobrança") : access.lifetime ? "Validade" : "Válido até"}
              </span>
              <p className="font-semibold text-white flex items-center gap-1.5">
                {loadingSub ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-400" />
                ) : recurring ? (
                  formatDate(sub?.currentPeriodEnd) || "—"
                ) : access.lifetime ? (
                  "Permanente • Para Sempre"
                ) : (
                  formatDate(access.expiresAt) || "—"
                )}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                {isGift ? <Gift className="w-3.5 h-3.5 text-gray-300" /> : <CreditCard className="w-3.5 h-3.5 text-gray-300" />}
                {isGift ? "Concessão" : "Pagamento"}
              </span>
              <p className="font-semibold text-white">
                {isGift
                  ? GRANT_TYPE_META[source!].label
                  : recurring
                  ? `${sub?.currency?.toUpperCase() || "R$"} ${(sub?.amount ?? 0).toFixed(2)} / ${sub?.interval === "year" ? "ano" : "mês"}`
                  : isVip
                  ? "Pagamento único vitalício"
                  : "Pagamento único"}
              </p>
            </div>
          </div>

          {/* Cancelamento agendado */}
          {recurring && sub?.cancelAtPeriodEnd && (
            <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/20 text-[11px] text-amber-200 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>Sua assinatura permanece ativa até <strong>{formatDate(sub?.currentPeriodEnd)}</strong> e não será renovada.</span>
            </div>
          )}
          {cancelDone && !sub?.cancelAtPeriodEnd && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-[11px] text-emerald-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>Cancelamento registrado. Seu acesso segue até o fim do período vigente.</span>
            </div>
          )}
          {isGift && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-gray-300 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 shrink-0 text-pink-300" />
              <span>Este é um acesso {GRANT_TYPE_META[source!].label.toLowerCase()} concedido pela equipe. Aproveite! {access.lifetime ? "" : `Expira em ${formatDate(access.expiresAt)}.`}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center flex items-center justify-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> {error}
          </div>
        )}

        {/* Ações */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          {/* Upgrade: para PRO recorrente ou gift (comprar plano de verdade) */}
          {(access.plan === "pro" || isGift) && onUpgrade && (
            <button
              onClick={() => { onClose(); onUpgrade(); }}
              className="w-full py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 hover:brightness-110"
            >
              <ArrowUpCircle className="w-4 h-4" />
              {access.plan === "pro" ? "Fazer upgrade para VIP" : "Assinar um plano"}
            </button>
          )}

          {/* Gerenciar cartão/faturas no Stripe (assinatura recorrente) */}
          {recurring && (
            <button
              onClick={handleOpenPortal}
              disabled={portalLoading}
              className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-white/10"
            >
              {portalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5 text-[#00E5FF]" />}
              Cartão e faturas
            </button>
          )}

          {/* Cancelar assinatura (só recorrente e ainda não cancelada) */}
          {recurring && !sub?.cancelAtPeriodEnd && !cancelDone && (
            confirmCancel ? (
              <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-3 space-y-2">
                <p className="text-xs text-gray-200 text-center">
                  Deseja mesmo cancelar? Seu acesso continua até <strong>{formatDate(sub?.currentPeriodEnd)}</strong> e depois volta ao plano gratuito.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setConfirmCancel(false)} className="flex-1 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs">
                    Manter assinatura
                  </button>
                  <button onClick={handleCancel} disabled={canceling} className="flex-1 py-2.5 rounded-full bg-rose-500/80 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 disabled:opacity-50">
                    {canceling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null} Confirmar cancelamento
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setConfirmCancel(true)} className="w-full py-2.5 rounded-full bg-transparent hover:bg-white/5 text-gray-400 hover:text-rose-300 font-semibold text-xs transition-all">
                Cancelar assinatura
              </button>
            )
          )}

          <button onClick={onClose} className="w-full py-2.5 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-xs transition-all shadow-md">
            Voltar ao perfil
          </button>
        </div>
      </div>
    </AdaptiveModal>
  );
}
