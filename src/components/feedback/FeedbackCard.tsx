"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FeedbackItem,
  FeedbackStatus,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
} from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import PlanBadge from "@/components/PlanBadge";
import { getProfileUrl } from "@/lib/routes";
import {
  ChevronUp,
  ChevronDown,
  Lightbulb,
  Bug,
  Zap,
  MessageSquare,
  MessageCircle,
  Crown,
  Sparkles,
  Trophy,
  ShieldCheck,
  Share2,
  Check,
  MoreVertical,
  Trash2,
  Clock,
  CheckCircle2,
  Gift,
} from "lucide-react";

interface FeedbackCardProps {
  item: FeedbackItem;
  userVote?: 1 | -1 | 0;
  onVote: (item: FeedbackItem, type: 1 | -1) => Promise<void>;
  onOpenDetail: (item: FeedbackItem) => void;
  onOpenRewardModal?: (item: FeedbackItem) => void;
  onStatusChange?: (item: FeedbackItem, status: FeedbackStatus) => Promise<void>;
  onDelete?: (item: FeedbackItem) => Promise<void>;
  isAdmin?: boolean;
  currentUserId?: string;
}

function formatSafeDate(
  dateVal: any,
  options?: Intl.DateTimeFormatOptions,
  fallback = "Recente"
): string {
  if (!dateVal) return fallback;
  try {
    let date: Date;
    if (typeof dateVal?.toDate === "function") {
      date = dateVal.toDate();
    } else if (typeof dateVal === "object" && typeof dateVal.seconds === "number") {
      date = new Date(dateVal.seconds * 1000);
    } else if (dateVal instanceof Date) {
      date = dateVal;
    } else {
      date = new Date(dateVal);
    }
    if (isNaN(date.getTime())) return fallback;
    return date.toLocaleDateString("pt-BR", options);
  } catch {
    return fallback;
  }
}

export default function FeedbackCard({
  item,
  userVote = 0,
  onVote,
  onOpenDetail,
  onOpenRewardModal,
  onStatusChange,
  onDelete,
  isAdmin = false,
  currentUserId,
}: FeedbackCardProps) {
  const [isVoting, setIsVoting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);

  const categoryConfig = FEEDBACK_CATEGORIES.find((c) => c.id === item.category) || FEEDBACK_CATEGORIES[0];
  const statusConfig = FEEDBACK_STATUSES[item.status] || FEEDBACK_STATUSES.under_review;

  const isAuthor = currentUserId && item.authorId === currentUserId;

  const handleVoteClick = async (e: React.MouseEvent, voteType: 1 | -1) => {
    e.stopPropagation();
    if (isVoting) return;
    setIsVoting(true);
    try {
      await onVote(item, voteType);
    } finally {
      setIsVoting(false);
    }
  };

  const handleCopyShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== "undefined" ? `${window.location.origin}/feedback?id=${item.id}` : "";
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const renderCategoryIcon = () => {
    switch (item.category) {
      case "idea":
        return <Lightbulb className="w-3.5 h-3.5 text-[#00E5FF]" />;
      case "bug":
        return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case "improvement":
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case "feedback":
      default:
        return <MessageSquare className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <article
      onClick={() => onOpenDetail(item)}
      className="group relative rounded-2xl sm:rounded-3xl bg-[#14161d] hover:bg-[#181a23] border border-white/10 hover:border-[#00E5FF]/40 p-4 sm:p-5 transition-all duration-200 shadow-xl cursor-pointer space-y-4"
    >
      {/* Faixa de Recompensa de Honra (se concedida pelo Admin) */}
      {item.rewarded && (
        <div className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-amber-950/20 border border-amber-500/40 text-amber-300 shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400/90 block">
                ⭐ Contribuição Recompensada pela Equipe
              </span>
              <p className="text-xs font-bold text-white truncate">
                {item.rewardTitle || "Recompensa Especial Concedida!"}
              </p>
            </div>
          </div>
          <span className="shrink-0 px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-200 text-[10px] font-bold font-mono border border-amber-400/30 uppercase">
            {item.rewardType === "vip" ? "Membro VIP" : item.rewardType === "pro" ? "Plano PRO" : "Tag Customizada"}
          </span>
        </div>
      )}

      {/* Conteúdo Principal do Card */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Bloco Vertical de Votação (Upvote / Score / Downvote) */}
        <div
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-2xl bg-[#0e1015] border border-white/10 shrink-0 min-w-[48px] sm:min-w-[54px]"
        >
          {/* Botão Upvote */}
          <button
            type="button"
            onClick={(e) => handleVoteClick(e, 1)}
            disabled={isVoting}
            className={`p-1.5 rounded-xl transition-all duration-150 flex items-center justify-center active:scale-90 ${
              userVote === 1
                ? "bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/40 font-bold"
                : "text-neutral-400 hover:text-[#00E5FF] hover:bg-white/5"
            }`}
            title="Votar a favor (Upvote)"
            aria-label="Votar a favor"
          >
            <ChevronUp className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Saldo de Votos (Score) */}
          <span
            className={`font-mono text-xs sm:text-sm font-black my-0.5 tracking-tight ${
              item.score > 0
                ? "text-[#00E5FF]"
                : item.score < 0
                ? "text-rose-400"
                : "text-neutral-400"
            }`}
          >
            {item.score > 0 ? `+${item.score}` : item.score}
          </span>

          {/* Botão Downvote */}
          <button
            type="button"
            onClick={(e) => handleVoteClick(e, -1)}
            disabled={isVoting}
            className={`p-1.5 rounded-xl transition-all duration-150 flex items-center justify-center active:scale-90 ${
              userVote === -1
                ? "bg-rose-500 text-white shadow-lg shadow-rose-500/40 font-bold"
                : "text-neutral-400 hover:text-rose-400 hover:bg-white/5"
            }`}
            title="Votar contra (Downvote)"
            aria-label="Votar contra"
          >
            <ChevronDown className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Lado Direito: Tags, Título, Descrição e Autor */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Linha de Badges (Categoria + Status) */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Badge da Categoria */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${categoryConfig.badgeClass}`}
              >
                {renderCategoryIcon()}
                <span>{categoryConfig.label}</span>
              </span>

              {/* Badge do Status */}
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusConfig.color}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotClass}`} />
                <span>{statusConfig.label}</span>
              </span>
            </div>

            {/* Ações Rápidas do Topo (Compartilhar & Menu Admin) */}
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={handleCopyShare}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Copiar link direto"
                aria-label="Copiar link"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Share2 className="w-3.5 h-3.5" />
                )}
              </button>

              {(isAdmin || isAuthor) && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowAdminMenu(!showAdminMenu)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                    title="Mais opções"
                    aria-label="Mais opções"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {showAdminMenu && (
                    <div className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-[#0c0e14] border border-white/10 shadow-2xl z-30 py-1 text-xs animate-fadeIn">
                      {isAdmin && onOpenRewardModal && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAdminMenu(false);
                            onOpenRewardModal(item);
                          }}
                          className="w-full text-left px-3 py-2 text-amber-300 hover:bg-amber-500/10 flex items-center gap-2 font-bold"
                        >
                          <Gift className="w-3.5 h-3.5 text-amber-400" />
                          <span>🎁 Conceder Recompensa</span>
                        </button>
                      )}

                      {isAdmin && onStatusChange && (
                        <div className="border-t border-white/5 pt-1">
                          <span className="px-3 py-1 text-[10px] font-mono text-neutral-400 uppercase block">
                            Mudar Status:
                          </span>
                          {(
                            [
                              "under_review",
                              "planned",
                              "in_progress",
                              "completed",
                              "declined",
                            ] as FeedbackStatus[]
                          ).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                setShowAdminMenu(false);
                                onStatusChange(item, st);
                              }}
                              className={`w-full text-left px-3 py-1.5 hover:bg-white/5 flex items-center gap-1.5 ${
                                item.status === st ? "text-[#00E5FF] font-bold" : "text-neutral-300"
                              }`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${FEEDBACK_STATUSES[st].dotClass}`} />
                              <span>{FEEDBACK_STATUSES[st].label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {onDelete && (
                        <div className="border-t border-white/5 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setShowAdminMenu(false);
                              if (confirm("Tem certeza que deseja excluir esta sugestão?")) {
                                onDelete(item);
                              }
                            }}
                            className="w-full text-left px-3 py-1.5 text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Excluir</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Título da Sugestão / Bug */}
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-snug">
            {item.title}
          </h3>

          {/* Descrição resumida */}
          <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed whitespace-pre-line">
            {item.description}
          </p>

          {/* Resposta Oficial da Equipe (se houver) */}
          {item.adminResponse && (
            <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/30 to-[#0e1015] border-l-2 border-[#00E5FF] space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#00E5FF]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Resposta da Equipe MyGameList</span>
              </div>
              <p className="text-xs text-neutral-300 italic line-clamp-2">
                &ldquo;{item.adminResponse}&rdquo;
              </p>
            </div>
          )}

          {/* Rodapé: Autor, Selo do Plano, Data e Comentários */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs text-neutral-400 flex-wrap">
            <div className="flex items-center gap-2 min-w-0" onClick={(e) => e.stopPropagation()}>
              <Link
                href={getProfileUrl(item.authorUsername)}
                className="flex items-center gap-2 group/author hover:text-white"
              >
                <UserAvatar photoURL={item.authorPhoto} name={item.authorName || "Jogador"} size="xs" />
                <span className="font-semibold text-neutral-300 group-hover/author:text-[#00E5FF] transition-colors truncate max-w-[120px]">
                  {item.authorName || "Jogador"}
                </span>
              </Link>
              <PlanBadge plan={item.authorPlan || "free"} size="sm" />
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                <Clock className="w-3 h-3 text-neutral-400" />
                {formatSafeDate(item.createdAt, {
                  day: "2-digit",
                  month: "short",
                })}
              </span>

              <div className="flex items-center gap-1 text-[11px] font-mono text-neutral-300 bg-white/5 px-2 py-1 rounded-lg">
                <MessageCircle className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>{item.commentsCount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
