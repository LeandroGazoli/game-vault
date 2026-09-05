"use client";

import React from "react";
import AdminPlansManager from "@/components/AdminPlansManager";
import { useAuth } from "@/context/AuthContext";
import { CreditCard } from "lucide-react";

export default function AdminPlansRoute() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-[#00E5FF]" />
          <h2 className="text-xl font-black text-white tracking-tight">
            Gestão de Planos &amp; Sincronização Stripe
          </h2>
        </div>
        <p className="text-xs text-gray-400">
          Configure preços ao vivo, IDs de produtos do Stripe e ofertas recorrentes ou avulsas para os usuários.
        </p>
      </div>

      <AdminPlansManager adminEmail={user?.email || ""} />
    </div>
  );
}
