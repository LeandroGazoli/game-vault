"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ARTICLES_DATA } from "@/lib/articlesData";
import { getCombinedArticles } from "@/lib/articlesService";
import { Article } from "@/lib/types/article.types";
import { BookOpen, ArrowRight, Clock } from "lucide-react";

export default function HomeEditorialSection() {
  const [articles, setArticles] = useState<Article[]>(ARTICLES_DATA.slice(0, 3));

  useEffect(() => {
    getCombinedArticles()
      .then((data) => {
        if (data.length > 0) setArticles(data.slice(0, 3));
      })
      .catch(() => {});
  }, []);

  return (
    <section className="space-y-6 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-white/10 pb-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>CENTRAL EDITORIAL &amp; GUIAS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Artigos &amp; Análises do Universo Gamer
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
            Textos autorais com dicas de backlog, análises de notas do Metacritic e retrospectivas de grandes sagas.
          </p>
        </div>

        <Link
          href="/artigos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 group"
        >
          <span>Acessar Todos os Artigos</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((article) => {
          const formattedDate = new Date(article.publishedAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "short",
          });

          return (
            <Link
              key={article.id}
              href={`/artigos/${article.slug}`}
              className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-white/10 bg-[#141822] hover:border-emerald-500/40 transition-all duration-300 shadow-xl hover:shadow-emerald-950/20 hover:-translate-y-1"
            >
              <div>
                <div className="relative h-44 w-full overflow-hidden bg-neutral-900">
                  <img
                    src={article.coverImage}
                    alt={article.coverAlt}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105 filter brightness-[0.8]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141822] via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-500/40 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider font-mono">
                    {article.categoryLabel}
                  </span>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {article.readTimeMinutes} min
                    </span>
                    <span>•</span>
                    <span>{formattedDate}</span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 leading-snug">
                    {article.title}
                  </h3>

                  <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                    {article.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 border-t border-white/5 mt-3 flex items-center justify-between text-xs font-bold text-emerald-400">
                <span className="text-[11px] text-gray-400 font-medium truncate max-w-[150px]">
                  Por {article.author.name}
                </span>
                <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Ler <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
