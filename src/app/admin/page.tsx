"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAllUsersForAdmin, updateUserPlanByAdmin } from "@/lib/firebase";
import { UserProfile, UserPlan, ADMIN_EMAILS } from "@/lib/types";
import PlanBadge from "@/components/PlanBadge";
import UserAvatar from "@/components/UserAvatar";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  Crown,
  Users,
  CreditCard,
  DollarSign,
  Search,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  RefreshCw,
  Activity,
  Layers,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const allUsers = await getAllUsersForAdmin();
      setUsers(allUsers);
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const handleUpdatePlan = async (targetUser: UserProfile, newPlan: UserPlan) => {
    setUpdatingUserId(targetUser.uid);
    try {
      await updateUserPlanByAdmin(targetUser.uid, newPlan);
      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid
            ? { ...u, plan: newPlan, isPremium: newPlan === "pro" || newPlan === "vip" }
            : u
        )
      );
      setSuccessToast(`Plano de ${targetUser.displayName} alterado para ${newPlan.toUpperCase()} com sucesso!`);
      setTimeout(() => setSuccessToast(null), 3500);
    } catch (e) {
      console.error("Erro ao atualizar plano:", e);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (planFilter !== "all" && (u.plan || "free") !== planFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.displayName?.toLowerCase().includes(q);
        const matchEmail = u.email?.toLowerCase().includes(q);
        const matchUser = u.username?.toLowerCase().includes(q);
        return matchName || matchEmail || matchUser;
      }
      return true;
    });
  }, [users, planFilter, searchQuery]);

  // Cálculos de métricas
  const totalUsersCount = users.length;
  const proCount = users.filter((u) => u.plan === "pro").length;
  const vipCount = users.filter((u) => u.plan === "vip").length;
  const freeCount = users.filter((u) => !u.plan || u.plan === "free").length;
  const estimatedMRR = proCount * 9.9;

  if (authLoading) {
    return (
      <div className="space-y-6 animate-pulse max-w-6xl mx-auto py-8">
        <div className="h-32 rounded-[32px] bg-[#18191c]" />
        <div className="h-64 rounded-[32px] bg-[#18191c]" />
      </div>
    );
  }

  // 1. TELA DE ACESSO NEGADO / LOGIN DE ADMIN
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 rounded-[32px] bg-[#18191c] border border-rose-500/30 p-8 sm:p-10 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Acesso Restrito
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Esta área é restrita a administradores autorizados.
          </p>
        </div>

        {!user ? (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full py-3 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all shadow-md"
          >
            Fazer Login com Conta Google
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white/5 text-xs text-gray-300 font-mono">
              Logado como: {user.email}
            </div>
            <Link
              href="/"
              className="inline-block text-xs text-[#00E5FF] hover:underline"
            >
              Voltar para o Início
            </Link>
          </div>
        )}

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  // 2. PAINEL DE CONTROLE MASTER DO ADMINISTRADOR
  return (
    <div className="space-y-8 pb-16 pt-2 max-w-6xl mx-auto">
      {/* Header do Painel */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#18191c] p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/10">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Painel do Administrador
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase font-mono">
                MASTER VIP
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Visão geral da plataforma, controle de assinaturas Stripe e gestão de membros.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchUsers}
            disabled={isLoadingUsers}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? "animate-spin" : ""}`} />
            Atualizar Dados
          </button>
        </div>
      </div>

      {/* Toast de Sucesso */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Grid de Cards KPI de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Usuários */}
        <div className="rounded-3xl bg-[#18191c] border border-white/10 p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Total de Usuários</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalUsersCount}</div>
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <span>{freeCount} usuários no plano gratuito</span>
          </div>
        </div>

        {/* Assinantes PRO */}
        <div className="rounded-3xl bg-[#18191c] border border-cyan-500/30 p-5 space-y-2 shadow-xl bg-gradient-to-b from-cyan-950/20 to-transparent">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-cyan-300">Assinantes PRO</span>
            <Sparkles className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div className="text-3xl font-black text-[#00E5FF]">{proCount}</div>
          <div className="text-[11px] text-gray-400">Planos Mensais e Anuais</div>
        </div>

        {/* Membros VIP */}
        <div className="rounded-3xl bg-[#18191c] border border-amber-500/30 p-5 space-y-2 shadow-xl bg-gradient-to-b from-amber-950/20 to-transparent">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-amber-300">Membros VIP</span>
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{vipCount}</div>
          <div className="text-[11px] text-gray-400">Fundadores &amp; Vitalícios</div>
        </div>

        {/* MRR Estimado */}
        <div className="rounded-3xl bg-[#18191c] border border-emerald-500/30 p-5 space-y-2 shadow-xl bg-gradient-to-b from-emerald-950/20 to-transparent">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-emerald-300">MRR Estimado</span>
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

      {/* Seção de Atalhos Rápidos para Ferramentas Externas */}
      <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Serviços &amp; Ferramentas Externas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="https://dashboard.stripe.com/products"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300">Stripe Dashboard</h4>
                <p className="text-[11px] text-gray-400">Produtos, Vendas e Webhooks</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          </a>

          <a
            href="https://www.google.com/adsense"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-amber-300">Google AdSense</h4>
                <p className="text-[11px] text-gray-400">Monetização e Relatórios</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          </a>

          <a
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white group-hover:text-orange-300">Console Firebase</h4>
                <p className="text-[11px] text-gray-400">Banco de Dados e Usuários</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
          </a>
        </div>
      </div>

      {/* Gestão de Usuários da Plataforma */}
      <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              Gerenciar Usuários &amp; Planos
            </h3>
            <p className="text-xs text-gray-400">
              Conceda planos PRO ou VIP manualmente para parceiros, streamers ou amigos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Campo de Busca */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar usuário..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#121316] border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF] w-48 sm:w-60"
              />
            </div>

            {/* Filtro por Plano */}
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-[#121316] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="all">Todos os Planos</option>
              <option value="free">Apenas Free</option>
              <option value="pro">Apenas PRO</option>
              <option value="vip">Apenas VIP</option>
            </select>
          </div>
        </div>

        {/* Tabela de Usuários */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px]">
                <th className="pb-3 pl-2">Usuário</th>
                <th className="pb-3">E-mail</th>
                <th className="pb-3">Plano Atual</th>
                <th className="pb-3">Cadastro</th>
                <th className="pb-3 text-right pr-2">Ação do Administrador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-xs">
                    {isLoadingUsers ? "Carregando usuários..." : "Nenhum usuário encontrado."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isThisAdmin = Boolean(u.email && ADMIN_EMAILS.includes(u.email.toLowerCase()));
                  const currentPlan = u.plan || "free";

                  return (
                    <tr key={u.uid} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <UserAvatar photoURL={u.photoURL} name={u.displayName} size="md" />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {u.displayName}
                              {isThisAdmin && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                                  ADMIN
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 font-mono">
                              @{u.username}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 text-gray-300 font-mono text-[11px]">
                        {u.email || "Sem e-mail informado"}
                      </td>

                      <td className="py-3.5">
                        <PlanBadge plan={currentPlan} size="sm" />
                      </td>

                      <td className="py-3.5 text-gray-400 text-[11px]">
                        {u.createdAt ? u.createdAt.split("T")[0] : "Recente"}
                      </td>

                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          {currentPlan !== "vip" && (
                            <button
                              onClick={() => handleUpdatePlan(u, "vip")}
                              disabled={updatingUserId === u.uid}
                              className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-[10px] transition-colors"
                              title="Tornar VIP permanente"
                            >
                              + VIP
                            </button>
                          )}

                          {currentPlan !== "pro" && (
                            <button
                              onClick={() => handleUpdatePlan(u, "pro")}
                              disabled={updatingUserId === u.uid}
                              className="px-2.5 py-1 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-[#00E5FF] font-semibold text-[10px] transition-colors"
                              title="Conceder PRO"
                            >
                              + PRO
                            </button>
                          )}

                          {currentPlan !== "free" && !isThisAdmin && (
                            <button
                              onClick={() => handleUpdatePlan(u, "free")}
                              disabled={updatingUserId === u.uid}
                              className="px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 text-[10px] transition-colors"
                              title="Reverter para Free"
                            >
                              Free
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
