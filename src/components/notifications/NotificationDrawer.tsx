"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  SystemNotification,
  NOTIFICATION_CATEGORIES,
} from "@/lib/types";
import {
  Bell,
  X,
  CheckCheck,
  Sparkles,
  Gamepad2,
  Zap,
  Trophy,
  ExternalLink,
  ChevronRight,
  Clock,
  Shield,
} from "lucide-react";

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SystemNotification[];
  readIds: string[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onEnablePush: () => Promise<void>;
  isPushEnabled: boolean;
  isLoadingPush: boolean;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  readIds,
  onMarkAsRead,
  onMarkAllAsRead,
  onEnablePush,
  isPushEnabled,
  isLoadingPush,
}: NotificationDrawerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || typeof document === "undefined") return null;

  const renderCategoryIcon = (category: string) => {
    switch (category) {
      case "feature":
        return <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />;
      case "content":
        return <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "update":
        return <Zap className="w-3.5 h-3.5 text-amber-300" />;
      case "reward":
        return <Trophy className="w-3.5 h-3.5 text-yellow-300" />;
      case "general":
      default:
        return <Bell className="w-3.5 h-3.5 text-purple-300" />;
    }
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  return createPortal(
    <div
      className="fixed inset-0 z-[110] !m-0 !mt-0 flex justify-end bg-black/75 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <aside
        className="relative w-full max-w-md h-[100dvh] bg-[#0e1015] border-l border-white/10 flex flex-col shadow-2xl z-[111] overflow-hidden animate-slideInRight pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Topo do Drawer com proteção para Dynamic Island / Notch / Status Bar */}
        <div className="shrink-0 px-4 sm:px-5 pt-safe-offset pb-3.5 sm:pb-4 border-b border-white/10 bg-[#12141a] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-[#00E5FF] flex items-center justify-center font-bold shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  Notificações &amp; Avisos
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-cyan-500 text-black font-mono shrink-0">
                    {unreadCount} novas
                  </span>
                )}
              </div>
              <p className="text-[11px] text-neutral-400 truncate">
                Novos recursos, conteúdos e comunicados da equipe
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-400 hover:text-white transition-all flex items-center justify-center border border-white/10 shrink-0 cursor-pointer"
            title="Fechar"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Banner CTA para Push se desativado */}
        {!isPushEnabled && (
          <div className="p-3 mx-4 mt-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#141720] to-transparent border border-cyan-500/30 flex items-center justify-between gap-3 shrink-0">
            <div className="text-xs space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Ativar Notificações Push</span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Receba alertas no navegador quando novos jogos forem lançados.
              </p>
            </div>
            <button
              onClick={onEnablePush}
              disabled={isLoadingPush}
              className="px-3 py-1.5 rounded-xl bg-[#00E5FF] hover:bg-cyan-400 text-black text-xs font-black shrink-0 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoadingPush ? "Ativando..." : "Ativar"}
            </button>
          </div>
        )}

        {/* Barra de Ações Rápidas (Marcar todas como lidas) */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between text-xs text-neutral-400 shrink-0">
            <span>{notifications.length} avisos no total</span>
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[#00E5FF] hover:underline flex items-center gap-1 font-semibold text-[11px]"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Marcar todas como lidas</span>
              </button>
            )}
          </div>
        )}

        {/* Lista de Cards de Notificação */}
        <div className="flex-1 overflow-y-auto p-4 pb-safe-offset space-y-3 overscroll-contain [-webkit-overflow-scrolling:touch]">
          {notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-400 space-y-2 border border-dashed border-white/10 rounded-2xl bg-white/[0.02] my-4">
              <Bell className="w-8 h-8 text-neutral-600 mx-auto stroke-1" />
              <p className="font-semibold text-neutral-300">Você está em dia!</p>
              <p className="text-[11px]">Nenhuma nova notificação no momento.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isRead = readIds.includes(notif.id);
              const catConfig = NOTIFICATION_CATEGORIES[notif.category] || NOTIFICATION_CATEGORIES.general;

              return (
                <article
                  key={notif.id}
                  onClick={() => onMarkAsRead(notif.id)}
                  className={`p-4 rounded-2xl border transition-all space-y-2.5 relative group ${
                    isRead
                      ? "bg-[#111319] border-white/5 opacity-80 hover:opacity-100"
                      : "bg-[#161922] border-cyan-500/30 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/20"
                  }`}
                >
                  {/* Topo do Card: Categoria + Data + Bolinha Não-Lida */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${catConfig.badgeClass}`}>
                        {renderCategoryIcon(notif.category)}
                        <span>{catConfig.label}</span>
                      </span>
                      {notif.isPinned && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                          FIXO
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-neutral-400 font-mono">
                        {new Date(notif.createdAt).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "short",
                        })}
                      </span>
                      {!isRead && (
                        <span
                          className="w-2 h-2 rounded-full bg-[#00E5FF] shadow-[0_0_8px_#00E5FF]"
                          title="Não lida"
                        />
                      )}
                    </div>
                  </div>

                  {/* Título e Conteúdo */}
                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors leading-snug">
                    {notif.title}
                  </h4>
                  <p className="text-xs text-neutral-300 leading-relaxed whitespace-pre-line">
                    {notif.message}
                  </p>

                  {/* Link de Ação (se houver) */}
                  {notif.linkUrl && (
                    <div className="pt-1">
                      <Link
                        href={notif.linkUrl}
                        onClick={onClose}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#00E5FF] hover:text-cyan-300 transition-colors"
                      >
                        <span>{notif.linkLabel || "Ver mais detalhes"}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </aside>
    </div>,
    document.body
  );
}
