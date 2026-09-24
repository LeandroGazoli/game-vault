"use client";

import React, { useState } from "react";
import { ProfileGuestbookEntry, ProfileGuestbookConfig } from "@/lib/types/profile.types";
import { MessageSquare, Send, CheckCircle2, ShieldCheck, Trash2, Heart, Sparkles, Gamepad2 } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";

interface ProfileGuestbookSectionProps {
  entries?: ProfileGuestbookEntry[];
  config?: ProfileGuestbookConfig;
  isOwner?: boolean;
  currentViewer?: {
    uid: string;
    username: string;
    displayName: string;
    photoURL?: string | null;
  } | null;
  onPostMessage?: (entry: Omit<ProfileGuestbookEntry, "id" | "createdAt" | "approved">) => Promise<void>;
  onApproveMessage?: (entryId: string) => Promise<void>;
  onDeleteMessage?: (entryId: string) => Promise<void>;
}

export default function ProfileGuestbookSection({
  entries: initialEntries = [],
  config = { enabled: true, requireApproval: false },
  isOwner = false,
  currentViewer,
  onPostMessage,
  onApproveMessage,
  onDeleteMessage,
}: ProfileGuestbookSectionProps) {
  const [entries, setEntries] = useState<ProfileGuestbookEntry[]>(initialEntries);
  const [newMsg, setNewMsg] = useState("");
  const [playedTogether, setPlayedTogether] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  if (!config.enabled && !isOwner) return null;

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !currentViewer) return;

    triggerSuccessHaptic();
    setIsSubmitting(true);

    const isAutoApproved = !config.requireApproval || isOwner;
    const newEntry: ProfileGuestbookEntry = {
      id: "gb_" + Date.now(),
      authorUid: currentViewer.uid,
      authorUsername: currentViewer.username,
      authorDisplayName: currentViewer.displayName,
      authorPhotoURL: currentViewer.photoURL,
      content: newMsg.trim(),
      playedTogetherGameTitle: playedTogether.trim() || undefined,
      createdAt: new Date().toISOString(),
      approved: isAutoApproved,
    };

    setEntries((prev) => [newEntry, ...prev]);

    if (onPostMessage) {
      await onPostMessage({
        authorUid: currentViewer.uid,
        authorUsername: currentViewer.username,
        authorDisplayName: currentViewer.displayName,
        authorPhotoURL: currentViewer.photoURL,
        content: newMsg.trim(),
        playedTogetherGameTitle: playedTogether.trim() || undefined,
      });
    }

    if (!isAutoApproved) {
      setNotice("Mensagem enviada com sucesso! Ela aparecerá no mural assim que o dono do perfil aprovar.");
    }

    setNewMsg("");
    setPlayedTogether("");
    setIsSubmitting(false);
  };

  const handleApprove = async (id: string) => {
    triggerSuccessHaptic();
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, approved: true } : e)));
    if (onApproveMessage) {
      await onApproveMessage(id);
    }
  };

  const handleDelete = async (id: string) => {
    triggerSelectionHaptic();
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (onDeleteMessage) {
      await onDeleteMessage(id);
    }
  };

  // Se o visitante for qualquer pessoa, só vê os aprovados ou suas próprias mensagens
  const visibleEntries = entries.filter((e) => {
    if (isOwner) return true;
    if (e.approved) return true;
    if (currentViewer && e.authorUid === currentViewer.uid) return true;
    return false;
  });

  return (
    <div className="rounded-3xl border border-white/10 bg-[#141822] p-4 sm:p-6 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Mural da Comunidade
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 font-mono border border-purple-500/20">
                Guestbook
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">Mensagens, recados e conexões de quem jogou junto</p>
          </div>
        </div>

        {isOwner && config.requireApproval && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-semibold">
            <ShieldCheck className="w-3 h-3" />
            <span>Moderação Ativa</span>
          </div>
        )}
      </div>

      {/* Caixa de Entrada para deixar recado */}
      {currentViewer ? (
        <form onSubmit={handlePost} className="p-3 sm:p-4 rounded-2xl bg-[#0b0d12] border border-white/10 space-y-3">
          <div className="flex items-start gap-2.5">
            <UserAvatar
              photoURL={currentViewer.photoURL}
              name={currentViewer.displayName || currentViewer.username}
              size="sm"
            />
            <div className="flex-1 space-y-2">
              <textarea
                value={newMsg}
                onChange={(e) => setNewMsg(e.target.value)}
                rows={2}
                placeholder="Deixe um recado amigável no mural deste perfil..."
                required
                maxLength={500}
                className="w-full bg-[#141822] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-400 resize-none"
              />
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1">
                  <Gamepad2 className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <input
                    type="text"
                    value={playedTogether}
                    onChange={(e) => setPlayedTogether(e.target.value)}
                    placeholder="Jogamos juntos? Ex: Helldivers 2, CoD..."
                    className="w-full bg-[#141822] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !newMsg.trim()}
                  className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs active:scale-95 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar Recado</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-3 rounded-2xl bg-[#0b0d12]/50 border border-white/5 text-center text-xs text-gray-400">
          Faça login para deixar um recado neste perfil.
        </div>
      )}

      {notice && (
        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-[11px] text-purple-200">
          {notice}
        </div>
      )}

      {/* Lista de Recados */}
      {visibleEntries.length === 0 ? (
        <div className="py-6 text-center border border-dashed border-white/10 rounded-2xl bg-[#0b0d12]/30 space-y-1">
          <Sparkles className="w-6 h-6 text-gray-600 mx-auto" />
          <p className="text-xs text-gray-400">Nenhum recado no mural ainda. Seja o primeiro a assinar!</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {visibleEntries.map((entry) => (
            <div
              key={entry.id}
              className={`p-3 rounded-2xl border transition-all ${
                !entry.approved
                  ? "bg-amber-950/20 border-amber-500/30"
                  : "bg-[#0e1118] border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <UserAvatar photoURL={entry.authorPhotoURL} name={entry.authorDisplayName} size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-white">{entry.authorDisplayName}</span>
                      <span className="text-[10px] text-gray-400">@{entry.authorUsername}</span>
                      {!entry.approved && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 font-mono">
                          Pendente
                        </span>
                      )}
                    </div>
                    {entry.playedTogetherGameTitle && (
                      <div className="text-[10px] text-purple-300 flex items-center gap-1 mt-0.5">
                        <Gamepad2 className="w-3 h-3" />
                        <span>Jogou junto: <strong>{entry.playedTogetherGameTitle}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ações do Dono ou Autor */}
                <div className="flex items-center gap-1">
                  {isOwner && !entry.approved && (
                    <button
                      type="button"
                      onClick={() => handleApprove(entry.id)}
                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white transition-all text-xs"
                      title="Aprovar Recado"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {(isOwner || (currentViewer && currentViewer.uid === entry.authorUid)) && (
                    <button
                      type="button"
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500 text-gray-400 hover:text-white transition-all text-xs"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-gray-300 mt-2 pl-9 whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
