"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import AuthModal from "./AuthModal";
import LiveSearchInput from "./LiveSearchInput";
import Logo from "./Logo";
import PlanBadge from "./PlanBadge";
import UserAvatar from "./UserAvatar";
import { triggerPwaInstall } from "./PwaInstallPrompt";
import { openSpotlightSearch } from "./SpotlightSearchModal";
import {
  Gamepad2,
  Trophy,
  User,
  LogOut,
  Flame,
  Crown,
  ShieldCheck,
  Calendar as CalendarIcon,
  Sparkles,
  Menu,
  X,
  Search,
  Download,
  Smartphone,
  ChevronRight,
  ChevronDown,
  Clock,
  Heart,
  Layers,
  Bookmark,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isPremium } = useAuth();
  const { stats } = useGameLibrary();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExploreMenuOpen, setIsExploreMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueia scroll do body quando o menu drawer mobile estiver aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMobileMenuOpen]);

  // Fecha o menu com a tecla ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    if (isMobileMenuOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isMobileMenuOpen]);

  // Fecha o menu ao trocar de rota
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsExploreMenuOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-[#242a36] bg-[#0c0e13]/95 backdrop-blur-xl pt-safe">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 pl-[max(env(safe-area-inset-left,0px),0.875rem)] pr-[max(env(safe-area-inset-right,0px),0.875rem)] h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Lado Esquerdo: Logo & Navegação Principal */}
          <div className="flex items-center gap-4 xl:gap-6 flex-shrink-0">
            <Link href="/" className="flex-shrink-0">
              <Logo size="md" />
            </Link>

            {/* Divisor vertical mecânico entre logo e navegação */}
            <div className="hidden lg:block h-5 w-px bg-[#242a36]" />

            {/* Links de Navegação (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 text-sm font-medium">
              <Link
                href="/"
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                  pathname === "/"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                Início
              </Link>
              <Link
                href="/calendar"
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                  pathname === "/calendar"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-[#00E5FF]" />
                Calendário
              </Link>
              <Link
                href="/rankings"
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                  pathname === "/rankings"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Rankings
              </Link>
              <Link
                href="/categorias"
                className={`hidden xl:flex px-2.5 py-1.5 rounded-lg transition-all items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                  pathname.startsWith("/categorias")
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Categorias
              </Link>
              <Link
                href="/colecoes"
                className={`hidden xl:flex px-2.5 py-1.5 rounded-lg transition-all items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                  pathname.startsWith("/colecoes")
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-purple-400" />
                Coleções
              </Link>
              <Link
                href="/profile"
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                  pathname === "/profile"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                Meus Jogos
              </Link>

              {/* Mega-Menu Explorar por Taxonomia (Plataformas, Gêneros, Especiais) */}
              <div
                className="relative"
                onMouseEnter={() => setIsExploreMenuOpen(true)}
                onMouseLeave={() => setIsExploreMenuOpen(false)}
              >
                <button
                  onClick={() => setIsExploreMenuOpen(!isExploreMenuOpen)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap text-xs font-semibold cursor-pointer ${
                    isExploreMenuOpen || pathname === "/search"
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Explorar</span>
                  <ChevronDown
                    className={`w-3 h-3 text-neutral-400 transition-transform ${
                      isExploreMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Estruturado em 3 Colunas */}
                {isExploreMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[500px] rounded-2xl bg-[#0f1218]/98 border border-[#262d3a] shadow-2xl p-4 grid grid-cols-3 gap-4 backdrop-blur-2xl animate-fadeIn z-50">
                    {/* Coluna 1: Plataformas */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-white/5 pb-1">
                        Plataformas
                      </div>
                      <div className="space-y-0.5">
                        {[
                          { label: "💻 PC Gamer", href: "/search?platform=PC" },
                          { label: "🎮 PlayStation 5", href: "/search?platform=PlayStation%205" },
                          { label: "🟢 Xbox Series", href: "/search?platform=Xbox%20Series" },
                          { label: "🔴 Nintendo Switch", href: "/search?platform=Nintendo%20Switch" },
                          { label: "🕹️ Clássicos Retrô", href: "/search?platform=Retro" },
                        ].map((p) => (
                          <Link
                            key={p.label}
                            href={p.href}
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors truncate"
                          >
                            {p.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Coluna 2: Principais Gêneros */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-400 border-b border-white/5 pb-1">
                        Gêneros Populares
                      </div>
                      <div className="space-y-0.5">
                        {[
                          { label: "⚔️ RPG & Aventura", href: "/search?genre=Role-playing%20(RPG)" },
                          { label: "💥 Ação & Tiro", href: "/search?genre=Action" },
                          { label: "🧩 Puzzle & Estratégia", href: "/search?genre=Puzzle" },
                          { label: "👻 Terror & Horror", href: "/search?genre=Horror" },
                          { label: "🎨 Jogos Indies", href: "/search?genre=Indie" },
                        ].map((g) => (
                          <Link
                            key={g.label}
                            href={g.href}
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors truncate"
                          >
                            {g.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Coluna 3: Coleções & Destaques */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 border-b border-white/5 pb-1">
                        Coleções Especiais
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          href="/search?q=dublado"
                          onClick={() => setIsExploreMenuOpen(false)}
                          className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors truncate"
                        >
                          🇧🇷 Dublados em PT-BR
                        </Link>
                        <Link
                          href="/rankings"
                          onClick={() => setIsExploreMenuOpen(false)}
                          className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors truncate"
                        >
                          ⭐ Top Metacritic
                        </Link>
                        <Link
                          href="/calendar"
                          onClick={() => setIsExploreMenuOpen(false)}
                          className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors truncate"
                        >
                          📅 Lançamentos 2026
                        </Link>
                        <Link
                          href="/search"
                          onClick={() => setIsExploreMenuOpen(false)}
                          className="block px-2 py-1 rounded-lg text-xs text-[#00E5FF] font-bold hover:bg-[#00E5FF]/10 transition-colors mt-1"
                        >
                          Ver Catálogo →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Lado Direito: Busca Spotlight & Área do Usuário */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0 justify-end">
            {/* Botão de Busca Spotlight (Desktop - Cmd+K / Ctrl+K) */}
            <button
              onClick={() => openSpotlightSearch()}
              className="hidden md:flex items-center justify-between w-36 lg:w-44 xl:w-56 px-2.5 py-1.5 rounded-xl bg-[#13161f] hover:bg-[#181c27] border border-[#242a36] hover:border-[#384255] text-xs text-neutral-400 transition-all shadow-inner group cursor-pointer shrink-0"
              title="Buscar jogos no GameVault (Atalho: ⌘K ou Ctrl+K)"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#00E5FF] transition-colors shrink-0" />
                <span className="truncate">Buscar...</span>
              </div>
              <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-neutral-400 shrink-0">
                ⌘K
              </kbd>
            </button>

            {!isPremium && (
              <Link
                href="/planos"
                className="hidden xl:flex text-amber-300 hover:text-amber-200 transition-all items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-xs font-semibold shadow-sm flex-shrink-0"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>PRO</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Perfil: no mobile é apenas o avatar circular compacto (32px), sem empurrar o menu */}
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pr-2.5 rounded-full bg-white/10 border border-white/10 hover:border-white/30 transition-colors shrink-0"
                  title={`Perfil de ${user.displayName}`}
                >
                  <UserAvatar photoURL={user.photoURL} name={user.displayName} size="sm" />
                  <span className="text-xs font-semibold text-gray-200 max-w-[70px] sm:max-w-[85px] truncate hidden sm:inline">
                    {user.displayName}
                  </span>
                  <span className="hidden md:inline">
                    <PlanBadge plan={user.plan || "free"} size="sm" />
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 transition-colors shadow-sm shrink-0"
                    title="Acessar Painel do Administrador"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden md:inline">Admin</span>
                  </Link>
                )}

                <button
                  onClick={() => logout()}
                  title="Sair"
                  className="hidden md:flex p-1.5 rounded-full text-gray-400 hover:text-rose-400 hover:bg-white/10 transition-colors shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
              >
                <User className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {/* Botão de Busca Rápida Spotlight (Mobile) */}
            <button
              onClick={() => openSpotlightSearch()}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-neutral-300 hover:text-white active:scale-95 transition-colors cursor-pointer shrink-0"
              title="Buscar jogos"
              aria-label="Buscar jogos"
            >
              <Search className="w-4 h-4 text-cyan-400" />
            </button>

            {/* Botão Hambúrguer para abrir Drawer Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white active:scale-95 transition-colors cursor-pointer shrink-0"
              aria-label="Abrir menu de navegação"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MENU MOBILE MODERNO: DRAWER COMPACTO COM GPU ACCELERATION
      ========================================================= */}
      {mounted && typeof document !== "undefined" && createPortal(
        <div
          className={`lg:hidden fixed inset-0 z-[100] transition-opacity duration-300 ease-out ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={!isMobileMenuOpen}
        >
          {/* Overlay escuro leve sem backdrop-blur (60 FPS garantido no mobile) */}
          <div
            className="fixed inset-0 bg-black/80 transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Painel Drawer Deslizante Compacto (w-[82vw] max-w-[310px]) */}
          <aside
            className={`fixed top-0 right-0 bottom-0 w-[82vw] max-w-[310px] h-full max-h-[100dvh] bg-[#0c0e13] border-l border-[#242a36] px-4 pt-[max(env(safe-area-inset-top,0px)+12px,1rem)] pb-[max(env(safe-area-inset-bottom,0px)+16px,1.5rem)] flex flex-col justify-between overflow-y-auto overflow-x-hidden no-scrollbar shadow-2xl z-[101] transform-gpu will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-label="Menu principal"
          >
            {/* Topo do Drawer: Logo & Fechar */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-[#242a36]">
                <Logo size="sm" />
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                  title="Fechar menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Perfil Compacto no Drawer */}
              {user ? (
                <div className="p-3 rounded-xl bg-[#14171e] border border-[#242a36] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar photoURL={user.photoURL} name={user.displayName} size="sm" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[120px]">
                          {user.displayName}
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-mono block truncate">
                          @{user.username || "gamer"}
                        </span>
                      </div>
                    </div>
                    <PlanBadge plan={user.plan || "free"} size="sm" />
                  </div>

                  {/* Resumo Rápido de Estatísticas */}
                  <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-[#242a36] text-neutral-400">
                    <span>{stats.totalGames} jogos</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">{stats.completedCount} zerados</span>
                    <span>•</span>
                    <span className="text-amber-300 font-bold">{stats.totalPlaytimeHours}h</span>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md"
                >
                  <User className="w-4 h-4" />
                  <span>Entrar ou Cadastrar</span>
                </button>
              )}

              {/* Botão de Busca Rápida Spotlight (1 toque) */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  openSpotlightSearch();
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#14171e] border border-[#242a36] text-xs text-neutral-400 hover:text-white transition-all active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <Search className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Buscar jogos...</span>
                </div>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-400">
                  ⌘K
                </kbd>
              </button>

              {/* Navegação Principal Compacta */}
              <div className="space-y-0.5 pt-1">
                <span className="text-[9px] uppercase font-mono font-bold text-neutral-400 tracking-wider px-2 block mb-1">
                  Navegação
                </span>
                {[
                  { href: "/", label: "Início", icon: Flame, color: "text-orange-400" },
                  { href: "/calendar", label: "Calendário", icon: CalendarIcon, color: "text-[#00E5FF]" },
                  { href: "/rankings", label: "Rankings", icon: Sparkles, color: "text-amber-400" },
                  { href: "/search", label: "Explorar Catálogo", icon: Search, color: "text-cyan-400" },
                  { href: "/profile", label: "Meu Perfil & Jogos", icon: Trophy, color: "text-emerald-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-[0.98] ${
                        isActive
                          ? "bg-white/10 text-white font-bold border border-white/10"
                          : "text-neutral-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                        <span>{item.label}</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                    </Link>
                  );
                })}
              </div>

              {/* Plataformas e Filtros Rápidos */}
              <div className="pt-1">
                <span className="text-[9px] uppercase font-mono font-bold text-neutral-400 tracking-wider px-2 block mb-1">
                  Plataformas
                </span>
                <div className="grid grid-cols-3 gap-1 font-mono text-[11px]">
                  {[
                    { label: "💻 PC", href: "/search?platform=PC" },
                    { label: "🎮 PS5", href: "/search?platform=PlayStation%205" },
                    { label: "🟢 Xbox", href: "/search?platform=Xbox%20Series" },
                    { label: "🔴 Switch", href: "/search?platform=Nintendo%20Switch" },
                    { label: "🕹️ Retrô", href: "/search?platform=Retro" },
                    { label: "🇧🇷 Dublados", href: "/search?q=dublado" },
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-2 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-colors active:scale-95 text-center text-xs truncate"
                    >
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Instalar App PWA (Compacto) */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  triggerPwaInstall();
                }}
                className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Instalar App Mobile</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                  PWA
                </span>
              </button>
            </div>

            {/* Rodapé do Drawer */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Painel Admin</span>
                  </div>
                  <ChevronRight className="w-3 h-3 text-amber-500" />
                </Link>
              )}

              {user && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              )}

              <div className="flex items-center justify-center gap-3 text-[10px] text-neutral-400 pt-1">
                <Link href="/sobre" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white">
                  Sobre
                </Link>
                <span>•</span>
                <Link href="/termos" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white">
                  Termos
                </Link>
                <span>•</span>
                <Link href="/privacidade" onClick={() => setIsMobileMenuOpen(false)} className="hover:text-white">
                  Privacidade
                </Link>
              </div>
            </div>
          </aside>
        </div>,
        document.body
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}

