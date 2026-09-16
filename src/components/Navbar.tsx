"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Logo from "./Logo";
import AuthModal from "./AuthModal";
import NotificationBell from "./notifications/NotificationBell";
import NavSearchBar from "./navigation/NavSearchBar";
import NavUserMenu from "./navigation/NavUserMenu";
import NavDrawer from "./navigation/NavDrawer";
import {
  Flame,
  Gamepad2,
  Menu,
  Crown,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { isPremium } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Fecha o drawer automaticamente ao mudar de página
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="vt-header sticky top-0 z-40 w-full border-b border-[#242a36] bg-[#0c0e13]/95 backdrop-blur-xl pt-safe">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pl-[max(env(safe-area-inset-left,0px),0.75rem)] pr-[max(env(safe-area-inset-right,0px),0.75rem)] h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* 1. Lado Esquerdo: Logo & Links Primários */}
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/" className="shrink-0">
              <Logo size="md" />
            </Link>

            {/* Links Rápidos Essenciais (Desktop) */}
            <nav className="hidden lg:flex items-center gap-1 ml-2 text-xs font-semibold">
              <Link
                href="/"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  pathname === "/"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>Início</span>
              </Link>
              <Link
                href="/search"
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  pathname === "/search"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Catálogo</span>
              </Link>
            </nav>
          </div>

          {/* 2. Centro: Barra de Busca Centralizada */}
          <NavSearchBar />

          {/* 3. Lado Direito: Notificações, PRO, Perfil e Botão Menu Drawer */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isPremium && (
              <Link
                href="/planos"
                className="hidden xl:flex text-amber-300 hover:text-amber-200 transition-all items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/60 text-xs font-semibold shadow-sm shrink-0"
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>PRO</span>
              </Link>
            )}

            {/* Sininho de Notificações */}
            <NotificationBell />

            {/* Menu Dropdown de Perfil (Desktop/Tablet) */}
            <div className="hidden sm:block">
              <NavUserMenu onOpenAuth={() => setIsAuthOpen(true)} />
            </div>

            {/* Botão Hambúrguer para abrir o Drawer de Navegação */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
              title="Abrir menu de navegação"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-4 h-4 sm:w-4 sm:h-4 text-emerald-400" />
              <span className="hidden lg:inline text-xs font-semibold text-neutral-300">Menu</span>
            </button>
          </div>

        </div>
      </header>

      {/* Drawer Lateral Unificado */}
      <NavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Modal de Autenticação */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
