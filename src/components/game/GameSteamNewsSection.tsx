"use client";

import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Radio,
} from "lucide-react";
import {
  SteamNewsItem,
  cleanSteamBBCode,
  extractFirstSteamImage,
  isPortugueseNews,
} from "@/lib/steamNewsService";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface GameSteamNewsSectionProps {
  appId: string | null;
  gameTitle: string;
}

export default function GameSteamNewsSection({
  appId,
  gameTitle,
}: GameSteamNewsSectionProps) {
  const [news, setNews] = useState<SteamNewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!appId) return;

    let isMounted = true;
    setLoading(true);

    fetch(`/api/steam/news?appId=${appId}&count=4`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && data?.news) {
          setNews(data.news);
        }
      })
      .catch((err) => {
        console.warn("Falha ao carregar notícias Steam:", err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appId]);

  if (!appId || (!loading && news.length === 0)) {
    return null;
  }

  const formatDate = (unixSeconds: number) => {
    try {
      const date = new Date(unixSeconds * 1000);
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  const toggleExpand = (idx: number) => {
    triggerSelectionHaptic();
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#141822] p-5 sm:p-6 space-y-4 shadow-xl">
      {/* Cabeçalho da Seção */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Atualizações &amp; Patches</span>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-[10px] text-cyan-400 border border-cyan-500/20 font-mono">
                Steam Feed
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">
              Notas de versão e comunicados oficiais de {gameTitle}
            </p>
          </div>
        </div>

        <a
          href={`https://store.steampowered.com/news/app/${appId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-cyan-400 transition-colors shrink-0"
        >
          <span>Ver na Steam</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-16 rounded-2xl bg-white/5 animate-pulse border border-white/5"
            />
          ))}
        </div>
      )}

      {/* Lista de Notícias */}
      {!loading && news.length > 0 && (
        <div className="space-y-3">
          {news.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            const cleanText = cleanSteamBBCode(item.contents);
            const firstImg = extractFirstSteamImage(item.contents);
            const isPt = isPortugueseNews(item.title, item.contents);

            return (
              <div
                key={item.gid || idx}
                className="rounded-2xl border border-white/5 bg-[#0b0d12]/70 overflow-hidden transition-all hover:border-white/15"
              >
                {/* Linha Resumo Clicável */}
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="w-full text-left p-3.5 sm:p-4 flex items-start justify-between gap-3 cursor-pointer"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                      <span className="px-1.5 py-0.5 rounded bg-white/5 font-mono text-cyan-400">
                        {item.feedlabel || "Patch Note"}
                      </span>
                      {(isPt || item.isTranslated) && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-bold border border-emerald-500/20">
                          {item.isTranslated ? "Traduzido PT-BR" : "PT-BR"}
                        </span>
                      )}
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {formatDate(item.date)}
                      </span>
                      {item.author && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-[120px]">
                            {item.author}
                          </span>
                        </>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2">
                      {item.title}
                    </h4>
                  </div>

                  <div className="p-1.5 rounded-lg bg-white/5 text-gray-400 shrink-0 mt-0.5">
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Conteúdo Expandido */}
                {isExpanded && (
                  <div className="p-4 pt-1 border-t border-white/5 space-y-3 text-xs text-gray-300 animate-fadeIn">
                    {firstImg && (
                      <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-black/40 border border-white/10 my-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={firstImg}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    <div className="prose prose-invert max-w-none text-xs leading-relaxed line-clamp-[12] whitespace-pre-line text-zinc-300 font-sans">
                      {cleanText}
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-white/5">
                      <span className="text-[11px] text-zinc-500">
                        Fonte: {item.feedname || "Steam Community"}
                      </span>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <span>Ler anúncio completo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
