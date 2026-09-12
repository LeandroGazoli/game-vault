import { SystemNotification } from "./types";

const READ_STORAGE_KEY = "mgl_read_notifications_v1";

// Configurações de retenção e limite de exibição
export const NOTIFICATION_RETENTION_DAYS = 30; // Notificações expiram visualmente após 30 dias (exceto fixadas)
export const NOTIFICATION_DISPLAY_LIMIT = 20;  // Máximo de notificações exibidas simultaneamente

// Notificação padrão automática destacando o novo recurso
export const INITIAL_FEATURE_NOTIFICATION: SystemNotification = {
  id: "initial-feedback-feature",
  title: "💡 Novo Recurso: Central de Ideias, Bugs & Votação!",
  message:
    "Agora você decide o que será implementado no MyGameList! Envie sugestões, relate bugs e vote nas melhores ideias. Contribuições aceitas ganham VIP Vitalício e tags exclusivas!",
  category: "feature",
  linkUrl: "/feedback",
  linkLabel: "Conhecer Central & Votar →",
  isPinned: true,
  createdAt: "2026-09-03T20:00:00.000Z",
};

/**
 * Filtra notificações aplicando limite de retenção em dias e cota máxima de itens.
 * Itens fixados (`isPinned: true`) são mantidos e ordenados no topo.
 */
export function filterActiveNotifications(
  notifications: SystemNotification[],
  options?: {
    maxDays?: number;
    maxLimit?: number;
  }
): SystemNotification[] {
  const maxDays = options?.maxDays ?? NOTIFICATION_RETENTION_DAYS;
  const maxLimit = options?.maxLimit ?? NOTIFICATION_DISPLAY_LIMIT;
  const cutoffTime = Date.now() - maxDays * 24 * 60 * 60 * 1000;

  // Filtra por data (mantendo sempre as fixadas)
  const valid = notifications.filter((item) => {
    if (item.isPinned) return true;
    const createdAtMs = new Date(item.createdAt).getTime();
    if (isNaN(createdAtMs)) return true;
    return createdAtMs >= cutoffTime;
  });

  // Ordena: fixados primeiro, e depois os mais recentes
  valid.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return valid.slice(0, maxLimit);
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return "denied";
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Dispara uma notificação de boas-vindas para confirmação instantânea
      await showLocalNotification("Notificações Ativadas! 🎮", {
        body: "Você receberá alertas sobre novos jogos, lançamentos e atualizações do MyGameList.",
        url: "/feedback",
      });
    }
    return permission;
  } catch (err) {
    console.error("Erro ao solicitar permissão de notificações:", err);
    return "denied";
  }
}

export async function showLocalNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    badge?: string;
    url?: string;
  }
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== "granted") {
    return false;
  }

  const notificationOptions = {
    body: options?.body || "",
    icon: options?.icon || "/icon-192.png",
    badge: options?.badge || "/icon-192.png",
    data: { url: options?.url || "/" },
    vibrate: [100, 50, 100],
  };

  try {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration && registration.showNotification) {
        await registration.showNotification(title, notificationOptions);
        return true;
      }
    }
    // Fallback nativo
    const n = new Notification(title, notificationOptions);
    n.onclick = () => {
      window.focus();
      if (options?.url) {
        window.location.href = options.url;
      }
    };
    return true;
  } catch (e) {
    console.warn("Falha ao disparar notificação local:", e);
    return false;
  }
}

const DISMISSED_STORAGE_KEY = "mgl_dismissed_notifications_v1";

// ==========================================
// GERENCIADOR DE LEITURA (LOCALSTORAGE)
// ==========================================

export function getReadNotificationIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function markNotificationAsRead(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getReadNotificationIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error("Erro ao marcar notificação como lida:", err);
  }
}

export function markAllNotificationsAsRead(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    const current = getReadNotificationIds();
    const merged = Array.from(new Set([...current, ...ids]));
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(merged));
  } catch (err) {
    console.error("Erro ao marcar todas como lidas:", err);
  }
}

// ==========================================
// GERENCIADOR DE NOTIFICAÇÕES DISPENSADAS/EXCLUÍDAS DO PERFIL
// ==========================================

export function getDismissedNotificationIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function dismissNotificationLocally(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getDismissedNotificationIds();
    if (!current.includes(id)) {
      const updated = [...current, id];
      localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(updated));
    }
  } catch (err) {
    console.error("Erro ao dispensar notificação localmente:", err);
  }
}

export function getUnreadCount(
  notifications: SystemNotification[],
  readIds: string[] = getReadNotificationIds()
): number {
  return notifications.filter((n) => !readIds.includes(n.id)).length;
}
