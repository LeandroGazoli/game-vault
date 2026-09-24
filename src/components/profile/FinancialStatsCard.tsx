"use client";

import React, { useMemo, useState } from "react";
import { UserGame } from "@/lib/types";
import { computeFinancialStats } from "@/lib/financialStatsUtils";
import { DollarSign, TrendingUp, Sparkles, Clock, AlertCircle, ShoppingBag, Layers, Award, HelpCircle, X, CheckCircle2 } from "lucide-react";

interface FinancialStatsCardProps {
  games: UserGame[];
  isOwner?: boolean;
}

export default function FinancialStatsCard({ games, isOwner }: FinancialStatsCardProps) {
  const [showExplainer, setShowExplainer] = useState(false);
  const stats = useMemo(() => computeFinancialStats(games), [games]);

  const hasData = stats.gamesWithPriceCount > 0;

  return (
    <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2">
              <span>Resumo de Investimento Gamer</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                ROI &amp; Custo/Hora
              </span>
            </h2>
            <p className="text-[11px] text-gray-400">
              Total investido, custo por hora jogada e jogos com melhor custo-benefício
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowExplainer(true)}
          className="px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-emerald-400 border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          title="Entenda como funciona o cálculo de ROI e Custo/Hora"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Como Funciona?</span>
        </button>
      </div>

      {/* Modal Explicativo de Métricas e ROI */}
      {showExplainer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#141822] border border-white/15 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-black text-white">Como Funciona o ROI Gamer?</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowExplainer(false)}
                className="p-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <div className="p-3 rounded-2xl bg-[#181d28] border border-white/5 space-y-1">
                <span className="font-bold text-emerald-400 block text-xs">1. Total Investido</span>
                <p className="text-gray-400 text-[11px]">
                  Soma de todos os valores em reais (R$) informados no campo &quot;Preço Pago&quot; na edição de cada jogo da sua biblioteca.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#181d28] border border-white/5 space-y-1">
                <span className="font-bold text-cyan-400 block text-xs">2. Custo por Hora (ROI de Entretenimento)</span>
                <p className="text-gray-400 text-[11px]">
                  Calculado pela divisão do valor investido pelo total de horas jogadas (ex: um jogo de R$ 150 jogado por 75 horas custou apenas R$ 2,00 por hora de diversão). Quanto menor o valor, maior o retorno do seu tempo!
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-[#181d28] border border-white/5 space-y-1">
                <span className="font-bold text-amber-400 block text-xs">3. Melhores Negócios</span>
                <p className="text-gray-400 text-[11px]">
                  Destaque automático para os títulos que entregaram mais tempo de gameplay pelo menor investimento proporcional.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowExplainer(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-colors"
            >
              Entendido!
            </button>
          </div>
        </div>
      )}

      {!hasData ? (
        <div className="p-4 rounded-2xl bg-[#181d28] border border-white/5 text-center space-y-2">
          <DollarSign className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-xs font-bold text-white">Nenhum preço registrado ainda</p>
          <p className="text-[11px] text-gray-400 max-w-sm mx-auto">
            Ao editar seus jogos na biblioteca, informe o valor pago para ver seu custo por hora, total investido e ROI gamer!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Métricas Principais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="p-3 rounded-2xl bg-[#181d28] border border-white/5 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                Total Investido
              </span>
              <p className="text-base sm:text-lg font-black font-mono text-emerald-400">
                R$ {stats.totalSpentBrl.toLocaleString("pt-BR")}
              </p>
              <span className="text-[9px] text-gray-500 block font-mono">
                {stats.gamesWithPriceCount} jogos com valor
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-[#181d28] border border-white/5 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                Custo por Hora
              </span>
              <p className="text-base sm:text-lg font-black font-mono text-cyan-400">
                R$ {stats.costPerHourPlayed.toFixed(2)}
              </p>
              <span className="text-[9px] text-gray-500 block font-mono">por hora de gameplay</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#181d28] border border-white/5 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                Preço Médio
              </span>
              <p className="text-base sm:text-lg font-black font-mono text-amber-400">
                R$ {stats.averagePricePerGame.toFixed(2)}
              </p>
              <span className="text-[9px] text-gray-500 block font-mono">por jogo na biblioteca</span>
            </div>

            <div className="p-3 rounded-2xl bg-[#181d28] border border-white/5 space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
                Gasto em {new Date().getFullYear()}
              </span>
              <p className="text-base sm:text-lg font-black font-mono text-purple-400">
                R$ {stats.spentCurrentYear.toLocaleString("pt-BR")}
              </p>
              <span className="text-[9px] text-gray-500 block font-mono">adquiridos este ano</span>
            </div>
          </div>

          {/* Melhores Negócios (Custo por Hora mais barato) */}
          {stats.bestValueGames.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>Melhor Custo-Benefício (Mais Horas por Real Gasto)</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {stats.bestValueGames.map((item) => (
                  <div
                    key={item.gameId}
                    className="p-2.5 rounded-2xl bg-[#181d28] border border-white/5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{item.gameTitle}</p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        R$ {item.price} · {item.hours}h jogadas
                      </p>
                    </div>
                    <span className="px-2 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs shrink-0">
                      R$ {item.costPerHour.toFixed(2)}/h
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
