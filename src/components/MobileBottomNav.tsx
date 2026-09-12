"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Flame,
  Search,
  Gamepad2,
  Library,
  User as UserIcon,
  Plus,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import { getProfileUrl } from "@/lib/routes";
import UserAvatar from "./UserAvatar";
import AuthModal from "./AuthModal";
import MobileQuickActionSheet from "./MobileQuickActionSheet";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const profileHref = user?.username ? getProfileUrl(user.username) : "/perfil";
  const isProfileActive = pathname?.startsWith("/perfil") || (user?.username && pathname === `/perfil/${encodeURIComponent(user.username)}`);
  const isHomeActive = pathname === "/";
  const isSearchActive = pathname === "/search" || pathname?.startsWith("/categorias") || pathname?.startsWith("/colecoes");
  const isLibraryActive = pathname?.startsWith("/perfil") && (pathname.includes("secao=biblioteca") || pathname.includes("tab=all"));

  // Telas cheias que já possuem barra de ações fixa própria (ex.: editor de perfil)
  // não exibem a navegação inferior — senão ela cobre o rodapé com o botão Salvar.
  if (pathname?.startsWith("/perfil/editar")) return null;

  const handleProfileClick = (e: React.MouseEvent) => {
    triggerSelectionHaptic();
    if (!user) {
      e.preventDefault();
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <nav
        aria-label="Navegação móvel"
        className="vt-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 w-full bg-[#090b0f]/95 backdrop-blur-2xl border-t border-white/10 shadow-[0_-8px_32px_rgba(0,0,0,0.85)] pt-1.5 pb-[max(env(safe-area-inset-bottom,0px)+4px,10px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
      >
        <div className="max-w-md mx-auto px-3 flex items-center justify-between relative">
          {/* 1. Início */}
          <Link
            href="/"
            onClick={() => triggerSelectionHaptic()}
            className={`relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
              isHomeActive
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Flame
              className={`w-5 h-5 transition-transform duration-200 ${
                isHomeActive
                  ? "text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                  : "text-neutral-400"
              }`}
            />
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                isHomeActive ? "text-emerald-400 font-bold" : "text-neutral-400"
              }`}
            >
              Início
            </span>
            {isHomeActive && (
              <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            )}
          </Link>

          {/* 2. Buscar */}
          <Link
            href="/search"
            onClick={() => triggerSelectionHaptic()}
            className={`relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
              isSearchActive
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Search
              className={`w-5 h-5 transition-transform duration-200 ${
                isSearchActive
                  ? "text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                  : "text-neutral-400"
              }`}
            />
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                isSearchActive ? "text-emerald-400 font-bold" : "text-neutral-400"
              }`}
            >
              Buscar
            </span>
            {isSearchActive && (
              <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            )}
          </Link>

          {/* 3. BOTÃO CENTRAL: AÇÕES RÁPIDAS (Adicionar / Roleta / Importar) */}
          <div className="flex-1 flex items-center justify-center relative -top-3 z-50">
            <button
              onClick={() => {
                triggerSelectionHaptic();
                setIsActionSheetOpen(true);
              }}
              className="relative group flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 via-emerald-400 to-teal-300 text-black shadow-[0_4px_20px_rgba(16,185,129,0.5)] border-[3px] border-[#090b0f] active:scale-90 hover:scale-105 transition-all duration-200 cursor-pointer"
              title="Ações Rápidas"
              aria-label="Abrir menu de ações rápidas gamer"
            >
              <Plus className="w-6 h-6 text-black stroke-[2.8] group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>

          {/* 4. Biblioteca / Catálogo do Usuário */}
          <Link
            href={user ? `${profileHref}?secao=biblioteca` : "/search"}
            onClick={() => triggerSelectionHaptic()}
            className={`relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
              pathname?.startsWith("/rankings") || pathname?.startsWith("/calendar") || pathname?.startsWith("/inventario-steam")
                ? "text-neutral-400 hover:text-neutral-200"
                : isProfileActive && !isLibraryActive
                ? "text-neutral-400 hover:text-neutral-200"
                : isLibraryActive
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Library
              className={`w-5 h-5 transition-transform duration-200 ${
                isLibraryActive
                  ? "text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                  : "text-neutral-400"
              }`}
            />
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                isLibraryActive ? "text-emerald-400 font-bold" : "text-neutral-400"
              }`}
            >
              Biblioteca
            </span>
            {isLibraryActive && (
              <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            )}
          </Link>

          {/* 5. Perfil Nativo — Avatar Dinâmico ou Entrar */}
          <Link
            href={profileHref}
            onClick={handleProfileClick}
            className={`relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-2xl transition-all active:scale-95 touch-manipulation ${
              isProfileActive && !isLibraryActive
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {user ? (
              <div className="relative">
                <div
                  className={`w-6 h-6 rounded-full overflow-hidden transition-all duration-200 ${
                    isProfileActive && !isLibraryActive
                      ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#090b0f] scale-105"
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
              </div>
            ) : (
              <UserIcon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isProfileActive && !isLibraryActive
                    ? "text-emerald-400 scale-110 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]"
                    : "text-neutral-400"
                }`}
              />
            )}
            <span
              className={`text-[10px] font-medium tracking-tight mt-1 transition-colors max-w-[54px] truncate ${
                isProfileActive && !isLibraryActive
                  ? "text-emerald-400 font-bold"
                  : "text-neutral-400"
              }`}
            >
              {user ? "Perfil" : "Entrar"}
            </span>
            {isProfileActive && !isLibraryActive && (
              <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
            )}
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
