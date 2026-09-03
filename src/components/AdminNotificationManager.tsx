"use client";

import React, { useState, useEffect } from "react";
import {
  SystemNotification,
  NotificationCategory,
  NOTIFICATION_CATEGORIES,
} from "@/lib/types";
import {
  createSystemNotification,
  getSystemNotifications,
  deleteSystemNotification,
} from "@/lib/firebase";
import {
  showLocalNotification,
  requestNotificationPermission,
  getNotificationPermission,
} from "@/lib/notifications";
import {
  Bell,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Gamepad2,
  Zap,
  Trophy,
  ExternalLink,
  Volume2,
} from "lucide-react";

export default function AdminNotificationManager() {
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

  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setErrorMessage("Preencha o título e a mensagem.");
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      await createSystemNotification({
        title: title.trim(),
        message: message.trim(),
        category,
        linkUrl: linkUrl.trim() || null,
        linkLabel: linkLabel.trim() || null,
        isPinned,
        sendPush,
      });

      // Dispara push local imediatamente no dispositivo do admin para teste
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

      setSuccessMessage("📢 Notificação disparada com sucesso para toda a plataforma!");
      setTimeout(() => setSuccessMessage(null), 4000);
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
      await showLocalNotification("🎮 Teste de Notificação MyGameList", {
        body: "O sistema de Push Notifications no navegador está funcionando perfeitamente!",
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
      {/* Toast Feedback */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Formulário de Disparo */}
      <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                Central de Disparo de Notificações &amp; Push
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-[#00E5FF] text-[10px] font-black uppercase font-mono">
                BROADCASTER
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Envie comunicados, novidades de conteúdo e recursos tanto via Web Push quanto via card in-app.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTestPush}
            className="px-3.5 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-neutral-300 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Testar Push no Navegador</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Seletor de Categoria */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-300 block">
              Tipo da Notificação
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(
                [
                  { id: "feature", label: "Novo Recurso", icon: Sparkles },
                  { id: "content", label: "Novo Conteúdo", icon: Gamepad2 },
                  { id: "update", label: "Atualização", icon: Zap },
                  { id: "reward", label: "Recompensa", icon: Trophy },
                  { id: "general", label: "Aviso Geral", icon: Bell },
                ] as const
              ).map((cat) => {
                const isSelected = category === cat.id;
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-[#00E5FF] text-black shadow-md font-black"
                        : "bg-white/5 border-white/10 text-neutral-300 hover:text-white"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Título */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300 block">
              Título da Notificação <span className="text-[#00E5FF]">*</span>
            </label>
            <input
              type="text"
              placeholder="Ex: Novo Recurso: Central de Ideias & Votação no ar!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="w-full bg-[#121316] border border-white/10 rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00E5FF]"
            />
          </div>

          {/* Mensagem */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-neutral-300 block">
              Mensagem Detalhada <span className="text-[#00E5FF]">*</span>
            </label>
            <textarea
              placeholder="Ex: Agora você pode sugerir melhorias, relatar bugs e votar nas propostas. Contribuidores premiados ganham VIP Vitalício!"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={400}
              rows={3}
              className="w-full bg-[#121316] border border-white/10 rounded-2xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-[#00E5FF] resize-none leading-relaxed"
            />
          </div>

          {/* Link URL e Label */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Link de Ação (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: /feedback ou /calendar"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-300 block mb-1">
                Texto do Botão de Link (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ex: Conhecer Recurso →"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                className="w-full bg-[#121316] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
          </div>

          {/* Opções de Disparo */}
          <div className="flex items-center gap-6 pt-1 flex-wrap">
            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={sendPush}
                onChange={(e) => setSendPush(e.target.checked)}
                className="rounded border-white/20 text-[#00E5FF] focus:ring-0"
              />
              <span>Disparar Push Notification no navegador</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-white/20 text-[#00E5FF] focus:ring-0"
              />
              <span>Fixar como Destaque no topo</span>
            </label>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 via-[#00E5FF] to-blue-500 hover:from-cyan-300 hover:to-cyan-200 text-black text-xs font-black flex items-center gap-2 transition-all shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Disparando...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Disparar Notificação Geral</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Histórico de Notificações Enviadas */}
      <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-6 sm:p-8 space-y-4">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
          Histórico de Notificações Enviadas ({notifications.length})
        </h4>

        <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="py-6 text-center text-xs text-gray-400 animate-pulse">
              Carregando histórico...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">
              Nenhuma notificação enviada ainda.
            </div>
          ) : (
            notifications.map((n) => (
              <div key={n.id} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white truncate">{n.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 font-mono">
                      {n.category}
                    </span>
                    {n.isPinned && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono font-bold">
                        FIXO
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{n.message}</p>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  title="Excluir notificação"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
