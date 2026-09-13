"use client";

import React from "react";
import { Clock, Download, ExternalLink, Sparkles } from "lucide-react";
import { NewsDataArticle } from "@/lib/newsDataService";

interface NewsDataCardProps {
  item: NewsDataArticle;
  onImport: (item: NewsDataArticle, rewriteWithAI: boolean) => void;
  isRewriting?: boolean;
}

export default function NewsDataCard({
  item,
  onImport,
  isRewriting = false,
}: NewsDataCardProps) {
  const publishedDate = item.pubDate
    ? new Date(item.pubDate).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Recente";

  const categories = item.category?.filter((c) => c !== "top") || [];
  const image = item.image_url;

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/30 transition-all space-y-3 group">
      <div className="flex items-start gap-3.5">
        {image && (
          <img
            src={image}
            alt={item.title}
            onError={(e) => {
              (e.target as HTMLElement).style.display = "none";
            }}
            className="w-20 h-16 sm:w-24 sm:h-20 rounded-xl object-cover shrink-0 border border-white/10 bg-black/40"
          />
        )}

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                {item.source_name || "NewsData"}
              </span>
              {categories.slice(0, 2).map((cat) => (
                <span
                  key={cat}
                  className="px-2 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10 uppercase text-[9px] font-mono"
                >
                  {cat}
                </span>
              ))}
            </div>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3 text-zinc-500" />
              {publishedDate}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2">
            {item.title}
          </h4>

          {item.description && (
            <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="pt-2 flex items-center justify-between border-t border-white/5 flex-wrap gap-2">
        <a
          href={item.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
        >
          <span>Fonte original</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isRewriting}
            onClick={() => onImport(item, false)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            title="Importa o texto original para você editar"
          >
            <Download className="w-3 h-3" />
            <span>Importar Direto</span>
          </button>

          <button
            type="button"
            disabled={isRewriting}
            onClick={() => onImport(item, true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 cursor-pointer"
            title="Reescreve e estrutura a matéria inteira com IA para aprovação no AdSense"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Reescrever com IA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
