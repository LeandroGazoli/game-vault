"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Flame,
  Search,
  Plus,
  Trophy,
  User as UserIcon,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import { getProfileUrl } from "@/lib/routes";
import UserAvatar from "./UserAvatar";
import AuthModal from "./AuthModal";
import MobileQuickActionSheet from "./MobileQuickActionSheet";
import LiquidNavIndicator from "./navigation/LiquidNavIndicator";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLElement | null)[]>([]);

  const profileHref = user?.username ? getProfileUrl(user.username) : "/perfil";

  // Determina o índice ativo com base na rota atual (0 a 4)
  const getRouteIndex = useCallback((): number => {
    if (isActionSheetOpen) return 2;
    if (!pathname || pathname === "/") return 0;
    if (
      pathname === "/search" ||
      pathname.startsWith("/categorias") ||
      pathname.startsWith("/colecoes")
    ) {
      return 1;
    }
    if (
      pathname.startsWith("/rankings") ||
      pathname.startsWith("/calendar") ||
      pathname.startsWith("/conquistas")
    ) {
      return 3;
    }
    if (
      pathname.startsWith("/perfil") ||
      pathname.startsWith("/profile")
    ) {
      return 4;
    }
    return -1;
  }, [isActionSheetOpen, pathname]);

  const routeIndex = getRouteIndex();
  const [activeIndex, setActiveIndex] = useState<number>(0);

  useEffect(() => {
    if (routeIndex !== -1) {
      setActiveIndex(routeIndex);
    }
  }, [routeIndex]);

  // Se a rota for o editor de perfil, oculta a barra inferior
  if (pathname?.startsWith("/perfil/editar")) return null;

  const handleProfileClick = (e: React.MouseEvent) => {
    triggerSelectionHaptic();
    setActiveIndex(4);
    if (!user) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };

  const handleTabClick = (index: number) => {
    triggerSelectionHaptic();
    setActiveIndex(index);
  };

  return (
    <>
      <nav
        aria-label="Navegação móvel"
        className="vt-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 w-full bg-[#090b0f]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.85)] pt-2 pb-[max(env(safe-area-inset-bottom,0px)+4px,10px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
      >
        <div
          ref={containerRef}
          className="max-w-md mx-auto px-2 flex items-center justify-between relative"
        >
          {/* Indicador Líquido com GSAP e Filtro SVG Gooey */}
          <LiquidNavIndicator
            activeIndex={activeIndex}
            tabRefs={tabRefs}
            containerRef={containerRef}
          />

          {/* 1. Início */}
          <Link
            href="/"
            ref={(el) => { tabRefs.current[0] = el; }}
            onClick={() => handleTabClick(0)}
            className="group relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-2xl active:scale-95 transition-transform duration-200 touch-manipulation z-10 cursor-pointer"
          >
            <div
              className={`relative transition-transform duration-300 ease-out ${
                activeIndex === 0 ? "-translate-y-2.5 scale-110" : "translate-y-0 scale-100"
              }`}
            >
              <Flame
                className={`w-5 h-5 transition-colors duration-200 ${
                  activeIndex === 0
                    ? "text-[#06140e] stroke-[2.8] drop-shadow-sm"
                    : "text-neutral-400 group-hover:text-neutral-200"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-all duration-200 select-none ${
                activeIndex === 0 ? "text-emerald-400 font-bold scale-105" : "text-neutral-400"
              }`}
            >
              Início
            </span>
          </Link>

          {/* 2. Buscar */}
          <Link
            href="/search"
            ref={(el) => { tabRefs.current[1] = el; }}
            onClick={() => handleTabClick(1)}
            className="group relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-2xl active:scale-95 transition-transform duration-200 touch-manipulation z-10 cursor-pointer"
          >
            <div
              className={`relative transition-transform duration-300 ease-out ${
                activeIndex === 1 ? "-translate-y-2.5 scale-110" : "translate-y-0 scale-100"
              }`}
            >
              <Search
                className={`w-5 h-5 transition-colors duration-200 ${
                  activeIndex === 1
                    ? "text-[#06140e] stroke-[2.8] drop-shadow-sm"
                    : "text-neutral-400 group-hover:text-neutral-200"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-all duration-200 select-none ${
                activeIndex === 1 ? "text-emerald-400 font-bold scale-105" : "text-neutral-400"
              }`}
            >
              Buscar
            </span>
          </Link>

          {/* 3. Ações Rápidas (Adicionar Jogo / Roleta / Importar) */}
          <button
            type="button"
            ref={(el) => { tabRefs.current[2] = el; }}
            onClick={() => {
              handleTabClick(2);
              setIsActionSheetOpen(true);
            }}
            className="group relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-2xl active:scale-95 transition-transform duration-200 touch-manipulation z-10 cursor-pointer"
            aria-label="Abrir menu de ações rápidas gamer"
          >
            <div
              className={`relative transition-transform duration-300 ease-out ${
                activeIndex === 2 ? "-translate-y-2.5 scale-110" : "translate-y-0 scale-100"
              }`}
            >
              {activeIndex === 2 ? (
                <Plus className="w-5 h-5 text-[#06140e] stroke-[3] drop-shadow-sm" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                  <Plus className="w-3.5 h-3.5 stroke-[2.8]" />
                </div>
              )}
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-all duration-200 select-none ${
                activeIndex === 2 ? "text-emerald-400 font-bold scale-105" : "text-neutral-400"
              }`}
            >
              Ações
            </span>
          </button>

          {/* 4. Rankings (Hall da Fama & Votações) */}
          <Link
            href="/rankings"
            ref={(el) => { tabRefs.current[3] = el; }}
            onClick={() => handleTabClick(3)}
            className="group relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-2xl active:scale-95 transition-transform duration-200 touch-manipulation z-10 cursor-pointer"
          >
            <div
              className={`relative transition-transform duration-300 ease-out ${
                activeIndex === 3 ? "-translate-y-2.5 scale-110" : "translate-y-0 scale-100"
              }`}
            >
              <Trophy
                className={`w-5 h-5 transition-colors duration-200 ${
                  activeIndex === 3
                    ? "text-[#06140e] stroke-[2.8] drop-shadow-sm"
                    : "text-neutral-400 group-hover:text-neutral-200"
                }`}
              />
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-all duration-200 select-none ${
                activeIndex === 3 ? "text-emerald-400 font-bold scale-105" : "text-neutral-400"
              }`}
            >
              Rankings
            </span>
          </Link>

          {/* 5. Perfil Gamer Nativo */}
          <Link
            href={profileHref}
            ref={(el) => { tabRefs.current[4] = el; }}
            onClick={handleProfileClick}
            className="group relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-2xl active:scale-95 transition-transform duration-200 touch-manipulation z-10 cursor-pointer"
          >
            <div
              className={`relative transition-transform duration-300 ease-out ${
                activeIndex === 4 ? "-translate-y-2.5 scale-110" : "translate-y-0 scale-100"
              }`}
            >
              {user ? (
                <div
                  className={`w-6 h-6 rounded-full overflow-hidden transition-all duration-200 ${
                    activeIndex === 4
                      ? "ring-2 ring-[#090b0f] shadow-sm"
                      : "ring-1 ring-white/20 opacity-80"
                  }`}
                >
                  <UserAvatar
                    photoURL={user.photoURL}
                    name={user.displayName}
                    size="xs"
                    className="w-full h-full rounded-full"
                  />
                </div>
              ) : (
                <UserIcon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    activeIndex === 4
                      ? "text-[#06140e] stroke-[2.8] drop-shadow-sm"
                      : "text-neutral-400 group-hover:text-neutral-200"
                  }`}
                />
              )}
            </div>
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-all duration-200 max-w-[54px] truncate select-none ${
                activeIndex === 4 ? "text-emerald-400 font-bold scale-105" : "text-neutral-400"
              }`}
            >
              {user ? "Perfil" : "Entrar"}
            </span>
          </Link>
        </div>
      </nav>

      {/* Sheet de Ações Rápidas Aberto pelo Botão Central */}
      <MobileQuickActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
      />

      {/* Modal de Autenticação disparado ao tocar em "Entrar" */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
