"use client";

import React, { useState } from "react";
import {
  X,
  Search,
  Download,
  Loader2,
  Radio,
  ExternalLink,
  Clock,
  Globe2,
} from "lucide-react";
import {
  SteamNewsItem,
  cleanSteamBBCode,
  extractFirstSteamImage,
  isPortugueseNews,
} from "@/lib/steamNewsService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";

interface SteamNewsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNews: (imported: {
    title: string;
    subtitle: string;
    excerpt: string;
    coverImage: string;
    tags: string[];
    content: string;
    sourceUrl: string;
  }) => void;
}

const POPULAR_STEAM_GAMES = [
  { name: "Elden Ring", appId: "1245620" },
  { name: "Cyberpunk 2077", appId: "1091500" },
  { name: "Baldur's Gate 3", appId: "1086940" },
  { name: "Hollow Knight", appId: "367520" },
  { name: "Black Myth: Wukong", appId: "2358720" },
  { name: "Hades II", appId: "1145350" },
];

export default function SteamNewsImportModal({
  isOpen,
  onClose,
  onSelectNews,
}: SteamNewsImportModalProps) {
  const [appIdInput, setAppIdInput] = useState("");
  const [onlyPt, setOnlyPt] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState<SteamNewsItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  if (!isOpen) return null;

  const handleFetchNews = async (targetAppId: string, ptOnly = onlyPt) => {
    const cleanId = targetAppId.trim();
    if (!cleanId || !/^\d+$/.test(cleanId)) {
      alert("Informe um Steam AppID numérico válido.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const langParam = ptOnly ? "&lang=pt" : "";
      const res = await fetch(`/api/steam/news?appId=${cleanId}&count=8${langParam}`);
      if (!res.ok) {
        throw new Error(`Status ${res.status}`);
      }
      const data = await res.json();
      setNewsList(data.news || []);
      if ((data.news || []).length === 0) {
        triggerWarningHaptic();
      } else {
        triggerSuccessHaptic();
      }
    } catch (e) {
      console.error("Erro ao buscar novidades da Steam:", e);
      setNewsList([]);
      triggerWarningHaptic();
      alert("Não foi possível buscar as notícias para este AppID na Steam.");
    } finally {
      setLoading(false);
    }
  };

  const handleImport = (item: SteamNewsItem) => {
    const cleanText = cleanSteamBBCode(item.contents);
    const cover =
      extractFirstSteamImage(item.contents) ||
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${item.appid}/header.jpg`;

    const cleanExcerpt =
      cleanText
        .replace(/^#+\s+/gm, "")
        .replace(/\*\*/g, "")
        .slice(0, 180)
        .trim() + "...";

    onSelectNews({
      title: item.title,
      subtitle: `Novidades, patch notes e atualizações oficiais via Steam Community`,
      excerpt: cleanExcerpt,
      coverImage: cover,
      tags: ["Steam", "Atualização", "Patch Notes", "Novidades"],
      content: cleanText,
      sourceUrl: item.url,
    });

    triggerSuccessHaptic();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-6 shadow-2xl max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Importar Notícia Oficial da Steam
              </h3>
              <p className="text-xs text-gray-400">
                Comunicados oficiais de estúdios (sem spam russo, chinês ou agregadores)
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

        {/* Input de Busca, Filtro PT e Sugestões */}
        <div className="space-y-3 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleFetchNews(appIdInput);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={appIdInput}
              onChange={(e) => setAppIdInput(e.target.value)}
              placeholder="Digite o Steam App ID (ex: 1245620 para Elden Ring)..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 shrink-0"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>Buscar</span>
            </button>
          </form>

          {/* Filtro de Idioma e Sugestões */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mr-1">
                Sugestões:
              </span>
              {POPULAR_STEAM_GAMES.map((game) => (
                <button
                  key={game.appId}
                  type="button"
                  onClick={() => {
                    setAppIdInput(game.appId);
                    handleFetchNews(game.appId);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-zinc-300 hover:text-cyan-400 transition-colors"
                >
                  {game.name}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                const nextVal = !onlyPt;
                setOnlyPt(nextVal);
                if (appIdInput) {
                  handleFetchNews(appIdInput, nextVal);
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold transition-all border ${
                onlyPt
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-white/5 text-zinc-400 border-white/10 hover:text-white"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>{onlyPt ? "Apenas PT-BR ativo" : "Filtrar estrito PT-BR"}</span>
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {loading && (
            <div className="p-8 text-center space-y-3 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
              <p className="text-xs">Consultando a Steam API oficial...</p>
            </div>
          )}

          {!loading && hasSearched && newsList.length === 0 && (
            <div className="p-8 text-center space-y-2 rounded-2xl bg-white/5 border border-white/5">
              <p className="text-xs font-bold text-white">Nenhum anúncio encontrado</p>
              <p className="text-[11px] text-zinc-400">
                {onlyPt
                  ? "Nenhum post em português encontrado para este jogo. Desmarque o filtro PT-BR para ver os comunicados originais dos estúdios."
                  : "Verifique se o AppID está correto na loja da Steam."}
              </p>
            </div>
          )}

          {!loading &&
            newsList.map((item) => {
              const isPt = isPortugueseNews(item.title, item.contents);
              return (
                <div
                  key={item.gid}
                  className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/40 transition-all space-y-2 group"
                >
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                        {item.feedlabel || "Steam"}
                      </span>
                      {isPt && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                          PT-BR
                        </span>
                      )}
                    </div>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.date * 1000).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {item.title}
                  </h4>

                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {cleanSteamBBCode(item.contents).slice(0, 160)}...
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-white/5">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white"
                    >
                      <span>Ver original</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleImport(item)}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Usar como Rascunho</span>
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
