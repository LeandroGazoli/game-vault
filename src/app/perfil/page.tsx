"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { GameStatus, UserGame, UserProfile, LibraryStats, calculateGamerLevel } from "@/lib/types";
import { getGamerCommunityRank, GamerRankResult } from "@/lib/firebase";
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
import LegendaryVaultCard from "@/components/profile/LegendaryVaultCard";
import GamerScoreboardCard from "@/components/profile/GamerScoreboardCard";
import GamerBadgesCard from "@/components/profile/GamerBadgesCard";
import GamerQuestsCard from "@/components/profile/GamerQuestsCard";
import GamerXpBreakdownModal from "@/components/profile/GamerXpBreakdownModal";
import LevelUpCelebrationModal from "@/components/profile/LevelUpCelebrationModal";
import ShareGamerCardModal from "@/components/profile/ShareGamerCardModal";
import SteamInventoryViewer from "@/components/steam/SteamInventoryViewer";
import GameImporterModal from "@/components/importer/GameImporterModal";
import { getThemeStyles } from "@/lib/themeStyles";
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
  Globe,
  Lock,
  Upload,
  ArrowUpDown,
  Layers,
  Bookmark,
  Ban,
  Library,
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
  let libraryCount = 0;

  for (const g of games) {
    if (g.status === "completed") completed++;
    else if (g.status === "playing") playing++;
    else if (g.status === "dropped") dropped++;
    else if (g.status === "backlog") backlog++;
    else if (g.status === "library") libraryCount++;

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
    libraryCount,
    totalPlaytimeHours: totalPlaytime,
    averageRating: ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : 0,
    topGenres,
  };
}

interface ProfilePageProps {
  targetUsername?: string;
}

export default function ProfilePage({ targetUsername }: ProfilePageProps = {}) {
  const { user: authUser, updateUserProfile, updateUserBio, isAdmin, isPremium, isLoading: authLoading } = useAuth();
  const { library: ownLibrary, stats: ownStats, isLoading: libraryLoading, levelUpData, dismissLevelUp } = useGameLibrary();
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
    isPrivate?: boolean;
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
  const [sortBy, setSortBy] = useState<"recent" | "rating" | "playtime" | "title" | "year">("recent");
  const [selectedGameToEdit, setSelectedGameToEdit] = useState<any | null>(null);
  const [customizerInitialTab, setCustomizerInitialTab] = useState<
    "info" | "appearance" | "titles" | "markdown" | "socials" | "showcase" | "visibility"
  >("info");
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
  const [isImporterOpen, setIsImporterOpen] = useState(false);
  const [isXpBreakdownOpen, setIsXpBreakdownOpen] = useState(false);
  const [isGamerCardOpen, setIsGamerCardOpen] = useState(false);
  const [realGamerRank, setRealGamerRank] = useState<GamerRankResult | null>(null);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  // Busca a posição real e percentual do perfil no ranking global do Firebase
  useEffect(() => {
    if (!activeUser?.username) return;
    const currentXp = activeUser.gamerXp || calculateGamerLevel(activeStats, undefined, activeUser.plan).xp;
    getGamerCommunityRank({
      uid: activeUser.uid,
      username: activeUser.username,
      xp: currentXp,
    })
      .then((res) => setRealGamerRank(res))
      .catch((err) => console.warn("Erro ao calcular ranking global real:", err));
  }, [activeUser?.uid, activeUser?.username, activeUser?.gamerXp, activeUser?.plan, activeStats]);

  const profileThemeStyles = getThemeStyles(activeUser?.theme);

  // Escuta evento global de abertura do importador (disparado pela Navbar ou outros componentes)
  useEffect(() => {
    const handleOpenImporter = () => setIsImporterOpen(true);
    window.addEventListener("open-game-importer", handleOpenImporter);
    return () => window.removeEventListener("open-game-importer", handleOpenImporter);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const searchParams = new URLSearchParams(window.location.search);
    const sId = searchParams.get("session_id");
    const isUpgraded = searchParams.get("upgraded");
    const action = searchParams.get("action");

    if (action === "import") {
      setIsImporterOpen(true);
    }

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
    const list = activeLibrary.filter((game) => {
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
      if (sortBy === "rating") {
        return (b.userRating ?? -1) - (a.userRating ?? -1);
      }
      if (sortBy === "playtime") {
        return (b.userPlaytimeHours ?? 0) - (a.userPlaytimeHours ?? 0);
      }
      if (sortBy === "title") {
        return a.gameTitle.localeCompare(b.gameTitle);
      }
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
  }, [activeLibrary, activeTab, searchQuery, sortBy]);

  if (authLoading || (authUser && !isViewingPublic && libraryLoading) || (isViewingPublic && publicLoading)) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-48 rounded-[32px] bg-[#18191c]" />
        <div className="h-32 rounded-[32px] bg-[#18191c]" />
      </div>
    );
  }

  if (isViewingPublic && publicData?.isPrivate) {
    const privateUser = publicData.user;
    return (
      <div className="max-w-xl mx-auto my-12 p-8 sm:p-10 rounded-[32px] border border-amber-500/30 bg-[#14161a] text-center space-y-6 shadow-2xl shadow-amber-500/10 animate-fadeIn">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <UserAvatar
              photoURL={privateUser?.photoURL}
              name={privateUser?.displayName || routeUsername}
              size="xl"
              className={`border-2 ${profileThemeStyles.avatarBorder}`}
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 border-2 border-[#14161a] flex items-center justify-center text-black shadow-md">
              <Lock className="w-4 h-4 stroke-[2.5]" />
            </div>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {privateUser?.displayName || routeUsername}
            </h2>
            <p className={`text-xs font-mono ${profileThemeStyles.textAccent}`}>
              @{privateUser?.username || routeUsername}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed">
          <span className="font-bold text-amber-300 block mb-1">🔒 Perfil Privado</span>
          Este usuário optou por manter sua biblioteca de jogos, histórico e estatísticas privados.
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs transition-all shadow-lg active:scale-95"
          >
            Voltar ao Início
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs transition-all active:scale-95"
          >
            Explorar Jogos
          </Link>
        </div>
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

      {/* Banner de Aviso de Modo Privado (visível apenas para o proprietário) */}
      {isOwner && (authUser?.isPublic === false || authUser?.visibility?.isPublic === false) && (
        <div className="rounded-2xl p-4 bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 shadow-lg shadow-amber-500/5 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-white block">
                Seu perfil está configurado como Privado
              </span>
              <p className="text-[11px] text-gray-300">
                Sua biblioteca e histórico estão invisíveis para outros usuários. Links compartilhados exibirão um aviso de perfil privado.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={async () => {
                await updateUserProfile({
                  isPublic: true,
                  visibility: {
                    ...authUser?.visibility,
                    isPublic: true,
                  },
                });
              }}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 shadow-md shadow-amber-500/20"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Tornar Perfil Público</span>
            </button>
            <button
              onClick={() => {
                if (typeof window !== "undefined" && window.innerWidth < 768) {
                  router.push("/perfil/editar?tab=visibility");
                } else {
                  setCustomizerInitialTab("visibility");
                  setIsCustomizerOpen(true);
                }
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-colors cursor-pointer active:scale-95"
            >
              Configurações
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
        onOpenEditProfile={() => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            router.push("/perfil/editar?tab=info");
          } else {
            setCustomizerInitialTab("info");
            setIsCustomizerOpen(true);
          }
        }}
        onOpenEditBio={() => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            router.push("/perfil/editar?tab=markdown");
          } else {
            setCustomizerInitialTab("markdown");
            setIsCustomizerOpen(true);
          }
        }}
        onOpenTools={() => setIsToolsOpen(true)}
        onOpenImporter={() => setIsImporterOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenManagePlan={() => setIsManagePlanOpen(true)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {/* Card Nobre VIP / PRO Legendary Vault (Inspirado nas Referências DemoVip) */}
      <LegendaryVaultCard
        user={activeUser}
        stats={activeStats}
        isOwner={isOwner}
        realRank={realGamerRank?.formattedRank}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        onOpenManagePlan={() => setIsManagePlanOpen(true)}
        onOpenXpBreakdown={() => setIsXpBreakdownOpen(true)}
      />

      {/* Placar Numérico Digital Neon de Pontos e XP (Inspirado nas Referências DemoVip) */}
      <GamerScoreboardCard
        stats={activeStats}
        plan={activeUser.plan}
        onOpenXpBreakdown={() => setIsXpBreakdownOpen(true)}
      />

      {/* Medalhas & Conquistas Desbloqueáveis do Gamer */}
      <GamerBadgesCard
        stats={activeStats}
        gamerLevel={activeUser.gamerLevel}
      />

      {/* Missões & Desafios Gamers da Temporada */}
      <GamerQuestsCard
        stats={activeStats}
        user={activeUser}
        isOwner={isOwner}
        onOpenCustomizer={() => {
          if (typeof window !== "undefined" && window.innerWidth < 768) {
            router.push("/perfil/editar?tab=showcase");
          } else {
            setCustomizerInitialTab("showcase");
            setIsCustomizerOpen(true);
          }
        }}
      />

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
          onEdit={
            isOwner
              ? () => {
                  if (typeof window !== "undefined" && window.innerWidth < 768) {
                    router.push("/perfil/editar?tab=markdown");
                  } else {
                    setCustomizerInitialTab("markdown");
                    setIsCustomizerOpen(true);
                  }
                }
              : undefined
          }
        />
      )}

      {/* Estatísticas Gerais do Perfil (se visibilidade ativa) */}
      {activeUser.visibility?.showStats !== false && (
        <StatsOverview
          stats={activeStats}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          realRank={realGamerRank?.formattedRank}
          plan={activeUser.plan}
        />
      )}

      {/* Abas de Navegação e Filtros (Mobile-First & Touch-Friendly) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-3.5">
          {/* Abas com rolagem suave horizontal e alvos de toque ergonômicos */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap">
            {[
              { id: "all", label: "Todos", icon: Layers, iconColor: "text-gray-400", count: activeStats.totalGames },
              { id: "library", label: "Biblioteca", icon: Library, iconColor: "text-indigo-400", count: activeStats.libraryCount || 0 },
              { id: "completed", label: "Zerados", icon: Trophy, iconColor: "text-amber-400", count: activeStats.completedCount },
              { id: "playing", label: "Jogando", icon: Gamepad2, iconColor: "text-emerald-400", count: activeStats.playingCount },
              { id: "backlog", label: "Quero Jogar", icon: Bookmark, iconColor: "text-purple-400", count: activeStats.backlogCount },
              { id: "dropped", label: "Dropados", icon: Ban, iconColor: "text-rose-400", count: activeStats.droppedCount },
              { id: "steam_inventory", label: "Inventário Steam", icon: Sparkles, iconColor: "text-cyan-400", count: activeUser?.socialLinks?.steam ? "Steam" : "Skins" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 min-h-[42px] px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 select-none active:scale-95 ${
                    isActive
                      ? profileThemeStyles.activeTabBg
                      : "bg-[#14161a] text-gray-400 hover:text-gray-200 hover:bg-[#1a1d24] border border-white/5"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-inherit" : tab.iconColor}`} />
                  <span>{tab.label}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? "bg-white/15 text-white" : "bg-white/5 text-gray-400"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Busca na Biblioteca, Ordenação e Modo de Visualização */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            {/* Campo de Busca Rápida */}
            <div className="relative flex-1 md:flex-initial">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filtrar na biblioteca..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-48 lg:w-52 h-11 md:h-10 pl-10 pr-8 rounded-2xl bg-[#14161a] border border-white/10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-all"
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

            {/* Seletor de Ordenação */}
            <div className="relative flex-shrink-0">
              <div className="flex items-center gap-1.5 h-11 md:h-10 px-2.5 sm:px-3 rounded-2xl bg-[#14161a] border border-white/10 text-xs text-gray-300 hover:border-white/20 transition-all">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent text-xs text-gray-200 font-medium focus:outline-none cursor-pointer pr-1"
                  aria-label="Ordenar biblioteca"
                >
                  <option value="recent" className="bg-[#14161a] text-white">Adicionados Recentes</option>
                  <option value="rating" className="bg-[#14161a] text-white">Maior Nota</option>
                  <option value="playtime" className="bg-[#14161a] text-white">Mais Horas Jogadas</option>
                  <option value="title" className="bg-[#14161a] text-white">Título (A - Z)</option>
                  <option value="year" className="bg-[#14161a] text-white">Ano de Lançamento</option>
                </select>
              </div>
            </div>

            {/* Alternador Grade / Lista */}
            <div className="flex items-center rounded-2xl bg-[#14161a] border border-white/10 p-1 flex-shrink-0">
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

        {/* Lista de Jogos do Usuário ou Inventário Steam */}
        {activeTab === "steam_inventory" ? (
          <div className="rounded-[32px] bg-[#18191c] border border-white/10 p-4 sm:p-7 shadow-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <span>🎒 Inventário Steam &amp; Skins</span>
                </h3>
                <p className="text-xs text-gray-400">
                  Armas, facas, chapéus e colecionáveis do CS2, TF2, Rust, Dota 2 e Cartas Steam
                </p>
              </div>
            </div>
            <SteamInventoryViewer
              initialSteamId={activeUser?.socialLinks?.steam || ""}
              isOwner={isOwner}
              onSaveSteamToProfile={
                isOwner
                  ? async (steamId) => {
                      await updateUserProfile({
                        socialLinks: {
                          ...authUser?.socialLinks,
                          steam: steamId,
                        },
                      });
                    }
                  : undefined
              }
            />
          </div>
        ) : filteredLibrary.length === 0 ? (
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-3">
            <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto" />
            <h3 className="text-base font-bold text-white">Nenhum jogo nesta categoria</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Navegue pelo catálogo ou sincronize seus jogos da Steam, Epic Games e outras lojas!
            </p>
            <div className="flex items-center justify-center gap-2.5 pt-1 flex-wrap">
              <Link
                href="/search"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md"
              >
                <Plus className="w-3.5 h-3.5" /> Explorar Catálogo
              </Link>
              {isOwner && (
                <button
                  type="button"
                  onClick={() => setIsImporterOpen(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all shadow-md active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" /> Importar da Steam / Lojas
                </button>
              )}
            </div>
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
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono">
                      <div className="flex items-center gap-1" title="Sua Avaliação">
                        <span className="text-amber-400">★</span>
                        <span className="font-bold text-gray-200">
                          {userGame.userRating !== null ? userGame.userRating.toFixed(1) : "--"}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-gray-400" title="Tempo Jogado">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span className="font-semibold text-cyan-300">
                          {userGame.userPlaytimeHours ? `${userGame.userPlaytimeHours}h` : "--"}
                        </span>
                      </div>
                    </div>

                    {isOwner ? (
                      <button
                        onClick={() => setSelectedGameToEdit(asGame)}
                        className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-gray-200 transition-colors mt-1 active:scale-95"
                      >
                        Editar
                      </button>
                    ) : (
                      <Link
                        href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}
                        className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-[11px] font-semibold text-[#00E5FF] transition-colors mt-1 block text-center active:scale-95"
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
                  className="rounded-2xl bg-[#14161a] border border-white/5 p-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-white/15 hover:bg-[#181a20] transition-all"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={userGame.gameCover || ""}
                      alt={userGame.gameTitle}
                      className="w-14 h-20 rounded-xl object-cover border border-white/10 shadow-md flex-shrink-0"
                    />

                    <div className="space-y-1.5 min-w-0">
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
                          {userGame.releaseYear ? `${userGame.releaseYear} • ` : ""}{userGame.platformPlayed}
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

                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 self-end md:self-center font-mono">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-right">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <div>
                        <div className="text-[9px] text-gray-400 uppercase font-bold">Tempo</div>
                        <div className="font-bold text-cyan-300 text-xs">
                          {userGame.userPlaytimeHours ? `${userGame.userPlaytimeHours}h` : "--"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-right">
                      <span className="text-amber-400 text-sm">★</span>
                      <div>
                        <div className="text-[9px] text-gray-400 uppercase font-bold">Nota</div>
                        <div className="font-bold text-amber-300 text-xs">
                          {userGame.userRating !== null ? `${userGame.userRating.toFixed(1)}` : "--"}
                        </div>
                      </div>
                    </div>

                    {isOwner ? (
                      <button
                        onClick={() => setSelectedGameToEdit(asGame)}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-gray-200 transition-colors active:scale-95"
                      >
                        Editar
                      </button>
                    ) : (
                      <Link
                        href={getGameUrl({ id: userGame.gameId, slug: userGame.gameSlug, name: userGame.gameTitle })}
                        className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-xs font-semibold text-[#00E5FF] transition-colors active:scale-95"
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
            onOpenCustomizer={() => {
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setIsToolsOpen(false);
                router.push("/perfil/editar?tab=info");
              } else {
                setCustomizerInitialTab("info");
                setIsCustomizerOpen(true);
              }
            }}
            onOpenPrivacy={() => {
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setIsToolsOpen(false);
                router.push("/perfil/editar?tab=visibility");
              } else {
                setCustomizerInitialTab("visibility");
                setIsCustomizerOpen(true);
              }
            }}
            onOpenRoulette={() => setIsRouletteOpen(true)}
            onOpenWrapped={() => setIsWrappedOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenImporter={() => setIsImporterOpen(true)}
            onOpenSteamInventory={() => setActiveTab("steam_inventory")}
            onOpenShare={() => setIsShareOpen(true)}
            onOpenGamerCard={() => setIsGamerCardOpen(true)}
            onInstallPwa={triggerPwaInstall}
          />

          <GameImporterModal
            isOpen={isImporterOpen}
            onClose={() => setIsImporterOpen(false)}
            existingGames={ownLibrary}
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
            initialTab={customizerInitialTab}
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
        username={activeUser?.username || authUser?.username || ""}
        displayName={activeUser?.displayName || authUser?.displayName || "Gamer"}
        isPublic={
          isOwner
            ? authUser?.isPublic !== false && authUser?.visibility?.isPublic !== false
            : activeUser?.isPublic !== false && activeUser?.visibility?.isPublic !== false
        }
        onMakePublic={
          isOwner
            ? async () => {
                await updateUserProfile({
                  isPublic: true,
                  visibility: {
                    ...authUser?.visibility,
                    isPublic: true,
                  },
                });
              }
            : undefined
        }
        onOpenGamerCard={() => setIsGamerCardOpen(true)}
      />

      {/* Modal de Extrato de XP Gamer */}
      <GamerXpBreakdownModal
        isOpen={isXpBreakdownOpen}
        onClose={() => setIsXpBreakdownOpen(false)}
        stats={activeStats}
        gamerLevel={activeUser?.gamerLevel}
        realRank={realGamerRank?.formattedRank}
        plan={activeUser?.plan}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
      />

      {/* Modal de Geração de Card Gamer para Redes Sociais */}
      <ShareGamerCardModal
        isOpen={isGamerCardOpen}
        onClose={() => setIsGamerCardOpen(false)}
        user={activeUser}
        stats={activeStats}
        library={activeLibrary}
        realRank={realGamerRank?.formattedRank}
      />

      {/* Modal de Comemoração de Level-Up com Confetes e Haptics */}
      {isOwnProfile && levelUpData && (
        <LevelUpCelebrationModal
          isOpen={Boolean(levelUpData)}
          onClose={dismissLevelUp}
          newLevel={levelUpData.newLevel}
          oldLevel={levelUpData.oldLevel}
          rankTitle={levelUpData.rankTitle}
          onOpenGamerCard={() => {
            dismissLevelUp();
            setIsGamerCardOpen(true);
          }}
        />
      )}
    </div>
  );
}
