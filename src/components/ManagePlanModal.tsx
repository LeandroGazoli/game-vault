"use client";

import React, { useState } from "react";
import { UserProfile } from "@/lib/types";
import { auth } from "@/lib/firebase";
import {
  X,
  Sparkles,
  Crown,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  CreditCard,
  ExternalLink,
  Clock,
  EyeOff,
  Check,
} from "lucide-react";

interface ManagePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
}

export default function ManagePlanModal({
  isOpen,
  onClose,
  user,
}: ManagePlanModalProps) {
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentPlan = user.plan || "free";
  const isVip = currentPlan === "vip";
  const isPro = currentPlan === "pro";
  const isSingleMonth = Boolean(user.premiumUntil);

  // Calcula dias restantes se houver premiumUntil
  let daysRemaining: number | null = null;
  let formattedExpirationDate = "";

  if (user.premiumUntil) {
    const expDate = new Date(user.premiumUntil);
    const now = new Date();
    const diffTime = expDate.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    formattedExpirationDate = expDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // Tenta abrir o portal de assinaturas do Stripe caso seja assinatura recorrente
  const handleOpenStripePortal = async () => {
    setIsLoadingPortal(true);
    setPortalError(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/billing/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          customerId: (user as any).stripeCustomerId,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setPortalError(
          data.error ||
            "Não foi possível abrir o portal de faturas do Stripe para este plano."
        );
      }
    } catch (err: any) {
      setPortalError(err.message || "Erro de conexão ao abrir portal.");
    } finally {
      setIsLoadingPortal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] !m-0 !mt-0 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-lg rounded-[32px] bg-[#14161a] border border-white/15 p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[92vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Glow de fundo */}
        <div
          className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl pointer-events-none ${
            isVip ? "bg-amber-500/15" : "bg-[#00E5FF]/15"
          }`}
        />

        {/* Topo do Modal */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg border ${
                isVip
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-300"
                  : "bg-cyan-500/20 border-cyan-500/40 text-[#00E5FF]"
              }`}
            >
              {isVip ? <Crown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Gerenciar Plano
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                  Ativo
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Informações e status da sua conta no GameVault
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Card do Plano Ativo */}
        <div
          className={`rounded-2xl p-5 border space-y-3 ${
            isVip
              ? "bg-gradient-to-b from-amber-950/30 to-black/40 border-amber-500/30"
              : "bg-gradient-to-b from-cyan-950/30 to-black/40 border-cyan-500/30"
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                  isVip
                    ? "bg-amber-500/20 text-amber-300"
                    : "bg-cyan-500/20 text-[#00E5FF]"
                }`}
              >
                {isVip
                  ? "Acesso Vitalício"
                  : isSingleMonth
                  ? "Passe Avulso (30 Dias)"
                  : "Assinatura Recorrente"}
              </span>
              <h4 className="text-lg font-black text-white mt-1">
                {isVip
                  ? "GameVault VIP Fundador"
                  : isSingleMonth
                  ? "GameVault PRO (1 Mês Avulso)"
                  : "GameVault PRO Mensal"}
              </h4>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Assinante Oficial
              </span>
            </div>
          </div>

          {/* Detalhes de Expiração ou Renovação */}
          <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-gray-300" />
                {isVip
                  ? "Validade do Plano"
                  : isSingleMonth
                  ? "Válido até"
                  : "Ciclo de Cobrança"}
              </span>
              <p className="font-semibold text-white">
                {isVip
                  ? "Permanente • Para Sempre"
                  : isSingleMonth
                  ? `${formattedExpirationDate} (${daysRemaining} dias restantes)`
                  : "Renovação Automática Mensal"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-gray-400 flex items-center gap-1.5 text-[11px]">
                <CreditCard className="w-3.5 h-3.5 text-gray-300" />
                Tipo de Pagamento
              </span>
              <p className="font-semibold text-white">
                {isVip
                  ? "Pagamento Único Vitalício"
                  : isSingleMonth
                  ? "Pagamento Único (Sem Renovação)"
                  : "Cartão de Crédito (Recorrente)"}
              </p>
            </div>
          </div>

          {/* Mensagem Explicativa para Passe Avulso */}
          {isSingleMonth && (
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/20 text-[11px] text-cyan-200 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Sem renovação automática programada</span>
              </div>
              <p className="text-gray-300 text-[10px] leading-relaxed">
                Você comprou o passe de 1 mês único. Nenhuma cobrança futura será
                realizada no seu cartão. Quando o período expirar em{" "}
                <strong>{formattedExpirationDate}</strong>, seu perfil voltará
                automaticamente para a conta gratuita.
              </p>
            </div>
          )}
        </div>

        {/* Benefícios Ativos */}
        <div className="space-y-2.5">
          <h5 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Benefícios Ativos na sua Conta
          </h5>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-200">
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <EyeOff className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
              <span>100% Livre de Anúncios</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <Sparkles className="w-4 h-4 text-[#00E5FF] flex-shrink-0" />
              <span>Selo Neon no Perfil</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Exportações Ilimitadas</span>
            </li>
            <li className="flex items-center gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5">
              <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Temas & Capas Exclusivas</span>
            </li>
          </ul>
        </div>

        {/* Ações / Stripe Portal */}
        {portalError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {portalError}
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-white/10">
          {!isSingleMonth && !isVip && (
            <button
              onClick={handleOpenStripePortal}
              disabled={isLoadingPortal}
              className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-white/10 shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#00E5FF]" />
              {isLoadingPortal
                ? "Abrindo Portal do Stripe..."
                : "Gerenciar Cartão e Faturas no Stripe"}
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-full bg-white text-black hover:bg-gray-200 font-bold text-xs transition-all shadow-md"
          >
            Entendido, Voltar ao Perfil
          </button>
        </div>
      </div>
    </div>
  );
}
