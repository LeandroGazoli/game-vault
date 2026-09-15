"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { UserGame, LibraryStats, GameStatus } from "@/lib/types";
import { getThemeStyles } from "@/lib/themeStyles";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import ProfileLibraryCard from "@/components/profile/ProfileLibraryCard";
import SteamInventoryViewer from "@/components/steam/SteamInventoryViewer";
import {
  Layers,
  Library,
  Trophy,
  Gamepad2,
  Bookmark,
  PauseCircle,
  Ban,
  Sparkles,
  Search,
  XCircle,
  ArrowUpDown,
  LayoutGrid,
  List,
  Plus,
  Upload,
} from "lucide-react";

export interface ProfileLibrarySectionProps {
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

export default function ProfileLibrarySection({
  games,
  stats,
  isOwner,
  theme,
  steamId,
  onEditGame,
  onOpenImporter,
  onSaveSteamId,
  initialTab = "all",
}: ProfileLibrarySectionProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "playtime" | "title" | "year">("recent");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const themeStyles = getThemeStyles(theme as any);

  const filteredGames = useMemo(() => {
    const list = games.filter((game) => {
      if (activeTab === "library") {
        // Aba Biblioteca: exibe jogos que pertencem à coleção (owned !== false)
        return game.owned !== false || game.status === "library";
      }
      if (activeTab !== "all" && game.status !== activeTab) {
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

  const handleTabChange = (id: string) => {
    triggerSelectionHaptic();
    setActiveTab(id);
  };

  return (
    <section id="profile-library" className="profile-library space-y-4" aria-label="Biblioteca de Jogos">
      {/* Abas Superiores & Controles */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-3.5">
        {/* Abas com scroll horizontal suave */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0">
          {[
            { id: "all", label: "Todos", icon: Layers, count: stats.totalGames },
            { id: "library", label: "Biblioteca", icon: Library, count: stats.libraryCount ?? stats.totalGames },
            { id: "completed", label: "Zerados", icon: Trophy, count: stats.completedCount },
            { id: "playing", label: "Jogando", icon: Gamepad2, count: stats.playingCount },
            { id: "paused", label: "Pausados", icon: PauseCircle, count: stats.pausedCount || 0 },
            { id: "backlog", label: "Quero Jogar", icon: Bookmark, count: stats.backlogCount },
            { id: "dropped", label: "Dropados", icon: Ban, count: stats.droppedCount },
            { id: "steam_inventory", label: "Skins Steam", icon: Sparkles, count: steamId ? "Steam" : "" },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex-shrink-0 min-h-[38px] px-3 py-1.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 select-none active:scale-95 ${
                  isActive
                    ? themeStyles.activeTabBg
                    : "bg-[#141822] text-gray-400 hover:text-gray-200 border border-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== "" && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${isActive ? "bg-white/20 text-white" : "bg-white/5 text-gray-400"}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Barra de Busca, Ordenação e Alternador Grade/Lista */}
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
                viewMode === "grid" ? "bg-white text-black font-bold" : "text-gray-400 hover:text-white"
              }`}
              title="Modo Grade"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-all ${
                viewMode === "list" ? "bg-white text-black font-bold" : "text-gray-400 hover:text-white"
              }`}
              title="Modo Lista"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo da Biblioteca ou Inventário Steam */}
      {activeTab === "steam_inventory" ? (
        <div className="rounded-3xl bg-[#141822] border border-white/10 p-4 sm:p-6 shadow-xl">
          <SteamInventoryViewer
            initialSteamId={steamId || ""}
            isOwner={isOwner}
            onSaveSteamToProfile={onSaveSteamId}
          />
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-[#141822] p-10 text-center space-y-3">
          <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Nenhum jogo encontrado</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Explore novos jogos no catálogo ou sincronize sua biblioteca de outras plataformas!
          </p>
          <div className="flex items-center justify-center gap-2 pt-2">
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Explorar Catálogo
            </Link>
            {isOwner && onOpenImporter && (
              <button
                type="button"
                onClick={onOpenImporter}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all active:scale-95"
              >
                <Upload className="w-3.5 h-3.5" /> Importar
              </button>
            )}
          </div>
        </div>
      ) : viewMode === "grid" ? (
        /* Visualização em Grade com Posters Padronizados (3:4) */
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
        /* Visualização em Lista Detalhada */
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
