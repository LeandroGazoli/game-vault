"use client";

import React, { useState, useEffect } from "react";
import { AuditLogEntry } from "@/lib/types";
import { getAuditLogs } from "@/lib/firebase";
import {
  History,
  ShieldCheck,
  RefreshCw,
  Search,
  Lock,
  Layers,
  Calendar,
  User,
} from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await getAuditLogs(100);
      setLogs(data);
    } catch (e) {
      console.error("Erro ao carregar logs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    if (categoryFilter !== "all" && log.category !== categoryFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchAdmin = log.adminEmail.toLowerCase().includes(q);
      const matchTarget = (log.targetName || "").toLowerCase().includes(q);
      return matchAction || matchAdmin || matchTarget;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-[#00E5FF]" />
              <h2 className="text-xl font-black text-white tracking-tight">
                Trilha de Auditoria (Audit Trail)
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              Registro criptográfico e imutável de todas as ações administrativas sensíveis na plataforma.
            </p>
          </div>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-semibold text-gray-200 transition-colors min-h-[44px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>Atualizar Logs</span>
          </button>
        </div>

        {/* Filtro e Busca */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ação, admin ou alvo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF] min-h-[44px]"
            />
          </div>

          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-[#0d0f14] border border-white/10 rounded-2xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF] min-h-[44px]"
            >
              <option value="all">Todas as Categorias</option>
              <option value="plans">Planos &amp; Stripe</option>
              <option value="users">Usuários &amp; Moderação</option>
              <option value="feedback">Feedbacks &amp; Bugs</option>
              <option value="notifications">Notificações</option>
              <option value="settings">Configurações</option>
              <option value="security">Segurança</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Registros */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px] bg-white/[0.02]">
                <th className="py-3.5 pl-6">Data / Hora</th>
                <th className="py-3.5">Administrador</th>
                <th className="py-3.5">Ação Executada</th>
                <th className="py-3.5">Categoria</th>
                <th className="py-3.5 pr-6">Alvo / Detalhes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 text-xs font-sans">
                    {isLoading ? "Consultando trilha de auditoria..." : "Nenhum log encontrado."}
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 pl-6 text-gray-400 text-[11px] whitespace-nowrap">
                      {log.createdAt
                        ? new Date(log.createdAt).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })
                        : "Desconhecido"}
                    </td>

                    <td className="py-3.5 text-white font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-amber-400" />
                        <span>{log.adminEmail}</span>
                      </div>
                    </td>

                    <td className="py-3.5 text-cyan-300 font-bold">
                      {log.action}
                    </td>

                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[9px] uppercase font-bold bg-white/10 text-gray-300 border border-white/5">
                        {log.category}
                      </span>
                    </td>

                    <td className="py-3.5 pr-6 text-gray-300 text-[11px]">
                      {log.targetName || log.targetId ? (
                        <div>
                          <span className="text-gray-400">Alvo: </span>
                          <span className="text-white font-semibold">{log.targetName || log.targetId}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500">Parâmetro Global</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
