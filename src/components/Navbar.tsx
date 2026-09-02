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
  Clock,
  Heart,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isPremium } = useAuth();
  const { stats } = useGameLibrary();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Bloqueia scroll do body quando o menu drawer mobile estiver aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
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
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#121316]/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Barra de Pesquisa Central com Autocomplete ao Vivo (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <LiveSearchInput
              variant="navbar"
              placeholder="Buscar no IGDB (Elden Ring, GTA, Zelda...)"
            />
          </div>

          {/* Links de Navegação (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className={`transition-colors flex items-center gap-1.5 ${
                pathname === "/" ? "text-white font-bold" : "text-gray-300 hover:text-white"
              }`}
            >
              <Flame className="w-4 h-4 text-orange-400" />
              Início
            </Link>
            <Link
              href="/calendar"
              className={`transition-colors flex items-center gap-1.5 ${
                pathname === "/calendar" ? "text-white font-bold" : "text-gray-300 hover:text-white"
              }`}
            >
              <CalendarIcon className="w-4 h-4 text-[#00E5FF]" />
              Calendário
            </Link>
            <Link
              href="/rankings"
              className={`transition-colors flex items-center gap-1.5 ${
                pathname === "/rankings" ? "text-white font-bold" : "text-gray-300 hover:text-white"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Rankings
            </Link>
            <Link
              href="/profile"
              className={`transition-colors flex items-center gap-1.5 ${
                pathname === "/profile" ? "text-white font-bold" : "text-gray-300 hover:text-white"
              }`}
            >
              <Trophy className="w-4 h-4 text-emerald-400" />
              Meus Jogos
            </Link>
            {!isPremium && (
              <Link
                href="/planos"
                className="text-amber-300 hover:text-amber-200 transition-colors flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-xs font-semibold shadow-sm"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                Planos PRO
              </Link>
            )}
          </nav>

          {/* Área do Usuário & Controles Mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botão Visível de Instalar PWA no Mobile */}
            <button
              onClick={triggerPwaInstall}
              className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] hover:bg-[#00E5FF]/20 active:scale-95 transition-all text-xs font-bold shadow-sm"
              title="Instalar Aplicativo no Celular"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>App</span>
            </button>

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
          MENU MOBILE MODERNO: DRAWER LATERAL COM PORTAL NO BODY
      ========================================================= */}
      {mounted && isMobileMenuOpen && typeof document !== "undefined" && createPortal(
        <div className="lg:hidden fixed inset-0 z-[100] animate-fadeIn">
          {/* Overlay com Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Painel Drawer Deslizante */}
          <aside
            className="fixed top-0 right-0 bottom-0 w-[86%] max-w-sm h-full max-h-[100dvh] bg-[#111317] border-l border-white/15 p-5 flex flex-col justify-between overflow-y-auto pb-safe shadow-2xl z-[101] animate-slideInRight"
            aria-label="Menu principal"
          >
              {/* Topo do Drawer: Logo & Fechar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <Logo size="sm" />
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-full bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white transition-colors"
                    title="Fechar menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Card de Perfil do Usuário no Drawer */}
                {user ? (
                  <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserAvatar photoURL={user.photoURL} name={user.displayName} size="md" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate max-w-[140px]">
                            {user.displayName}
                          </h4>
                          <span className="text-[11px] text-[#00E5FF] font-mono block">
                            @{user.username || "gamer"}
                          </span>
                        </div>
                      </div>
                      <PlanBadge plan={user.plan || "free"} size="sm" />
                    </div>

                    {/* Resumo Rápido de Estatísticas */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center font-mono">
                      <div className="p-1.5 rounded-xl bg-white/5">
                        <div className="text-[10px] text-gray-400">Total</div>
                        <div className="text-xs font-bold text-white">{stats.totalGames}</div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-cyan-500/10 text-[#00E5FF]">
                        <div className="text-[10px] text-cyan-300">Zerados</div>
                        <div className="text-xs font-bold">{stats.completedCount}</div>
                      </div>
                      <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-300">
                        <div className="text-[10px] text-amber-200">Horas</div>
                        <div className="text-xs font-bold">{stats.totalPlaytimeHours}h</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/40 via-surface-100 to-[#18191c] border border-cyan-500/30 space-y-3">
                    <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                      <Gamepad2 className="w-4 h-4 text-[#00E5FF]" />
                      <span>Crie seu Perfil Gamer</span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-snug">
                      Salve seus jogos zerados, backlog e compartilhe suas notas com a comunidade.
                    </p>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setIsAuthOpen(true);
                      }}
                      className="w-full py-2.5 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold shadow-md transition-all active:scale-95"
                    >
                      Entrar ou Cadastrar
                    </button>
                  </div>
                )}

                {/* Card de Instalação PWA no Mobile Drawer */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-cyan-950/50 to-indigo-950/40 border border-[#00E5FF]/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#00E5FF]" />
                      <span className="text-xs font-bold text-white">App Mobile (PWA)</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-[#00E5FF]/20 text-[#00E5FF]">
                      RÁPIDO
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-300 leading-tight">
                    Tenha o GameVault direto na tela de início com tela cheia e offline.
                  </p>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      triggerPwaInstall();
                    }}
                    className="w-full py-2 rounded-full bg-[#00E5FF] hover:bg-cyan-300 text-black text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
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
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
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
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
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
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
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
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
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
                    className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
                      pathname === "/profile" ? "bg-white/10 text-white font-bold" : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span>Meu Perfil &amp; Biblioteca</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                  </Link>

                  {!isPremium && (
                    <Link
                      href="/planos"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium transition-all ${
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
                      className="flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-amber-300 hover:bg-amber-500/10 transition-colors"
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

