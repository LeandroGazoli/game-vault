"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Article } from "@/lib/types/article.types";
import {
  getCombinedArticles,
  deleteArticleFromFirestore,
} from "@/lib/articlesService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import {
  BookOpen,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Search,
  Flame,
  Clock,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function AdminArtigosPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadArticles = async () => {
    setIsLoading(true);
    try {
      const data = await getCombinedArticles();
      setArticles(data);
    } catch (err) {
      console.error("Erro ao carregar artigos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDelete = async (article: Article) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o artigo "${article.title}"?`
    );
    if (!confirmDelete) return;

    try {
      await deleteArticleFromFirestore(article.id);
      triggerSuccessHaptic();
      setToastMessage("Artigo excluído com sucesso!");
      setTimeout(() => setToastMessage(null), 3500);
      loadArticles();
    } catch (err) {
      console.error("Erro ao excluir artigo:", err);
      triggerWarningHaptic();
      alert("Falha ao excluir o artigo.");
    }
  };

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === "all" || art.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 flex-1 w-full min-w-0">
      {/* Toast Notificação */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-2xl bg-emerald-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header com Ação de Criar (Página Dedicada) */}
      <div className="rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>SISTEMA DE POSTAGENS & BLOG</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Gerenciador de Artigos & Guias
          </h2>
          <p className="text-xs text-gray-400">
            Crie e edite análises, matérias e guias para fortalecer a indexação no Google AdSense.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadArticles}
            disabled={isLoading}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
            title="Recarregar lista"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>

          <Link
            href="/admin/artigos/novo"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Nova Postagem
          </Link>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, tag ou slug..."
            className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#14161d] border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-4 py-2.5 rounded-2xl bg-[#14161d] border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
        >
          <option value="all">Todas as Categorias</option>
          <option value="guias">Guias</option>
          <option value="analises">Análises</option>
          <option value="listas">Listas</option>
          <option value="especiais">Especiais</option>
          <option value="industria">Indústria</option>
        </select>
      </div>

      {/* Tabela / Lista de Artigos */}
      <div className="rounded-3xl bg-[#14161d] border border-white/10 overflow-hidden shadow-xl">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-gray-400 font-mono animate-pulse">
            Carregando acervo editorial...
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="p-12 text-center text-xs text-gray-400">
            Nenhum artigo encontrado com os filtros aplicados.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredArticles.map((art) => (
              <div
                key={art.id || art.slug}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <img
                    src={art.coverImage}
                    alt={art.title}
                    className="w-16 h-12 rounded-xl object-cover shrink-0 border border-white/10"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase">
                        {art.categoryLabel}
                      </span>
                      {art.featured && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                          <Flame className="w-2.5 h-2.5" /> Destaque
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-gray-500">
                        /{art.slug}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white truncate max-w-lg">
                      {art.title}
                    </h3>

                    <div className="flex items-center gap-3 text-[11px] text-gray-400 font-mono">
                      <span>{art.author?.name || "Redação"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        {art.readTimeMinutes} min
                      </span>
                      <span>•</span>
                      <span>{new Date(art.publishedAt).toLocaleDateString("pt-BR")}</span>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Link
                    href={`/artigos/${art.slug}`}
                    target="_blank"
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    title="Visualizar Artigo no Site"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/admin/artigos/${art.id || art.slug}`}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 text-gray-300 hover:text-emerald-400 transition-colors"
                    title="Editar Postagem em Página Dedicada"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => handleDelete(art)}
                    className="p-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-300 hover:text-red-400 transition-colors"
                    title="Excluir Postagem"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
