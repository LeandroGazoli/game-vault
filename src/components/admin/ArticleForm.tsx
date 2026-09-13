"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Article, ArticleSection } from "@/lib/types/article.types";
import { saveArticleToFirestore } from "@/lib/articlesService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import { Save, Loader2, Radio, FileText, SlidersHorizontal, ArrowLeft, Eye, Sparkles, Globe } from "lucide-react";
import NewsImportModal, { ImportedArticleData } from "./NewsImportModal";
import ArticleInfoFields, { CATEGORY_OPTIONS } from "./ArticleInfoFields";
import ArticleRichEditor from "./ArticleRichEditor";
import ArticlePreviewModal from "./ArticlePreviewModal";
import {
  generateArticleSlug,
  convertSectionsToHtml,
  buildArticlePayload,
  parseSteamNewsToArticleData,
  getInitialArticleFormData,
} from "@/lib/articleHelpers";

interface ArticleFormProps {
  initialArticle?: Article | null;
  currentAdminName?: string;
  currentAdminEmail?: string;
}

export default function ArticleForm({ initialArticle, currentAdminName }: ArticleFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [slug, setSlug] = useState("");
  const [category, setCategory] = useState<Article["category"]>("guias");
  const [readTimeMinutes, setReadTimeMinutes] = useState(5);
  const [coverImage, setCoverImage] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [featured, setFeatured] = useState(false);
  const [contentHtml, setContentHtml] = useState("");
  const [sections, setSections] = useState<ArticleSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "content">("info");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isRewritingCurrent, setIsRewritingCurrent] = useState(false);

  useEffect(() => {
    const data = getInitialArticleFormData(initialArticle);
    setTitle(data.title);
    setSubtitle(data.subtitle);
    setSlug(data.slug);
    setCategory(data.category);
    setReadTimeMinutes(data.readTimeMinutes);
    setCoverImage(data.coverImage);
    setExcerpt(data.excerpt);
    setTagsInput(data.tagsInput);
    setFeatured(data.featured);
    setSections(data.sections);
    setContentHtml(data.contentHtml);
  }, [initialArticle]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!initialArticle) setSlug(generateArticleSlug(val));
  };

  const handleRewriteCurrentWithAI = async () => {
    if (!title.trim() && !contentHtml.trim()) {
      alert("Informe ao menos o título ou conteúdo para a IA reescrever.");
      return;
    }

    setIsRewritingCurrent(true);
    try {
      const res = await fetch("/api/articles/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "Artigo de Games",
          content: contentHtml || excerpt || title,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Falha ao comunicar com a IA.");
      }

      const aiData = await res.json();
      setTitle(aiData.title);
      setSubtitle(aiData.subtitle);
      setSlug(aiData.slug);
      setCategory(aiData.category);
      setExcerpt(aiData.excerpt);
      if (aiData.tags) setTagsInput(aiData.tags.join(", "));
      if (aiData.readTimeMinutes) setReadTimeMinutes(aiData.readTimeMinutes);
      if (aiData.contentHtml) setContentHtml(aiData.contentHtml);

      triggerSuccessHaptic();
      setActiveTab("content");
    } catch (err: any) {
      console.error("Erro ao reescrever matéria:", err);
      triggerWarningHaptic();
      alert(`Falha na reescrita com IA: ${err.message || "Tente novamente."}`);
    } finally {
      setIsRewritingCurrent(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !excerpt.trim()) {
      triggerWarningHaptic();
      alert("Preencha ao menos o título, slug e resumo do artigo.");
      return;
    }

    setIsSaving(true);
    try {
      const catObj = CATEGORY_OPTIONS.find((c) => c.value === category);
      const articlePayload = buildArticlePayload({
        initialArticle,
        title,
        subtitle,
        slug,
        excerpt,
        category,
        categoryLabel: catObj?.label,
        readTimeMinutes,
        coverImage,
        featured,
        tagsInput,
        contentHtml,
        sections,
        currentAdminName,
      });

      await saveArticleToFirestore(articlePayload);
      triggerSuccessHaptic();
      router.push("/admin/artigos");
      router.refresh();
    } catch (err) {
      console.error("Erro ao salvar artigo:", err);
      triggerWarningHaptic();
      alert("Falha ao salvar postagem no Firestore.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectImportedNews = (imported: ImportedArticleData) => {
    if (imported.contentHtml) {
      // Importação já reescrita e formatada pela IA
      setTitle(imported.title);
      setSubtitle(imported.subtitle || "");
      setSlug(imported.slug || generateArticleSlug(imported.title));
      if (imported.category) setCategory(imported.category);
      setExcerpt(imported.excerpt);
      setCoverImage(imported.coverImage);
      setTagsInput(imported.tags.join(", "));
      setReadTimeMinutes(imported.readTimeMinutes || 4);
      setContentHtml(imported.contentHtml);
    } else {
      // Importação direta
      const data = parseSteamNewsToArticleData({
        title: imported.title,
        subtitle: imported.subtitle,
        excerpt: imported.excerpt,
        coverImage: imported.coverImage,
        tags: imported.tags,
        content: imported.content,
        sourceUrl: imported.sourceUrl,
      });
      setTitle(data.title);
      setSubtitle(data.subtitle);
      setSlug(data.slug);
      setCategory(data.category);
      setExcerpt(data.excerpt);
      setCoverImage(data.coverImage);
      setTagsInput(data.tagsInput);
      setReadTimeMinutes(data.readTimeMinutes);
      setContentHtml(data.contentHtml);
    }
    setActiveTab("content");
  };

  return (
    <div className="space-y-6">
      {/* Abas e Ações de Topo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("info")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "info"
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>1. Metadados & Capa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              activeTab === "content"
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Conteúdo Rico (Editor Visual)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            disabled={isRewritingCurrent}
            onClick={handleRewriteCurrentWithAI}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Aprimora e reescreve todo o texto e metadados com IA mantendo a essência original"
          >
            {isRewritingCurrent ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{isRewritingCurrent ? "Reescrevendo..." : "Reescrever com IA"}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-bold transition-all cursor-pointer"
            title="Pré-visualizar diagramação e conteúdo do artigo"
          >
            <Eye className="w-3.5 h-3.5 text-emerald-400" />
            <span>Pré-visualizar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Importar matérias da NewsData.io ou comunicados oficiais da Steam com reescrita inteligente"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Importar Matérias (NewsData & Steam)</span>
          </button>
        </div>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {activeTab === "info" ? (
          <div className="rounded-3xl bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-6 shadow-xl">
            <ArticleInfoFields
              title={title}
              onTitleChange={handleTitleChange}
              slug={slug}
              onSlugChange={setSlug}
              category={category}
              onCategoryChange={setCategory}
              subtitle={subtitle}
              onSubtitleChange={setSubtitle}
              excerpt={excerpt}
              onExcerptChange={setExcerpt}
              coverImage={coverImage}
              onCoverImageChange={setCoverImage}
              readTimeMinutes={readTimeMinutes}
              onReadTimeMinutesChange={setReadTimeMinutes}
              tagsInput={tagsInput}
              onTagsInputChange={setTagsInput}
              featured={featured}
              onFeaturedChange={setFeatured}
            />
          </div>
        ) : (
          <div className="rounded-3xl bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-400">
                Escreva com total liberdade: utilize títulos, citações, links, imagens e listas.
              </p>
              <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                Tiptap Rich Text Editor
              </span>
            </div>

            <ArticleRichEditor
              key={initialArticle?.id || "new-article"}
              content={contentHtml}
              onChange={setContentHtml}
              placeholder="Escreva seu artigo aqui... Clique nas ferramentas acima para adicionar formatação, listas ou links."
            />
          </div>
        )}

        {/* Rodapé Fixo/Sticky de Ações */}
        <div className="rounded-2xl bg-[#14161d]/80 backdrop-blur-md border border-white/10 p-4 flex items-center justify-between sticky bottom-4 shadow-2xl z-20">
          <Link
            href="/admin/artigos"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Cancelar
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/20 font-bold text-xs transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4" /> Pré-visualizar
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Salvar Postagem
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Modal de Pré-visualização do Artigo */}
      <ArticlePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        article={buildArticlePayload({
          initialArticle,
          title: title.trim() || "Título do Artigo em Destaque",
          subtitle,
          slug: slug.trim() || "preview-slug",
          excerpt: excerpt.trim() || "Resumo da postagem com detalhes para o card e metadados SEO...",
          category,
          categoryLabel: CATEGORY_OPTIONS.find((c) => c.value === category)?.label,
          readTimeMinutes,
          coverImage,
          featured,
          tagsInput,
          contentHtml,
          sections,
          currentAdminName,
        })}
      />

      {/* Modal de Importação com IA (NewsData.io + Steam) */}
      <NewsImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSelectNews={handleSelectImportedNews}
      />
    </div>
  );
}
