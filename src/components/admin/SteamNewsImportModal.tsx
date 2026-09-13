"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Search,
  Loader2,
  Radio,
  Sparkles,
  Flame,
} from "lucide-react";
import {
  SteamNewsItem,
  cleanSteamBBCode,
  extractFirstSteamImage,
} from "@/lib/steamNewsService";
import { triggerSuccessHaptic, triggerWarningHaptic } from "@/lib/capacitor";
import SteamNewsCard from "./SteamNewsCard";
import SteamAppIdSearchForm from "./SteamAppIdSearchForm";

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
  const [activeTab, setActiveTab] = useState<"latest" | "search">("latest");
  const [appIdInput, setAppIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState<SteamNewsItem[]>([]);
  const [latestList, setLatestList] = useState<any[]>([]);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadLatestNews();
    }
  }, [isOpen]);

  const loadLatestNews = async () => {
    setLoadingLatest(true);
    try {
      const res = await fetch("/api/steam/news?mode=latest&count=15");
      if (res.ok) {
        const data = await res.json();
        setLatestList(data.news || []);
      }
    } catch (err) {
      console.warn("Erro ao carregar matérias recentes da Steam:", err);
    } finally {
      setLoadingLatest(false);
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

    const gameTag = item.gameName ? [item.gameName] : [];

    onSelectNews({
      title: item.translatedTitle || item.title,
      subtitle: `Novidades, patch notes e atualizações oficiais traduzidas via Steam`,
      excerpt: cleanExcerpt,
      coverImage: cover,
      tags: ["Steam", "Atualização", "Patch Notes", ...gameTag],
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
                Últimos comunicados oficiais da Steam traduzidos automaticamente
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

        {/* Abas de Navegação */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("latest")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "latest"
                ? "bg-cyan-500 text-black shadow-lg shadow-cyan-500/20 font-black"
                : "text-gray-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Últimos da Steam ({latestList.length})</span>
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
            <span>Filtrar por AppID</span>
          </button>
        </div>

        {/* Conteúdo Aba: Buscar por AppID */}
        {activeTab === "search" && (
          <SteamAppIdSearchForm
            appIdInput={appIdInput}
            setAppIdInput={setAppIdInput}
            loading={loading}
            onSearch={handleFetchNews}
            suggestions={POPULAR_STEAM_GAMES}
          />
        )}

        {/* Lista de Resultados */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Aba: Notícias Globais Mais Recentes */}
          {activeTab === "latest" && (
            <>
              {loadingLatest && (
                <div className="p-8 text-center space-y-3 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                  <p className="text-xs">Buscando os anúncios mais recentes da Steam em tempo real...</p>
                </div>
              )}

              {!loadingLatest && latestList.length === 0 && (
                <div className="p-8 text-center space-y-3 rounded-2xl bg-white/5 border border-white/5">
                  <Sparkles className="w-8 h-8 text-cyan-400 mx-auto" />
                  <p className="text-xs font-bold text-white">
                    Nenhum anúncio carregado no momento
                  </p>
                  <p className="text-[11px] text-zinc-400 max-w-md mx-auto">
                    Não foi possível obter novidades automáticas da Steam agora. Você também pode buscar diretamente pelo AppID de um jogo específico.
                  </p>
                  <button
                    type="button"
                    onClick={loadLatestNews}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}

              {!loadingLatest &&
                latestList.map((item) => (
                  <SteamNewsCard
                    key={item.gid}
                    item={item}
                    onImport={handleImport}
                    buttonLabel="Usar como Postagem"
                  />
                ))}
            </>
          )}

          {/* Aba: Busca por AppID */}
          {activeTab === "search" && (
            <>
              {loading && (
                <div className="p-8 text-center space-y-3 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-cyan-400" />
                  <p className="text-xs">Buscando anúncios deste jogo na Steam...</p>
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
                newsList.map((item) => (
                  <SteamNewsCard
                    key={item.gid}
                    item={item}
                    onImport={handleImport}
                    buttonLabel="Usar como Postagem"
                  />
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
