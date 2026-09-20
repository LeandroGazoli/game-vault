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
import { Button } from "@/components/ui/button";

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
            <nav className="hidden lg:flex items-center gap-1.5 ml-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={`transition-all font-semibold ${
                  pathname === "/"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Link href="/">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Início</span>
                </Link>
              </Button>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={`transition-all font-semibold ${
                  pathname === "/search"
                    ? "bg-white/10 text-white border border-white/15"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Link href="/search">
                  <Gamepad2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Catálogo</span>
                </Link>
              </Button>
            </nav>
          </div>

          {/* 2. Centro: Barra de Busca Centralizada */}
          <NavSearchBar />

          {/* 3. Lado Direito: Notificações, PRO, Perfil e Botão Menu Drawer */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {!isPremium && (
              <Button
                asChild
                size="sm"
                className="hidden md:inline-flex text-amber-300 hover:text-amber-200 transition-all rounded-full bg-gradient-to-r from-amber-500/15 to-emerald-500/10 border border-amber-500/30 hover:border-amber-500/60 text-xs font-bold shadow-sm shrink-0"
              >
                <Link href="/planos">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>PRO</span>
                </Link>
              </Button>
            )}

            {/* Sininho de Notificações */}
            <NotificationBell />

            {/* Menu Dropdown de Perfil (Desktop/Tablet) */}
            <div className="hidden sm:block">
              <NavUserMenu onOpenAuth={() => setIsAuthOpen(true)} />
            </div>

            {/* Botão Hambúrguer para abrir o Drawer de Navegação */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              className="rounded-xl bg-white/5 hover:bg-white/10 border-white/10 text-gray-300 hover:text-white active:scale-95 transition-all cursor-pointer shrink-0 max-sm:h-11 max-sm:w-11 max-sm:p-0"
              title="Abrir menu de navegação"
              aria-label="Abrir menu de navegação"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              <span className="hidden lg:inline text-xs font-semibold text-neutral-300">Menu</span>
            </Button>
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
