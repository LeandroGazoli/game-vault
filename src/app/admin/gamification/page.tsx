"use client";

import React from "react";
import GamificationManager from "@/components/admin/GamificationManager";
import { Trophy } from "lucide-react";

export default function AdminGamificationRoute() {
  return (
    <div className="space-y-6 pb-12">
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-black text-white tracking-tight">
            Conquistas &amp; Missões
          </h2>
        </div>
        <p className="text-xs text-gray-400">
          Crie e gerencie conquistas (incluindo secretas), missões da temporada e missões
          diárias. Todas são avaliadas automaticamente contra as estatísticas dos jogadores e
          concedem XP real ao serem desbloqueadas.
        </p>
      </div>

      <GamificationManager />
    </div>
  );
}
