"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FeedbackItem,
  FeedbackComment,
  FeedbackStatus,
  FEEDBACK_CATEGORIES,
  FEEDBACK_STATUSES,
  UserProfile,
} from "@/lib/types";
import {
  getFeedbackComments,
  addFeedbackComment,
  updateFeedbackStatusAndResponse,
} from "@/lib/firebase";
import {
  validateCommentSpam,
  checkCommentCooldown,
  recordCommentSubmission,
} from "@/lib/antiSpam";
import UserAvatar from "@/components/UserAvatar";
import PlanBadge from "@/components/PlanBadge";
import { getProfileUrl } from "@/lib/routes";
import {
  X,
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
  Send,
  Loader2,
  Trash2,
  Clock,
  Gift,
  AlertCircle,
  Edit3,
} from "lucide-react";

interface FeedbackDetailModalProps {
  item: FeedbackItem | null;
  isOpen: boolean;
  onClose: () => void;
  userVote?: 1 | -1 | 0;
  onVote: (item: FeedbackItem, type: 1 | -1) => Promise<void>;
  user: UserProfile | null;
  isAdmin?: boolean;
  onRequireAuth: () => void;
  onOpenRewardModal: (item: FeedbackItem) => void;
  onStatusChange?: (item: FeedbackItem, status: FeedbackStatus, adminNote?: string) => Promise<void>;
  onDelete?: (item: FeedbackItem) => Promise<void>;
}

export default function FeedbackDetailModal({
  item,
  isOpen,
  onClose,
  userVote = 0,
  onVote,
  user,
  isAdmin = false,
  onRequireAuth,
  onOpenRewardModal,
  onStatusChange,
  onDelete,
}: FeedbackDetailModalProps) {
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentInput, setCommentInput] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  // Estados de Admin (Edição de Status e Resposta Oficial)
  const [adminStatus, setAdminStatus] = useState<FeedbackStatus>("under_review");
  const [adminResponseText, setAdminResponseText] = useState("");
  const [isSavingAdmin, setIsSavingAdmin] = useState(false);
  const [showAdminEdit, setShowAdminEdit] = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      setAdminStatus(item.status);
      setAdminResponseText(item.adminResponse || "");
      loadComments(item.id);
    }
  }, [item, isOpen]);

  const loadComments = async (feedbackId: string) => {
    setIsLoadingComments(true);
    try {
      const data = await getFeedbackComments(feedbackId);
      setComments(data);
    } catch (e) {
      console.error("Erro ao carregar comentários:", e);
    } finally {
      setIsLoadingComments(false);
    }
  };

  if (!isOpen || !item) return null;

  const categoryConfig = FEEDBACK_CATEGORIES.find((c) => c.id === item.category) || FEEDBACK_CATEGORIES[0];
  const statusConfig = FEEDBACK_STATUSES[item.status] || FEEDBACK_STATUSES.under_review;

  const handleVoteClick = async (voteType: 1 | -1) => {
    if (isVoting) return;
    setIsVoting(true);
    try {
      await onVote(item, voteType);
    } finally {
      setIsVoting(false);
    }
  };

  const [commentError, setCommentError] = useState<string | null>(null);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    const clean = commentInput.trim();
    if (!clean) return;

    // 1. Verificação Anti-Spam
    const spamCheck = validateCommentSpam(clean);
    if (!spamCheck.isValid) {
      setCommentError(spamCheck.error || "Comentário inválido.");
      return;
    }

    // 2. Cooldown de Comentários
    const cd = checkCommentCooldown(user.uid);
    if (!cd.allowed) {
      setCommentError(cd.reason || "Aguarde alguns segundos antes de comentar novamente.");
      return;
    }

    setCommentError(null);
    setIsSubmittingComment(true);
    try {
      await addFeedbackComment(item.id, {
        feedbackId: item.id,
        authorId: user.uid,
        authorName: user.displayName || "Jogador",
        authorUsername: user.username || "gamer",
        authorPhoto: user.photoURL || null,
        authorPlan: user.plan || "free",
        content: clean,
        isAdmin: Boolean(isAdmin),
      });
      recordCommentSubmission(user.uid);
      setCommentInput("");
      await loadComments(item.id);
    } catch (e: any) {
      console.error("Erro ao enviar comentário:", e);
      setCommentError(e?.message || "Erro ao publicar comentário.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleSaveAdminData = async () => {
    if (!isAdmin || !onStatusChange) return;
    setIsSavingAdmin(true);
    try {
      await onStatusChange(item, adminStatus, adminResponseText);
      setShowAdminEdit(false);
    } catch (e) {
      console.error("Erro ao salvar dados de admin:", e);
    } finally {
      setIsSavingAdmin(false);
    }
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/feedback?id=${item.id}` : "";
    if (url && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] !m-0 !mt-0 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-3xl bg-[#14161e] border border-white/10 p-5 sm:p-8 shadow-2xl space-y-6 text-white max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner de Recompensa (se concedida) */}
        {item.rewarded && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/15 to-transparent border border-amber-500/40 flex items-center justify-between gap-3 shadow-lg shadow-amber-500/10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  ⭐ Destaque da Comunidade • Contribuição Premiada
                </span>
                <h4 className="text-sm sm:text-base font-black text-white">
                  {item.rewardTitle || "Recompensa Concedida"}
                </h4>
                <p className="text-xs text-neutral-300">
                  {item.rewardType === "vip"
                    ? "O autor recebeu o Plano VIP Vitalício do MyGameList."
                    : item.rewardType === "pro"
                    ? "O autor recebeu a assinatura PRO exclusiva."
                    : "O autor recebeu uma tag/insígnia customizada exclusiva em seu perfil."}
                </p>
              </div>
            </div>
            <span className="shrink-0 px-3 py-1 rounded-full bg-amber-500/30 text-amber-200 text-xs font-black font-mono border border-amber-400/40">
              PREMIADO
            </span>
          </div>
        )}

        {/* Topo: Badges, Autor, Data e Votação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Badge Categoria */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${categoryConfig.badgeClass}`}>
                {item.category === "idea" && <Lightbulb className="w-3.5 h-3.5" />}
                {item.category === "bug" && <Bug className="w-3.5 h-3.5" />}
                {item.category === "improvement" && <Zap className="w-3.5 h-3.5" />}
                {item.category === "feedback" && <MessageSquare className="w-3.5 h-3.5" />}
                <span>{categoryConfig.label}</span>
              </span>

              {/* Badge Status */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.color}`}>
                <span className={`w-2 h-2 rounded-full ${statusConfig.dotClass}`} />
                <span>{statusConfig.label}</span>
              </span>
            </div>

            {/* Autor */}
            <div className="flex items-center gap-2 text-xs">
              <Link
                href={getProfileUrl(item.authorUsername)}
                className="flex items-center gap-2 group/author hover:text-white"
              >
                <UserAvatar photoURL={item.authorPhoto} name={item.authorName} size="sm" />
                <div>
                  <div className="font-bold text-neutral-200 group-hover/author:text-[#00E5FF] transition-colors">
                    {item.authorName}
                  </div>
                  <span className="text-[11px] text-neutral-400 font-mono">
                    @{item.authorUsername}
                  </span>
                </div>
              </Link>
              <PlanBadge plan={item.authorPlan || "free"} size="sm" />
              <span className="text-neutral-400">•</span>
              <span className="text-neutral-400 text-[11px]">
                {new Date(item.createdAt).toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Controle de Votos Horizontal no Topo */}
          <div className="flex items-center gap-2 self-start sm:self-center p-1.5 rounded-2xl bg-[#0e1015] border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => handleVoteClick(1)}
              disabled={isVoting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                userVote === 1
                  ? "bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/40"
                  : "text-neutral-300 hover:text-[#00E5FF] hover:bg-white/5"
              }`}
            >
              <ChevronUp className="w-4 h-4" />
              <span>Upvote</span>
            </button>

            <span
              className={`font-mono text-sm font-black px-2 ${
                item.score > 0 ? "text-[#00E5FF]" : item.score < 0 ? "text-rose-400" : "text-neutral-400"
              }`}
            >
              {item.score > 0 ? `+${item.score}` : item.score}
            </span>

            <button
              type="button"
              onClick={() => handleVoteClick(-1)}
              disabled={isVoting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                userVote === -1
                  ? "bg-rose-500 text-white shadow-md shadow-rose-500/40"
                  : "text-neutral-300 hover:text-rose-400 hover:bg-white/5"
              }`}
            >
              <ChevronDown className="w-4 h-4" />
              <span>Downvote</span>
            </button>
          </div>
        </div>

        {/* Título & Descrição Completa */}
        <div className="space-y-3">
          <h2 className="text-xl sm:text-2xl font-black text-white leading-snug">
            {item.title}
          </h2>
          <div className="p-4 rounded-2xl bg-[#0e1015] border border-white/5 text-sm text-neutral-200 leading-relaxed whitespace-pre-line select-text">
            {item.description}
          </div>
        </div>

        {/* Resposta Oficial da Equipe */}
        {item.adminResponse && !showAdminEdit && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#101520] to-[#0e1015] border-l-4 border-[#00E5FF] space-y-2 shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#00E5FF]">
                <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />
                <span>Posicionamento Oficial da Equipe MyGameList</span>
              </div>
              {item.adminResponseAt && (
                <span className="text-[10px] text-neutral-400 font-mono">
                  {new Date(item.adminResponseAt).toLocaleDateString("pt-BR")}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed italic">
              &ldquo;{item.adminResponse}&rdquo;
            </p>
          </div>
        )}

        {/* Painel do Administrador (Editar Status, Resposta & Conceder Recompensa) */}
        {isAdmin && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Controle de Moderação do Administrador</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenRewardModal(item)}
                  className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Gift className="w-3.5 h-3.5 text-amber-400" />
                  <span>🎁 Conceder Recompensa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdminEdit(!showAdminEdit)}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{showAdminEdit ? "Cancelar" : "Editar Status & Nota"}</span>
                </button>
              </div>
            </div>

            {showAdminEdit && (
              <div className="space-y-3 pt-2 border-t border-amber-500/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">
                      Status da Solicitação
                    </label>
                    <select
                      value={adminStatus}
                      onChange={(e) => setAdminStatus(e.target.value as FeedbackStatus)}
                      className="w-full bg-[#0e1015] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                    >
                      <option value="under_review">🟡 Em Análise</option>
                      <option value="planned">🟣 Planejado</option>
                      <option value="in_progress">🔵 Em Desenvolvimento</option>
                      <option value="completed">🟢 Implementado / Concluído</option>
                      <option value="declined">🔴 Não Viável / Recusado</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1">
                      Nota Oficial da Equipe (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Excelente sugestão! Lançado na versão v2.4."
                      value={adminResponseText}
                      onChange={(e) => setAdminResponseText(e.target.value)}
                      className="w-full bg-[#0e1015] border border-white/15 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveAdminData}
                    disabled={isSavingAdmin}
                    className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  >
                    {isSavingAdmin ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>Salvar Alterações de Status</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Seção de Discussão e Comentários */}
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#00E5FF]" />
              <span>Discussão da Comunidade ({comments.length})</span>
            </h3>

            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-1 text-xs text-neutral-400 hover:text-white transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "Link Copiado!" : "Compartilhar"}</span>
            </button>
          </div>

          {/* Formulário de Novo Comentário */}
          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              placeholder={
                user
                  ? "Deixe sua opinião, dica ou comentário..."
                  : "Faça login para participar da discussão..."
              }
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              disabled={!user || isSubmittingComment}
              className="flex-1 bg-[#0e1015] border border-white/10 focus:border-[#00E5FF] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-neutral-500 focus:outline-none transition-colors"
            />
            {user ? (
              <button
                type="submit"
                disabled={isSubmittingComment || !commentInput.trim()}
                className="px-4 py-2.5 rounded-2xl bg-[#00E5FF] hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40"
              >
                {isSubmittingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Comentar</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={onRequireAuth}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-black font-bold text-xs shrink-0 transition-all active:scale-95"
              >
                Entrar
              </button>
            )}
          </form>

          {/* Mensagem de Erro de Comentário / Anti-Spam */}
          {commentError && (
            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{commentError}</span>
            </div>
          )}

          {/* Lista de Comentários */}
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {isLoadingComments ? (
              <div className="py-6 flex items-center justify-center gap-2 text-xs text-neutral-400">
                <Loader2 className="w-4 h-4 animate-spin text-[#00E5FF]" />
                <span>Carregando comentários...</span>
              </div>
            ) : comments.length === 0 ? (
              <div className="py-6 text-center text-xs text-neutral-400 italic bg-white/[0.02] border border-dashed border-white/5 rounded-2xl">
                Seja o primeiro a comentar sobre esta sugestão!
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    c.isAdmin
                      ? "bg-cyan-950/20 border-cyan-500/30"
                      : "bg-[#0e1015] border-white/5"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <UserAvatar photoURL={c.authorPhoto} name={c.authorName} size="xs" />
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-neutral-200">
                          {c.authorName}
                        </span>
                        {c.isAdmin && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-500/20 text-amber-300 font-mono">
                            ADMIN
                          </span>
                        )}
                        <PlanBadge plan={c.authorPlan || "free"} size="sm" />
                      </div>
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono">
                      {new Date(c.createdAt).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-300 pl-7 leading-relaxed whitespace-pre-line select-text">
                    {c.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
