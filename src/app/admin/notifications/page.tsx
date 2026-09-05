"use client";

import React from "react";
import AdminNotificationManager from "@/components/AdminNotificationManager";
import { Bell } from "lucide-react";

export default function AdminNotificationsRoute() {
  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-purple-400" />
          <h2 className="text-xl font-black text-white tracking-tight">
            Transmissão de Notificações &amp; Push
          </h2>
        </div>
        <p className="text-xs text-gray-400">
          Dispare notificações de sistema in-app e Web Push para todos os membros registrados.
        </p>
      </div>

      <AdminNotificationManager />
    </div>
  );
}
