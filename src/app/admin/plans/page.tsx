"use client";

import React, { useState } from "react";
import AdminPlansManager from "@/components/AdminPlansManager";
import AdminPlanAdsManager from "@/components/admin/AdminPlanAdsManager";
import { useAuth } from "@/context/AuthContext";
import { CreditCard, Megaphone } from "lucide-react";

export default function AdminPlansRoute() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"stripe" | "ads">("stripe");

  return (
    <div className="space-y-6 pb-12">
      {/* Cabeçalho com Abas Segmentadas */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {activeTab === "stripe" ? (
                <CreditCard className="w-5 h-5 text-[#00E5FF]" />
              ) : (
                <Megaphone className="w-5 h-5 text-emerald-400" />
              )}
              <h2 className="text-xl font-black text-white tracking-tight">
                {activeTab === "stripe"
                  ? "Gestão de Planos & Sincronização Stripe"
                  : "Anúncios de Planos nos Feeds & Probabilidade"}
              </h2>
            </div>
            <p className="text-xs text-gray-400">
              {activeTab === "stripe"
                ? "Configure preços ao vivo, IDs de produtos do Stripe e ofertas recorrentes ou avulsas para os usuários."
                : "Controle a probabilidade, posições aleatórias, textos dos criativos e sincronização de valores nos feeds."}
            </p>
          </div>

          {/* Seletor Segmentado Shadcn/Native */}
          <div className="flex items-center p-1 rounded-2xl bg-black/50 border border-white/10 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab("stripe")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "stripe"
                  ? "bg-[#00E5FF] text-black shadow-md shadow-[#00E5FF]/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Stripe & Preços</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("ads")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === "ads"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Anúncios de Planos</span>
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo Conforme a Aba Ativa */}
      {activeTab === "stripe" ? (
        <AdminPlansManager adminEmail={user?.email || ""} />
      ) : (
        <AdminPlanAdsManager adminEmail={user?.email || ""} />
      )}
    </div>
  );
}
