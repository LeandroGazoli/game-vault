"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Article, ArticleSection } from "@/lib/types/article.types";
import { saveArticleToFirestore } from "@/lib/articlesService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import { Save, Loader2, Radio, FileText, SlidersHorizontal, ArrowLeft, Eye } from "lucide-react";
import SteamNewsImportModal from "./SteamNewsImportModal";
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
  const [isSteamModalOpen, setIsSteamModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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

  const handleSelectSteamNews = (imported: {
    title: string;
    subtitle: string;
    excerpt: string;
    coverImage: string;
    tags: string[];
    content: string;
    sourceUrl: string;
  }) => {
    const data = parseSteamNewsToArticleData(imported);
    setTitle(data.title);
    setSubtitle(data.subtitle);
    setSlug(data.slug);
    setCategory(data.category);
    setExcerpt(data.excerpt);
    setCoverImage(data.coverImage);
    setTagsInput(data.tagsInput);
    setReadTimeMinutes(data.readTimeMinutes);
    setContentHtml(data.contentHtml);
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

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Pré-visualizar diagramação e conteúdo do artigo"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Pré-visualizar</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSteamModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer"
            title="Importar anúncio ou patch note oficial da Steam como rascunho"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Importar da Steam</span>
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

      {/* Modal Secundário para Importação Steam */}
      <SteamNewsImportModal
        isOpen={isSteamModalOpen}
        onClose={() => setIsSteamModalOpen(false)}
        onSelectNews={handleSelectSteamNews}
      />
    </div>
  );
}
