"use client";

import React, { useState, useEffect, useMemo } from "react";
import { UserProfile, UserPlan, ADMIN_EMAILS } from "@/lib/types";
import { getAllUsersForAdmin, updateUserPlanByAdmin, updateUserModerationByAdmin, recordAuditLog } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import PlanBadge from "@/components/PlanBadge";
import UserAvatar from "@/components/UserAvatar";
import AdminUserDrawer from "@/components/admin/AdminUserDrawer";
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Crown,
  Sparkles,
  CheckCircle2,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Ban,
  MoreVertical,
  Download,
} from "lucide-react";

export default function AdminUsersPage() {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await getAllUsersForAdmin();
      setUsers(data);
    } catch (e) {
      console.error("Erro ao carregar usuários:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUpdatePlan = async (targetUser: UserProfile, newPlan: UserPlan) => {
    try {
      await updateUserPlanByAdmin(targetUser.uid, newPlan);
      if (currentAdmin) {
        await recordAuditLog({
          adminEmail: currentAdmin.email,
          adminUid: currentAdmin.uid,
          action: `Plano alterado para ${newPlan.toUpperCase()}`,
          category: "plans",
          targetId: targetUser.uid,
          targetName: targetUser.displayName || targetUser.username,
          details: { oldPlan: targetUser.plan, newPlan },
        });
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid
            ? { ...u, plan: newPlan, isPremium: newPlan === "pro" || newPlan === "vip" }
            : u
        )
      );

      if (selectedUser && selectedUser.uid === targetUser.uid) {
        setSelectedUser({ ...selectedUser, plan: newPlan, isPremium: newPlan === "pro" || newPlan === "vip" });
      }

      setToastMessage(`Plano de ${targetUser.displayName} alterado para ${newPlan.toUpperCase()}`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error("Erro ao alterar plano:", e);
    }
  };

  const handleUpdateModeration = async (
    targetUser: UserProfile,
    action: { banned?: boolean; suspended?: boolean; reason?: string | null }
  ) => {
    try {
      await updateUserModerationByAdmin(targetUser.uid, {
        banned: action.banned,
        suspended: action.suspended,
        moderationReason: action.reason || null,
      });

      if (currentAdmin) {
        await recordAuditLog({
          adminEmail: currentAdmin.email,
          adminUid: currentAdmin.uid,
          action: action.banned ? "Usuário Banido" : "Banimento Revogado",
          category: "users",
          targetId: targetUser.uid,
          targetName: targetUser.displayName || targetUser.username,
          details: action,
        });
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.uid === targetUser.uid
            ? { ...u, banned: action.banned, suspended: action.suspended, moderationReason: action.reason }
            : u
        )
      );

      if (selectedUser && selectedUser.uid === targetUser.uid) {
        setSelectedUser({
          ...selectedUser,
          banned: action.banned,
          suspended: action.suspended,
          moderationReason: action.reason,
        });
      }

      setToastMessage(`Status de moderação de ${targetUser.displayName} atualizado`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e) {
      console.error("Erro ao atualizar moderação:", e);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (planFilter !== "all" && (u.plan || "free") !== planFilter) {
        return false;
      }
      if (statusFilter === "banned" && !u.banned) return false;
      if (statusFilter === "active" && u.banned) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (u.displayName || "").toLowerCase().includes(q);
        const matchEmail = (u.email || "").toLowerCase().includes(q);
        const matchUsername = (u.username || "").toLowerCase().includes(q);
        const matchUid = (u.uid || "").toLowerCase().includes(q);
        return matchName || matchEmail || matchUsername || matchUid;
      }
      return true;
    });
  }, [users, planFilter, statusFilter, searchQuery]);

  const exportToCSV = () => {
    const headers = ["UID", "Nome", "Username", "Email", "Plano", "Banido", "CriadoEm"];
    const rows = filteredUsers.map((u) => [
      `"${u.uid}"`,
      `"${u.displayName || ""}"`,
      `"${u.username || ""}"`,
      `"${u.email || ""}"`,
      `"${u.plan || "free"}"`,
      `"${u.banned ? "Sim" : "Não"}"`,
      `"${u.createdAt || ""}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `usuarios_mygamelist_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notificação */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header com Filtros e Exportação */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00E5FF]" />
              <span>Gestão de Usuários &amp; CRM</span>
            </h2>
            <p className="text-xs text-gray-400">
              {filteredUsers.length} de {users.length} usuários exibidos. Clique na linha para abrir a ficha completa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportToCSV}
              disabled={filteredUsers.length === 0}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors min-h-[44px]"
              title="Exportar registros filtrados para CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={fetchUsers}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors min-h-[44px]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Atualizar</span>
            </button>
          </div>
        </div>

        {/* Barra de Filtro e Busca */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, email, username ou UID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF] min-h-[44px]"
            />
          </div>

          <div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF] min-h-[44px]"
            >
              <option value="all">Todos os Planos</option>
              <option value="free">Apenas Free</option>
              <option value="pro">Apenas PRO</option>
              <option value="vip">Apenas VIP</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#00E5FF] min-h-[44px]"
            >
              <option value="all">Todos os Status</option>
              <option value="active">Contas Ativas</option>
              <option value="banned">Contas Banidas</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela Responsiva de Usuários */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px] bg-white/[0.02]">
                <th className="py-3.5 pl-6">Membro</th>
                <th className="py-3.5">E-mail</th>
                <th className="py-3.5">Plano Atual</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5">Cadastro</th>
                <th className="py-3.5 pr-6 text-right">Ação / Ficha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 text-xs">
                    {isLoading ? "Carregando usuários..." : "Nenhum usuário localizado com estes filtros."}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isThisAdmin = Boolean(u.email && ADMIN_EMAILS.includes(u.email.toLowerCase()));
                  const currentPlan = u.plan || "free";

                  return (
                    <tr
                      key={u.uid}
                      onClick={() => {
                        setSelectedUser(u);
                        setIsDrawerOpen(true);
                      }}
                      className="hover:bg-white/[0.03] cursor-pointer transition-colors group"
                    >
                      <td className="py-3.5 pl-6">
                        <div className="flex items-center gap-3">
                          <UserAvatar photoURL={u.photoURL} name={u.displayName} size="md" />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5 group-hover:text-[#00E5FF] transition-colors">
                              <span>{u.displayName}</span>
                              {isThisAdmin && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold font-mono">
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

                      <td className="py-3.5">
                        {u.banned ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-bold border border-rose-500/30">
                            Banido
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/20">
                            Ativo
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-gray-400 text-[11px] font-mono">
                        {u.createdAt ? u.createdAt.split("T")[0] : "Recente"}
                      </td>

                      <td className="py-3.5 pr-6 text-right">
                        <div className="inline-flex items-center gap-1 text-[#00E5FF] font-semibold text-xs opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                          <span>Ver Ficha</span>
                          <ChevronRight className="w-4 h-4" />
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

      {/* Drawer Lateral com Ficha Completa do Usuário */}
      <AdminUserDrawer
        user={selectedUser}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          setSelectedUser(null);
        }}
        onUpdatePlan={handleUpdatePlan}
        onUpdateModeration={handleUpdateModeration}
      />
    </div>
  );
}
