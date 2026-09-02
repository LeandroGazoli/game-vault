"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { GameStatus, UserGame } from "@/lib/types";
import StatsOverview from "@/components/StatsOverview";
import MetacriticBadge from "@/components/MetacriticBadge";
import StatusBadge from "@/components/StatusBadge";
import GameModal from "@/components/GameModal";
import AuthModal from "@/components/AuthModal";
import Link from "next/link";
import {
  Trophy,
  Gamepad2,
  XCircle,
  Clock,
  Edit2,
  Plus,
  Search,
  Heart,
  User,
  LayoutGrid,
  List,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUserBio } = useAuth();
  const { library, stats, isLoading } = useGameLibrary();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameToEdit, setSelectedGameToEdit] = useState<any | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || "");
  const [favGameInput, setFavGameInput] = useState(user?.favoriteGame || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
        <div className="h-48 rounded-[32px] bg-[#18191c]" />
        <div className="h-32 rounded-[32px] bg-[#18191c]" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-4 max-w-lg mx-auto shadow-2xl my-8">
          <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/10">
            <Gamepad2 className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Acesse seu Perfil Gamer
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
            Faça login com sua conta para salvar seus jogos zerados, favoritos e acompanhar estatísticas no Cloud Firestore.
          </p>
          <button
            onClick={() => setIsAuthOpen(true)}
            className="rounded-full bg-white hover:bg-gray-200 text-black font-bold px-8 py-3 text-sm transition-all shadow-xl hover:scale-105"
          >
            Entrar ou Criar Conta
          </button>
        </div>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Banner de Perfil do Jogador */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#18191c] p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative">
              <img
                src={
                  user.photoURL ||
                  "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                }
                alt={user.displayName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-[#00E5FF]/40 shadow-xl"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.displayName}
                </h1>
                <span className="text-xs text-[#00E5FF] font-mono">@{user.username}</span>
              </div>

              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                {user.bio || "Nenhuma bio informada."}
              </p>

              {user.favoriteGame && (
                <div className="inline-flex items-center gap-1.5 text-xs text-pink-300 bg-pink-950/40 border border-pink-500/20 px-3 py-0.5 rounded-full mt-1">
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-xs font-semibold text-gray-200 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Editar Perfil
            </button>
            <Link
              href="/search"
              className="flex items-center gap-1.5 px-5 py-2 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              Adicionar Jogos
            </Link>
          </div>
        </div>

        {/* Modal Inline de Edição de Perfil */}
        {isEditingBio && (
          <div className="mt-6 pt-6 border-t border-white/10 space-y-4 max-w-xl animate-fadeIn">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1">
                Bio / Apresentação
              </label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                rows={2}
                className="w-full rounded-2xl bg-white/5 border border-white/10 p-3 text-xs text-white focus:outline-none focus:border-[#00E5FF] resize-none"
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
                placeholder="Ex: Elden Ring, The Witcher 3, Zelda..."
                className="w-full rounded-full bg-white/5 border border-white/10 px-4 py-2 text-xs text-white focus:outline-none focus:border-[#00E5FF]"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveBio}
                className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Salvar Alterações
              </button>
              <button
                onClick={() => setIsEditingBio(false)}
                className="px-3 py-1.5 rounded-full text-xs text-gray-400 hover:text-white"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
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
                className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? "bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/20"
                    : "bg-[#18191c] text-gray-400 hover:text-gray-200 hover:bg-[#202126] border border-white/5"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    activeTab === tab.id ? "bg-black/20 text-black font-bold" : "bg-white/10 text-gray-400"
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
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3.5 top-2.5" />
              <input
                type="text"
                placeholder="Filtrar na biblioteca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 rounded-full bg-[#18191c] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] w-44 sm:w-56"
              />
            </div>

            <div className="flex items-center rounded-full bg-[#18191c] border border-white/10 p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-full ${
                  viewMode === "grid" ? "bg-white text-black" : "text-gray-400 hover:text-white"
                }`}
                title="Modo Grade"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-full ${
                  viewMode === "list" ? "bg-white text-black" : "text-gray-400 hover:text-white"
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
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-3">
            <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum jogo nesta categoria</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Navegue pelo catálogo do IGDB e adicione jogos para construir seu perfil!
            </p>
            <Link
              href="/search"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md"
            >
              <Plus className="w-3.5 h-3.5" /> Explorar Catálogo
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          /* Visualização em Grade com Posters */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                  className="group relative flex flex-col rounded-2xl bg-[#18191c] border border-white/5 hover:border-white/20 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/70 hover:-translate-y-1"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-900">
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
                    <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] via-transparent to-transparent opacity-60" />

                    <div className="absolute top-2 left-2 z-10">
                      {userGame.metacritic && (
                        <MetacriticBadge score={userGame.metacritic} size="sm" />
                      )}
                    </div>

                    <div className="absolute top-2 right-2 z-10">
                      <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1 font-mono">
                        <span>{userGame.releaseYear || userGame.platformPlayed}</span>
                        {userGame.isFavorite && (
                          <span className="text-pink-400 flex items-center gap-0.5">
                            <Heart className="w-3 h-3 fill-pink-400" />
                          </span>
                        )}
                      </div>

                      <Link href={`/game/${userGame.gameId}`}>
                        <h3 className="font-semibold text-xs sm:text-sm text-white hover:text-[#00E5FF] transition-colors line-clamp-1">
                          {userGame.gameTitle}
                        </h3>
                      </Link>
                    </div>

                    {/* Resumo de Avaliação e Horas */}
                    <div className="pt-2 border-t border-white/5 space-y-1 text-[11px] font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Nota:</span>
                        {userGame.userRating !== null ? (
                          <span className="font-bold text-amber-300">
                            ⭐ {userGame.userRating.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-gray-500 italic">NS</span>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Tempo:</span>
                        <span className="font-semibold text-cyan-300">
                          {userGame.userPlaytimeHours ? `${userGame.userPlaytimeHours}h` : "--"}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedGameToEdit(asGame)}
                      className="w-full py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-gray-200 transition-colors mt-1"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Visualização em Lista Detalhada */
          <div className="space-y-2.5">
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
                  className="rounded-2xl bg-[#18191c] border border-white/5 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={userGame.gameCover || ""}
                      alt={userGame.gameTitle}
                      className="w-12 h-16 rounded-xl object-cover border border-white/10 flex-shrink-0"
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
                        <h3 className="text-sm font-semibold text-white hover:text-[#00E5FF] transition-colors truncate">
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

                  <div className="flex flex-wrap items-center gap-5 self-end md:self-center font-mono">
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400">Tempo</div>
                      <div className="font-bold text-cyan-300 text-xs">
                        {userGame.userPlaytimeHours ? `${userGame.userPlaytimeHours}h` : "--"}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-gray-400">Nota</div>
                      <div className="font-bold text-amber-400 text-xs">
                        {userGame.userRating !== null ? `${userGame.userRating.toFixed(1)}/10` : "--"}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedGameToEdit(asGame)}
                      className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-gray-200"
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
