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
        className="group relative block overflow-hidden rounded-3xl border border-white/10 bg-[#141822] hover:border-emerald-500/40 transition-all duration-300 shadow-2xl hover:shadow-emerald-950/20"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[340px] overflow-hidden bg-neutral-900">
            <img
              src={article.coverImage}
              alt={article.coverAlt}
              className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105 filter brightness-[0.75] contrast-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#141822]" />
            <span className="absolute top-4 left-4 px-3.5 py-1.5 rounded-full bg-emerald-500 text-black font-extrabold text-xs tracking-wider uppercase shadow-lg">
              {article.categoryLabel}
            </span>
          </div>

          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  {article.readTimeMinutes} min de leitura
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors tracking-tight leading-tight">
                {article.title}
              </h2>

              <p className="text-xs sm:text-sm text-gray-300 line-clamp-3 leading-relaxed">
                {article.excerpt}
              </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <div className="flex items-center gap-2.5">
                <img
                  src={article.author.avatar}
                  alt={article.author.name}
                  className="w-8 h-8 rounded-full border border-white/20 object-cover"
                />
                <div>
                  <p className="text-xs font-bold text-white leading-none">{article.author.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{article.author.role}</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                Ler Artigo <ArrowRight className="w-4 h-4" />
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
