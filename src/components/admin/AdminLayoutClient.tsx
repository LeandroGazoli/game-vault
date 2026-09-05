"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AdminSidebar from "./AdminSidebar";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";
import { ShieldAlert, ShieldCheck } from "lucide-react";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, isLoading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-8 space-y-6 animate-pulse px-4">
        <div className="h-28 rounded-[32px] bg-[#14161d]" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="h-96 rounded-[32px] bg-[#14161d]" />
          <div className="lg:col-span-3 h-96 rounded-[32px] bg-[#14161d]" />
        </div>
      </div>
    );
  }

  // Barreira de Autenticação e Autorização Master
  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 rounded-[32px] bg-[#14161d] border border-rose-500/30 p-8 sm:p-10 text-center space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Acesso Restrito
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            Esta área é restrita a administradores autorizados com credencial verificada.
          </p>
        </div>

        {!user ? (
          <button
            onClick={() => setIsAuthOpen(true)}
            className="w-full py-3.5 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all shadow-md min-h-[44px]"
          >
            Fazer Login com Conta Google
          </button>
        ) : (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-white/5 text-xs text-gray-300 font-mono">
              Logado como: {user.email}
            </div>
            <Link
              href="/"
              className="inline-block text-xs text-[#00E5FF] hover:underline"
            >
              Voltar para a Página Inicial
            </Link>
          </div>
        )}

        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-6 space-y-6">
      {/* Header Unificado com Status */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00E5FF]/20 to-blue-500/20 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center shadow-lg shadow-[#00E5FF]/10">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Painel Administrativo
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[9px] font-mono font-bold uppercase">
                MASTER
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Gerenciamento da plataforma, planos Stripe, usuários e telemetria.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs font-mono bg-white/5 border border-white/5 px-3 py-1.5 rounded-full text-gray-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Sessão Autenticada</span>
        </div>
      </div>

      {/* Grid com Sidebar Lateral e Conteúdo das Rotas Filhas */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <AdminSidebar />
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
