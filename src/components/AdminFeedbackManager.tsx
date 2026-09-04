"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FeedbackItem,
  FeedbackStatus,
  FeedbackCategory,
  FeedbackRewardType,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
} from "@/lib/types";
import {
  getFeedbackItems,
  updateFeedbackStatusAndResponse,
  grantFeedbackReward,
  deleteFeedbackItem,
  castFeedbackVote,
} from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/UserAvatar";
import PlanBadge from "@/components/PlanBadge";
import FeedbackDetailModal from "@/components/feedback/FeedbackDetailModal";
import GrantRewardModal from "@/components/feedback/GrantRewardModal";
import {
  Lightbulb,
  Bug,
  Zap,
  MessageSquare,
  Gift,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  Trophy,
  Crown,
  Sparkles,
  ChevronRight,
  Flame,
  Clock,
  Trash2,
} from "lucide-react";

export default function AdminFeedbackManager() {
  const { user, isAdmin } = useAuth();
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [detailItem, setDetailItem] = useState<FeedbackItem | null>(null);
  const [rewardItem, setRewardItem] = useState<FeedbackItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const data = await getFeedbackItems();
      setItems(data);
    } catch (e) {
      console.error("Erro ao carregar feedbacks no admin:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = async (
    item: FeedbackItem,
    status: FeedbackStatus,
    adminNote?: string
  ) => {
    try {
      await updateFeedbackStatusAndResponse(item.id, status, adminNote);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status,
                adminResponse: adminNote !== undefined ? adminNote : i.adminResponse,
                adminResponseAt: adminNote ? new Date().toISOString() : i.adminResponseAt,
              }
            : i
        )
      );
      if (detailItem?.id === item.id) {
        setDetailItem((prev) =>
          prev
            ? {
                ...prev,
                status,
                adminResponse: adminNote !== undefined ? adminNote : prev.adminResponse,
              }
            : null
        );
      }
      showToast(`Status atualizado para "${FEEDBACK_STATUSES[status].label}"!`);
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
      showToast("Erro ao atualizar status.");
    }
  };

  const handleGrantReward = async (rewardData: {
    type: FeedbackRewardType;
    customTitle?: string;
    adminNote?: string;
  }) => {
    if (!rewardItem) return;
    try {
      await grantFeedbackReward(rewardItem.id, rewardItem.authorId, rewardData);
      showToast(`🏆 Recompensa concedida para ${rewardItem.authorName}!`);
      await fetchItems();
    } catch (e) {
      console.error("Erro ao conceder recompensa:", e);
      showToast("Erro ao conceder recompensa.");
    }
  };

  const handleDelete = async (item: FeedbackItem) => {
    if (!confirm(`Tem certeza que deseja excluir a sugestão "${item.title}"?`)) return;
    try {
      await deleteFeedbackItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (detailItem?.id === item.id) setDetailItem(null);
      showToast("Sugestão excluída com sucesso.");
    } catch (e) {
      console.error("Erro ao excluir:", e);
      showToast("Erro ao excluir.");
    }
  };

  const handleVote = async (item: FeedbackItem, voteType: 1 | -1) => {
    if (!user) return;
    try {
      const res = await castFeedbackVote(item.id, user.uid, voteType);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                score: res.score,
                upvotesCount: res.upvotes,
                downvotesCount: res.downvotes,
              }
            : i
        )
      );
      if (detailItem?.id === item.id) {
        setDetailItem((prev) =>
          prev
            ? {
                ...prev,
                score: res.score,
                upvotesCount: res.upvotes,
                downvotesCount: res.downvotes,
              }
            : null
        );
      }
    } catch (e) {
      console.error("Erro ao votar no admin:", e);
    }
  };

  // KPIs
  const totalCount = items.length;
  const underReviewCount = items.filter((i) => i.status === "under_review").length;
  const inProgressOrPlannedCount = items.filter(
    (i) => i.status === "planned" || i.status === "in_progress"
  ).length;
  const rewardedCount = items.filter((i) => i.rewarded).length;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          item.title?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q) ||
          item.authorName?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, categoryFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-3xl bg-[#18191c] border border-white/10 p-5 space-y-2 shadow-xl">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium">Total de Propostas</span>
            <Lightbulb className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalCount}</div>
          <div className="text-[11px] text-gray-400">Ideias, Bugs e Sugestões</div>
        </div>

        <div className="rounded-3xl bg-[#18191c] border border-yellow-500/30 p-5 space-y-2 shadow-xl bg-gradient-to-b from-yellow-950/20 to-transparent">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-yellow-300">Pendentes em Análise</span>
            <Clock className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="text-3xl font-black text-yellow-300">{underReviewCount}</div>
          <div className="text-[11px] text-gray-400">Aguardando decisão da equipe</div>
        </div>

        <div className="rounded-3xl bg-[#18191c] border border-blue-500/30 p-5 space-y-2 shadow-xl bg-gradient-to-b from-blue-950/20 to-transparent">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-blue-300">Roadmap Ativo</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-300">{inProgressOrPlannedCount}</div>
          <div className="text-[11px] text-gray-400">Planejados ou em desenvolvimento</div>
        </div>

        <div className="rounded-3xl bg-[#18191c] border border-amber-500/30 p-5 space-y-2 shadow-xl bg-gradient-to-b from-amber-950/20 to-transparent">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-medium text-amber-300">Recompensados</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{rewardedCount}</div>
          <div className="text-[11px] text-gray-400">VIPs, PROs e Tags concedidas</div>
        </div>
      </div>

      {/* Tabela de Gestão de Feedbacks */}
      <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Moderação de Feedbacks &amp; Bugs
              </h3>
              <Link
                href="/feedback"
                className="text-xs text-[#00E5FF] hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Ver página pública</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Avalie o saldo de votos, altere o status de implementação e premie usuários com 1 clique.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Busca */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar sugestão..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#121316] border border-white/10 rounded-full pl-8 pr-4 py-1.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#00E5FF] w-44 sm:w-56"
              />
            </div>

            {/* Filtro de Categoria */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-[#121316] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="all">Todas Categorias</option>
              <option value="idea">💡 Ideias / Recursos</option>
              <option value="bug">🐛 Bugs / Erros</option>
              <option value="improvement">⚡ Melhorias</option>
              <option value="feedback">💬 Feedback Geral</option>
            </select>

            {/* Filtro de Status */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#121316] border border-white/10 rounded-full px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="all">Todos Status</option>
              <option value="under_review">🟡 Em Análise</option>
              <option value="planned">🟣 Planejado</option>
              <option value="in_progress">🔵 Em Desenvolvimento</option>
              <option value="completed">🟢 Implementado</option>
              <option value="declined">🔴 Não Viável</option>
            </select>

            <button
              onClick={fetchItems}
              disabled={isLoading}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 transition-colors"
              title="Recarregar"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Tabela Responsiva */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 uppercase font-mono text-[10px]">
                <th className="pb-3 pl-2">Votos (Score)</th>
                <th className="pb-3">Título &amp; Categoria</th>
                <th className="pb-3">Autor</th>
                <th className="pb-3">Status Atual</th>
                <th className="pb-3">Recompensa</th>
                <th className="pb-3 text-right pr-2">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                    {isLoading ? "Carregando publicações..." : "Nenhuma sugestão encontrada."}
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const statusConf = FEEDBACK_STATUSES[item.status] || FEEDBACK_STATUSES.under_review;

                  return (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Saldo de Votos */}
                      <td className="py-3.5 pl-2 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-black text-xs px-2 py-0.5 rounded-lg ${
                              item.score > 0
                                ? "bg-cyan-500/20 text-[#00E5FF]"
                                : item.score < 0
                                ? "bg-rose-500/20 text-rose-400"
                                : "bg-white/5 text-gray-400"
                            }`}
                          >
                            {item.score > 0 ? `+${item.score}` : item.score}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            (▲{item.upvotesCount || 0} ▼{item.downvotesCount || 0})
                          </span>
                        </div>
                      </td>

                      {/* Título & Categoria */}
                      <td className="py-3.5 max-w-xs">
                        <div
                          onClick={() => setDetailItem(item)}
                          className="font-bold text-white hover:text-[#00E5FF] cursor-pointer truncate"
                          title={item.title}
                        >
                          {item.title}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono text-gray-400 uppercase">
                            {item.category === "idea" && "💡 Ideia"}
                            {item.category === "bug" && "🐛 Bug / Erro"}
                            {item.category === "improvement" && "⚡ Melhoria"}
                            {item.category === "feedback" && "💬 Feedback"}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {item.commentsCount || 0} comentários
                          </span>
                        </div>
                      </td>

                      {/* Autor */}
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <UserAvatar photoURL={item.authorPhoto} name={item.authorName} size="xs" />
                          <div className="min-w-0">
                            <div className="font-bold text-white truncate max-w-[100px]">
                              {item.authorName}
                            </div>
                            <span className="text-[10px] text-gray-400 font-mono block truncate">
                              @{item.authorUsername}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Atual com Seletor Rápido */}
                      <td className="py-3.5">
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item, e.target.value as FeedbackStatus)}
                          className={`bg-[#121316] border rounded-lg px-2 py-1 text-[11px] font-bold focus:outline-none focus:border-[#00E5FF] ${statusConf.color}`}
                        >
                          <option value="under_review">🟡 Em Análise</option>
                          <option value="planned">🟣 Planejado</option>
                          <option value="in_progress">🔵 Em Progresso</option>
                          <option value="completed">🟢 Concluído</option>
                          <option value="declined">🔴 Não Viável</option>
                        </select>
                      </td>

                      {/* Recompensa */}
                      <td className="py-3.5">
                        {item.rewarded ? (
                          <div className="flex items-center gap-1 text-amber-300 font-bold text-[11px]">
                            <Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate max-w-[110px]" title={item.rewardTitle || "Recompensado"}>
                              {item.rewardTitle || "Recompensado"}
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setRewardItem(item)}
                            className="px-2.5 py-1 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                          >
                            <Gift className="w-3 h-3 text-amber-400" />
                            <span>Premiar</span>
                          </button>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 text-right pr-2">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setDetailItem(item)}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 text-[11px] font-semibold transition-colors"
                          >
                            Ver / Responder
                          </button>
                          <button
                            onClick={() => handleDelete(item)}
                            className="p-1 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* Modais */}
      <FeedbackDetailModal
        item={detailItem}
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        onVote={handleVote}
        user={user}
        isAdmin={isAdmin}
        onRequireAuth={() => {}}
        onOpenRewardModal={(i) => setRewardItem(i)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
      />

      <GrantRewardModal
        item={rewardItem}
        isOpen={Boolean(rewardItem)}
        onClose={() => setRewardItem(null)}
        onGrantReward={handleGrantReward}
      />
    </div>
  );
}
