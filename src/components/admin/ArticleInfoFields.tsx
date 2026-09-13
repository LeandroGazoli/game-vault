"use client";

import React from "react";
import { Article } from "@/lib/types/article.types";

export const CATEGORY_OPTIONS = [
  { value: "guias", label: "Guia Completo" },
  { value: "analises", label: "Análise Crítica" },
  { value: "listas", label: "Seleção Temática" },
  { value: "especiais", label: "Retrospectiva & Especial" },
  { value: "industria", label: "Cenário & Indústria" },
] as const;

interface ArticleInfoFieldsProps {
  title: string;
  onTitleChange: (val: string) => void;
  slug: string;
  onSlugChange: (val: string) => void;
  category: Article["category"];
  onCategoryChange: (val: Article["category"]) => void;
  subtitle: string;
  onSubtitleChange: (val: string) => void;
  excerpt: string;
  onExcerptChange: (val: string) => void;
  coverImage: string;
  onCoverImageChange: (val: string) => void;
  readTimeMinutes: number;
  onReadTimeMinutesChange: (val: number) => void;
  tagsInput: string;
  onTagsInputChange: (val: string) => void;
  featured: boolean;
  onFeaturedChange: (val: boolean) => void;
}

export default function ArticleInfoFields({
  title,
  onTitleChange,
  slug,
  onSlugChange,
  category,
  onCategoryChange,
  subtitle,
  onSubtitleChange,
  excerpt,
  onExcerptChange,
  coverImage,
  onCoverImageChange,
  readTimeMinutes,
  onReadTimeMinutesChange,
  tagsInput,
  onTagsInputChange,
  featured,
  onFeaturedChange,
}: ArticleInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-xs font-bold text-gray-300">Título do Artigo *</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
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
            onChange={(e) => onSlugChange(e.target.value)}
            placeholder="melhores-jogos-ficcao-cientifica-2026"
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-300">Categoria</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as Article["category"])}
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
          onChange={(e) => onSubtitleChange(e.target.value)}
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
          onChange={(e) => onExcerptChange(e.target.value)}
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
            onChange={(e) => onCoverImageChange(e.target.value)}
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
            onChange={(e) => onReadTimeMinutesChange(Number(e.target.value))}
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
            onChange={(e) => onTagsInputChange(e.target.value)}
            placeholder="RPG, PS5, Metacritic, Dicas"
            className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-6">
          <input
            type="checkbox"
            id="featured-check"
            checked={featured}
            onChange={(e) => onFeaturedChange(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-500 bg-black/40 border-white/20 focus:ring-emerald-500"
          />
          <label htmlFor="featured-check" className="text-xs font-bold text-white cursor-pointer">
            Destacar este artigo no topo do blog
          </label>
        </div>
      </div>
    </div>
  );
}
