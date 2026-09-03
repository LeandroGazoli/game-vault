"use client";

import React, { useState, useEffect } from "react";
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
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        onClose();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification) return null;

  const catConfig = NOTIFICATION_CATEGORIES[notification.category] || NOTIFICATION_CATEGORIES.general;

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-[120] max-w-sm w-full animate-slideInUp">
      <div className="rounded-2xl p-4 bg-[#141722]/95 border border-cyan-500/40 text-white shadow-[0_15px_40px_rgba(0,0,0,0.8)] backdrop-blur-md space-y-2 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 pr-6">
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${catConfig.badgeClass}`}>
            {catConfig.label}
          </span>
          <span className="text-[10px] text-neutral-400 font-mono">Agora</span>
        </div>

        <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
          {notification.title}
        </h4>

        <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
          {notification.message}
        </p>

        {notification.linkUrl && (
          <div className="pt-1">
            <Link
              href={notification.linkUrl}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-xs font-black text-[#00E5FF] hover:underline"
            >
              <span>{notification.linkLabel || "Ver novidade"}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
