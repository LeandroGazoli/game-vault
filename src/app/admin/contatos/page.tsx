"use client";

import React from "react";
import AdminContactManager from "@/components/admin/AdminContactManager";
import { Inbox, Mail } from "lucide-react";

export default function AdminContatosPage() {
  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2">
          <Inbox className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-black text-white tracking-tight">
            Central de Mensagens &amp; Leads de Contato
          </h2>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed">
          Gerencie contatos recebidos pelo site, responda mensagens diretamente por e-mail via Resend e acompanhe propostas de parcerias e suporte.
        </p>
      </div>

      <AdminContactManager />
    </div>
  );
}
