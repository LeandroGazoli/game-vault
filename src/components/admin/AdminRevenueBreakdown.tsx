"use client";

import React, { useState } from "react";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Receipt,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Calendar,
  AlertCircle,
} from "lucide-react";

export interface MonthlyRevenue {
  monthName: string;
  year: number;
  gross: number;
  fees: number;
  net: number;
  refunds: number;
  chargesCount: number;
  netMarginPercentage: number;
}

export interface RevenueSnapshot {
  mrr: number;
  activeSubscriptions: number;
  grossTotal: number;
  netTotal: number;
  feesTotal: number;
  totalCharges: number;
  refundedTotal: number;
  currency: string;
  isTestMode: boolean;
  currentMonth: MonthlyRevenue;
  recentTransactions: Array<{
    id: string;
    amount: number;
    fee: number;
    net: number;
    currency: string;
    created: string;
    description: string | null;
    status: string;
  }>;
  computedAt: string;
}

interface AdminRevenueBreakdownProps {
  revenue: RevenueSnapshot | null;
  isLoading: boolean;
}

export default function AdminRevenueBreakdown({
  revenue,
  isLoading,
}: AdminRevenueBreakdownProps) {
  const [showTransactions, setShowTransactions] = useState(false);

  const formatBRL = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val || 0);

  if (isLoading && !revenue) {
    return (
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 animate-pulse space-y-4">
        <div className="h-6 w-48 bg-white/5 rounded-lg" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
          <div className="h-24 bg-white/5 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!revenue) {
    return null;
  }

  const { currentMonth } = revenue;

  return (
    <div className="rounded-[32px] bg-[#14161d] border border-emerald-500/20 p-6 sm:p-7 space-y-5 bg-gradient-to-b from-emerald-950/15 via-transparent to-transparent shadow-xl">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Desempenho Financeiro de {currentMonth.monthName}</span>
            </h3>
            {revenue.isTestMode ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Stripe Teste
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Stripe Ao Vivo
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400">
            Valores reais apurados via API do Stripe com taxas operacionais deduzidas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://dashboard.stripe.com/payments"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-[11px] font-medium transition-colors"
          >
            <span>Ver no Stripe</span>
            <ArrowUpRight className="w-3 h-3 text-gray-400" />
          </a>
        </div>
      </div>

      {/* Grid de 4 Cards: Bruto, Taxas, Lucro Líquido e Margem */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Receita Bruta */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-medium">Receita Bruta</span>
            <DollarSign className="w-3.5 h-3.5 text-white/60" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-white">
            {formatBRL(currentMonth.gross)}
          </div>
          <div className="text-[10px] text-gray-400 font-mono">
            {currentMonth.chargesCount} transação(ões) no mês
          </div>
        </div>

        {/* Taxas do Stripe */}
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-rose-500/10 space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span className="font-medium text-rose-300/90">Taxas Stripe</span>
            <Receipt className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-400">
            {formatBRL(currentMonth.fees)}
          </div>
          <div className="text-[10px] text-rose-400/70 font-mono">
            Tarifas de processamento
          </div>
        </div>

        {/* Lucro Líquido */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
          <div className="flex items-center justify-between text-emerald-300 text-xs">
            <span className="font-medium">Lucro Líquido</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">
            {formatBRL(currentMonth.net)}
          </div>
          <div className="text-[10px] text-emerald-300/80 font-mono">
            Saldo real creditado
          </div>
        </div>

        {/* Margem Líquida */}
        <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-1">
          <div className="flex items-center justify-between text-cyan-300 text-xs">
            <span className="font-medium">Margem Líquida</span>
            <Percent className="w-3.5 h-3.5 text-[#00E5FF]" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-[#00E5FF]">
            {currentMonth.netMarginPercentage}%
          </div>
          <div className="text-[10px] text-cyan-400/80 font-mono">
            Retenção após tarifas
          </div>
        </div>
      </div>

      {/* Resumo Acumulado (All Time) */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-xs">
        <div className="flex items-center gap-2 text-gray-400">
          <CreditCard className="w-3.5 h-3.5 text-gray-500" />
          <span>
            Total Histórico Líquido:{" "}
            <strong className="text-white font-mono">
              {formatBRL(revenue.netTotal)}
            </strong>
          </span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Bruto Total: {formatBRL(revenue.grossTotal)}
          </span>
          <span className="text-gray-600 hidden sm:inline">•</span>
          <span className="hidden sm:inline">
            Taxas Totais: {formatBRL(revenue.feesTotal)}
          </span>
        </div>

        {revenue.recentTransactions.length > 0 && (
          <button
            onClick={() => setShowTransactions(!showTransactions)}
            className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition-colors"
          >
            <span>{showTransactions ? "Ocultar Extrato" : "Extrato Recente"}</span>
            {showTransactions ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}
      </div>

      {/* Extrato Recente Retrátil */}
      {showTransactions && revenue.recentTransactions.length > 0 && (
        <div className="pt-2 space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 font-mono">
            Últimas Movimentações no Stripe
          </div>
          <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
            {revenue.recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white flex items-center gap-1.5">
                    <span>{tx.description || "Pagamento Stripe"}</span>
                    <span className="text-[10px] text-gray-500 font-mono">
                      ({tx.id.slice(0, 14)}...)
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {new Date(tx.created).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="font-bold text-emerald-400 font-mono">
                    +{formatBRL(tx.net)}
                  </div>
                  <div className="text-[10px] text-gray-500 font-mono">
                    Bruto: {formatBRL(tx.amount)} • Taxa: -{formatBRL(tx.fee)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
