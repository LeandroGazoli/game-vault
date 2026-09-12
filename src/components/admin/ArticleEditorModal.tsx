"use client";

import React, { useState, useEffect } from "react";
import { Article, ArticleSection } from "@/lib/types/article.types";
import { saveArticleToFirestore } from "@/lib/articlesService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import {
  X,
  Plus,
  Trash2,
  Save,
  Loader2,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

interface ArticleEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleToEdit?: Article | null;
  onSaved: () => void;
  currentAdminEmail?: string;
  currentAdminName?: string;
}

const CATEGORY_OPTIONS = [
  { value: "guias", label: "Guia Completo" },
  { value: "analises", label: "Análise Crítica" },
  { value: "listas", label: "Seleção Temática" },
  { value: "especiais", label: "Retrospectiva & Especial" },
  { value: "industria", label: "Cenário & Indústria" },
] as const;

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
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
  const [sections, setSections] = useState<ArticleSection[]>([
    { heading: "Introdução", content: [""] },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "content">("info");

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
      setSections(
        articleToEdit.sections?.length > 0
          ? articleToEdit.sections
          : [{ heading: "Introdução", content: [""] }]
      );
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
      setSections([{ heading: "Introdução", content: [""] }]);
    }
  }, [articleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!articleToEdit) {
      setSlug(generateSlug(val));
    }
  };

  const handleAddSection = () => {
    setSections([...sections, { heading: "Novo Subtítulo", content: [""] }]);
  };

  const handleRemoveSection = (idx: number) => {
    if (sections.length <= 1) return;
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleSectionHeadingChange = (idx: number, heading: string) => {
    const updated = [...sections];
    updated[idx].heading = heading;
    setSections(updated);
  };

  const handleSectionContentChange = (idx: number, text: string) => {
    const updated = [...sections];
    // Divide por quebra de linha dupla para criar múltiplos parágrafos
    const paragraphs = text.split("\n\n").filter((p) => p.trim() !== "");
    updated[idx].content = paragraphs.length > 0 ? paragraphs : [text];
    setSections(updated);
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
        coverImage: coverImage.trim() || "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg",
        coverAlt: `${title} - Imagem de Capa`,
        featured,
        tags,
        author: articleToEdit?.author || {
          name: currentAdminName || "Equipe Editorial MyGameList",
          role: "Editor Gamer",
          avatar: "/logo-mgl.png",
          bio: "Redação de guias, análises e curadoria de dados da plataforma.",
        },
        sections,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl my-8 max-h-[90vh] flex flex-col">
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
                Conteúdo editorial visível em /artigos e indexável pelo Google
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

        {/* Abas Internas */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-2 shrink-0">
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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "content"
                ? "bg-emerald-500 text-black shadow-lg"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            2. Seções &amp; Conteúdo ({sections.length})
          </button>
        </div>

        {/* Formulário com Scroll Interno */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === "info" ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Título do Artigo *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={handleTitleChange}
                  placeholder="Ex.: Os Melhores Jogos de Ficção Científica de 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Slug da URL *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="melhores-jogos-ficcao-cientifica-2026"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Subtítulo</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Uma frase marcante complementando o tema do artigo..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300">Resumo / Excerpt (SEO e Card) *</label>
                <textarea
                  rows={2}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Resumo de 2 a 3 linhas sobre o conteúdo do artigo..."
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">URL da Imagem de Capa</label>
                  <input
                    type="url"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    placeholder="https://images.igdb.com/..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Tempo de Leitura (minutos)</label>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={readTimeMinutes}
                    onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-300">Tags (separadas por vírgula)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="RPG, PS5, Metacritic, Dicas"
                    className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="featured-check"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 bg-black/40 border-white/20 focus:ring-emerald-500"
                  />
                  <label htmlFor="featured-check" className="text-xs font-bold text-white cursor-pointer">
                    Destacar este artigo no topo do blog
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">
                  Estruture seu artigo em subtítulos e parágrafos bem diagramados.
                </p>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-emerald-400" /> Adicionar Subtítulo
                </button>
              </div>

              {sections.map((section, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                      Seção {idx + 1}
                    </span>
                    {sections.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveSection(idx)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    required
                    value={section.heading}
                    onChange={(e) => handleSectionHeadingChange(idx, e.target.value)}
                    placeholder="Título da Seção (H2)"
                    className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
                  />

                  <textarea
                    rows={4}
                    required
                    value={section.content.join("\n\n")}
                    onChange={(e) => handleSectionContentChange(idx, e.target.value)}
                    placeholder="Escreva o texto desta seção. Use quebras de linha duplas para separar parágrafos..."
                    className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-300 text-xs focus:outline-none focus:border-emerald-500 resize-none leading-relaxed"
                  />
                </div>
              ))}
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
    </div>
  );
}
