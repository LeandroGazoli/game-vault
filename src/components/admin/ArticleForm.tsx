"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Article, ArticleSection } from "@/lib/types/article.types";
import { saveArticleToFirestore } from "@/lib/articlesService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import { Save, Loader2, Radio, FileText, SlidersHorizontal, ArrowLeft } from "lucide-react";
import SteamNewsImportModal from "./SteamNewsImportModal";
import ArticleInfoFields, { CATEGORY_OPTIONS } from "./ArticleInfoFields";
import ArticleRichEditor from "./ArticleRichEditor";
import { generateArticleSlug, convertSectionsToHtml } from "@/lib/articleHelpers";

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

  useEffect(() => {
    if (initialArticle) {
      setTitle(initialArticle.title || "");
      setSubtitle(initialArticle.subtitle || "");
      setSlug(initialArticle.slug || "");
      setCategory(initialArticle.category || "guias");
      setReadTimeMinutes(initialArticle.readTimeMinutes || 5);
      setCoverImage(initialArticle.coverImage || "");
      setExcerpt(initialArticle.excerpt || "");
      setTagsInput(initialArticle.tags?.join(", ") || "");
      setFeatured(Boolean(initialArticle.featured));
      setSections(initialArticle.sections || []);

      if (initialArticle.contentHtml) {
        setContentHtml(initialArticle.contentHtml);
      } else if (initialArticle.sections && initialArticle.sections.length > 0) {
        setContentHtml(convertSectionsToHtml(initialArticle.sections));
      } else {
        setContentHtml("<p>Escreva o conteúdo do seu artigo aqui...</p>");
      }
    } else {
      setTitle("");
      setSubtitle("");
      setSlug("");
      setCategory("guias");
      setReadTimeMinutes(5);
      setCoverImage("https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg");
      setExcerpt("");
      setTagsInput("Games, Análise, Backlog");
      setFeatured(false);
      setContentHtml("<p>Escreva o conteúdo do seu artigo aqui...</p>");
      setSections([{ heading: "Introdução", content: [""] }]);
    }
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
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

      const articlePayload: Article = {
        id: initialArticle?.id || `art-${Date.now()}`,
        slug: slug.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        excerpt: excerpt.trim(),
        category,
        categoryLabel: catObj?.label || "Guia",
        readTimeMinutes: Number(readTimeMinutes) || 5,
        publishedAt: initialArticle?.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        coverImage: coverImage.trim() || "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg",
        coverAlt: `${title} - Imagem de Capa`,
        featured,
        tags,
        author: initialArticle?.author || {
          name: currentAdminName || "Equipe Editorial MyGameList",
          role: "Editor Gamer",
          avatar: "/logo-mgl.png",
          bio: "Redação de guias, análises e curadoria de dados da plataforma.",
        },
        contentHtml,
        sections: sections.length > 0 ? sections : [{ heading: "Artigo", content: [excerpt] }],
      };

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
    setTitle(imported.title);
    setSubtitle(imported.subtitle);
    setSlug(generateArticleSlug(imported.title));
    setCategory("industria");
    setExcerpt(imported.excerpt);
    setCoverImage(imported.coverImage);
    setTagsInput(imported.tags.join(", "));
    setReadTimeMinutes(4);

    const paragraphsHtml = imported.content
      .split("\n\n")
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");

    const fullHtml = `
      <h2>Visão Geral da Atualização</h2>
      <blockquote><p>Anúncio oficial importado via Steam News. <a href="${imported.sourceUrl}">Acesse o post original na Steam</a></p></blockquote>
      ${paragraphsHtml}
    `;

    setContentHtml(fullHtml);
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

        <button
          type="button"
          onClick={() => setIsSteamModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
          title="Importar anúncio ou patch note oficial da Steam como rascunho"
        >
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>Importar da Steam</span>
        </button>
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
      </form>

      {/* Modal Secundário para Importação Steam */}
      <SteamNewsImportModal
        isOpen={isSteamModalOpen}
        onClose={() => setIsSteamModalOpen(false)}
        onSelectNews={handleSelectSteamNews}
      />
    </div>
  );
}
