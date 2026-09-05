"use client";

import React from "react";
import { UserProfile, LibraryStats, calculateGamerLevel } from "@/lib/types";
import { Crown, Sparkles, Gamepad2, ArrowRight, ShieldCheck, Trophy } from "lucide-react";

interface LegendaryVaultCardProps {
  user: UserProfile;
  stats?: LibraryStats | null;
  isOwner?: boolean;
  onOpenUpgrade?: () => void;
  onOpenManagePlan?: () => void;
}

export default function LegendaryVaultCard({
  user,
  stats,
  isOwner,
  onOpenUpgrade,
  onOpenManagePlan,
}: LegendaryVaultCardProps) {
  const isVipOrPro = user.plan === "vip" || user.plan === "pro";
  const gamerLevelInfo = calculateGamerLevel(stats);
  const displayLevel = user.gamerLevel || gamerLevelInfo.level;

  const handleAction = () => {
    if (isVipOrPro && onOpenManagePlan) {
      onOpenManagePlan();
    } else if (onOpenUpgrade) {
      onOpenUpgrade();
    }
  };

  return (
    <div className="relative rounded-[28px] sm:rounded-[32px] p-[2px] bg-gradient-to-r from-amber-500 via-purple-600 to-[#00E5FF] shadow-[0_10px_35px_rgba(0,229,255,0.25)] overflow-hidden group">
      {/* Container Interno */}
      <div className="relative rounded-[26px] sm:rounded-[30px] bg-gradient-to-br from-[#10121a] via-[#120f20] to-[#0c1322] p-4 sm:p-6 overflow-hidden">
        {/* Marca d'água gamer com controle e feixes de luz */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 sm:w-56 sm:h-56 opacity-10 text-white pointer-events-none transform -rotate-12 group-hover:rotate-0 group-hover:scale-105 transition-all duration-500">
          <Gamepad2 className="w-full h-full" />
        </div>
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 bg-[#00E5FF]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Lado Esquerdo: Tag VIP, Título e Ação */}
          <div className="space-y-2 max-w-md">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-[11px] tracking-wider uppercase shadow-md flex items-center gap-1">
                <Crown className="w-3 h-3 text-black fill-black" />
                <span>VIP</span>
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300/80">
                #LEGENDARY-VAULT
              </span>
            </div>

            <div>
              <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>LEGENDARY VAULT</span>
                <Sparkles className="w-4 h-4 text-[#00E5FF] animate-pulse" />
              </h3>
              <p className="text-xs text-gray-300 font-medium">
                {isVipOrPro
                  ? "Assinatura Nobre Ativa • Acesso a temas exclusivos, estatísticas ilimitadas e insígnias lendárias."
                  : "Desbloqueie o potencial máximo com temas neon, zero anúncios e estatísticas de prestígio."}
              </p>
            </div>

            {/* Botão de Ação Ciano Neon */}
            <div className="pt-1">
              <button
                onClick={handleAction}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00b4d8] hover:from-white hover:to-gray-100 text-black font-extrabold text-xs tracking-tight shadow-[0_0_15px_rgba(0,229,255,0.4)] transition-all active:scale-95 cursor-pointer"
              >
                <span>{isVipOrPro ? "Gerenciar Benefícios" : "PRO Levelitar"}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          </div>

          {/* Lado Direito: Brasão PRO LEVEL com Nível Dinâmico */}
          <div className="flex items-center gap-3 sm:flex-col sm:items-end self-start sm:self-center bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-2xl border border-white/10 sm:border-0">
            {/* Brasão Dourado de Asas PRO LEVEL */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 shadow-inner">
              <Trophy className="w-4 h-4 text-amber-400 fill-amber-400/30" />
              <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                PRO LEVEL
              </span>
            </div>

            {/* Badge de Nível Ciano Neon */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#00E5FF]/10 border border-[#00E5FF]/40 shadow-[0_0_15px_rgba(0,229,255,0.2)]">
              <span className="text-[10px] font-mono font-bold text-gray-300 uppercase">
                LEVEL
              </span>
              <span className="text-base sm:text-lg font-black font-mono text-[#00E5FF]">
                {displayLevel}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
