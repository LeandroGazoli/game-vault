"use client";

import React from "react";
import AdminFeedbackManager from "@/components/AdminFeedbackManager";
import { Lightbulb } from "lucide-react";

export default function AdminFeedbackRoute() {
  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-black text-white tracking-tight">
            Central de Sugestões, Bugs &amp; Recompensas
          </h2>
        </div>
        <p className="text-xs text-gray-400">
          Analise relatos de bugs, conceda status de planejamento e premie membros com títulos de Caçador de Bugs ou planos VIP.
        </p>
      </div>

      <AdminFeedbackManager />
    </div>
  );
}
