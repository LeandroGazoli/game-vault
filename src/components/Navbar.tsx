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
            <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2 text-sm font-medium">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                  pathname === "/"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Flame className="w-4 h-4 text-orange-400" />
                Início
              </Link>
              <Link
                href="/calendar"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                  pathname === "/calendar"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <CalendarIcon className="w-4 h-4 text-[#00E5FF]" />
                Calendário
              </Link>
              <Link
                href="/rankings"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                  pathname === "/rankings"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                Rankings
              </Link>
              <Link
                href="/profile"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap text-xs font-semibold ${
                  pathname === "/profile"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Trophy className="w-4 h-4 text-emerald-400" />
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
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold cursor-pointer ${
                    isExploreMenuOpen || pathname === "/search"
                      ? "bg-white/10 text-white border border-white/15"
                      : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Gamepad2 className="w-4 h-4 text-cyan-400" />
                  <span>Explorar</span>
                  <ChevronDown
                    className={`w-3 h-3 text-neutral-400 transition-transform ${
                      isExploreMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Estruturado em 3 Colunas */}
                {isExploreMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-[520px] rounded-2xl bg-[#0f1218]/98 border border-[#262d3a] shadow-2xl p-4 grid grid-cols-3 gap-4 backdrop-blur-2xl animate-fadeIn z-50">
                    {/* Coluna 1: Plataformas */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 border-b border-white/5 pb-1">
                        Plataformas
                      </div>
                      <div className="space-y-0.5">
                        {[
                          { label: "PC Gamer", query: "PC" },
                          { label: "PlayStation 5", query: "PlayStation 5" },
                          { label: "Xbox Series", query: "Xbox Series" },
                          { label: "Nintendo Switch", query: "Nintendo Switch" },
                          { label: "Retrô & Clássicos", query: "Retro" },
                        ].map((p) => (
                          <Link
                            key={p.label}
                            href={`/search?platform=${encodeURIComponent(p.query)}`}
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {p.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Coluna 2: Gêneros */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 border-b border-white/5 pb-1">
                        Gêneros
                      </div>
                      <div className="space-y-0.5">
                        {[
                          { label: "RPG / Aventura", query: "Role-playing (RPG)" },
                          { label: "Ação & Luta", query: "Action" },
                          { label: "Tiro & FPS", query: "Shooter" },
                          { label: "Estratégia", query: "Strategy" },
                          { label: "Terror & Horror", query: "Horror" },
                        ].map((g) => (
                          <Link
                            key={g.label}
                            href={`/search?genre=${encodeURIComponent(g.query)}`}
                            onClick={() => setIsExploreMenuOpen(false)}
                            className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                          >
                            {g.label}
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Coluna 3: Listas Especiais */}
                    <div className="space-y-1.5">
                      <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 border-b border-white/5 pb-1">
                        Listas Especiais
                      </div>
                      <div className="space-y-0.5">
                        <Link
                          href="/search?q=dublado"
                          onClick={() => setIsExploreMenuOpen(false)}
                          className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          🇧🇷 Dublados em PT-BR
                        </Link>
                        <Link
                          href="/rankings"
                          onClick={() => setIsExploreMenuOpen(false)}
                          className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          ⭐ Top Metacritic
                        </Link>
                        <Link
                          href="/calendar"
                          onClick={() => setIsExploreMenuOpen(false)}
                          className="block px-2 py-1 rounded-lg text-xs text-neutral-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          📅 Calendário 2026
                        </Link>
                        <Link
                          href="/search"
                          onClick={() => setIsExploreMenuOpen(false)}
                          className="block px-2 py-1 rounded-lg text-xs text-[#00E5FF] font-bold hover:bg-[#00E5FF]/10 transition-colors mt-1"
                        >
                          Ver Catálogo Completo →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          </div>

          {/* Lado Direito: Barra de Pesquisa Destacada & Área do Usuário */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-end">
            {/* Barra de Pesquisa Destacada com Autocomplete ao Vivo (Desktop) */}
            <div className="hidden md:flex w-52 lg:w-64 xl:w-72 2xl:w-80 focus-within:w-72 lg:focus-within:w-80 xl:focus-within:w-96 transition-all duration-300">
              <LiveSearchInput
                variant="navbar"
                placeholder="Buscar jogos (God of War, GTA...)"
              />
            </div>

            {!isPremium && (
              <Link
                href="/planos"
                className="hidden xl:flex text-amber-300 hover:text-amber-200 transition-all items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-xs font-semibold shadow-sm flex-shrink-0"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Planos PRO</span>
              </Link>
            )}

            {user ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1.5 pr-2.5 sm:pr-3 rounded-full bg-white/10 border border-white/10 hover:border-white/30 transition-colors"
                >
                  <UserAvatar photoURL={user.photoURL} name={user.displayName} size="sm" />
                  <span className="text-xs font-semibold text-gray-200 max-w-[70px] sm:max-w-[90px] truncate">
                    {user.displayName}
                  </span>
                  <PlanBadge plan={user.plan || "free"} size="sm" />
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-xs font-semibold text-amber-300 transition-colors shadow-sm"
                    title="Acessar Painel do Administrador"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin</span>
                  </Link>
                )}

                <button
                  onClick={() => logout()}
                  title="Sair"
                  className="hidden sm:flex p-2 rounded-full text-gray-400 hover:text-rose-400 hover:bg-white/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <User className="w-3.5 h-3.5" />
                <span>Entrar</span>
              </button>
            )}

            {/* Botão Hambúrguer para abrir Drawer Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white active:scale-95 transition-colors"
              aria-label="Abrir menu de navegação"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          MENU MOBILE MODERNO: DRAWER LATERAL COM GPU ACCELERATION
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

          {/* Painel Drawer Deslizante com aceleração por hardware GPU (transform-gpu) */}
          <aside
            className={`fixed top-0 right-0 bottom-0 w-[86%] max-w-sm h-full max-h-[100dvh] bg-[#0c0e13] border-l border-[#242a36] px-5 pt-[max(env(safe-area-inset-top,0px)+12px,1.5rem)] pb-[max(env(safe-area-inset-bottom,0px)+16px,2rem)] flex flex-col justify-between overflow-y-auto shadow-2xl z-[101] transform-gpu will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            }`}
            aria-label="Menu principal"
          >
              {/* Topo do Drawer: Logo & Fechar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#242a36]">
                  <Logo size="sm" />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors border border-transparent hover:border-white/10"
                    title="Fechar menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Card de Perfil do Usuário no Drawer */}
                {user ? (
                  <div className="p-3.5 rounded-xl bg-[#14171e] border border-[#242a36] space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar photoURL={user.photoURL} name={user.displayName} size="md" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate max-w-[140px]">
                            {user.displayName}
                          </h4>
                          <span className="text-[11px] text-neutral-400 font-mono block">
                            @{user.username || "gamer"}
                          </span>
                        </div>
                      </div>
                      <PlanBadge plan={user.plan || "free"} size="sm" />
                    </div>

                    {/* Resumo Rápido de Estatísticas */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#242a36] text-center font-mono">
                      <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                        <div className="text-[10px] text-neutral-400">Total</div>
                        <div className="text-xs font-bold text-white tabular-nums">{stats.totalGames}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                        <div className="text-[10px] text-emerald-300">Zerados</div>
                        <div className="text-xs font-bold tabular-nums">{stats.completedCount}</div>
                      </div>
                      <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
                        <div className="text-[10px] text-amber-200">Horas</div>
                        <div className="text-xs font-bold tabular-nums">{stats.totalPlaytimeHours}h</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#14171e] border border-[#242a36] space-y-3">
                    <div className="flex items-center gap-2 text-white text-xs font-bold">
                      <Gamepad2 className="w-4 h-4 text-[#00E5FF]" />
                      <span>Crie seu Perfil Gamer</span>
                    </div>
                    <p className="text-[11px] text-neutral-400 leading-snug">
                      Salve seus jogos zerados, backlog e compartilhe suas notas com a comunidade.
                    </p>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsAuthOpen(true);
                      }}
                      className="w-full py-2.5 rounded-lg bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all active:scale-95"
                    >
                      Entrar ou Cadastrar
                    </button>
                  </div>
                )}

                {/* Card de Instalação PWA no Mobile Drawer */}
                <div className="p-3.5 rounded-xl bg-[#14171e] border border-[#242a36] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#00E5FF]" />
                      <span className="text-xs font-bold text-white">App Mobile (PWA)</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-[#00E5FF]/10 text-[#00E5FF] border border-[#00E5FF]/20">
                      RÁPIDO
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-tight">
                    Tenha o GameVault direto na tela de início com tela cheia e offline.
                  </p>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      triggerPwaInstall();
                    }}
                    className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Instalar Aplicativo
                  </button>
                </div>

                {/* Busca ao Vivo no Drawer */}
                <div className="pt-1">
                  <LiveSearchInput
                    variant="navbar"
                    placeholder="Buscar jogos no IGDB..."
                  />
                </div>

                {/* Links de Navegação Estruturados */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-2">
                    Navegação
                  </span>

                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all active:scale-[0.98] min-h-[44px] ${
                      pathname === "/" ? "bg-white/10 text-white font-bold" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Flame className="w-4 h-4 text-orange-400" />
                      <span>Início &amp; Destaques</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </Link>

                  <Link
                    href="/search"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all active:scale-[0.98] min-h-[44px] ${
                      pathname === "/search" ? "bg-white/10 text-white font-bold" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Search className="w-4 h-4 text-[#00E5FF]" />
                      <span>Explorar Catálogo Completo</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </Link>

                  <Link
                    href="/calendar"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all active:scale-[0.98] min-h-[44px] ${
                      pathname === "/calendar" ? "bg-white/10 text-white font-bold" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <CalendarIcon className="w-4 h-4 text-cyan-400" />
                      <span>Calendário de Lançamentos</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </Link>

                  <Link
                    href="/rankings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all active:scale-[0.98] min-h-[44px] ${
                      pathname === "/rankings" ? "bg-white/10 text-white font-bold" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Rankings da Comunidade</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </Link>

                  <Link
                    href="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all active:scale-[0.98] min-h-[44px] ${
                      pathname === "/profile" ? "bg-white/10 text-white font-bold" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span>Meu Perfil &amp; Biblioteca</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </Link>

                  {/* Taxonomia & Filtros Rápidos no Mobile */}
                  <div className="pt-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider px-2">
                      Categorias &amp; Plataformas
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 pt-1.5 font-mono text-[11px]">
                      {[
                        { label: "💻 PC Gamer", href: "/search?platform=PC" },
                        { label: "🎮 PS5", href: "/search?platform=PlayStation%205" },
                        { label: "🟢 Xbox Series", href: "/search?platform=Xbox%20Series" },
                        { label: "🔴 Switch", href: "/search?platform=Nintendo%20Switch" },
                        { label: "⚔️ RPGs", href: "/search?genre=Role-playing%20(RPG)" },
                        { label: "🇧🇷 Dublados", href: "/search?q=dublado" },
                      ].map((cat) => (
                        <Link
                          key={cat.label}
                          href={cat.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="px-2.5 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-colors active:scale-95 text-left"
                        >
                          {cat.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {!isPremium && (
                    <Link
                      href="/planos"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3 rounded-xl text-xs font-medium transition-all active:scale-[0.98] min-h-[44px] ${
                        pathname === "/planos" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-amber-300 hover:bg-amber-500/10"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Assinatura Planos PRO</span>
                      </div>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-black">
                        VIP
                      </span>
                    </Link>
                  )}

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition-colors active:scale-[0.98] min-h-[44px]"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShieldCheck className="w-4 h-4 text-amber-400" />
                        <span>Painel do Administrador</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-500" />
                    </Link>
                  )}
                </div>
              </div>

              {/* Rodapé do Drawer: Links e Logout */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <Link
                    href="/sobre"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-white transition-colors"
                  >
                    Sobre
                  </Link>
                  <span>•</span>
                  <Link
                    href="/termos"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-white transition-colors"
                  >
                    Termos
                  </Link>
                  <span>•</span>
                  <Link
                    href="/privacidade"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-white transition-colors"
                  >
                    Privacidade
                  </Link>
                </div>

                {user && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair da Conta
                  </button>
                )}

                <div className="text-center text-[10px] text-gray-500 font-mono">
                  GameVault • PWA Offline Ready
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

