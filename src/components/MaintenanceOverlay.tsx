"use client";

import React, { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { SystemSettings } from "@/lib/types";
import { useAuth } from "@/context/AuthContext";
import { Wrench, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";

export default function MaintenanceOverlay() {
  const { isAdmin, isLoading } = useAuth();
  const [settings, setSettings] = useState<SystemSettings | null>(null);

  useEffect(() => {
    if (!db) return;

    const unsub = onSnapshot(doc(db, "system", "settings"), (snap) => {
      if (snap.exists()) {
        setSettings(snap.data() as SystemSettings);
      }
    });

    return () => unsub();
  }, []);

  // Se o modo manutenção estiver desativado, ou for o admin, ou ainda carregando auth, não bloqueia
  if (isLoading || !settings || !settings.maintenanceMode || isAdmin) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0b0c10]/95 backdrop-blur-xl animate-fadeIn">
      <div className="w-full max-w-lg rounded-[36px] bg-[#14161d] border border-[#00E5FF]/30 p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00E5FF]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#00E5FF]/20 to-blue-500/20 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center mx-auto shadow-xl shadow-[#00E5FF]/10 animate-bounce">
          <Wrench className="w-9 h-9" />
        </div>

        <div className="space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/30 text-[11px] font-bold uppercase font-mono tracking-wider">
            Manutenção Programada
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Estamos em Manutenção
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-md mx-auto">
            {settings.maintenanceNotice ||
              "Estamos realizando melhorias e atualizações técnicas no MyGameList para aprimorar sua experiência. Retornaremos em breve!"}
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3 relative z-10">
          <button
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#00E5FF] hover:bg-[#00cbe3] text-black font-bold text-xs transition-all shadow-lg shadow-[#00E5FF]/20 flex items-center justify-center gap-2 min-h-[44px]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Verificar Novamente</span>
          </button>
        </div>

        <div className="pt-4 border-t border-white/5 text-[11px] text-gray-500 flex items-center justify-center gap-2 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>MyGameList Core • Seus dados estão preservados</span>
        </div>
      </div>
    </div>
  );
}
