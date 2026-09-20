"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SystemNotification } from "@/lib/types";
import {
  subscribeToSystemNotifications,
  subscribeToUserPrivateNotifications,
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
import { Button } from "@/components/ui/button";

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

    let globalNotifs: SystemNotification[] = [];
    let privateNotifs: SystemNotification[] = [];

    const updateCombined = () => {
      const all = [...privateNotifs, ...globalNotifs];
      const uniqueMap = new Map<string, SystemNotification>();
      all.forEach((n) => uniqueMap.set(n.id, n));
      const sorted = Array.from(uniqueMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setRawNotifications(sorted.length > 0 ? sorted : [INITIAL_FEATURE_NOTIFICATION]);
    };

    // Assina notificações públicas de sistema
    const unsubGlobal = subscribeToSystemNotifications((serverNotifs) => {
      globalNotifs = serverNotifs;
      updateCombined();
    });

    // Assina notificações privadas e direcionadas do usuário (FASE 11 & FASE 14)
    const unsubPrivate = subscribeToUserPrivateNotifications(user.uid, (privates) => {
      privateNotifs = privates;
      updateCombined();
    });

    return () => {
      if (typeof unsubGlobal === "function") unsubGlobal();
      if (typeof unsubPrivate === "function") unsubPrivate();
    };
    // `user` é objeto novo a cada snapshot do doc do usuário; depender dele fazia
    // marcar-como-lida (que escreve no doc) derrubar e recriar os dois listeners.
    // react-doctor-disable-next-line react-doctor/exhaustive-deps -- user é recriado a cada snapshot, depender de user?.uid evita recriar listeners
  }, [user?.uid]);

  // Filtra notificações ativas removendo as que o usuário excluiu/dispensou do perfil
  const activeNotifications = useMemo(() => {
    const dismissedSet = new Set(localDismissedIds);
    const withoutDismissed = rawNotifications.filter((item) => {
      if (dismissedSet.has(item.id)) return false;
      // Notificação direcionada: só exibe se for para o usuário atual
      if (item.targetUserId && item.targetUserId !== user?.uid) return false;
      return true;
    });
    return filterActiveNotifications(withoutDismissed);
  }, [rawNotifications, localDismissedIds, user?.uid]);

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

  // Ativação de Notificações Push Web/Nativo
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

  const unreadCount = useMemo(() => {
    const readSet = new Set(localReadIds);
    return activeNotifications.filter((n) => !readSet.has(n.id)).length;
  }, [activeNotifications, localReadIds]);

  // Visitantes não logados não visualizam o sino
  if (!user) {
    return null;
  }

  return (
    <>
      {/* Botão de Sino no Navbar */}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={() => setIsDrawerOpen(true)}
        className="relative rounded-xl bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 text-neutral-300 hover:text-white transition-all active:scale-95 cursor-pointer shrink-0"
        title="Notificações & Novidades"
        aria-label="Notificações"
      >
        <Bell className="w-4 h-4 text-neutral-300 group-hover:text-[#00E5FF] transition-colors" />

        {/* Badge Pulsante de Não Lidas */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#00E5FF] text-black text-[10px] font-black font-mono flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-pulse pointer-events-none">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>

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
