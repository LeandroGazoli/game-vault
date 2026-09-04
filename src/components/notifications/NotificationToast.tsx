"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { SystemNotification, NOTIFICATION_CATEGORIES } from "@/lib/types";
import {
  Bell,
  X,
  Sparkles,
  Gamepad2,
  Zap,
  Trophy,
  ChevronRight,
} from "lucide-react";

interface NotificationToastProps {
  notification: SystemNotification | null;
  onClose: () => void;
}

export default function NotificationToast({
  notification,
  onClose,
}: NotificationToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification || !mounted || typeof document === "undefined") return null;

  const catConfig = NOTIFICATION_CATEGORIES[notification.category] || NOTIFICATION_CATEGORIES.general;

  const renderIcon = () => {
    switch (notification.category) {
      case "feature":
        return <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />;
      case "content":
        return <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />;
      case "update":
        return <Zap className="w-3.5 h-3.5 text-amber-300" />;
      case "reward":
        return <Trophy className="w-3.5 h-3.5 text-yellow-300" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-purple-300" />;
    }
  };

  return createPortal(
    <aside
      aria-label="Aviso do sistema"
      className="fixed top-[calc(4.75rem+env(safe-area-inset-top,0px))] right-3 sm:right-6 z-[99999] max-w-[calc(100vw-1.5rem)] sm:max-w-sm w-full animate-slideInDown pointer-events-auto select-none"
    >
      <div className="rounded-2xl p-4 bg-[#12141c]/95 border border-cyan-500/40 text-white shadow-[0_20px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10 backdrop-blur-xl space-y-2 relative transition-all">
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Fechar notificação"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Categoria & Horário */}
        <div className="flex items-center gap-2 pr-7">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1.5 ${catConfig.badgeClass}`}>
            {renderIcon()}
            <span>{catConfig.label}</span>
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">Novo</span>
        </div>

        {/* Título */}
        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug pr-4">
          {notification.title}
        </h4>

        {/* Mensagem */}
        <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {/* Link de Ação Opcional */}
        {notification.linkUrl && (
          <div className="pt-1">
            <Link
              href={notification.linkUrl}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-black text-[#00E5FF] hover:underline active:scale-95 transition-transform"
            >
              <span>{notification.linkLabel || "Ver novidade"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </aside>,
    document.body
  );
}
