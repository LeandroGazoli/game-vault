"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { ShieldAlert, LogOut, Mail } from "lucide-react";

export default function BannedUserModal() {
  const { user, logout } = useAuth();

  // Exibe apenas se o usuário autenticado estiver marcado com banned: true
  if (!user || !user.banned) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md rounded-[32px] bg-[#14161d] border border-rose-500/40 p-6 sm:p-8 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Conta Suspensa
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            O acesso a esta conta foi bloqueado temporária ou permanentemente pela moderação da plataforma.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5 text-left text-xs">
          <span className="text-[10px] uppercase font-mono text-gray-500 font-bold">
            Motivo Registrado
          </span>
          <p className="text-rose-300 font-medium leading-relaxed">
            {user.moderationReason || "Violação das Diretrizes da Comunidade do MyGameList."}
          </p>
        </div>

        <div className="space-y-2 pt-2">
          <button
            onClick={() => logout()}
            className="w-full py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-lg min-h-[44px]"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>

          <a
            href="mailto:suporte@mygameslist.com.br"
            className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors pt-2"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contestar Suspensão via Suporte</span>
          </a>
        </div>
      </div>
    </div>
  );
}
