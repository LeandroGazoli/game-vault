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
        className="group relative block overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-[#141822] hover:border-emerald-500/40 transition-all duration-300 shadow-xl hover:shadow-emerald-950/20"
      >
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-0">
          <div className="sm:col-span-5 relative h-48 sm:h-auto min-h-[170px] sm:min-h-[210px] overflow-hidden bg-neutral-900">
            <img
              src={article.coverImage}
              alt={article.coverAlt}
              className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 filter brightness-[0.8] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-[#141822]" />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-500 text-black font-extrabold text-[10px] tracking-wider uppercase shadow-md">
              {article.categoryLabel}
            </span>
          </div>

          <div className="sm:col-span-7 p-4 sm:p-5 flex flex-col justify-between space-y-3">
            <div className="space-y-2">
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

              <h2 className="text-base sm:text-lg font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight leading-snug line-clamp-2">
                {article.title}
              </h2>

              <p className="text-xs text-gray-300 line-clamp-2 leading-relaxed font-normal">
                {article.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <div className="flex items-center gap-2">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-6 h-6 rounded-full border border-white/20 object-cover"
                />
                <div>
                  <p className="text-[11px] font-bold text-white leading-none">{article.author.name}</p>
                  <p className="text-[9px] text-gray-400 mt-0.5">{article.author.role}</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                Ler Artigo <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
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
