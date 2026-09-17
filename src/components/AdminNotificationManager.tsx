"use client";

import React, { useState, useEffect, useCallback } from "react";
import { SystemNotification, NotificationCategory } from "@/lib/types";
import {
  getSystemNotifications,
  deleteSystemNotification,
  recordAuditLog,
} from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { auth } from "@/lib/firebase";
import {
  showLocalNotification,
  requestNotificationPermission,
  getNotificationPermission,
} from "@/lib/notifications";
import { GroupNotificationInput } from "@/lib/types";
import AdminNotificationForm from "./admin/AdminNotificationForm";
import AdminNotificationConfirmModal from "./admin/AdminNotificationConfirmModal";
import AdminNotificationHistory from "./admin/AdminNotificationHistory";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function AdminNotificationManager() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<NotificationCategory>("feature");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [sendPush, setSendPush] = useState(true);
  const [sendEmail, setSendEmail] = useState(false);

  // Audience targeting
  const [targetType, setTargetType] = useState<GroupNotificationInput["targetType"]>("all");
  const [customUserIds, setCustomUserIds] = useState("");
  const [audienceEstimate, setAudienceEstimate] = useState<number | null>(null);
  const [isLoadingEstimate, setIsLoadingEstimate] = useState(false);

  // Modal & Feedback
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchEstimate = useCallback(async (type: GroupNotificationInput["targetType"]) => {
    if (type === "custom_users") return;
    setIsLoadingEstimate(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;
      const res = await fetch(`/api/admin/notifications/send?targetType=${type}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAudienceEstimate(data.estimate?.totalUsers ?? null);
      }
    } catch (e) {
      console.error("Erro ao estimar audiência:", e);
    } finally {
      setIsLoadingEstimate(false);
    }
  }, []);

  useEffect(() => {
    fetchEstimate(targetType);
  }, [targetType, fetchEstimate]);

  const fetchNotifs = async () => {
    setIsLoading(true);
    try {
      const data = await getSystemNotifications();
      setNotifications(data);
    } catch (e) {
      console.error("Erro ao carregar notificações:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMessage("Título e mensagem são obrigatórios.");
      return;
    }
    if (targetType === "custom_users" && !customUserIds.trim()) {
      setErrorMessage("Informe ao menos um ID ou e-mail de usuário para o disparo personalizado.");
      return;
    }
    setErrorMessage(null);
    setIsConfirmOpen(true);
  };

  const handleExecuteSend = async () => {
    setIsSending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Usuário não autenticado.");

      const parsedCustomIds = targetType === "custom_users"
        ? customUserIds.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
        : undefined;

      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          category,
          linkUrl: linkUrl.trim() || null,
          linkLabel: linkLabel.trim() || null,
          targetType,
          targetUserIds: parsedCustomIds,
          sendEmail,
          isPinned,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha ao despachar notificação.");

      if (sendPush && getNotificationPermission() === "granted") {
        await showLocalNotification(title.trim(), {
          body: message.trim(),
          url: linkUrl.trim() || "/",
        });
      }

      setTitle("");
      setMessage("");
      setLinkUrl("");
      setLinkLabel("");
      setIsPinned(false);
      setCustomUserIds("");
      setIsConfirmOpen(false);

      setSuccessMessage(`📢 Notificação despachada com sucesso! (${data.result?.totalSent || 0} destinatários)`);
      setTimeout(() => setSuccessMessage(null), 5000);
      await fetchNotifs();
    } catch (err: any) {
      setErrorMessage(err?.message || "Erro ao disparar notificação.");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta notificação?")) return;
    try {
      await deleteSystemNotification(id);
      if (user) {
        await recordAuditLog({
          adminEmail: user.email,
          adminUid: user.uid,
          action: "Notificação do Sistema Excluída",
          category: "notifications",
          targetId: id,
        });
      }
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setSuccessMessage("Notificação excluída.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Erro ao excluir notificação:", err);
    }
  };

  const handleTestPush = async () => {
    const perm = await requestNotificationPermission();
    if (perm === "granted") {
      await showLocalNotification("🎮 Teste de Notificação Game Vault", {
        body: "O sistema de Push Notifications no navegador está operacional!",
        url: "/",
      });
      setSuccessMessage("🔔 Notificação de teste disparada no navegador!");
      setTimeout(() => setSuccessMessage(null), 3500);
    } else {
      setErrorMessage("Permissão de notificações não concedida no navegador.");
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulário de Disparo */}
      <AdminNotificationForm
        title={title}
        setTitle={setTitle}
        message={message}
        setMessage={setMessage}
        category={category}
        setCategory={setCategory}
        linkUrl={linkUrl}
        setLinkUrl={setLinkUrl}
        linkLabel={linkLabel}
        setLinkLabel={setLinkLabel}
        isPinned={isPinned}
        setIsPinned={setIsPinned}
        sendPush={sendPush}
        setSendPush={setSendPush}
        sendEmail={sendEmail}
        setSendEmail={setSendEmail}
        targetType={targetType}
        setTargetType={setTargetType}
        customUserIds={customUserIds}
        setCustomUserIds={setCustomUserIds}
        audienceEstimate={audienceEstimate}
        isLoadingEstimate={isLoadingEstimate}
        onSubmit={handleOpenConfirm}
        onTestPush={handleTestPush}
      />

      {/* Histórico */}
      <AdminNotificationHistory
        notifications={notifications}
        isLoading={isLoading}
        onDelete={handleDelete}
      />

      {/* Modal de Confirmação */}
      <AdminNotificationConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteSend}
        isSending={isSending}
        title={title}
        message={message}
        category={category}
        targetType={targetType}
        targetCount={
          targetType === "custom_users"
            ? customUserIds.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean).length
            : audienceEstimate || 0
        }
        sendEmail={sendEmail}
        sendPush={sendPush}
      />
    </div>
  );
}
