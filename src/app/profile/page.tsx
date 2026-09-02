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
import ProfileCustomizerModal from "@/components/ProfileCustomizerModal";
import GameRouletteModal from "@/components/GameRouletteModal";
import GamerWrappedModal from "@/components/GamerWrappedModal";
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
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUserBio, isAdmin, isLoading: authLoading } = useAuth();
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
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [isRouletteOpen, setIsRouletteOpen] = useState(false);
  const [isWrappedOpen, setIsWrappedOpen] = useState(false);
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
            <div className="relative">
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
                {user.customTitle && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] font-bold">
                    {user.customTitle}
                  </span>
                )}
              </div>

              {/* Status e Detalhes da Assinatura */}
              {user.plan === "vip" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold w-fit">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Membro Fundador VIP Vitalício</span>
                </div>
              ) : user.plan === "pro" ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[#00E5FF] text-xs font-bold w-fit">
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
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-xs font-medium w-fit">
                  <span>Plano Gratuito</span>
                  <button
                    onClick={() => setIsUpgradeOpen(true)}
                    className="text-[#00E5FF] hover:underline font-bold ml-1 inline-flex items-center gap-0.5"
                  >
                    Seja PRO <ArrowRight className="w-3 h-3" />
                  </button>
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

          <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
            {/* Ações Primárias */}
            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Jogos
              </Link>
              <button
                onClick={() => {
                  setBioInput(user.bio || "");
                  setFavGameInput(user.favoriteGame || "");
                  setIsEditingBio(true);
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/15 text-xs font-semibold text-gray-200 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar Perfil
              </button>
            </div>

            {/* Ações Secundárias e Ferramentas com Scroll Suave no Mobile */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-2 px-2 sm:mx-0 sm:px-0 sm:flex-wrap">
              {user.plan === "free" ? (
                <button
                  onClick={() => setIsUpgradeOpen(true)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-[#00E5FF]/40 text-xs font-bold text-[#00E5FF] transition-all shadow-md hover:scale-105"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                  Seja PRO
                </button>
              ) : (
                <Link
                  href="/planos"
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-bold text-[#00E5FF] transition-all shadow-sm hover:bg-cyan-500/25"
                  title="Ver detalhes do seu plano ativo"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                  Plano PRO Ativo
                </Link>
              )}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-xs font-bold text-amber-300 transition-all shadow-md"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  Admin
                </Link>
              )}
              <button
                onClick={() => setIsCustomizerOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-xs font-semibold text-purple-300 transition-colors shadow-sm"
                title="Personalizar capa e tema do perfil"
              >
                <Palette className="w-3.5 h-3.5 text-purple-400" />
                Personalizar
              </button>
              <button
                onClick={() => setIsRouletteOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 text-xs font-semibold text-indigo-300 transition-colors shadow-sm"
                title="Sortear o próximo jogo do seu backlog"
              >
                <Dices className="w-3.5 h-3.5 text-indigo-400" />
                Roleta Backlog
              </button>
              <button
                onClick={() => setIsWrappedOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-semibold text-[#00E5FF] transition-colors shadow-sm"
                title="Ver sua retrospectiva gamer"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                Retrospectiva
              </button>
              <button
                onClick={() => setIsUpgradeOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-xs font-semibold text-amber-300 transition-all shadow-sm"
                title="Gerenciar plano e remover anúncios"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                {user.plan === "pro" || user.plan === "vip" ? "Plano PRO" : "Seja PRO"}
              </button>
              <button
                onClick={() => setIsExportOpen(true)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-semibold text-[#00E5FF] transition-colors"
                title="Exportar biblioteca em Excel, JSON ou link dinâmico"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar
              </button>
              <button
                onClick={triggerPwaInstall}
                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-300 transition-colors"
                title="Instalar aplicativo mobile"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                App Mobile
              </button>
            </div>
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

      {/* Card Promocional do App Mobile PWA */}
      <div className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-surface-100 to-indigo-950/40 border border-[#00E5FF]/25 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#00E5FF]/10 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] flex-shrink-0 shadow-lg shadow-cyan-500/10">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white">Instale o GameVault no seu Celular</h4>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-[#00E5FF]/20 text-[#00E5FF]">
                PWA
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Acesse sua biblioteca, backlog e estatísticas em tela cheia direto da tela de início, mesmo sem internet.
            </p>
          </div>
        </div>
        <button
          onClick={triggerPwaInstall}
          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-[#00E5FF] hover:bg-cyan-300 text-black text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 flex-shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          Instalar Aplicativo
        </button>
      </div>

      {/* Estatísticas Gerais do Perfil (se visibilidade ativa) */}
      {user.visibility?.showStats !== false && (
        <StatsOverview stats={stats} activeTab={activeTab} onSelectTab={setActiveTab} />
      )}

      {/* Abas de Navegação e Filtros */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
          {/* Abas com rolagem suave horizontal no mobile */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-3.5 px-3.5 sm:mx-0 sm:px-0 flex-nowrap sm:flex-wrap">
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
                className={`flex-shrink-0 px-3.5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
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

      {/* Modal de Exportação */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        games={library}
        username={user.username || user.uid}
      />

      {/* Modal de Upgrade de Planos */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
      />

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
