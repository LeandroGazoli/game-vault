"use client";

import React, { useState, useEffect } from "react";
import { Article, ArticleSection } from "@/lib/types/article.types";
import { saveArticleToFirestore } from "@/lib/articlesService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import {
  X,
  Save,
  Loader2,
  BookOpen,
  Radio,
  FileText,
} from "lucide-react";
import SteamNewsImportModal from "./SteamNewsImportModal";
import ArticleInfoFields, { CATEGORY_OPTIONS } from "./ArticleInfoFields";
import ArticleRichEditor from "./ArticleRichEditor";
import { generateArticleSlug, convertSectionsToHtml } from "@/lib/articleHelpers";

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: Article | null;
  onSaved: () => void;
  currentAdminEmail?: string;
  currentAdminName?: string;
}

export default function ArticleEditorModal({
  isOpen,
  onClose,
  articleToEdit,
  onSaved,
  currentAdminEmail,
  currentAdminName,
}: ArticleEditorModalProps) {
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
    if (articleToEdit) {
      setTitle(articleToEdit.title);
      setSubtitle(articleToEdit.subtitle);
      setSlug(articleToEdit.slug);
      setCategory(articleToEdit.category);
      setReadTimeMinutes(articleToEdit.readTimeMinutes);
      setCoverImage(articleToEdit.coverImage);
      setExcerpt(articleToEdit.excerpt);
      setTagsInput(articleToEdit.tags?.join(", ") || "");
      setFeatured(Boolean(articleToEdit.featured));
      setSections(articleToEdit.sections || []);

      // Se já possui contentHtml, utiliza-o. Se não, converte seções legadas para HTML
      if (articleToEdit.contentHtml) {
        setContentHtml(articleToEdit.contentHtml);
      } else if (articleToEdit.sections?.length > 0) {
        setContentHtml(convertSectionsToHtml(articleToEdit.sections));
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
  }, [articleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!articleToEdit) {
      setSlug(generateArticleSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !slug.trim() || !excerpt.trim()) {
      triggerWarningHaptic();
      alert("Preencha título, slug e resumo do artigo.");
      return;
    }

    setIsSaving(true);
    try {
      const catObj = CATEGORY_OPTIONS.find((c) => c.value === category);
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const articlePayload: Article = {
        id: articleToEdit?.id || `art-${Date.now()}`,
        slug: slug.trim(),
        title: title.trim(),
        subtitle: subtitle.trim(),
        excerpt: excerpt.trim(),
        category,
        categoryLabel: catObj?.label || "Guia",
        readTimeMinutes: Number(readTimeMinutes) || 5,
        publishedAt: articleToEdit?.publishedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        coverImage:
          coverImage.trim() ||
          "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg",
        coverAlt: `${title} - Imagem de Capa`,
        featured,
        tags,
        author: articleToEdit?.author || {
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
      onSaved();
      onClose();
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

    // Converte os parágrafos da Steam para HTML no novo editor rico
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] flex flex-col">
        {/* Header do Modal */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-white">
                {articleToEdit ? "Editar Postagem" : "Nova Postagem no Blog"}
              </h2>
              <p className="text-xs text-gray-400">
                Editor rico estilo Notion / WordPress com suporte a títulos, formatação, links e imagens
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Abas Internas & Ação Importar Steam */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("info")}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "info"
                  ? "bg-emerald-500 text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              1. Metadados &amp; Capa
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("content")}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === "content"
                  ? "bg-emerald-500 text-black shadow-lg"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2. Conteúdo Rico (Editor Visual)</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSteamModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
            title="Importar anúncio ou patch note oficial da Steam como rascunho"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Importar da Steam</span>
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === "info" ? (
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
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Escreva com total liberdade: utilize títulos, citações, links, imagens e listas.
                </p>
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
                  Tiptap Rich Text
                </span>
              </div>

              <ArticleRichEditor
                key={articleToEdit?.id || "new-article"}
                content={contentHtml}
                onChange={setContentHtml}
                placeholder="Escreva seu artigo aqui... Clique nas ferramentas acima para adicionar formatação, listas ou links."
              />
            </div>
          )}

          {/* Botões do Rodapé do Modal */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
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
      </div>

      {/* Modal Secundário de Importação da Steam */}
      <SteamNewsImportModal
        isOpen={isSteamModalOpen}
        onClose={() => setIsSteamModalOpen(false)}
        onSelectNews={handleSelectSteamNews}
      />
    </div>
  );
}
