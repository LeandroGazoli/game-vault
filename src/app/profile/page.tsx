"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { GameStatus, UserGame } from "@/lib/types";
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
import MarkdownProfileBio from "@/components/MarkdownProfileBio";
import SocialGamertagsBar from "@/components/SocialGamertagsBar";
import ShowcaseGameCard from "@/components/ShowcaseGameCard";
import PlanBadge from "@/components/PlanBadge";
import UserAvatar from "@/components/UserAvatar";
import { triggerPwaInstall } from "@/components/PwaInstallPrompt";
import Link from "next/link";
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
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUserBio, isAdmin, isPremium, isLoading: authLoading } = useAuth();
  const { library, stats, isLoading: libraryLoading } = useGameLibrary();

  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGameToEdit, setSelectedGameToEdit] = useState<any | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || "");
  const [favGameInput, setFavGameInput] = useState(user?.favoriteGame || "");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isManagePlanOpen, setIsManagePlanOpen] = useState(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const [celebrationBanner, setCelebrationBanner] = useState<string | null>(null);

  // Verificação e ativação automática se o usuário retornou do Stripe Checkout
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const sId = params.get("session_id");
    const isUpgraded = params.get("upgraded");

    if (sId) {
      fetch(`/api/checkout/verify?session_id=${sId}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.success) {
            setCelebrationBanner(
              `🎉 Parabéns! Seu plano ${data.planName || "GameVault PRO"} foi ativado com sucesso! Aproveite todos os benefícios.`
            );
          }
        })
        .catch((e) => console.error("Erro ao verificar sessão do checkout:", e));
    } else if (isUpgraded === "true") {
      setCelebrationBanner("🎉 Parabéns! Sua assinatura foi ativada com sucesso!");
    }
  }, []);

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

  if (authLoading || (user && libraryLoading)) {
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

      {/* Banner de Perfil do Jogador */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#18191c] p-6 sm:p-8 shadow-2xl">
        {user.bannerURL && (
          <img
            src={user.bannerURL}
            alt="Banner de Capa"
            className="absolute inset-0 w-full h-full object-cover opacity-25 pointer-events-none"
          />
        )}
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <UserAvatar
                photoURL={user.photoURL}
                name={user.displayName}
                size="xl"
                className="border-2 border-[#00E5FF]/40 shadow-xl"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  {user.displayName}
                </h1>
                <span className="text-xs text-[#00E5FF] font-mono">@{user.username}</span>
                <PlanBadge plan={user.plan || "free"} size="sm" />
                {/* Títulos & Insígnias Gamer (Até 3 no Perfil) */}
                {(() => {
                  const titlesToDisplay =
                    user.customTitles && user.customTitles.length > 0
                      ? user.customTitles
                      : user.customTitle
                      ? [user.customTitle]
                      : [];

                  return titlesToDisplay.map((title, idx) => (
                    <span
                      key={idx}
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm inline-flex items-center gap-1 transition-all ${
                        idx === 0
                          ? user.theme === "gold"
                            ? "bg-amber-500/15 border border-amber-500/40 text-amber-300"
                            : user.theme === "purple"
                            ? "bg-purple-500/15 border border-purple-500/40 text-purple-300"
                            : user.theme === "crimson"
                            ? "bg-rose-500/15 border border-rose-500/40 text-rose-300"
                            : user.theme === "emerald"
                            ? "bg-emerald-500/15 border border-emerald-500/40 text-emerald-300"
                            : "bg-cyan-500/15 border border-cyan-500/40 text-[#00E5FF]"
                          : "bg-white/10 border border-white/20 text-gray-200"
                      }`}
                      title={idx === 0 ? "Insígnia Principal" : `Insígnia #${idx + 1}`}
                    >
                      {title}
                    </span>
                  ));
                })()}
              </div>

              {/* Status e Detalhes da Assinatura (Limpo & Interativo) */}
              {user.plan === "vip" ? (
                <div
                  onClick={() => setIsManagePlanOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold cursor-pointer hover:bg-amber-500/20 active:scale-95 transition-all w-fit shadow-sm"
                  title="Clique para gerenciar seu plano VIP"
                >
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Membro Fundador VIP Vitalício</span>
                </div>
              ) : user.plan === "pro" ? (
                <div
                  onClick={() => setIsManagePlanOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-bold cursor-pointer hover:bg-cyan-500/20 active:scale-95 transition-all w-fit shadow-sm"
                  title="Clique para gerenciar sua assinatura PRO"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                  <span>
                    Assinante PRO Ativo
                    {user.premiumUntil ? (
                      <span className="text-gray-300 font-normal ml-1">
                        • Válido até{" "}
                        {new Date(user.premiumUntil).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </span>
                    ) : (
                      <span className="text-gray-300 font-normal ml-1">(Renovação Automática)</span>
                    )}
                  </span>
                </div>
              ) : (
                <div
                  onClick={() => setIsUpgradeOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white text-xs font-medium cursor-pointer hover:border-white/20 active:scale-95 transition-all w-fit shadow-sm"
                  title="Conheça as vantagens do plano PRO"
                >
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <span>Conta Free</span>
                  <span className="text-[#00E5FF] font-semibold ml-1 flex items-center gap-0.5">
                    • Seja PRO <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              )}

              <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
                {user.bio || "Nenhuma bio informada."}
              </p>

              {user.favoriteGame && (
                <div className="inline-flex items-center gap-1.5 text-xs text-pink-300 bg-pink-950/40 border border-pink-500/20 px-3 py-0.5 rounded-full mt-1">
                  <Heart className="w-3 h-3 fill-pink-400 text-pink-400" /> Jogo Favorito:{" "}
                  <strong>{user.favoriteGame}</strong>
                </div>
              )}

              {/* Barra de Gamertags e Redes Sociais */}
              <SocialGamertagsBar socials={user.socialLinks} />
            </div>
          </div>

          {/* Tríade de Ações do Perfil (Mobile-First, Ergonômico e Sem Poluição) */}
          <div className="w-full sm:w-auto flex flex-row items-center gap-2 sm:gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Ação Primária: Adicionar Jogos */}
            <Link
              href="/search"
              className="flex-1 sm:flex-initial min-h-[46px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-gray-200 text-black text-xs font-black transition-all shadow-xl shadow-white/10 active:scale-95"
            >
              <Plus className="w-4 h-4 text-black" />
              <span>Adicionar Jogos</span>
            </Link>

            {/* Ação Secundária: Editar Perfil */}
            <button
              onClick={() => {
                setBioInput(user.bio || "");
                setFavGameInput(user.favoriteGame || "");
                setIsEditingBio(!isEditingBio);
              }}
              className="min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 border border-white/15 hover:bg-white/10 hover:border-white/25 text-xs font-semibold text-gray-200 transition-all active:scale-95"
            >
              <Edit2 className="w-3.5 h-3.5 text-gray-400" />
              <span>Editar</span>
            </button>

            {/* Central de Ações & Ferramentas (Abre Bottom Sheet no mobile ou modal no desktop) */}
            <button
              onClick={() => setIsToolsOpen(true)}
              className="min-h-[46px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500/15 via-[#00E5FF]/10 to-blue-500/15 border border-[#00E5FF]/30 hover:border-[#00E5FF]/60 hover:bg-[#00E5FF]/20 text-xs font-bold text-[#00E5FF] transition-all shadow-md shadow-[#00E5FF]/5 active:scale-95"
              title="Ações e Ferramentas do Perfil"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#00E5FF]" />
              <span>Ferramentas</span>
            </button>
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

      {/* Jogo em Destaque no Perfil (Se configurado) */}
      {user.showcaseGameId && (
        <ShowcaseGameCard
          game={library.find((g) => g.gameId === user.showcaseGameId)}
        />
      )}

      {/* Showcase / Bio em Markdown Rico & GIFs */}
      {(user.customMarkdown || user.customHtml) && (
        <MarkdownProfileBio content={user.customMarkdown || user.customHtml} />
      )}


      {/* Estatísticas Gerais do Perfil (se visibilidade ativa) */}
      {user.visibility?.showStats !== false && (
        <StatsOverview stats={stats} activeTab={activeTab} onSelectTab={setActiveTab} />
      )}

      {/* Abas de Navegação e Filtros (Mobile-First & Touch-Friendly) */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 border-b border-white/10 pb-3.5">
          {/* Abas com rolagem suave horizontal e alvos de toque ergonômicos */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 flex-nowrap">
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

      {/* Modal de Exportação */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        games={library}
        username={user.username || user.uid}
      />

      {/* Modal / Bottom Sheet de Ações & Ferramentas do Perfil */}
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
        onInstallPwa={triggerPwaInstall}
      />

      {/* Modal de Gerenciamento do Plano Ativo */}
      <ManagePlanModal
        isOpen={isManagePlanOpen}
        onClose={() => setIsManagePlanOpen(false)}
        user={user}
      />

      {/* Modal de Upgrade de Planos (somente para usuários Free) */}
      {!isPremium && (
        <UpgradeModal
          isOpen={isUpgradeOpen}
          onClose={() => setIsUpgradeOpen(false)}
        />
      )}

      {/* Modal de Personalização do Perfil */}
      <ProfileCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onOpenUpgrade={() => setIsUpgradeOpen(true)}
        games={library}
      />

      {/* Modal de Roleta do Backlog */}
      <GameRouletteModal
        isOpen={isRouletteOpen}
        onClose={() => setIsRouletteOpen(false)}
        games={library}
      />

      {/* Modal de Retrospectiva Gamer Wrapped */}
      <GamerWrappedModal
        isOpen={isWrappedOpen}
        onClose={() => setIsWrappedOpen(false)}
        games={library}
        user={user}
        stats={stats}
      />
    </div>
  );
}
