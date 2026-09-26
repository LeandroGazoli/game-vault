"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Loader2,
  Radio,
  Sparkles,
  Flame,
  Globe,
  Newspaper,
  Filter,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import {
  SteamNewsItem,
  cleanSteamBBCode,
  extractFirstSteamImage,
} from "@/lib/steamNewsService";
import type { NewsDataArticle } from "@/lib/newsDataService";
import type { GNewsArticle } from "@/lib/gnewsService";
import type { ApiQuotaStatus } from "@/lib/apiKeyUsageTracker";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import SteamNewsCard from "./SteamNewsCard";
import SteamAppIdSearchForm from "./SteamAppIdSearchForm";
import NewsDataCard from "./NewsDataCard";
import GNewsCard from "./GNewsCard";

export interface ImportedArticleData {
  title: string;
  subtitle: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  content: string;
  contentHtml?: string;
  sourceUrl: string;
  category?: "guias" | "analises" | "listas" | "especiais" | "industria";
  readTimeMinutes?: number;
  slug?: string;
}

interface NewsImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectNews: (imported: ImportedArticleData) => void;
}

const POPULAR_STEAM_GAMES = [
  { name: "Elden Ring", appId: "1245620" },
  { name: "Cyberpunk 2077", appId: "1091500" },
  { name: "Baldur's Gate 3", appId: "1086940" },
  { name: "Hollow Knight", appId: "367520" },
  { name: "Black Myth: Wukong", appId: "2358720" },
  { name: "Hades II", appId: "1145350" },
];

export default function NewsImportModal({
  isOpen,
  onClose,
  onSelectNews,
}: NewsImportModalProps) {
  const [sourceTab, setSourceTab] = useState<"newsdata" | "gnews" | "steam">("newsdata");
  
  // Custom API keys (para o usuário/admin usar a sua própria se desejar)
  const [newsDataCustomKey, setNewsDataCustomKey] = useState("");
  const [gnewsCustomKey, setGnewsCustomKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  // Quotas
  const [newsDataQuota, setNewsDataQuota] = useState<ApiQuotaStatus | null>(null);
  const [gnewsQuota, setGnewsQuota] = useState<ApiQuotaStatus | null>(null);

  // NewsData.io state
  const [newsDataQuery, setNewsDataQuery] = useState("games OR jogo OR jogos OR video game");
  const [newsDataArticles, setNewsDataArticles] = useState<NewsDataArticle[]>([]);
  const [loadingNewsData, setLoadingNewsData] = useState(false);

  // GNews.io state
  const [gnewsQuery, setGnewsQuery] = useState("jogos OR video game");
  const [gnewsArticles, setGnewsArticles] = useState<GNewsArticle[]>([]);
  const [loadingGNews, setLoadingGNews] = useState(false);
  
  // Steam state
  const [steamTab, setSteamTab] = useState<"latest" | "search">("latest");
  const [appIdInput, setAppIdInput] = useState("");
  const [loadingSteam, setLoadingSteam] = useState(false);
  const [steamList, setSteamList] = useState<SteamNewsItem[]>([]);
  const [steamLatestList, setSteamLatestList] = useState<any[]>([]);
  const [loadingSteamLatest, setLoadingSteamLatest] = useState(false);
  const [hasSteamSearched, setHasSteamSearched] = useState(false);

  // IA Rewrite state
  const [rewritingId, setRewritingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (sourceTab === "newsdata" && newsDataArticles.length === 0) {
        loadNewsData();
      } else if (sourceTab === "gnews" && gnewsArticles.length === 0) {
        loadGNews();
      } else if (sourceTab === "steam" && steamLatestList.length === 0) {
        loadLatestSteamNews();
      }
    }
  }, [isOpen, sourceTab]);

  const loadNewsData = async (customQuery?: string) => {
    setLoadingNewsData(true);
    try {
      const q = encodeURIComponent(customQuery ?? newsDataQuery);
      const res = await fetch(`/api/newsdata?q=${q}&country=br&language=pt`, {
        headers: newsDataCustomKey.trim()
          ? { "x-newsdata-api-key": newsDataCustomKey.trim() }
          : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setNewsDataArticles(data.results || []);
        if (data.quota) setNewsDataQuota(data.quota);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Erro ao consultar NewsData.io");
      }
    } catch (err: any) {
      console.warn("Erro ao buscar notícias NewsData:", err);
    } finally {
      setLoadingNewsData(false);
    }
  };

  const loadGNews = async (customQuery?: string) => {
    setLoadingGNews(true);
    try {
      const q = encodeURIComponent(customQuery ?? gnewsQuery);
      const res = await fetch(`/api/gnews?q=${q}&lang=pt&max=10`, {
        headers: gnewsCustomKey.trim()
          ? { "x-gnews-api-key": gnewsCustomKey.trim() }
          : undefined,
      });
      if (res.ok) {
        const data = await res.json();
        setGnewsArticles(data.articles || []);
        if (data.quota) setGnewsQuota(data.quota);
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Erro ao consultar GNews.io");
      }
    } catch (err: any) {
      console.warn("Erro ao buscar notícias GNews:", err);
    } finally {
      setLoadingGNews(false);
    }
  };

  const loadLatestSteamNews = async () => {
    setLoadingSteamLatest(true);
    try {
      const res = await fetch("/api/steam/news?mode=latest&count=15");
      if (res.ok) {
        const data = await res.json();
        setSteamLatestList(data.news || []);
      }
    } catch (err) {
      console.warn("Erro ao carregar matérias recentes da Steam:", err);
    } finally {
      setLoadingSteamLatest(false);
    }
  };

  const handleFetchSteamByAppId = async (targetAppId: string) => {
    const cleanId = targetAppId.trim();
    if (!cleanId || !/^\d+$/.test(cleanId)) {
      alert("Informe um Steam AppID numérico válido.");
      return;
    }

    setLoadingSteam(true);
    setHasSteamSearched(true);
    try {
      const res = await fetch(`/api/steam/news?appId=${cleanId}&count=8`);
      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      setSteamList(data.news || []);
      if ((data.news || []).length === 0) {
        triggerWarningHaptic();
      } else {
        triggerSuccessHaptic();
      }
    } catch (e) {
      console.error("Erro ao buscar novidades da Steam:", e);
      setSteamList([]);
      triggerWarningHaptic();
      alert("Não foi possível buscar as notícias para este AppID na Steam.");
    } finally {
      setLoadingSteam(false);
    }
  };

  const requestAiRewrite = async (params: {
    title: string;
    content: string;
    sourceName?: string;
    sourceUrl?: string;
  }) => {
    const res = await fetch("/api/articles/rewrite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Falha ao reescrever matéria com IA.");
    }
    return await res.json();
  };

  // Import Handler para NewsData.io
  const handleImportNewsData = async (item: NewsDataArticle, rewriteWithAI: boolean) => {
    const rawContent = item.description || item.title || "";
    const cover = item.image_url || "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg";
    const tags = item.keywords || ["Games", "Notícias", item.source_name || "News"];

    if (rewriteWithAI) {
      setRewritingId(item.article_id);
      try {
        const aiOutput = await requestAiRewrite({
          title: item.title,
          content: `${item.title}\n\n${item.description || ""}`,
          sourceName: item.source_name,
          sourceUrl: item.link,
        });

        onSelectNews({
          title: aiOutput.title,
          subtitle: aiOutput.subtitle,
          slug: aiOutput.slug,
          excerpt: aiOutput.excerpt,
          category: aiOutput.category,
          tags: aiOutput.tags || tags,
          readTimeMinutes: aiOutput.readTimeMinutes || 4,
          coverImage: cover,
          content: rawContent,
          contentHtml: aiOutput.contentHtml,
          sourceUrl: item.link,
        });

        triggerSuccessHaptic();
        onClose();
      } catch (err: any) {
        console.error("Erro na reescrita IA:", err);
        triggerWarningHaptic();
        alert(`Erro na reescrita com IA: ${err.message || "Tente novamente."}`);
      } finally {
        setRewritingId(null);
      }
      return;
    }

    onSelectNews({
      title: item.title,
      subtitle: `Matéria informada via ${item.source_name || "NewsData.io"}`,
      excerpt: (item.description || item.title).slice(0, 180) + "...",
      coverImage: cover,
      tags,
      content: rawContent,
      sourceUrl: item.link,
      category: "industria",
    });

    triggerSuccessHaptic();
    onClose();
  };

  // Import Handler para GNews.io
  const handleImportGNews = async (item: GNewsArticle, rewriteWithAI: boolean) => {
    const rawContent = `${item.title}\n\n${item.description || ""}\n\n${item.content || ""}`;
    const cover = item.image || "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg";
    const tags = ["Games", "GNews", item.source?.name || "Notícias"];

    if (rewriteWithAI) {
      setRewritingId(item.id);
      try {
        const aiOutput = await requestAiRewrite({
          title: item.title,
          content: rawContent,
          sourceName: item.source?.name || "GNews",
          sourceUrl: item.url,
        });

        onSelectNews({
          title: aiOutput.title,
          subtitle: aiOutput.subtitle,
          slug: aiOutput.slug,
          excerpt: aiOutput.excerpt,
          category: aiOutput.category,
          tags: aiOutput.tags || tags,
          readTimeMinutes: aiOutput.readTimeMinutes || 4,
          coverImage: cover,
          content: rawContent,
          contentHtml: aiOutput.contentHtml,
          sourceUrl: item.url,
        });

        triggerSuccessHaptic();
        onClose();
      } catch (err: any) {
        console.error("Erro na reescrita IA:", err);
        triggerWarningHaptic();
        alert(`Erro na reescrita com IA: ${err.message || "Tente novamente."}`);
      } finally {
        setRewritingId(null);
      }
      return;
    }

    onSelectNews({
      title: item.title,
      subtitle: `Notícia apurada por ${item.source?.name || "GNews"}`,
      excerpt: (item.description || item.title).slice(0, 180) + "...",
      coverImage: cover,
      tags,
      content: rawContent,
      sourceUrl: item.url,
      category: "industria",
    });

    triggerSuccessHaptic();
    onClose();
  };

  // Import Handler para Steam
  const handleImportSteam = async (item: any, rewriteWithAI = false) => {
    const rawContent = item.translatedContents || item.contents || item.originalContents || "";
    const cleanText = cleanSteamBBCode(rawContent);
    const cover =
      item.firstImage ||
      extractFirstSteamImage(item.contents || "") ||
      `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${item.appId || item.appid}/header.jpg`;

    const gameTag = item.gameName ? [item.gameName] : [];
    const baseTags = ["Steam", "Atualização", "Patch Notes", ...gameTag];

    if (rewriteWithAI) {
      const idKey = String(item.gid || item.id || Date.now());
      setRewritingId(idKey);
      try {
        const aiOutput = await requestAiRewrite({
          title: item.translatedTitle || item.title,
          content: cleanText.slice(0, 3500),
          sourceName: "Steam Oficial",
          sourceUrl: item.url,
        });

        onSelectNews({
          title: aiOutput.title,
          subtitle: aiOutput.subtitle,
          slug: aiOutput.slug,
          excerpt: aiOutput.excerpt,
          category: aiOutput.category,
          tags: aiOutput.tags || baseTags,
          readTimeMinutes: aiOutput.readTimeMinutes || 4,
          coverImage: cover,
          content: cleanText,
          contentHtml: aiOutput.contentHtml,
          sourceUrl: item.url,
        });

        triggerSuccessHaptic();
        onClose();
      } catch (err: any) {
        console.error("Erro na reescrita com IA:", err);
        triggerWarningHaptic();
        alert(`Erro na reescrita com IA: ${err.message || "Tente novamente."}`);
      } finally {
        setRewritingId(null);
      }
      return;
    }

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
      tags: baseTags,
      content: cleanText,
      sourceUrl: item.url,
      category: "industria",
    });

    triggerSuccessHaptic();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl rounded-[32px] bg-[#14161d] border border-white/10 p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Importador Editorial Multifonte
              </h3>
              <p className="text-xs text-gray-400">
                Selecione artigos de grandes portais ou Steam e reescreva de forma 100% autoral sob demanda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Indicador de Processamento IA Global */}
        {rewritingId && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 animate-pulse shrink-0">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-emerald-300">Inteligência Artificial reescrevendo matéria...</p>
              <p className="text-zinc-400 text-[11px]">Gerando estrutura em HTML, título cativante, subtítulo e SEO autoral.</p>
            </div>
          </div>
        )}

        {/* Abas de Seleção de Fonte e Monitor de Cotas */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => setSourceTab("newsdata")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sourceTab === "newsdata"
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20 font-black"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>NewsData.io</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceTab("gnews")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sourceTab === "gnews"
                  ? "bg-violet-500 text-white shadow-lg shadow-violet-500/20 font-black"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>GNews.io</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceTab("steam")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                sourceTab === "steam"
                  ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Steam Oficial</span>
            </button>
          </div>

          {/* Contador de Limite Diário & Chave Alternativa */}
          {sourceTab !== "steam" && (
            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              {/* Badge de Consumo Diário */}
              {((sourceTab === "newsdata" && newsDataQuota) || (sourceTab === "gnews" && gnewsQuota)) && (
                <div
                  className="px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-[11px] font-mono text-zinc-300 flex items-center gap-1.5"
                  title="Contador de requisições gastas hoje para esta chave (Cap: 100/dia)"
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      (sourceTab === "newsdata" ? newsDataQuota?.isExceeded : gnewsQuota?.isExceeded)
                        ? "bg-rose-500 animate-ping"
                        : "bg-emerald-400"
                    }`}
                  />
                  <span>
                    Hoje:{" "}
                    <strong className="text-white">
                      {sourceTab === "newsdata" ? newsDataQuota?.count : gnewsQuota?.count}
                    </strong>
                    /
                    {sourceTab === "newsdata" ? newsDataQuota?.limit : gnewsQuota?.limit} reqs
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                  (sourceTab === "newsdata" ? newsDataCustomKey : gnewsCustomKey)
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                    : "bg-white/5 hover:bg-white/10 border-white/10 text-zinc-400 hover:text-white"
                }`}
                title="Inserir uma chave de API própria ou alternativa"
              >
                <KeyRound className="w-3 h-3" />
                <span>{(sourceTab === "newsdata" ? newsDataCustomKey : gnewsCustomKey) ? "Chave Própria Ativa" : "Usar Minha Chave"}</span>
              </button>
            </div>
          )}
        </div>

        {/* Gaveta de Chave Própria / Alternativa */}
        {showKeyInput && sourceTab !== "steam" && (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2 shrink-0 animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-300 font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                Chave de API {sourceTab === "newsdata" ? "NewsData.io" : "GNews.io"}
              </span>
              <span className="text-[10px] text-gray-400">
                Cada chave possui cota isolada de 100 req/dia
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={sourceTab === "newsdata" ? newsDataCustomKey : gnewsCustomKey}
                onChange={(e) => {
                  if (sourceTab === "newsdata") setNewsDataCustomKey(e.target.value);
                  else setGnewsCustomKey(e.target.value);
                }}
                placeholder={
                  sourceTab === "newsdata"
                    ? "Cole sua chave da NewsData (pub_...)"
                    : "Cole seu token de API da GNews"
                }
                className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={() => {
                  if (sourceTab === "newsdata") loadNewsData();
                  else loadGNews();
                  triggerSuccessHaptic();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all cursor-pointer"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo: NewsData.io */}
        {sourceTab === "newsdata" && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadNewsData();
              }}
              className="flex items-center gap-2 shrink-0"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={newsDataQuery}
                  onChange={(e) => setNewsDataQuery(e.target.value)}
                  placeholder='Ex: games OR playstation NOT vazamento, "Resident Evil"'
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                disabled={loadingNewsData}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loadingNewsData ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
                <span>Buscar</span>
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingNewsData && (
                <div className="p-8 text-center space-y-3 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                  <p className="text-xs">Buscando matérias no NewsData.io em tempo real...</p>
                </div>
              )}

              {!loadingNewsData && newsDataArticles.length === 0 && (
                <div className="p-8 text-center space-y-2 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-bold text-white">Nenhuma notícia encontrada</p>
                  <p className="text-[11px] text-zinc-400">Tente ajustar as palavras-chave ou operadores na barra de busca.</p>
                </div>
              )}

              {!loadingNewsData &&
                newsDataArticles.map((art) => (
                  <NewsDataCard
                    key={art.article_id}
                    item={art}
                    onImport={handleImportNewsData}
                    isRewriting={Boolean(rewritingId)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Conteúdo: GNews.io */}
        {sourceTab === "gnews" && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadGNews();
              }}
              className="flex items-center gap-2 shrink-0"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={gnewsQuery}
                  onChange={(e) => setGnewsQuery(e.target.value)}
                  placeholder='Ex: jogos OR "video game", nintendo, xbox'
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-violet-500"
                />
              </div>
              <button
                type="submit"
                disabled={loadingGNews}
                className="px-4 py-2 rounded-xl bg-violet-500 hover:bg-violet-400 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {loadingGNews ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Filter className="w-3.5 h-3.5" />}
                <span>Buscar</span>
              </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingGNews && (
                <div className="p-8 text-center space-y-3 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-violet-400" />
                  <p className="text-xs">Buscando matérias no GNews.io...</p>
                </div>
              )}

              {!loadingGNews && gnewsArticles.length === 0 && (
                <div className="p-8 text-center space-y-2 rounded-2xl bg-white/5 border border-white/5">
                  <p className="text-xs font-bold text-white">Nenhuma notícia encontrada</p>
                  <p className="text-[11px] text-zinc-400">Tente buscar por outros termos.</p>
                </div>
              )}

              {!loadingGNews &&
                gnewsArticles.map((art) => (
                  <GNewsCard
                    key={art.id}
                    item={art}
                    onImport={handleImportGNews}
                    isRewriting={Boolean(rewritingId)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Conteúdo: Steam */}
        {sourceTab === "steam" && (
          <div className="space-y-4 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setSteamTab("latest")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  steamTab === "latest"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Flame className="w-3 h-3 inline mr-1" />
                Últimos da Steam ({steamLatestList.length})
              </button>
              <button
                type="button"
                onClick={() => setSteamTab("search")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  steamTab === "search"
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Search className="w-3 h-3 inline mr-1" />
                Filtrar por AppID
              </button>
            </div>

            {steamTab === "search" && (
              <SteamAppIdSearchForm
                appIdInput={appIdInput}
                setAppIdInput={setAppIdInput}
                loading={loadingSteam}
                onSearch={handleFetchSteamByAppId}
                suggestions={POPULAR_STEAM_GAMES}
              />
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {steamTab === "latest" && (
                <>
                  {loadingSteamLatest && (
                    <div className="p-8 text-center space-y-3 text-zinc-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                      <p className="text-xs">Buscando os anúncios mais recentes da Steam...</p>
                    </div>
                  )}

                  {!loadingSteamLatest &&
                    steamLatestList.map((item) => (
                      <SteamNewsCard
                        key={item.gid}
                        item={item}
                        onImport={handleImportSteam}
                        isRewriting={Boolean(rewritingId)}
                      />
                    ))}
                </>
              )}

              {steamTab === "search" && (
                <>
                  {loadingSteam && (
                    <div className="p-8 text-center space-y-3 text-zinc-400">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                      <p className="text-xs">Buscando anúncios deste jogo na Steam...</p>
                    </div>
                  )}

                  {!loadingSteam && hasSteamSearched && steamList.length === 0 && (
                    <div className="p-8 text-center space-y-2 rounded-2xl bg-white/5 border border-white/5">
                      <p className="text-xs font-bold text-white">Nenhum anúncio encontrado</p>
                    </div>
                  )}

                  {!loadingSteam &&
                    steamList.map((item) => (
                      <SteamNewsCard
                        key={item.gid}
                        item={item}
                        onImport={handleImportSteam}
                        isRewriting={Boolean(rewritingId)}
                      />
                    ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
