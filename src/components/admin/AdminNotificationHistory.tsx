"use client";

import React from "react";
import { Trash2 } from "lucide-react";
import { SystemNotification } from "@/lib/types";

interface AdminNotificationHistoryProps {
  notifications: SystemNotification[];
  isLoading: boolean;
  onDelete: (id: string) => Promise<void>;
}

export default function AdminNotificationHistory({
  notifications,
  isLoading,
  onDelete,
}: AdminNotificationHistoryProps) {
  return (
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
                onClick={() => onDelete(n.id)}
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
  );
}
