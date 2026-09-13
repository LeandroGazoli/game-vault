import React from "react";
import Link from "next/link";
import { Article } from "@/lib/types/article.types";
import { Clock, Calendar, ArrowRight, BookOpen } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  featured?: boolean;
}

export default function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (featured) {
    return (
      <Link
        href={`/artigos/${article.slug}`}
        className="group relative flex flex-col sm:flex-row items-center overflow-hidden rounded-2xl border border-white/10 bg-[#141822] hover:border-emerald-500/40 transition-all duration-300 shadow-lg hover:shadow-emerald-950/20"
      >
        {/* Thumbnail compacta estilo portal de notícias */}
        <div className="relative w-full sm:w-72 md:w-80 h-44 sm:h-36 shrink-0 overflow-hidden bg-neutral-900">
          <img
            src={article.coverImage}
            alt={article.coverAlt}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 filter brightness-[0.85]"
          />
          <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-emerald-500 text-black font-extrabold text-[10px] uppercase tracking-wider shadow">
            {article.categoryLabel}
          </span>
        </div>

        {/* Conteúdo textual direto ao ponto */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between w-full space-y-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-400" />
                {formattedDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                {article.readTimeMinutes} min de leitura
              </span>
            </div>

            <h2 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight leading-snug line-clamp-2">
              {article.title}
            </h2>

            <p className="text-xs text-gray-400 line-clamp-1 leading-relaxed">
              {article.excerpt}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
            <span className="text-gray-400 font-medium">
              Por <strong className="text-gray-300">{article.author.name}</strong>
            </span>

            <span className="inline-flex items-center gap-1 font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
              Ler Notícia <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/artigos/${article.slug}`}
      className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#141822] hover:border-emerald-500/40 transition-all duration-300 shadow-xl hover:shadow-emerald-950/10 hover:-translate-y-1"
    >
      <div>
        <div className="relative h-48 w-full overflow-hidden bg-neutral-900">
          <img
            src={article.coverImage}
            alt={article.coverAlt}
            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 filter brightness-[0.8]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-transparent to-transparent" />
          <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-[11px] uppercase tracking-wider">
            {article.categoryLabel}
          </span>
        </div>

        <div className="p-5 space-y-2.5">
          <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-emerald-400" />
              {article.readTimeMinutes} min de leitura
            </span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
            {article.title}
          </h3>

          <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {article.excerpt}
          </p>
        </div>
      </div>

      <div className="p-5 pt-0 border-t border-white/5 mt-4 flex items-center justify-between text-xs font-bold text-emerald-400">
        <span className="flex items-center gap-1 text-[11px] text-gray-400">
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          Editorial MGL
        </span>
        <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          Acessar <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}
