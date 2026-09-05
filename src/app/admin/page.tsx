"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  DollarSign,
  Sparkles,
  Crown,
  Activity,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
  Zap,
  Bell,
  CheckCircle2,
} from "lucide-react";
import { UserProfile } from "@/lib/types";
import { getAllUsersForAdmin, getAuditLogs } from "@/lib/firebase";
import PlanBadge from "@/components/PlanBadge";
import UserAvatar from "@/components/UserAvatar";

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [allUsers, recentLogs] = await Promise.all([
        getAllUsersForAdmin(),
        getAuditLogs(8),
      ]);
      setUsers(allUsers);
      setAuditLogs(recentLogs);
    } catch (e) {
      console.error("Erro ao carregar dados do dashboard:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalUsers = users.length;
  const proUsers = users.filter((u) => u.plan === "pro").length;
  const vipUsers = users.filter((u) => u.plan === "vip").length;
  const freeUsers = users.filter((u) => !u.plan || u.plan === "free").length;
  const estimatedMRR = proUsers * 9.9;

  return (
    <div className="space-y-6 pb-12">
      {/* Botão de Atualização Rápida */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Dashboard Executivo
          </h2>
          <p className="text-xs text-gray-400">
            Visão consolidada de métricas, atividade recente e links de infraestrutura.
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-colors min-h-[44px]"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Sincronizar</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Usuários */}
        <Link
          href="/admin/users"
          className="group rounded-3xl bg-[#14161d] border border-white/10 p-5 space-y-2 shadow-xl hover:border-white/20 transition-all"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Total de Usuários</span>
            <Users className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-white">{totalUsers}</div>
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>{freeUsers} membros Free</span>
            <span className="text-[#00E5FF] font-semibold text-[10px] group-hover:underline flex items-center">
              Gerenciar &rarr;
            </span>
          </div>
        </Link>

        {/* Assinantes PRO */}
        <Link
          href="/admin/plans"
          className="group rounded-3xl bg-[#14161d] border border-cyan-500/30 p-5 space-y-2 shadow-xl bg-gradient-to-b from-cyan-950/20 to-transparent hover:border-cyan-400/50 transition-all"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-cyan-300">Assinantes PRO</span>
            <Sparkles className="w-4 h-4 text-[#00E5FF] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-[#00E5FF]">{proUsers}</div>
          <div className="text-[11px] text-gray-400 flex items-center justify-between">
            <span>Planos Recorrentes</span>
            <span className="text-[#00E5FF] font-semibold text-[10px] group-hover:underline flex items-center">
              Stripe &rarr;
            </span>
          </div>
        </Link>

        {/* Membros VIP */}
        <Link
          href="/admin/users?plan=vip"
          className="group rounded-3xl bg-[#14161d] border border-amber-500/30 p-5 space-y-2 shadow-xl bg-gradient-to-b from-amber-950/20 to-transparent hover:border-amber-400/50 transition-all"
        >
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-amber-300">Membros VIP</span>
            <Crown className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-3xl font-black text-amber-400">{vipUsers}</div>
          <div className="text-[11px] text-gray-400">Fundadores &amp; Vitalícios</div>
        </Link>

        {/* MRR Estimado */}
        <div className="rounded-3xl bg-[#14161d] border border-emerald-500/30 p-5 space-y-2 shadow-xl bg-gradient-to-b from-emerald-950/20 to-transparent">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-emerald-300">MRR Recorrente</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
              estimatedMRR
            )}
          </div>
          <div className="text-[11px] text-gray-400">Receita Recorrente Mensal</div>
        </div>
      </div>

      {/* Grid Duplo: Ações Rápidas & Logs Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hub de Serviços Externos */}
        <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
              Ferramentas de Produção
            </h3>
            <span className="text-[10px] text-gray-500 font-mono">Status Operacional</span>
          </div>

          <div className="space-y-3">
            <a
              href="https://dashboard.stripe.com/products"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between group transition-all min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">
                    Stripe Dashboard
                  </h4>
                  <p className="text-[11px] text-gray-400">Cobranças, Vendas e Webhooks</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </a>

            <a
              href="https://www.google.com/adsense"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between group transition-all min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-300">
                    Google AdSense
                  </h4>
                  <p className="text-[11px] text-gray-400">Monetização e RPM de Anúncios</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </a>

            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 flex items-center justify-between group transition-all min-h-[44px]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white group-hover:text-orange-300">
                    Firebase Console
                  </h4>
                  <p className="text-[11px] text-gray-400">Firestore, Auth e Regras de Segurança</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
            </a>
          </div>
        </div>

        {/* Trilha Recente de Auditoria */}
        <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
                Atividades Administrativas Recentes
              </h3>
              <Link
                href="/admin/audit"
                className="text-[10px] text-[#00E5FF] hover:underline font-mono"
              >
                Ver Histórico Completo &rarr;
              </Link>
            </div>

            {auditLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                Nenhum evento de auditoria recente registrado.
              </div>
            ) : (
              <div className="space-y-2">
                {auditLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-white">{log.action}</div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        Alvo: {log.targetName || log.targetId || "Sistema"}
                      </div>
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono">
                      {log.createdAt ? new Date(log.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/users"
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-center text-xs font-bold text-gray-200 block transition-colors min-h-[44px] flex items-center justify-center"
            >
              Acessar Gestão Completa de Usuários
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
