"use client";

import React, { useMemo } from "react";
import { UserProfile } from "@/lib/types";
import { TrendingUp, Users, PieChart, ShieldCheck } from "lucide-react";

interface AdminAnalyticsChartsProps {
  users: UserProfile[];
}

export default function AdminAnalyticsCharts({ users }: AdminAnalyticsChartsProps) {
  // 1. Agrupamento por planos
  const planDistribution = useMemo(() => {
    const total = Math.max(users.length, 1);
    const free = users.filter((u) => !u.plan || u.plan === "free").length;
    const pro = users.filter((u) => u.plan === "pro").length;
    const vip = users.filter((u) => u.plan === "vip").length;

    return {
      free: { count: free, percentage: Math.round((free / total) * 100) },
      pro: { count: pro, percentage: Math.round((pro / total) * 100) },
      vip: { count: vip, percentage: Math.round((vip / total) * 100) },
    };
  }, [users]);

  // 2. Crescimento nos últimos 7 dias
  const last7DaysData = useMemo(() => {
    const days: { label: string; dateStr: string; count: number }[] = [];
    const now = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const dayName = d.toLocaleDateString("pt-BR", { weekday: "short" });
      days.push({ label: dayName, dateStr, count: 0 });
    }

    users.forEach((u) => {
      if (!u.createdAt) return;
      const uDate = u.createdAt.split("T")[0];
      const matchedDay = days.find((d) => d.dateStr === uDate);
      if (matchedDay) {
        matchedDay.count += 1;
      }
    });

    const maxCount = Math.max(...days.map((d) => d.count), 1);
    return { days, maxCount };
  }, [users]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico 1: Novos Cadastros nos Últimos 7 Dias */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#00E5FF]" />
              <span>Novos Usuários (Últimos 7 dias)</span>
            </h3>
            <p className="text-[11px] text-gray-400">Taxa de adesão diária na plataforma</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-[#00E5FF] border border-cyan-500/30 font-bold">
            ATIVIDADE
          </span>
        </div>

        {/* Barras SVG / Flex CSS */}
        <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-white/5">
          {last7DaysData.days.map((d, index) => {
            const heightPercentage = Math.max((d.count / last7DaysData.maxCount) * 100, 6);
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-cyan-300 font-bold">
                  {d.count}
                </div>
                <div
                  style={{ height: `${heightPercentage}%` }}
                  className="w-full max-w-[28px] rounded-t-xl bg-gradient-to-t from-cyan-600/30 to-[#00E5FF] group-hover:from-cyan-500/50 group-hover:to-cyan-300 transition-all shadow-md shadow-[#00E5FF]/10"
                />
                <div className="text-[10px] font-mono text-gray-400 uppercase">
                  {d.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Gráfico 2: Distribuição da Base por Planos */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-amber-400" />
              <span>Distribuição de Nível da Base</span>
            </h3>
            <p className="text-[11px] text-gray-400">Divisão entre Free, Assinantes PRO e VIPs</p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 text-gray-300 border border-white/10 font-bold">
            PRODUÇÃO
          </span>
        </div>

        {/* Barra de Distribuição Segmentada */}
        <div className="space-y-4 pt-4">
          <div className="h-4 w-full rounded-full overflow-hidden flex bg-white/5 p-0.5 gap-0.5">
            <div
              style={{ width: `${planDistribution.free.percentage}%` }}
              className="h-full rounded-l-full bg-gray-500 transition-all"
              title={`Free: ${planDistribution.free.count}`}
            />
            <div
              style={{ width: `${planDistribution.pro.percentage}%` }}
              className="h-full bg-[#00E5FF] transition-all"
              title={`PRO: ${planDistribution.pro.count}`}
            />
            <div
              style={{ width: `${planDistribution.vip.percentage}%` }}
              className="h-full rounded-r-full bg-amber-400 transition-all"
              title={`VIP: ${planDistribution.vip.count}`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 text-xs">
            <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-gray-400" />
                <span>Free</span>
              </div>
              <div className="text-base font-black text-white">{planDistribution.free.count}</div>
              <div className="text-[10px] text-gray-500 font-mono">{planDistribution.free.percentage}% da base</div>
            </div>

            <div className="p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-300 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-[#00E5FF]" />
                <span>PRO</span>
              </div>
              <div className="text-base font-black text-[#00E5FF]">{planDistribution.pro.count}</div>
              <div className="text-[10px] text-cyan-400/80 font-mono">{planDistribution.pro.percentage}% da base</div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/20 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-300 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>VIP</span>
              </div>
              <div className="text-base font-black text-amber-400">{planDistribution.vip.count}</div>
              <div className="text-[10px] text-amber-400/80 font-mono">{planDistribution.vip.percentage}% da base</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
