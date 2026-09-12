"use client";

import React, { useState, useEffect } from "react";
import { SystemNotification } from "@/lib/types";
import { subscribeToSystemNotifications } from "@/lib/firebase";
import {
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
  INITIAL_FEATURE_NOTIFICATION,
  filterActiveNotifications,
} from "@/lib/notifications";
import NotificationDrawer from "./NotificationDrawer";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isLoadingPush, setIsLoadingPush] = useState(false);

  useEffect(() => {
    // Se o usuário não estiver logado, não carrega nem escuta notificações
    if (!user) {
      setNotifications([]);
      return;
    }

    // Carrega IDs lidos
    setReadIds(getReadNotificationIds());

    if (isNotificationSupported()) {
      setIsPushEnabled(getNotificationPermission() === "granted");
    }

    // Assina notificações em tempo real do Firestore apenas para usuários autenticados
    const unsubscribe = subscribeToSystemNotifications((serverNotifs) => {
      let merged: SystemNotification[] = [];

      if (serverNotifs.length > 0) {
        merged = serverNotifs;
      } else {
        merged = [INITIAL_FEATURE_NOTIFICATION];
      }

      // Aplica filtro de retenção de dias e limite máximo de quantidade
      const activeList = filterActiveNotifications(merged);
      setNotifications(activeList);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user]);

  // Usuários não logados não visualizam a central nem o sino de notificações
  if (!user) {
    return null;
  }

  const handleMarkAsRead = (id: string) => {
    markNotificationAsRead(id);
    setReadIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleMarkAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    markAllNotificationsAsRead(allIds);
    setReadIds(allIds);
  };

  const handleEnablePush = async () => {
    setIsLoadingPush(true);
    try {
      const res = await requestNotificationPermission();
      if (res === "granted") {
        setIsPushEnabled(true);
      }
    } finally {
      setIsLoadingPush(false);
    }
  };

  const unreadCount = notifications.filter((n) => !readIds.includes(n.id)).length;

  return (
    <>
      {/* Botão de Sino no Navbar */}
      <button
        type="button"
        onClick={() => setIsDrawerOpen(true)}
        className="relative p-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
        title="Notificações & Novidades"
        aria-label="Notificações"
      >
        <Bell className="w-4 h-4 text-neutral-300 hover:text-[#00E5FF] transition-colors" />

        {/* Badge Pulsante de Não Lidas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00E5FF] text-black text-[10px] font-black font-mono flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Drawer com Histórico de Cards */}
      <NotificationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notifications={notifications}
        readIds={readIds}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onEnablePush={handleEnablePush}
        isPushEnabled={isPushEnabled}
        isLoadingPush={isLoadingPush}
      />
    </>
  );
}
