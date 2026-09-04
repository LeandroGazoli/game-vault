"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import AuthModal from "./AuthModal";
import Logo from "./Logo";
import PlanBadge from "./PlanBadge";
import UserAvatar from "./UserAvatar";
import { triggerPwaInstall } from "./PwaInstallPrompt";
import { openSpotlightSearch } from "./SpotlightSearchModal";
import NotificationBell from "./notifications/NotificationBell";
import { getProfileUrl } from "@/lib/routes";
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
  Lightbulb,
  Upload,
} from "lucide-react";

export function openGameImporter() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-game-importer"));
  }
}

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isPremium } = useAuth();
  const { stats } = useGameLibrary();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isExploreMenuOpen, setIsExploreMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const exploreTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);
  const userMenuTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleOpenUserMenu = () => {
    if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    setIsUserMenuOpen(true);
  };

  const handleCloseUserMenu = () => {
    if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    userMenuTimeoutRef.current = setTimeout(() => {
      setIsUserMenuOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
    };
  }, []);

  const handleOpenExplore = () => {
    if (exploreTimeoutRef.current) {
      clearTimeout(exploreTimeoutRef.current);
    }
    setIsExploreMenuOpen(true);
  };

  const handleCloseExplore = () => {
    if (exploreTimeoutRef.current) {
      clearTimeout(exploreTimeoutRef.current);
    }
    exploreTimeoutRef.current = setTimeout(() => {
      setIsExploreMenuOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (exploreTimeoutRef.current) {
        clearTimeout(exploreTimeoutRef.current);
      }
    };
  }, []);

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
      <header className="vt-header sticky top-0 z-50 w-full border-b border-[#242a36] bg-[#0c0e13]/95 backdrop-blur-xl pt-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pl-[max(env(safe-area-inset-left,0px),0.75rem)] pr-[max(env(safe-area-inset-right,0px),0.75rem)] h-16 flex items-center justify-between gap-2 sm:gap-3">
          {/* Lado Esquerdo: Logo & Navegação Principal */}
          <div className="flex items-center gap-2.5 lg:gap-3 xl:gap-4 shrink-0">
            <Link href="/" className="shrink-0">
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
                href="/feedback"
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                  pathname === "/feedback"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                Ideias &amp; Bugs
              </Link>
              <Link
                href={user?.username ? getProfileUrl(user.username) : "/perfil"}
                className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold ${
                  pathname?.startsWith("/perfil")
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                Meus Jogos
              </Link>

              {/* Mega-Menu Explorar por Taxonomia (Categorias, Coleções, Plataformas, Gêneros) */}
              <div
                className="relative"
                onMouseEnter={handleOpenExplore}
                onMouseLeave={handleCloseExplore}
              >
                <button
                  onClick={() => setIsExploreMenuOpen(!isExploreMenuOpen)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1 whitespace-nowrap text-xs font-semibold cursor-pointer ${
                    isExploreMenuOpen || pathname === "/search" || pathname.startsWith("/categorias") || pathname.startsWith("/colecoes")
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

                {/* Dropdown Estruturado em 3 Colunas com Fundo 100% Sólido e Hover Bridge Sem Falhas */}
                {isExploreMenuOpen && (
                  <div className="absolute top-full left-0 pt-2 w-[530px] z-50 animate-fadeIn">
                    <div className="rounded-2xl bg-[#0c0e14] border border-[#2a3242] shadow-[0_25px_60px_rgba(0,0,0,0.95)] ring-1 ring-white/10 p-4 grid grid-cols-3 gap-4">
                      {/* Coluna 1: Plataformas */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-white/10 pb-1.5 flex items-center gap-1.5">
                          <Gamepad2 className="w-3.5 h-3.5" />
                          <span>Plataformas</span>
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
                              className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors truncate"
                            >
                              {p.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Coluna 2: Principais Gêneros */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-purple-400 border-b border-white/10 pb-1.5 flex items-center gap-1.5">
                          <Flame className="w-3.5 h-3.5" />
                          <span>Gêneros</span>
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
                              className="block px-2.5 py-1.5 rounded-lg text-xs font-medium text-neutral-300 hover:text-white hover:bg-white/10 transition-colors truncate"
                            >
                              {g.label}
                            </Link>
                          ))}
                        </div>
                      </div>

                      {/* Coluna 3: Coleções & Hubs Principais */}
                      <div className="space-y-2">
                        <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 border-b border-white/10 pb-1.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Hubs &amp; Coleções</span>
                        </div>
                        <div className="space-y-0.5">
                          <Link
                            href="/inventario-steam"
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-cyan-300 hover:text-white hover:bg-white/10 transition-colors truncate font-semibold"
                          >
                            <span>🎒 Inventário Steam &amp; Skins</span>
                          </Link>
                          <Link
                            href="/categorias"
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors truncate font-medium"
                          >
                            <Layers className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                            <span>Todas Categorias</span>
                          </Link>
                          <Link
                            href="/colecoes"
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors truncate font-medium"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>Coleções do Acervo</span>
                          </Link>
                          <Link
                            href="/search?q=dublado"
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="block px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors truncate font-medium"
                          >
                            🇧🇷 Dublados em PT-BR
                          </Link>
                          <Link
                            href="/rankings"
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="block px-2.5 py-1.5 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/10 transition-colors truncate font-medium"
                          >
                            ⭐ Top Metacritic
                          </Link>
                          <Link
                            href="/feedback"
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:text-white hover:bg-amber-500/15 transition-colors truncate font-bold"
                          >
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>💡 Ideias &amp; Votação</span>
                          </Link>
                          <Link
                            href="/search"
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="block px-2.5 py-1.5 rounded-lg text-xs text-[#00E5FF] font-bold hover:bg-[#00E5FF]/10 transition-colors mt-1"
                          >
                            Ver Catálogo →
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Lado Direito: Busca Spotlight & Área do Usuário */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 justify-end">
            {/* Botão de Busca Spotlight (Desktop - Cmd+K / Ctrl+K) */}
            <button
              onClick={() => openSpotlightSearch()}
              className="hidden md:flex items-center justify-between w-28 lg:w-36 xl:w-40 px-2.5 py-1.5 rounded-xl bg-[#13161f] hover:bg-[#181c27] border border-[#242a36] hover:border-[#384255] text-xs text-neutral-400 transition-all shadow-inner group cursor-pointer shrink-0"
              title="Buscar jogos no MyGameList (Atalho: ⌘K ou Ctrl+K)"
            >
              <div className="flex items-center gap-1.5 truncate">
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
                className="hidden 2xl:flex text-amber-300 hover:text-amber-200 transition-all items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-xs font-semibold shadow-sm flex-shrink-0"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>PRO</span>
              </Link>
            )}

            {/* Central de Notificações (Web Push & Cards In-App) */}
            <NotificationBell />

            {user ? (
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Menu Dropdown do Perfil */}
                <div
                  ref={userMenuRef}
                  className="relative"
                  onMouseEnter={handleOpenUserMenu}
                  onMouseLeave={handleCloseUserMenu}
                >
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-1.5 p-1 sm:p-1.5 sm:pr-2.5 rounded-full bg-white/10 border border-white/10 hover:border-white/30 transition-colors shrink-0 cursor-pointer"
                    title={`Menu do perfil de ${user.displayName}`}
                    aria-expanded={isUserMenuOpen}
                  >
                    <UserAvatar photoURL={user.photoURL} name={user.displayName} size="sm" />
                    <span className="text-xs font-semibold text-gray-200 max-w-[70px] sm:max-w-[85px] truncate hidden sm:inline">
                      {user.displayName}
                    </span>
                    <span className="hidden md:inline">
                      <PlanBadge plan={user.plan || "free"} size="sm" />
                    </span>
                    <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform hidden sm:inline ${isUserMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu Flutuante */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-[#101217] border border-white/15 p-2 shadow-2xl z-50 animate-fadeIn space-y-1">
                      {/* Cabeçalho do Usuário */}
                      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">
                            {user.displayName}
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono truncate">
                            @{user.username || "gamer"}
                          </p>
                        </div>
                        <PlanBadge plan={user.plan || "free"} size="sm" />
                      </div>

                      {/* Links do Menu */}
                      <div className="pt-1 space-y-0.5">
                        <Link
                          href={user.username ? getProfileUrl(user.username) : "/perfil"}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <User className="w-4 h-4 text-cyan-400" />
                          <span>Meu Perfil</span>
                        </Link>

                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            if (pathname?.startsWith("/perfil")) {
                              openGameImporter();
                            } else {
                              window.location.href = `${user.username ? getProfileUrl(user.username) : "/perfil"}?action=import`;
                            }
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/30 hover:bg-cyan-950/60 border border-[#00E5FF]/20 hover:border-[#00E5FF]/40 transition-colors text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5">
                            <Upload className="w-4 h-4 text-[#00E5FF]" />
                            <span>Importar Biblioteca</span>
                          </div>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF]">
                            NOVO
                          </span>
                        </button>

                        <Link
                          href="/inventario-steam"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-cyan-300" />
                          <span>Inventário Steam &amp; Skins</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            href="/admin"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4 text-amber-400" />
                            <span>Painel Admin</span>
                          </Link>
                        )}

                        <Link
                          href="/feedback"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                          <span>Ideias &amp; Reportar Bugs</span>
                        </Link>
                      </div>

                      {/* Botão Sair */}
                      <div className="pt-1 border-t border-white/10">
                        <button
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-400" />
                          <span>Sair da Conta</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

          {/* Painel Drawer Deslizante Estruturado e Confiável */}
          <aside
            className={`fixed top-0 right-0 bottom-0 w-[85vw] max-w-[340px] h-[100dvh] bg-[#0c0e13] border-l border-[#242a36] flex flex-col shadow-2xl z-[101] transform-gpu will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-label="Menu principal"
          >
            {/* Topo do Drawer: Fixo com Safe Area Superior e Botão Fechar */}
            <div className="shrink-0 px-4 pt-[max(env(safe-area-inset-top,0px)+10px,1rem)] pb-3 border-b border-[#242a36] flex items-center justify-between bg-[#0e1015]">
              <Logo size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-300 hover:text-white transition-all flex items-center justify-center border border-white/10 cursor-pointer"
                title="Fechar menu"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo Central Rolável com Suporte a Momentum Scrolling */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-3.5 no-scrollbar [-webkit-overflow-scrolling:touch]">
              {/* Perfil Compacto no Drawer */}
              {user ? (
                <div className="p-3 rounded-xl bg-[#14171e] border border-[#242a36] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar photoURL={user.photoURL} name={user.displayName} size="sm" />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-white truncate max-w-[130px]">
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

                  {/* Botão Rápido de Importar */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      if (pathname?.startsWith("/perfil")) {
                        openGameImporter();
                      } else {
                        window.location.href = `${user.username ? getProfileUrl(user.username) : "/perfil"}?action=import`;
                      }
                    }}
                    className="w-full mt-2 flex items-center justify-between px-3 py-2 rounded-xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-[#00E5FF]/25 text-xs font-bold text-cyan-300 transition-all active:scale-95 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-3.5 h-3.5 text-[#00E5FF]" />
                      <span>Importar Biblioteca</span>
                    </div>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF]">
                      NOVO
                    </span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsAuthOpen(true);
                  }}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md cursor-pointer"
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
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#14171e] border border-[#242a36] text-xs text-neutral-400 hover:text-white transition-all active:scale-95 cursor-pointer"
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
                  { href: "/feedback", label: "Ideias & Votação (Bugs)", icon: Lightbulb, color: "text-yellow-400" },
                  { href: "/search", label: "Explorar Catálogo", icon: Search, color: "text-cyan-400" },
                  { href: "/inventario-steam", label: "Inventário Steam & Skins", icon: Gamepad2, color: "text-cyan-300" },
                  { href: user?.username ? getProfileUrl(user.username) : "/perfil", label: "Meu Perfil & Jogos", icon: Trophy, color: "text-emerald-400" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href === "/" ? pathname === "/" : pathname === item.href || (item.label.includes("Perfil") && pathname?.startsWith("/perfil"));
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

              {/* Plataformas e Filtros Rápidos (Grade de 2 Colunas Legível) */}
              <div className="pt-1">
                <span className="text-[9px] uppercase font-mono font-bold text-neutral-400 tracking-wider px-2 block mb-1">
                  Plataformas &amp; Hubs
                </span>
                <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
                  {[
                    { label: "💻 PC Gamer", href: "/search?platform=PC" },
                    { label: "🎮 PlayStation 5", href: "/search?platform=PlayStation%205" },
                    { label: "🟢 Xbox Series", href: "/search?platform=Xbox%20Series" },
                    { label: "🔴 Switch", href: "/search?platform=Nintendo%20Switch" },
                    { label: "🕹️ Clássicos Retrô", href: "/search?platform=Retro" },
                    { label: "🇧🇷 Dublados PT-BR", href: "/search?q=dublado" },
                  ].map((cat) => (
                    <Link
                      key={cat.label}
                      href={cat.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="px-2.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-colors active:scale-95 text-left text-xs truncate"
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
                className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-95 cursor-pointer"
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

            {/* Rodapé Fixo do Drawer com Proteção de Safe Area Inferior */}
            <div className="shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom,0px)+12px,1rem)] border-t border-white/10 bg-[#0a0c10] space-y-2">
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

              <div className="flex items-center justify-center gap-3 text-[10px] text-neutral-400 pt-0.5">
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

