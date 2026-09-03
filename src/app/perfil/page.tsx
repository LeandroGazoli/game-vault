"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { GameStatus, UserGame, UserProfile, LibraryStats } from "@/lib/types";
import StatsOverview from "@/components/StatsOverview";
import MetacriticBadge from "@/components/MetacriticBadge";
import StatusBadge from "@/components/StatusBadge";
import GameModal from "@/components/GameModal";
import AuthModal from "@/components/AuthModal";
import ExportModal from "@/components/ExportModal";
import UpgradeModal from "@/components/UpgradeModal";
import ManagePlanModal from "@/components/ManagePlanModal";
import ProfileCustomizerModal from "@/components/ProfileCustomizerModal";
import GameRouletteModal from "@/components/GameRouletteModal";
import GamerWrappedModal from "@/components/GamerWrappedModal";
import ProfileToolsModal from "@/components/ProfileToolsModal";
import ShareProfileModal from "@/components/ShareProfileModal";
import ProfileHeroCard from "@/components/ProfileHeroCard";
import ProfileBioRenderer from "@/components/ProfileBioRenderer";
import SocialGamertagsBar from "@/components/SocialGamertagsBar";
import ShowcaseGameCard from "@/components/ShowcaseGameCard";
import PlanBadge from "@/components/PlanBadge";
import UserAvatar from "@/components/UserAvatar";
import { triggerPwaInstall } from "@/components/PwaInstallPrompt";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { getGameUrl, getProfileUrl } from "@/lib/routes";
import {
  Trophy,
  Gamepad2,
  Crown,
  Palette,
  Dices,
  Sparkles,
  ShieldCheck,
  XCircle,
  Clock,
  Edit2,
  Plus,
  Search,
  Heart,
  User,
  Download,
  LayoutGrid,
  List,
  Smartphone,
  ArrowRight,
  SlidersHorizontal,
  Share2,
} from "lucide-react";

function computeLibraryStats(games: UserGame[]): LibraryStats {
  let totalPlaytime = 0;
  let ratingSum = 0;
  let ratedCount = 0;
  const genreMap: Record<string, number> = {};

  let completed = 0;
  let playing = 0;
  let dropped = 0;
  let backlog = 0;

  for (const g of games) {
    if (g.status === "completed") completed++;
    else if (g.status === "playing") playing++;
    else if (g.status === "dropped") dropped++;
    else if (g.status === "backlog") backlog++;

    if (g.userPlaytimeHours && g.userPlaytimeHours > 0) {
      totalPlaytime += g.userPlaytimeHours;
    }

    if (g.userRating !== null && g.userRating !== undefined) {
      ratingSum += g.userRating;
      ratedCount++;
    }

    if (g.genres) {
      for (const genre of g.genres) {
        genreMap[genre] = (genreMap[genre] || 0) + 1;
      }
    }
  }

  const topGenres = Object.entries(genreMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  return {
    totalGames: games.length,
    completedCount: completed,
    playingCount: playing,
    droppedCount: dropped,
    backlogCount: backlog,
    totalPlaytimeHours: totalPlaytime,
    averageRating: ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : 0,
    topGenres,
  };
}

interface ProfilePageProps {
  targetUsername?: string;
}

export default function ProfilePage({ targetUsername }: ProfilePageProps = {}) {
  const { user: authUser, updateUserBio, isAdmin, isPremium, isLoading: authLoading } = useAuth();
  const { library: ownLibrary, stats: ownStats, isLoading: libraryLoading } = useGameLibrary();
  const router = useRouter();
  const params = useParams();

  const routeUsername = (targetUsername || (params?.username as string) || "").trim();

  useEffect(() => {
    if (!routeUsername && authUser?.username) {
      router.replace(getProfileUrl(authUser.username));
    }
  }, [routeUsername, authUser?.username, router]);

  const isOwnProfile = Boolean(
    authUser && (!routeUsername || (authUser.username && authUser.username.toLowerCase() === routeUsername.toLowerCase()))
  );

  const isViewingPublic = Boolean(
    routeUsername && (!authUser?.username || authUser.username.toLowerCase() !== routeUsername.toLowerCase())
  );

  const [publicData, setPublicData] = useState<{
    user: UserProfile;
    stats: any;
    games: UserGame[];
  } | null>(null);
  const [publicLoading, setPublicLoading] = useState(isViewingPublic);
  const [publicNotFound, setPublicNotFound] = useState(false);

  useEffect(() => {
    if (isViewingPublic && routeUsername) {
      setPublicLoading(true);
      setPublicNotFound(false);
      fetch(`/api/user/${encodeURIComponent(routeUsername)}/games.json`)
        .then(async (res) => {
          if (!res.ok) {
            setPublicNotFound(true);
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (data?.user) {
            setPublicData(data);
          } else {
            setPublicNotFound(true);
          }
        })
        .catch(() => setPublicNotFound(true))
        .finally(() => setPublicLoading(false));
    } else {
      setPublicData(null);
      setPublicLoading(false);
      setPublicNotFound(false);
    }
  }, [isViewingPublic, routeUsername]);

  const activeUser = (isViewingPublic ? publicData?.user : authUser) as UserProfile | null;
  const activeLibrary = isViewingPublic ? (publicData?.games || []) : ownLibrary;
  const activeStats = useMemo(() => {
    if (isViewingPublic) {
      return computeLibraryStats(activeLibrary);
    }
    return ownStats;
  }, [isViewingPublic, activeLibrary, ownStats]);

  const isOwner = isOwnProfile;

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameToEdit, setSelectedGameToEdit] = useState<any | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(authUser?.bio || "");
  const [favGameInput, setFavGameInput] = useState(authUser?.favoriteGame || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isManagePlanOpen, setIsManagePlanOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const sId = searchParams.get("session_id");
    const isUpgraded = searchParams.get("upgraded");

    if (sId) {
      fetch(`/api/checkout/verify?session_id=${sId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success) {
            setCelebrationBanner(
              `🎉 Parabéns! Seu plano ${data.planName || "MyGameList PRO"} foi ativado com sucesso! Aproveite todos os benefícios.`
            );
          }
        })
        .catch((e) => console.error("Erro ao verificar sessão do checkout:", e));
    } else if (isUpgraded === "true") {
      setCelebrationBanner("🎉 Parabéns! Sua assinatura foi ativada com sucesso!");
    }
  }, []);

  const filteredLibrary = useMemo(() => {
    return activeLibrary.filter((game) => {
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
  }, [activeLibrary, activeTab, searchQuery]);

  const handleSaveBio = async () => {
    await updateUserBio(bioInput, favGameInput);
    setIsEditingBio(false);
  };

  if (authLoading || (authUser && !isViewingPublic && libraryLoading) || (isViewingPublic && publicLoading)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-[32px] bg-[#18191c]" />
        <div className="h-32 rounded-[32px] bg-[#18191c]" />
      </div>
    );
  }

  if (isViewingPublic && publicNotFound) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-4 max-w-lg mx-auto shadow-2xl my-12 animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
          <Gamepad2 className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Perfil não encontrado
        </h2>
        <p className="text-xs sm:text-sm text-gray-400 max-w-sm mx-auto">
          O usuário <span className="text-[#00E5FF] font-mono">@{routeUsername}</span> ainda não existe ou não possui uma biblioteca configurada no MyGameList.
        </p>
        <Link
          href="/"
          className="inline-block rounded-full bg-white hover:bg-gray-200 text-black font-bold px-8 py-3 text-sm transition-all shadow-xl hover:scale-105"
        >
          Voltar ao Início
        </Link>
      </div>
    );
  }

  if (!activeUser) {
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
            Faça login com sua conta para salvar seus jogos zerados, favoritos e acompanhar estatísticas na sua biblioteca.
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

  // Define perfil ativo garantidamente tipado e não-nulo para renderização
  const user = activeUser;

  return (
    <div className="space-y-8 pb-12">
      {/* Banner de Celebração de Upgrade / Retorno do Stripe */}
      {celebrationBanner && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cyan-950/90 via-black to-emerald-950/90 border-2 border-[#00E5FF] p-5 sm:p-6 shadow-2xl shadow-cyan-500/20 animate-fadeIn">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center flex-shrink-0 shadow-lg">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <span>Assinatura Ativada com Sucesso!</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-[#00E5FF] text-black font-extrabold uppercase">
                    PRO ATIVO
                  </span>
                </h3>
                <p className="text-xs text-gray-300">{celebrationBanner}</p>
                <p className="text-[11px] text-[#00E5FF]/90 font-mono">
                  Aproveite zero anúncios, selo neon no perfil, temas exclusivos e exportações ilimitadas.
                </p>
              </div>
            </div>
            <button
              onClick={() => setCelebrationBanner(null)}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Banner / Card do Perfil com Suporte aos 4 Layouts */}
      <ProfileHeroCard
        user={activeUser}
        isOwner={isOwner}
        isAdmin={isAdmin}
        isPremium={isPremium}
        onOpenEditBio={() => {
          setBioInput(activeUser.bio || "");
          setFavGameInput(activeUser.favoriteGame || "");
          setIsEditingBio(!isEditingBio);
        }}
        onOpenTools={() => setIsToolsOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenManagePlan={() => setIsManagePlanOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {/* Modal Inline de Edição de Perfil */}
      {isOwner && isEditingBio && (
        <div className="rounded-[28px] border border-white/10 bg-[#18191c] p-6 space-y-4 max-w-xl animate-fadeIn">
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

      {/* Jogo em Destaque no Perfil (Se configurado) */}
      {activeUser.showcaseGameId && (
        <ShowcaseGameCard
          game={activeLibrary.find((g) => g.gameId === activeUser.showcaseGameId)}
        />
      )}

      {/* Showcase / Bio Gamer Customizada (Markdown & GIFs ou HTML5 & CSS3 Puro) */}
      {(activeUser.customMarkdown || activeUser.customHtml) && (
        <ProfileBioRenderer
          content={activeUser.customMarkdown || activeUser.customHtml}
          mode={activeUser.customBioMode}
        />
      )}

      {/* Estatísticas Gerais do Perfil (se visibilidade ativa) */}
      {activeUser.visibility?.showStats !== false && (
        <StatsOverview stats={activeStats} activeTab={activeTab} onSelectTab={setActiveTab} />
      )}

      {/* Abas de Navegação e Filtros (Mobile-First & Touch-Friendly) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-3.5">
          {/* Abas com rolagem suave horizontal e alvos de toque ergonômicos */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap">
            {[
              { id: "all", label: "Todos", count: activeStats.totalGames },
              { id: "completed", label: "Zerados 🏆", count: activeStats.completedCount },
              { id: "playing", label: "Jogando 🎮", count: activeStats.playingCount },
              { id: "dropped", label: "Dropados 🛑", count: activeStats.droppedCount },
              { id: "backlog", label: "Quero Jogar ⏳", count: activeStats.backlogCount },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 min-h-[44px] px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 select-none active:scale-95 ${
                  activeTab === tab.id
                    ? "bg-[#00E5FF] text-black shadow-lg shadow-[#00E5FF]/25 font-black"
                    : "bg-[#18191c] text-gray-400 hover:text-gray-200 hover:bg-[#202126] border border-white/5"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === tab.id ? "bg-black/20 text-black" : "bg-white/10 text-gray-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Busca na Biblioteca e Modo de Visualização */}
          <div className="flex items-center gap-2.5 w-full md:w-auto">
            <div className="relative flex-1 md:flex-initial">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar na biblioteca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-56 h-11 md:h-10 pl-10 pr-8 rounded-2xl bg-[#18191c] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center rounded-2xl bg-[#18191c] border border-white/10 p-1 flex-shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                  viewMode === "grid" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
                }`}
                title="Modo Grade"
                aria-label="Modo Grade"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`h-9 w-9 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                  viewMode === "list" ? "bg-white text-black shadow-sm" : "text-gray-400 hover:text-white"
                }`}
                title="Modo Lista Detalhada"
                aria-label="Modo Lista"
              >
                <List className="w-4 h-4" />
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
                dlcs: userGame.dlcs?.map((d) => ({ id: d.id, name: d.name, coverUrl: d.coverUrl })),
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
                        <div className="flex items-center gap-1">
                          {userGame.dlcs && userGame.dlcs.length > 0 && (
                            <span
                              className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-[#00E5FF] font-mono border border-cyan-500/30 font-bold"
                              title={`${userGame.dlcs.filter((d) => d.status === "completed").length} de ${userGame.dlcs.length} DLCs zeradas`}
                            >
                              +{userGame.dlcs.length} DLC{userGame.dlcs.length > 1 ? "s" : ""}
                            </span>
                          )}
                          {userGame.isFavorite && (
                            <span className="text-pink-400 flex items-center gap-0.5">
                              <Heart className="w-3 h-3 fill-pink-400" />
                            </span>
                          )}
                        </div>
                      </div>

                      <Link href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}>
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

                    {isOwner ? (
                      <button
                        onClick={() => setSelectedGameToEdit(asGame)}
                        className="w-full py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-gray-200 transition-colors mt-1"
                      >
                        Editar
                      </button>
                    ) : (
                      <Link
                        href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}
                        className="w-full py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-[#00E5FF] transition-colors mt-1 block text-center"
                      >
                        Ver Detalhes
                      </Link>
                    )}
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
                dlcs: userGame.dlcs?.map((d) => ({ id: d.id, name: d.name, coverUrl: d.coverUrl })),
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
                        {userGame.dlcs && userGame.dlcs.length > 0 && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-[#00E5FF] font-mono border border-cyan-500/30 font-bold"
                            title={`${userGame.dlcs.filter((d) => d.status === "completed").length} de ${userGame.dlcs.length} DLCs zeradas`}
                          >
                            +{userGame.dlcs.length} DLC{userGame.dlcs.length > 1 ? "s" : ""}
                          </span>
                        )}
                        {userGame.metacritic && (
                          <MetacriticBadge score={userGame.metacritic} size="sm" />
                        )}
                        <span className="text-xs text-gray-400 font-mono">
                          {userGame.platformPlayed}
                        </span>
                      </div>

                      <Link href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}>
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

                    {isOwner ? (
                      <button
                        onClick={() => setSelectedGameToEdit(asGame)}
                        className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-gray-200"
                      >
                        Editar
                      </button>
                    ) : (
                      <Link
                        href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}
                        className="px-4 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-[#00E5FF]"
                      >
                        Ver Detalhes
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal para editar */}
      {isOwner && (
        <GameModal
          game={selectedGameToEdit}
          isOpen={Boolean(selectedGameToEdit)}
          onClose={() => setSelectedGameToEdit(null)}
        />
      )}

      {/* Modais Exclusivos do Proprietário da Conta */}
      {isOwner && user && (
        <>
          <ExportModal
            isOpen={isExportOpen}
            onClose={() => setIsExportOpen(false)}
            games={ownLibrary}
            username={user.username || user.uid}
          />

          <ProfileToolsModal
            isOpen={isToolsOpen}
            onClose={() => setIsToolsOpen(false)}
            user={user}
            isPremium={isPremium}
            isAdmin={isAdmin}
            onOpenManagePlan={() => setIsManagePlanOpen(true)}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            onOpenCustomizer={() => setIsCustomizerOpen(true)}
            onOpenRoulette={() => setIsRouletteOpen(true)}
            onOpenWrapped={() => setIsWrappedOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenShare={() => setIsShareOpen(true)}
            onInstallPwa={triggerPwaInstall}
          />

          <ManagePlanModal
            isOpen={isManagePlanOpen}
            onClose={() => setIsManagePlanOpen(false)}
            user={user}
          />

          {!isPremium && (
            <UpgradeModal
              isOpen={isUpgradeOpen}
              onClose={() => setIsUpgradeOpen(false)}
            />
          )}

          <ProfileCustomizerModal
            isOpen={isCustomizerOpen}
            onClose={() => setIsCustomizerOpen(false)}
            onOpenUpgrade={() => setIsUpgradeOpen(true)}
            games={ownLibrary}
          />

          <GameRouletteModal
            isOpen={isRouletteOpen}
            onClose={() => setIsRouletteOpen(false)}
            games={ownLibrary}
          />

          <GamerWrappedModal
            isOpen={isWrappedOpen}
            onClose={() => setIsWrappedOpen(false)}
            games={ownLibrary}
            user={user}
            stats={ownStats}
          />
        </>
      )}

      {/* Modal de Compartilhamento do Perfil (Disponível para Dono e Visitantes) */}
      <ShareProfileModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        username={activeUser?.username || user?.username || ""}
        displayName={activeUser?.displayName || user?.displayName || "Gamer"}
      />
    </div>
  );
}
