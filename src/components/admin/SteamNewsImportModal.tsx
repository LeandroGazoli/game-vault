"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Download,
  Loader2,
  Radio,
  ExternalLink,
  Clock,
  Sparkles,
  History,
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
  const [activeTab, setActiveTab] = useState<"search" | "recent">("recent");
  const [appIdInput, setAppIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState<SteamNewsItem[]>([]);
  const [recentList, setRecentList] = useState<any[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Carrega as postagens recentes salvas e traduzidas no banco
  useEffect(() => {
    if (isOpen) {
      loadRecentNews();
    }
  }, [isOpen]);

  const loadRecentNews = async () => {
    setLoadingRecent(true);
    try {
      const res = await fetch("/api/steam/news?mode=recent&count=15");
      if (res.ok) {
        const data = await res.json();
        setRecentList(data.news || []);
      }
    } catch (err) {
      console.warn("Erro ao carregar matérias recentes salvas:", err);
    } finally {
      setLoadingRecent(false);
    }
  };

  if (!isOpen) return null;

  const handleFetchNews = async (targetAppId: string) => {
    const cleanId = targetAppId.trim();
    if (!cleanId || !/^\d+$/.test(cleanId)) {
      alert("Informe um Steam AppID numérico válido.");
      return;
    }

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/steam/news?appId=${cleanId}&count=8`);
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

  const handleImport = (item: any) => {
    const rawContent = item.translatedContents || item.contents || "";
    const cleanText = cleanSteamBBCode(rawContent);
    const cover =
      item.firstImage ||
      extractFirstSteamImage(item.contents || "") ||
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${item.appId || item.appid}/header.jpg`;

    const cleanExcerpt =
      cleanText
        .replace(/^#+\s+/gm, "")
        .replace(/\*\*/g, "")
        .slice(0, 180)
        .trim() + "...";

    onSelectNews({
      title: item.translatedTitle || item.title,
      subtitle: `Novidades, patch notes e atualizações oficiais traduzidas via Steam`,
      excerpt: cleanExcerpt,
      coverImage: cover,
      tags: ["Steam", "Atualização", "Patch Notes", "Notícias"],
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
                Central de Atualizações Steam (PT-BR)
              </h3>
              <p className="text-xs text-gray-400">
                Matérias traduzidas automaticamente e salvas sem idiomas indesejados
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

        {/* Abas: Últimas Postagens Salvas vs Buscar por AppID */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("recent")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "recent"
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Últimas Postagens Lançadas ({recentList.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("search")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "search"
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Buscar por AppID da Steam</span>
          </button>
        </div>

        {/* Conteúdo Aba: Buscar por AppID */}
        {activeTab === "search" && (
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

            {/* Atalhos Populares */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
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
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-zinc-300 hover:text-cyan-400 transition-colors cursor-pointer"
                >
                  {game.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Aba Recentes */}
          {activeTab === "recent" && (
            <>
              {loadingRecent && (
                <div className="p-8 text-center space-y-3 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                  <p className="text-xs">Carregando postagens recentes em PT-BR...</p>
                </div>
              )}

              {!loadingRecent && recentList.length === 0 && (
                <div className="p-8 text-center space-y-3 rounded-2xl bg-white/5 border border-white/5">
                  <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
                  <p className="text-xs font-bold text-white">
                    Nenhuma matéria salva no catálogo ainda
                  </p>
                  <p className="text-[11px] text-zinc-400 max-w-md mx-auto">
                    Use a aba &quot;Buscar por AppID da Steam&quot; acima ou visite as páginas dos jogos. As notícias são traduzidas para PT-BR e salvas automaticamente no banco!
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("search");
                      setAppIdInput("1245620");
                      handleFetchNews("1245620");
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all"
                  >
                    Buscar Elden Ring agora
                  </button>
                </div>
              )}

              {!loadingRecent &&
                recentList.map((item) => (
                  <div
                    key={item.gid}
                    className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/40 transition-all space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                          {item.feedlabel || "Steam"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                          Traduzido PT-BR
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.date * 1000).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {item.translatedTitle || item.title}
                    </h4>

                    <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                      {cleanSteamBBCode(item.translatedContents || item.originalContents).slice(0, 160)}...
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
                        onClick={() => handleImport(item)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Usar como Postagem</span>
                      </button>
                    </div>
                  </div>
                ))}
            </>
          )}

          {/* Aba Busca */}
          {activeTab === "search" && (
            <>
              {loading && (
                <div className="p-8 text-center space-y-3 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                  <p className="text-xs">Buscando, traduzindo para PT-BR e salvando no banco...</p>
                </div>
              )}

              {!loading && hasSearched && newsList.length === 0 && (
                <div className="p-8 text-center space-y-2 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-bold text-white">Nenhum anúncio encontrado</p>
                  <p className="text-[11px] text-zinc-400">
                    Verifique se o AppID está correto na loja da Steam.
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
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                            {item.isTranslated ? "Traduzido PT-BR" : isPt ? "PT-BR" : "Oficial"}
                          </span>
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
                          <span>Ver original Steam</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          type="button"
                          onClick={() => handleImport(item)}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Usar como Rascunho</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
