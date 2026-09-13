"use client";

import React, { useState, useEffect } from "react";
import { Article } from "@/lib/types/article.types";
import { sanitizeCustomHtml } from "@/lib/sanitizeHtml";
import ArticleCard from "@/components/articles/ArticleCard";
import {
  X,
  Eye,
  Calendar,
  Clock,
  Smartphone,
  Monitor,
  LayoutTemplate,
  FileText,
  AlertCircle,
} from "lucide-react";

interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: Article;
}

export default function ArticlePreviewModal({
  isOpen,
  onClose,
  article,
}: ArticlePreviewModalProps) {
  const [viewMode, setViewMode] = useState<"full" | "card">("full");
  const [deviceView, setDeviceView] = useState<"desktop" | "mobile">("desktop");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formattedDate = new Date(article.publishedAt || Date.now()).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-5xl rounded-[32px] bg-[#0b0d12] border border-white/10 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Barra Superior com Controles */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:px-6 bg-[#141822] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  Pré-visualização do Artigo
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-bold">
                  <AlertCircle className="w-3 h-3" /> RASCUNHO
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Verifique a diagramação, tipografia e imagens antes de publicar
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Alternar Modo: Página Completa vs Card no Feed */}
            <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("full")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "full"
                    ? "bg-emerald-500 text-black shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Página Completa</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                  viewMode === "card"
                    ? "bg-emerald-500 text-black shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <LayoutTemplate className="w-3.5 h-3.5" />
                <span>Card de Feed</span>
              </button>
            </div>

            {/* Alternar Tamanho de Tela na Visão Completa */}
            {viewMode === "full" && (
              <div className="hidden sm:flex items-center bg-white/5 p-1 rounded-xl border border-white/10 text-xs">
                <button
                  type="button"
                  onClick={() => setDeviceView("desktop")}
                  className={`p-1.5 rounded-lg transition-all ${
                    deviceView === "desktop"
                      ? "bg-white/20 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Visão Desktop"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceView("mobile")}
                  className={`p-1.5 rounded-lg transition-all ${
                    deviceView === "mobile"
                      ? "bg-white/20 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Visão Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              title="Fechar Pré-visualização (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Área de Visualização com Scroll */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#0b0d12]">
          {viewMode === "full" ? (
            <div
              className={`mx-auto transition-all duration-300 ${
                deviceView === "mobile"
                  ? "max-w-md border-x border-white/10 px-4 py-6 bg-[#0f1117] rounded-3xl shadow-2xl my-4"
                  : "max-w-4xl"
              }`}
            >
              <article className="space-y-8">
                {/* Header do Artigo */}
                <header className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase tracking-wider font-mono">
                      {article.categoryLabel || "Guia"}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="flex items-center gap-1 text-gray-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                      {formattedDate}
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="flex items-center gap-1 text-gray-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      {article.readTimeMinutes || 5} min de leitura
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {article.title || "Título do Artigo em Destaque"}
                  </h1>

                  {article.subtitle && (
                    <p className="text-sm sm:text-lg text-gray-300 leading-relaxed font-normal">
                      {article.subtitle}
                    </p>
                  )}

                  {/* Card do Autor */}
                  <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                    <img
                      src={article.author.avatar || "/logo-mgl.png"}
                      alt={article.author.name || "Autor"}
                      className="w-10 h-10 rounded-full border border-white/20 object-cover"
                    />
                    <div>
                      <p className="text-xs font-bold text-white">{article.author.name}</p>
                      <p className="text-[11px] text-gray-400">{article.author.role}</p>
                    </div>
                  </div>
                </header>

                {/* Imagem de Capa */}
                {article.coverImage && (
                  <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video bg-neutral-900 shadow-2xl">
                    <img
                      src={article.coverImage}
                      alt={article.coverAlt || article.title}
                      className="w-full h-full object-cover filter brightness-[0.9]"
                    />
                  </div>
                )}

                {/* Tags */}
                {article.tags && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {article.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-xs font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Conteúdo Principal */}
                {article.contentHtml ? (
                  <div
                    className="prose prose-invert prose-emerald max-w-none space-y-6 text-sm sm:text-base text-gray-300 leading-relaxed font-sans"
                    dangerouslySetInnerHTML={{
                      __html: sanitizeCustomHtml(article.contentHtml),
                    }}
                  />
                ) : (
                  <div className="p-8 rounded-2xl bg-white/5 border border-dashed border-white/20 text-center text-gray-400 text-sm">
                    Nenhum conteúdo escrito ainda no corpo do artigo.
                  </div>
                )}
              </article>
            </div>
          ) : (
            /* Modo Feed/Cards */
            <div className="max-w-4xl mx-auto space-y-8 py-4">
              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Como Destaque Principal do Blog
                </p>
                <ArticleCard article={article} featured={true} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  No Grid Padrão de Artigos
                </p>
                <div className="max-w-sm">
                  <ArticleCard article={article} featured={false} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
