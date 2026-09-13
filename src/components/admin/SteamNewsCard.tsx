"use client";

import React from "react";
import { Clock, Download, ExternalLink } from "lucide-react";
import { cleanSteamBBCode, isPortugueseNews } from "@/lib/steamNewsService";

interface SteamNewsCardProps {
  item: any;
  onImport: (item: any) => void;
  buttonLabel?: string;
}

export default function SteamNewsCard({
  item,
  onImport,
  buttonLabel = "Usar como Postagem",
}: SteamNewsCardProps) {
  const isPt = isPortugueseNews(item.title, item.contents || item.originalContents || "");
  const gameBadge = item.gameName || (item.appId || item.appid ? `App ${item.appId || item.appid}` : null);
  const title = item.translatedTitle || item.title;
  const rawBody = item.translatedContents || item.originalContents || item.contents || "";
  const displaySnippet = cleanSteamBBCode(rawBody).slice(0, 160);

  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/40 transition-all space-y-2 group">
      <div className="flex items-center justify-between text-[10px] text-zinc-400">
        <div className="flex items-center gap-1.5 flex-wrap">
          {gameBadge && (
            <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
              {gameBadge}
            </span>
          )}
          <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
            {item.feedlabel || "Steam"}
          </span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
            {item.isTranslated ? "Traduzido PT-BR" : isPt ? "PT-BR" : "Oficial"}
          </span>
        </div>
        <span className="flex items-center gap-1 shrink-0 ml-2">
          <Clock className="w-3 h-3" />
          {item.date ? new Date(item.date * 1000).toLocaleDateString("pt-BR") : "Recente"}
        </span>
      </div>

      <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
        {title}
      </h4>

      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
        {displaySnippet}...
      </p>

      <div className="pt-2 flex items-center justify-between border-t border-white/5">
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
        >
          <span>Ver original Steam</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          type="button"
          onClick={() => onImport(item)}
          className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{buttonLabel}</span>
        </button>
      </div>
    </div>
  );
}
