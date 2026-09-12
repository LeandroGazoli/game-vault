"use client";

import React, { useState, useEffect } from "react";
import { IndieComment } from "@/lib/types/indie.types";
import { fetchIndieComments, addIndieComment } from "@/lib/indieService";
import { useAuth } from "@/context/AuthContext";
import { triggerSuccessHaptic } from "@/lib/capacitor";
import AuthModal from "@/components/AuthModal";
import { MessageSquare, Send, Loader2, User } from "lucide-react";

interface IndieCommentsSectionProps {
  gameId: string;
  gameTitle: string;
}

export default function IndieCommentsSection({
  gameId,
  gameTitle,
}: IndieCommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<IndieComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const loadComments = async () => {
    try {
      const data = await fetchIndieComments(gameId);
      setComments(data);
    } catch (err) {
      console.error("Erro ao carregar comentários:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      await addIndieComment(gameId, {
        userId: user.uid,
        userName: user.displayName || "Jogador da Comunidade",
        userAvatar: user.photoURL || undefined,
        content: newComment.trim(),
      });
      triggerSuccessHaptic();
      setNewComment("");
      await loadComments();
    } catch (err) {
      console.error("Erro ao enviar comentário:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#141822] p-6 sm:p-8 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            Mural da Comunidade &amp; Feedback ao Criador
          </h3>
          <p className="text-xs text-gray-400">
            Deixe seu apoio, impressões e dicas para a equipe de desenvolvimento de {gameTitle}.
          </p>
        </div>
        <span className="text-xs font-mono text-gray-400 font-bold">
          {comments.length} mensagens
        </span>
      </div>

      {/* Formulário de Envio */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {user ? (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || "User"} className="w-full h-full object-cover" />
              ) : (
                <User className="w-4 h-4 text-gray-400" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                rows={3}
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Escreva uma mensagem de apoio, feedback sobre a demo ou sua expectativa..."
                className="w-full px-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
              />
              <button
                type="submit"
                disabled={submitting || !newComment.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Enviar Comentário
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            <p className="text-xs text-gray-300">
              Faça login para apoiar o desenvolvedor e deixar sua mensagem no mural.
            </p>
            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs whitespace-nowrap shadow-md"
            >
              Entrar para Comentar
            </button>
          </div>
        )}
      </form>

      {/* Lista de Comentários */}
      <div className="space-y-3 pt-2">
        {loading ? (
          <p className="text-xs text-gray-500 font-mono text-center py-4">
            Carregando mensagens da comunidade...
          </p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-gray-500 text-center py-6">
            Seja o primeiro a deixar uma mensagem de incentivo para este jogo indie!
          </p>
        ) : (
          comments.map((comm) => (
            <div
              key={comm.id}
              className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {comm.userAvatar ? (
                      <img src={comm.userAvatar} alt={comm.userName} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                  <span className="text-xs font-bold text-white">{comm.userName}</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">
                  {new Date(comm.createdAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed pl-8">
                {comm.content}
              </p>
            </div>
          ))
        )}
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
