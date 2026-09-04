"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  FeedbackItem,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackRewardType,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
} from "@/lib/types";
import {
  getFeedbackItems,
  createFeedbackItem,
  castFeedbackVote,
  getUserFeedbackVotes,
  updateFeedbackStatusAndResponse,
  grantFeedbackReward,
  deleteFeedbackItem,
} from "@/lib/firebase";
import FeedbackCard from "@/components/feedback/FeedbackCard";
import NewFeedbackModal from "@/components/feedback/NewFeedbackModal";
import FeedbackDetailModal from "@/components/feedback/FeedbackDetailModal";
import GrantRewardModal from "@/components/feedback/GrantRewardModal";
import AuthModal from "@/components/AuthModal";
import UserAvatar from "@/components/UserAvatar";
import {
  Lightbulb,
  Bug,
  Zap,
  MessageSquare,
  Plus,
  Flame,
  Clock,
  MessageCircle,
  Search,
  Filter,
  Trophy,
  Crown,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Gift,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

export default function FeedbackClient() {
  const { user, isAdmin, isLoading: isAuthLoading } = useAuth();

  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [userVotes, setUserVotes] = useState<Record<string, 1 | -1>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Filtros e ordenação
  const [categoryFilter, setCategoryFilter] = useState<FeedbackCategory | "all">("all");
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"score" | "recent" | "comments">("score");
  const [searchQuery, setSearchQuery] = useState("");

  // Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<FeedbackItem | null>(null);
  const [rewardTargetItem, setRewardTargetItem] = useState<FeedbackItem | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Carrega lista de feedbacks
  const fetchFeedbacks = async () => {
    setIsLoading(true);
    try {
      const data = await getFeedbackItems();
      setItems(data);

      if (user?.uid) {
        const itemIds = data.map((i) => i.id);
        const votes = await getUserFeedbackVotes(user.uid, itemIds);
        setUserVotes(votes);
      }
    } catch (e) {
      console.error("Erro ao carregar feedbacks:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, [user?.uid]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Votação com atualização otimista instantânea
  const handleVote = async (item: FeedbackItem, type: 1 | -1) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const result = await castFeedbackVote(item.id, user.uid, type);

      // Atualiza votos do usuário
      setUserVotes((prev) => {
        const updated = { ...prev };
        if (result.userVote === 0) {
          delete updated[item.id];
        } else {
          updated[item.id] = result.userVote;
        }
        return updated;
      });

      // Atualiza item na lista
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                score: result.score,
                upvotesCount: result.upvotes,
                downvotesCount: result.downvotes,
              }
            : i
        )
      );

      // Se o modal de detalhes estiver aberto com este item, atualiza
      if (detailItem?.id === item.id) {
        setDetailItem((prev) =>
          prev
            ? {
                ...prev,
                score: result.score,
                upvotesCount: result.upvotes,
                downvotesCount: result.downvotes,
              }
            : null
        );
      }
    } catch (e: any) {
      console.error("Erro ao registrar voto:", e);
      showToast("Não foi possível registrar seu voto. Tente novamente.");
    }
  };

  // Criar nova sugestão
  const handleCreateFeedback = async (data: {
    title: string;
    description: string;
    category: FeedbackCategory;
  }) => {
    if (!user) return;

    await createFeedbackItem({
      title: data.title,
      description: data.description,
      category: data.category,
      authorId: user.uid,
      authorName: user.displayName || "Jogador",
      authorUsername: user.username || "gamer",
      authorPhoto: user.photoURL || null,
      authorPlan: user.plan || "free",
    });

    showToast("🎉 Sua publicação foi enviada para votação da comunidade!");
    await fetchFeedbacks();
  };

  // Alterar Status
  const handleStatusChange = async (
    item: FeedbackItem,
    newStatus: FeedbackStatus,
    adminNote?: string
  ) => {
    try {
      await updateFeedbackStatusAndResponse(item.id, newStatus, adminNote);
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: newStatus,
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
                status: newStatus,
                adminResponse: adminNote !== undefined ? adminNote : prev.adminResponse,
              }
            : null
        );
      }

      showToast(`Status alterado para "${FEEDBACK_STATUSES[newStatus].label}" com sucesso!`);
    } catch (e) {
      console.error("Erro ao alterar status:", e);
      showToast("Erro ao alterar status.");
    }
  };

  // Conceder Recompensa
  const handleGrantReward = async (rewardData: {
    type: FeedbackRewardType;
    customTitle?: string;
    adminNote?: string;
  }) => {
    if (!rewardTargetItem) return;

    try {
      await grantFeedbackReward(rewardTargetItem.id, rewardTargetItem.authorId, rewardData);
      showToast(`🏆 Recompensa concedida com sucesso para ${rewardTargetItem.authorName}!`);
      await fetchFeedbacks();
    } catch (e) {
      console.error("Erro ao conceder recompensa:", e);
      showToast("Erro ao conceder recompensa.");
    }
  };

  // Excluir Feedback
  const handleDeleteFeedback = async (item: FeedbackItem) => {
    try {
      await deleteFeedbackItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (detailItem?.id === item.id) {
        setDetailItem(null);
      }
      showToast("Sugestão excluída com sucesso.");
    } catch (e) {
      console.error("Erro ao excluir:", e);
      showToast("Erro ao excluir sugestão.");
    }
  };

  // Filtragem e ordenação em memória
  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
        if (statusFilter !== "all" && item.status !== statusFilter) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchTitle = item.title?.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchAuthor = item.authorName?.toLowerCase().includes(q);
          return matchTitle || matchDesc || matchAuthor;
        }
        return true;
      })
      .sort((a, b) => {
        const getTime = (val: any) => {
          if (!val) return 0;
          if (typeof val?.toDate === "function") return val.toDate().getTime();
          if (typeof val === "object" && typeof val.seconds === "number") return val.seconds * 1000;
          if (val instanceof Date) return val.getTime();
          const t = new Date(val).getTime();
          return isNaN(t) ? 0 : t;
        };

        if (sortBy === "score") {
          const scoreDiff = (b.score || 0) - (a.score || 0);
          if (scoreDiff !== 0) return scoreDiff;
          return getTime(b.createdAt) - getTime(a.createdAt);
        }
        if (sortBy === "recent") {
          return getTime(b.createdAt) - getTime(a.createdAt);
        }
        if (sortBy === "comments") {
          return (b.commentsCount || 0) - (a.commentsCount || 0);
        }
        return 0;
      });
  }, [items, categoryFilter, statusFilter, sortBy, searchQuery]);

  // Contribuidores premiados (Hall da Fama)
  const rewardedItems = useMemo(() => {
    return items.filter((i) => i.rewarded).slice(0, 6);
  }, [items]);

  return (
    <div className="space-y-8 pb-16 pt-2 max-w-6xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[120] p-4 rounded-2xl bg-[#0c0e14]/95 border border-cyan-500/40 text-[#00E5FF] text-xs sm:text-sm font-bold flex items-center gap-3 shadow-2xl backdrop-blur-md animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#00E5FF] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO BANNER PRINCIPAL */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-gradient-to-br from-[#12141c] via-[#141722] to-[#0a0c10] p-6 sm:p-10 shadow-2xl space-y-6">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Voz da Comunidade &amp; Roadmap Colaborativo</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Ajude a Moldar o <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[#00E5FF]">MyGameList</span>
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
              Dê ideias para novos recursos, relate falhas ou bugs e vote nas melhores sugestões da comunidade. As propostas com maior apoio são analisadas pela equipe para entrar no site — e você ganha recompensas exclusivas!
            </p>
          </div>

          {/* CTA Principal */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-3">
            <button
              onClick={() => {
                if (!user) setIsAuthOpen(true);
                else setIsNewModalOpen(true);
              }}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-[#00E5FF] to-blue-500 hover:from-cyan-300 hover:to-cyan-200 text-black font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Enviar Ideia ou Bug</span>
            </button>

            <button
              onClick={fetchFeedbacks}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Atualizar Votações</span>
            </button>
          </div>
        </div>

        {/* Três Pilares do Sistema de Recompensas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-[#00E5FF] shrink-0">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">1. Votação Democrática</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Upvotes e Downvotes definem as prioridades do nosso roadmap.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 shrink-0">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">2. VIP &amp; PRO Grátis</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Ache bugs críticos ou sugira recursos adotados para ganhar acesso vitalício.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-start gap-3">
            <div className="p-2 rounded-xl bg-purple-500/15 text-purple-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">3. Insígnias Gamer</h4>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                Tags como &ldquo;Bug Hunter&rdquo; ou &ldquo;Visionário&rdquo; direto no seu perfil.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MURAL DE DESTAQUES: HALL DA FAMA DE CONTRIBUIDORES PREMIADOS */}
      {rewardedItems.length > 0 && (
        <div className="rounded-[32px] bg-[#14161d] border border-amber-500/30 p-5 sm:p-7 space-y-4 shadow-xl">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Mural de Honra: Contribuidores Premiados
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-400/80 uppercase font-bold">
              Bounties &amp; Recompensas Concedidas
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {rewardedItems.map((ri) => (
              <div
                key={ri.id}
                onClick={() => setDetailItem(ri)}
                className="p-3.5 rounded-2xl bg-[#0e1015] border border-white/10 hover:border-amber-500/50 transition-all cursor-pointer space-y-2 group"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <UserAvatar photoURL={ri.authorPhoto} name={ri.authorName} size="xs" />
                    <span className="text-xs font-bold text-white truncate">{ri.authorName}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold uppercase">
                    {ri.rewardType === "vip" ? "VIP Vitalício" : ri.rewardType === "pro" ? "PRO" : "Tag de Honra"}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-neutral-200 group-hover:text-amber-300 transition-colors truncate">
                  {ri.title}
                </h4>

                <div className="text-[11px] text-amber-400 font-mono flex items-center gap-1 font-semibold">
                  <Sparkles className="w-3 h-3" />
                  <span className="truncate">{ri.rewardTitle || "Recompensa Especial"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. BARRA DE CONTROLES, ORDENAÇÃO E FILTROS */}
      <div className="space-y-4">
        {/* Linha 1: Abas de Ordenação e Busca */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Abas de Ordenação */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 shrink-0">
            <button
              onClick={() => setSortBy("score")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                sortBy === "score"
                  ? "bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/20 scale-105"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Mais Votados</span>
            </button>

            <button
              onClick={() => setSortBy("recent")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                sortBy === "recent"
                  ? "bg-white text-black shadow-md scale-105"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Mais Recentes</span>
            </button>

            <button
              onClick={() => setSortBy("comments")}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                sortBy === "comments"
                  ? "bg-purple-500 text-white shadow-md scale-105"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Mais Comentados</span>
            </button>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por ideia, bug ou autor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#14161e] border border-white/10 rounded-2xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-[#00E5FF] transition-colors"
            />
          </div>
        </div>

        {/* Linha 2: Chips de Categoria e Filtro de Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Chips de Categorias */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                categoryFilter === "all"
                  ? "bg-white text-black shadow-sm"
                  : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Todas ({items.length})
            </button>

            {FEEDBACK_CATEGORIES.map((cat) => {
              const count = items.filter((i) => i.category === cat.id).length;
              const isSelected = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-white text-black font-bold shadow-sm"
                      : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <span>{cat.label}</span>
                  <span className="text-[10px] font-mono opacity-70">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Filtro por Status */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-neutral-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as FeedbackStatus | "all")}
              className="bg-[#14161e] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
            >
              <option value="all">Todos os Status</option>
              <option value="under_review">🟡 Em Análise</option>
              <option value="planned">🟣 Planejado</option>
              <option value="in_progress">🔵 Em Desenvolvimento</option>
              <option value="completed">🟢 Implementado</option>
              <option value="declined">🔴 Não Viável</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. LISTA DE CARDS DE FEEDBACK */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="space-y-4 animate-pulse py-4">
            <div className="h-32 rounded-3xl bg-[#14161e]" />
            <div className="h-32 rounded-3xl bg-[#14161e]" />
            <div className="h-32 rounded-3xl bg-[#14161e]" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-[32px] bg-[#14161e] border border-dashed border-white/10 p-10 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-[#00E5FF] flex items-center justify-center mx-auto">
              <Lightbulb className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                Nenhuma publicação encontrada
              </h3>
              <p className="text-xs text-neutral-400 max-w-md mx-auto">
                {searchQuery
                  ? "Tente alterar os termos da sua pesquisa ou redefinir os filtros."
                  : "Seja o primeiro a enviar uma ideia de novo recurso ou reportar um erro!"}
              </p>
            </div>
            <button
              onClick={() => {
                if (!user) setIsAuthOpen(true);
                else setIsNewModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-all shadow-md active:scale-95"
            >
              + Enviar Primeira Sugestão
            </button>
          </div>
        ) : (
          filteredItems.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              userVote={userVotes[item.id] || 0}
              onVote={handleVote}
              onOpenDetail={(i) => setDetailItem(i)}
              onOpenRewardModal={(i) => setRewardTargetItem(i)}
              onStatusChange={isAdmin ? handleStatusChange : undefined}
              onDelete={handleDeleteFeedback}
              isAdmin={isAdmin}
              currentUserId={user?.uid}
            />
          ))
        )}
      </div>

      {/* Modais Integrados */}
      <NewFeedbackModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSubmit={handleCreateFeedback}
        user={user}
        onRequireAuth={() => setIsAuthOpen(true)}
        existingFeedbacks={items}
      />

      <FeedbackDetailModal
        item={detailItem}
        isOpen={Boolean(detailItem)}
        onClose={() => setDetailItem(null)}
        userVote={detailItem ? userVotes[detailItem.id] || 0 : 0}
        onVote={handleVote}
        user={user}
        isAdmin={isAdmin}
        onRequireAuth={() => setIsAuthOpen(true)}
        onOpenRewardModal={(i) => setRewardTargetItem(i)}
        onStatusChange={isAdmin ? handleStatusChange : undefined}
        onDelete={handleDeleteFeedback}
      />

      <GrantRewardModal
        item={rewardTargetItem}
        isOpen={Boolean(rewardTargetItem)}
        onClose={() => setRewardTargetItem(null)}
        onGrantReward={handleGrantReward}
      />

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
