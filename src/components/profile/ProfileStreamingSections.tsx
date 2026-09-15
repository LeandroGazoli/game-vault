"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { UserGame, LibraryStats, GameStatus } from "@/lib/types";
import { getThemeStyles } from "@/lib/themeStyles";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import ProfileStreamingRows from "@/components/profile/ProfileStreamingRows";
import ProfileLibraryCard from "@/components/profile/ProfileLibraryCard";
import SteamInventoryViewer from "@/components/steam/SteamInventoryViewer";
import {
  Layers,
  Gamepad2,
  Bookmark,
  Trophy,
  PauseCircle,
  Clock,
  Sparkles,
  Search,
  XCircle,
  ArrowUpDown,
  LayoutGrid,
  List,
  Plus,
  Upload,
  ChevronRight,
} from "lucide-react";

export interface ProfileStreamingSectionsProps {
  games: UserGame[];
  stats: LibraryStats;
  isOwner: boolean;
  theme?: string;
  steamId?: string;
  onEditGame?: (game: any) => void;
  onOpenImporter?: () => void;
  onSaveSteamId?: (steamId: string) => Promise<void>;
  initialTab?: string;
}

/**
 * Seções de Jogos do Perfil no modelo moderno de streaming.
 * Divide a biblioteca em 3 blocos horizontais essenciais:
 * 1. Jogando (com limite + card 'Ver todos' no final)
 * 2. Quero Jogar (com limite + card 'Ver todos' no final)
 * 3. Zerados (com limite + card 'Ver todos' no final)
 * E oferece controle único de alternância (Tabs) para visualização completa
 * em Grade/Lista sem duplicar componentes nem gerar poluição.
 */
export default function ProfileStreamingSections({
  games,
  stats,
  isOwner,
  theme,
  steamId,
  onEditGame,
  onOpenImporter,
  onSaveSteamId,
  initialTab = "stream",
}: ProfileStreamingSectionsProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "playtime" | "title" | "year">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const themeStyles = getThemeStyles(theme as any);

  // Listas especializadas para os 3 blocos de streaming
  const playingGames = useMemo(() => games.filter((g) => g.status === "playing"), [games]);
  const backlogGames = useMemo(() => games.filter((g) => g.status === "backlog"), [games]);
  const completedGames = useMemo(() => games.filter((g) => g.status === "completed"), [games]);

  // Lista para a visualização detalhada de coleção quando selecionada uma aba
  const filteredGames = useMemo(() => {
    const list = games.filter((game) => {
      if (activeTab === "library") {
        return game.owned !== false || game.status === "library";
      }
      if (activeTab !== "all" && activeTab !== "stream" && game.status !== activeTab) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          game.gameTitle.toLowerCase().includes(q) ||
          (game.userReview && game.userReview.toLowerCase().includes(q))
        );
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "rating") return (b.userRating ?? -1) - (a.userRating ?? -1);
      if (sortBy === "playtime") return (b.userPlaytimeHours ?? 0) - (a.userPlaytimeHours ?? 0);
      if (sortBy === "title") return a.gameTitle.localeCompare(b.gameTitle);
      if (sortBy === "year") {
        const yearA = parseInt(a.releaseYear || "0", 10) || 0;
        const yearB = parseInt(b.releaseYear || "0", 10) || 0;
        return yearB - yearA;
      }
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return 0;
    });
  }, [games, activeTab, searchQuery, sortBy]);

  const handleTabChange = (tabId: string) => {
    triggerSelectionHaptic();
    setActiveTab(tabId);
  };

  return (
    <section id="profile-library-streaming" className="profile-library-streaming space-y-6" aria-label="Biblioteca de Jogos">
      {/* 1. SELETOR ERGONÔMICO DE CATEGORIAS / MODO STREAMING (ÚNICA FONTE DE CONTROLE) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          {[
            { id: "stream", label: "Destaques Streaming", icon: Sparkles, count: "" },
            { id: "all", label: "Coleção Completa", icon: Layers, count: stats.totalGames },
            { id: "playing", label: "Jogando", icon: Gamepad2, count: stats.playingCount },
            { id: "backlog", label: "Quero Jogar", icon: Bookmark, count: stats.backlogCount },
            { id: "completed", label: "Zerados", icon: Trophy, count: stats.completedCount },
            { id: "paused", label: "Pausados", icon: PauseCircle, count: stats.pausedCount || 0 },
            { id: "steam_inventory", label: "Skins Steam", icon: Sparkles, count: steamId ? "Steam" : "" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex-shrink-0 min-h-[38px] px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 select-none active:scale-95 ${
                  isActive
                    ? themeStyles.activeTabBg
                    : "bg-[#141822] text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== "" && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? "bg-white/20 text-white" : "bg-[#181d28] text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Controles de Busca e Visualização (Ativos quando fora do modo streaming geral) */}
        {activeTab !== "stream" && activeTab !== "steam_inventory" && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-48">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar jogo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-9 pl-9 pr-7 rounded-xl bg-[#141822] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="relative flex items-center h-9 px-2 rounded-xl bg-[#141822] border border-white/10 text-xs text-gray-300">
              <ArrowUpDown className="w-3 h-3 text-gray-400 mr-1.5 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs text-gray-200 focus:outline-none cursor-pointer"
              >
                <option value="recent" className="bg-[#141822]">Recentes</option>
                <option value="rating" className="bg-[#141822]">Nota</option>
                <option value="playtime" className="bg-[#141822]">Horas</option>
                <option value="title" className="bg-[#141822]">A - Z</option>
                <option value="year" className="bg-[#141822]">Ano</option>
              </select>
            </div>

            <div className="flex items-center rounded-xl bg-[#141822] border border-white/10 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "grid" ? "bg-[#1e2538] text-white" : "text-gray-400 hover:text-white"
                }`}
                title="Modo Grade"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                  viewMode === "list" ? "bg-[#1e2538] text-white" : "text-gray-400 hover:text-white"
                }`}
                title="Modo Lista"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. CONTEÚDO PRINCIPAL: MODO STREAMING (3 BLOCOS HORIZONTAIS) OU VISÃO FILTRADA */}
      {activeTab === "steam_inventory" ? (
        <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-6 shadow-xl">
          <SteamInventoryViewer
            initialSteamId={steamId || ""}
            isOwner={isOwner}
            onSaveSteamToProfile={onSaveSteamId}
          />
        </div>
      ) : activeTab === "stream" ? (
        <ProfileStreamingRows
          playingGames={playingGames}
          backlogGames={backlogGames}
          completedGames={completedGames}
          isOwner={isOwner}
          onEditGame={onEditGame}
          onSelectTab={handleTabChange}
        />
      ) : filteredGames.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#141822] p-10 text-center space-y-3">
          <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum jogo encontrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Nenhum jogo corresponde a este filtro ou busca na biblioteca.
          </p>
          <button
            type="button"
            onClick={() => handleTabChange("stream")}
            className="px-4 py-2 rounded-xl bg-[#1c2230] hover:bg-[#252f42] text-xs font-bold text-gray-200 border border-white/10"
          >
            Voltar aos Destaques
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {filteredGames.map((userGame) => (
            <ProfileLibraryCard
              key={userGame.gameId}
              userGame={userGame}
              isOwner={isOwner}
              viewMode="grid"
              onEditGame={onEditGame}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredGames.map((userGame) => (
            <ProfileLibraryCard
              key={userGame.gameId}
              userGame={userGame}
              isOwner={isOwner}
              viewMode="list"
              onEditGame={onEditGame}
            />
          ))}
        </div>
      )}
    </section>
  );
}
