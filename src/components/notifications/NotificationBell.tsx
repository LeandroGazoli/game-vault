"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SystemNotification } from "@/lib/types";
import {
  subscribeToSystemNotifications,
  markNotificationAsReadForUser,
  markAllNotificationsAsReadForUser,
  dismissNotificationForUser,
} from "@/lib/firebase";
import {
  getReadNotificationIds,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getDismissedNotificationIds,
  dismissNotificationLocally,
  getNotificationPermission,
  requestNotificationPermission,
  isNotificationSupported,
  INITIAL_FEATURE_NOTIFICATION,
  filterActiveNotifications,
} from "@/lib/notifications";
import { triggerSelectionHaptic, triggerHaptic } from "@/lib/capacitor";
import NotificationDrawer from "./NotificationDrawer";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function NotificationBell() {
  const { user } = useAuth();
  const [rawNotifications, setRawNotifications] = useState<SystemNotification[]>([]);
  const [localReadIds, setLocalReadIds] = useState<string[]>([]);
  const [localDismissedIds, setLocalDismissedIds] = useState<string[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPushEnabled, setIsPushEnabled] = useState(false);
  const [isLoadingPush, setIsLoadingPush] = useState(false);

  // Inicializa leituras e dispensados combinando Firestore (user profile) e localStorage
  useEffect(() => {
    if (!user) {
      setRawNotifications([]);
      return;
    }

    const storedReads = getReadNotificationIds();
    const userProfileReads = user.readNotificationIds || [];
    const mergedReads = Array.from(new Set([...storedReads, ...userProfileReads]));
    setLocalReadIds(mergedReads);

    const storedDismissed = getDismissedNotificationIds();
    const userProfileDismissed = user.dismissedNotificationIds || [];
    const mergedDismissed = Array.from(new Set([...storedDismissed, ...userProfileDismissed]));
    setLocalDismissedIds(mergedDismissed);

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

      setRawNotifications(merged);
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
  }, [user]);

  // Filtra notificações ativas removendo as que o usuário excluiu/dispensou do perfil
  const activeNotifications = useMemo(() => {
    const withoutDismissed = rawNotifications.filter(
      (item) => !localDismissedIds.includes(item.id)
    );
    return filterActiveNotifications(withoutDismissed);
  }, [rawNotifications, localDismissedIds]);

  // Marca uma notificação como lida
  const handleMarkAsRead = useCallback(
    (id: string) => {
      if (localReadIds.includes(id)) return;
      markNotificationAsRead(id);
      setLocalReadIds((prev) => [...prev, id]);

      if (user?.uid) {
        markNotificationAsReadForUser(user.uid, id);
      }
    },
    [localReadIds, user?.uid]
  );

  // Alterna o status entre lida e não lida
  const handleToggleRead = useCallback(
    (id: string) => {
      triggerSelectionHaptic();
      setLocalReadIds((prev) => {
        const isRead = prev.includes(id);
        if (isRead) {
          return prev.filter((item) => item !== id);
        } else {
          markNotificationAsRead(id);
          if (user?.uid) {
            markNotificationAsReadForUser(user.uid, id);
          }
          return [...prev, id];
        }
      });
    },
    [user?.uid]
  );

  // Marca todas as visíveis como lidas
  const handleMarkAllAsRead = useCallback(() => {
    triggerSelectionHaptic();
    const allIds = activeNotifications.map((n) => n.id);
    markAllNotificationsAsRead(allIds);
    setLocalReadIds((prev) => Array.from(new Set([...prev, ...allIds])));

    if (user?.uid) {
      markAllNotificationsAsReadForUser(user.uid, allIds);
    }
  }, [activeNotifications, user?.uid]);

  // Exclui/remove a notificação do perfil do usuário
  const handleDismissNotification = useCallback(
    (id: string) => {
      triggerHaptic("medium");
      dismissNotificationLocally(id);
      setLocalDismissedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

      if (user?.uid) {
        dismissNotificationForUser(user.uid, id);
      }
    },
    [user?.uid]
  );

  // Limpa todas as notificações visíveis do perfil
  const handleDismissAll = useCallback(() => {
    triggerHaptic("medium");
    const idsToDismiss = activeNotifications.map((n) => n.id);
    idsToDismiss.forEach((id) => dismissNotificationLocally(id));
    setLocalDismissedIds((prev) => Array.from(new Set([...prev, ...idsToDismiss])));

    if (user?.uid) {
      idsToDismiss.forEach((id) => dismissNotificationForUser(user.uid, id));
    }
  }, [activeNotifications, user?.uid]);

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

  // Visitantes não logados não visualizam o sino
  if (!user) {
    return null;
  }

  const unreadCount = activeNotifications.filter((n) => !localReadIds.includes(n.id)).length;

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
        notifications={activeNotifications}
        readIds={localReadIds}
        onMarkAsRead={handleMarkAsRead}
        onToggleRead={handleToggleRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onDismissNotification={handleDismissNotification}
        onDismissAll={handleDismissAll}
        onEnablePush={handleEnablePush}
        isPushEnabled={isPushEnabled}
        isLoadingPush={isLoadingPush}
      />
    </>
  );
}
