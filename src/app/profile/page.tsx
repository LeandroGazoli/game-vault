"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { GameStatus, UserGame } from "@/lib/types";
import StatsOverview from "@/components/StatsOverview";
import MetacriticBadge from "@/components/MetacriticBadge";
import StatusBadge from "@/components/StatusBadge";
import RatingStars from "@/components/RatingStars";
import GameModal from "@/components/GameModal";
import Link from "next/link";
import {
  Trophy,
  Gamepad2,
  XCircle,
  Clock,
  Edit2,
  Plus,
  Search,
  Filter,
  Heart,
  Calendar,
  Sparkles,
  LayoutGrid,
  List,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUserBio, isDemoMode } = useAuth();
  const { library, stats, isLoading } = useGameLibrary();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameToEdit, setSelectedGameToEdit] = useState<any | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || "");
  const [favGameInput, setFavGameInput] = useState(user?.favoriteGame || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filtra jogos da biblioteca
  const filteredLibrary = library.filter((game) => {
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

  const handleSaveBio = async () => {
    await updateUserBio(bioInput, favGameInput);
    setIsEditingBio(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-3xl bg-surface-100" />
        <div className="h-32 rounded-3xl bg-surface-100" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-gray-800 bg-surface-100/50 p-12 text-center">
        <Gamepad2 className="w-12 h-12 text-gray-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white">Nenhum perfil ativo</h2>
        <p className="text-xs text-gray-400 mt-1">
          Faça login ou entre no modo demonstração para ver seu perfil de jogos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Banner de Perfil do Jogador */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-surface-100 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={
                  user.photoURL ||
                  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                }
                alt={user.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-500 shadow-xl"
              />
              {isDemoMode && (
                <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider">
                  Demo
                </span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.displayName}
                </h1>
                <span className="text-xs text-indigo-400 font-mono">@{user.username}</span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                {user.bio || "Nenhuma bio informada."}
              </p>

              {user.favoriteGame && (
                <div className="inline-flex items-center gap-1.5 text-xs text-pink-300 bg-pink-950/40 border border-pink-500/20 px-2.5 py-0.5 rounded-full mt-1">
                  <Heart className="w-3 h-3 fill-pink-400 text-pink-400" /> Jogo Favorito:{" "}
                  <strong>{user.favoriteGame}</strong>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setBioInput(user.bio || "");
                setFavGameInput(user.favoriteGame || "");
                setIsEditingBio(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-50 border border-gray-700 hover:border-gray-500 text-xs font-semibold text-gray-200 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar Perfil
            </button>
            <Link
              href="/search"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Jogos
            </Link>
          </div>
        </div>

        {/* Modal de Edição de Perfil */}
        {isEditingBio && (
          <div className="mt-6 pt-6 border-t border-gray-800 space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Bio / Apresentação
              </label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={2}
                className="w-full rounded-xl bg-surface-50 border border-gray-700 p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Jogo Favorito
              </label>
              <input
                type="text"
                value={favGameInput}
                onChange={(e) => setFavGameInput(e.target.value)}
                placeholder="Ex: Elden Ring, Chrono Trigger..."
                className="w-full rounded-xl bg-surface-50 border border-gray-700 px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveBio}
                className="px-4 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => setIsEditingBio(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Estatísticas Gerais do Perfil */}
      <StatsOverview stats={stats} activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Abas de Navegação e Filtros */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-3">
          {/* Abas */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Todos", count: stats.totalGames },
              { id: "completed", label: "Zerados 🏆", count: stats.completedCount },
              { id: "playing", label: "Jogando 🎮", count: stats.playingCount },
              { id: "dropped", label: "Dropados 🛑", count: stats.droppedCount },
              { id: "backlog", label: "Quero Jogar ⏳", count: stats.backlogCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-surface-100 text-gray-400 hover:text-gray-200 hover:bg-surface-200"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === tab.id ? "bg-white/20 text-white" : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Busca na Biblioteca e Modo de Visualização */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar na biblioteca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-xl bg-surface-100 border border-gray-800 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center rounded-xl bg-surface-100 border border-gray-800 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg ${
                  viewMode === "grid" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                title="Modo Grade"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg ${
                  viewMode === "list" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                }`}
                title="Modo Lista Detalhada"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Jogos do Usuário */}
        {filteredLibrary.length === 0 ? (
          <div className="rounded-3xl border border-gray-800 bg-surface-100/40 p-12 text-center">
            <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">Nenhum jogo nesta categoria</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              Navegue pelo catálogo e adicione jogos para construir sua história gamer!
            </p>
            <Link
              href="/search"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
            >
              <Plus className="w-3.5 h-3.5" /> Explorar Jogos
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          /* Visualização em Grade */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredLibrary.map((userGame) => {
              const asGame = {
                id: userGame.gameId,
                slug: userGame.gameSlug,
                name: userGame.gameTitle,
                released: userGame.releaseYear ? `${userGame.releaseYear}-01-01` : null,
                background_image: userGame.gameCover,
                rating: 4.5,
                metacritic: userGame.metacritic,
                genres: userGame.genres?.map((name, i) => ({ id: i, name, slug: name })) || [],
                hltb: userGame.hltbData,
              };

              return (
                <div
                  key={userGame.gameId}
                  className="group relative flex flex-col rounded-2xl bg-surface-100/90 border border-gray-800 overflow-hidden hover:border-indigo-500/40 transition-all hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-950">
                    {userGame.gameCover ? (
                      <img
                        src={userGame.gameCover}
                        alt={userGame.gameTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        Sem Imagem
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-transparent to-black/50" />

                    <div className="absolute top-2.5 left-2.5 z-10">
                      {userGame.metacritic ? (
                        <MetacriticBadge score={userGame.metacritic} size="sm" />
                      ) : null}
                    </div>

                    <div className="absolute top-2.5 right-2.5 z-10">
                      <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                        <span>{userGame.releaseYear || userGame.platformPlayed}</span>
                        {userGame.isFavorite && (
                          <span className="text-pink-400 flex items-center gap-0.5">
                            <Heart className="w-3 h-3 fill-pink-400" /> Favorito
                          </span>
                        )}
                      </div>

                      <Link href={`/game/${userGame.gameId}`}>
                        <h3 className="font-bold text-base text-white hover:text-indigo-400 transition-colors line-clamp-1">
                          {userGame.gameTitle}
                        </h3>
                      </Link>
                    </div>

                    {/* Resumo de Avaliação e Horas Jogadas */}
                    <div className="rounded-xl bg-surface-50 p-2.5 border border-gray-800/80 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Sua Nota:</span>
                        {userGame.userRating !== null ? (
                          <span className="font-mono font-bold text-amber-300">
                            ⭐ {userGame.userRating.toFixed(1)}/10
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">Não avaliado</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Tempo Jogado:</span>
                        <span className="font-mono font-semibold text-indigo-300">
                          {userGame.userPlaytimeHours ? `${userGame.userPlaytimeHours}h` : "--"}
                        </span>
                      </div>
                    </div>

                    {userGame.userReview && (
                      <p className="text-xs text-gray-400 italic line-clamp-2">
                        &quot;{userGame.userReview}&quot;
                      </p>
                    )}

                    <button
                      onClick={() => setSelectedGameToEdit(asGame)}
                      className="w-full py-2 rounded-xl bg-surface-50 hover:bg-surface-200 border border-gray-700 text-xs font-semibold text-gray-200 transition-colors"
                    >
                      Editar Registro
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Visualização em Lista Detalhada */
          <div className="space-y-3">
            {filteredLibrary.map((userGame) => {
              const asGame = {
                id: userGame.gameId,
                slug: userGame.gameSlug,
                name: userGame.gameTitle,
                released: userGame.releaseYear ? `${userGame.releaseYear}-01-01` : null,
                background_image: userGame.gameCover,
                rating: 4.5,
                metacritic: userGame.metacritic,
                genres: userGame.genres?.map((name, i) => ({ id: i, name, slug: name })) || [],
                hltb: userGame.hltbData,
              };

              return (
                <div
                  key={userGame.gameId}
                  className="rounded-2xl bg-surface-100 border border-gray-800 p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-indigo-500/30 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img
                      src={userGame.gameCover || ""}
                      alt={userGame.gameTitle}
                      className="w-16 h-20 rounded-xl object-cover border border-gray-700 flex-shrink-0"
                    />

                    <div className="space-y-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
                        {userGame.metacritic && (
                          <MetacriticBadge score={userGame.metacritic} size="sm" />
                        )}
                        <span className="text-xs text-gray-400 font-mono">
                          {userGame.platformPlayed}
                        </span>
                      </div>

                      <Link href={`/game/${userGame.gameId}`}>
                        <h3 className="text-base font-bold text-white hover:text-indigo-400 transition-colors truncate">
                          {userGame.gameTitle}
                        </h3>
                      </Link>

                      {userGame.userReview && (
                        <p className="text-xs text-gray-400 italic line-clamp-1 max-w-xl">
                          &quot;{userGame.userReview}&quot;
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Tempo Jogado</div>
                      <div className="font-mono font-bold text-indigo-300 text-sm">
                        {userGame.userPlaytimeHours ? `${userGame.userPlaytimeHours} horas` : "--"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-gray-400">Sua Nota</div>
                      <div className="font-mono font-bold text-amber-400 text-sm">
                        {userGame.userRating !== null ? `${userGame.userRating.toFixed(1)} / 10` : "--"}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedGameToEdit(asGame)}
                      className="px-3 py-1.5 rounded-xl bg-surface-50 hover:bg-surface-200 border border-gray-700 text-xs font-semibold text-gray-200"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para editar */}
      <GameModal
        game={selectedGameToEdit}
        isOpen={Boolean(selectedGameToEdit)}
        onClose={() => setSelectedGameToEdit(null)}
      />
    </div>
  );
}
