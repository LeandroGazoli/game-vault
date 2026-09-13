"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import ArticleForm from "@/components/admin/ArticleForm";
import { BookOpen, ArrowLeft } from "lucide-react";

export default function AdminNovoArtigoPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 flex-1 w-full min-w-0">
      {/* Header da Página Dedicada */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/artigos"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Voltar para Artigos"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>NOVA PUBLICAÇÃO</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Criar Nova Postagem
          </h1>
          <p className="text-xs text-gray-400">
            Página dedicada com espaço ampliado para redação, metadados SEO, capas e editor rico Notion/WordPress.
          </p>
        </div>

        <Link
          href="/admin/artigos"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-colors self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Ver Todos os Artigos
        </Link>
      </div>

      {/* Formulário com Editor Dedicado */}
      <ArticleForm
        currentAdminName={user?.displayName || undefined}
        currentAdminEmail={user?.email || undefined}
      />
    </div>
  );
}
