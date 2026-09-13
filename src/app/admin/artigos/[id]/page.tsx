"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Article } from "@/lib/types/article.types";
import { getCombinedArticles } from "@/lib/articlesService";
import ArticleForm from "@/components/admin/ArticleForm";
import { BookOpen, ArrowLeft, Loader2 } from "lucide-react";

export default function AdminEditarArtigoPage() {
  const params = useParams();
  const rawId = params?.id ? (Array.isArray(params.id) ? params.id[0] : params.id) : "";
  const decodedId = decodeURIComponent(rawId);

  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadArticle() {
      if (!decodedId) return;
      setIsLoading(true);
      try {
        const articles = await getCombinedArticles();
        const found = articles.find(
          (a) => a.id === decodedId || a.slug === decodedId
        );
        if (found) {
          setArticle(found);
        } else {
          setNotFound(true);
        }
      } catch (err) {
        console.error("Erro ao carregar artigo para edição:", err);
        setNotFound(true);
      } finally {
        setIsLoading(false);
      }
    }

    loadArticle();
  }, [decodedId]);

  if (isLoading) {
    return (
      <div className="space-y-6 flex-1 w-full min-w-0">
        <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-12 text-center flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          <p className="text-xs text-gray-400 font-mono">Carregando dados do artigo...</p>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="space-y-6 flex-1 w-full min-w-0">
        <div className="rounded-[32px] bg-[#14161d] border border-rose-500/30 p-12 text-center space-y-4">
          <h2 className="text-lg font-bold text-white">Artigo não encontrado</h2>
          <p className="text-xs text-gray-400">
            Não foi possível encontrar a postagem solicitada (&quot;{decodedId}&quot;).
          </p>
          <Link
            href="/admin/artigos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar para Postagens
          </Link>
        </div>
      </div>
    );
  }

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
              <span>EDITAR POSTAGEM</span>
            </div>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight truncate max-w-2xl">
            {article.title}
          </h1>
          <p className="text-xs text-gray-400">
            Edição dedicada com editor rico visual, metadados e pré-visualização.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/artigos/${article.slug}`}
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-emerald-400 font-bold text-xs transition-colors"
          >
            Visualizar no Site
          </Link>
          <Link
            href="/admin/artigos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>
      </div>

      {/* Formulário com Artigo Carregado */}
      <ArticleForm
        initialArticle={article}
        currentAdminName={user?.displayName || undefined}
        currentAdminEmail={user?.email || undefined}
      />
    </div>
  );
}
