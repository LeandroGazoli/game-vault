"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Flame,
  Search,
  Trophy,
  Crown,
  Star,
  Gamepad2,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import { getProfileUrl } from "@/lib/routes";
import MobileQuickActionSheet from "./MobileQuickActionSheet";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user, isPremium } = useAuth();
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const profileHref = user?.username ? getProfileUrl(user.username) : "/perfil";

  return (
    <>
      <nav
        aria-label="Navegação móvel"
        className="vt-bottom-nav md:hidden fixed bottom-0 left-0 right-0 z-40 w-full bg-[#0b0d12]/95 backdrop-blur-2xl border-t border-[#1e2330] shadow-[0_-8px_30px_rgba(0,0,0,0.8)] pt-1.5 pb-[max(env(safe-area-inset-bottom,0px)+4px,12px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]"
      >
        <div className="max-w-md mx-auto px-2 flex items-center justify-between relative">
          {/* 1. Início */}
          <Link
            href="/"
            onClick={() => triggerSelectionHaptic()}
            className={`relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              pathname === "/"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Flame
              className={`w-5 h-5 transition-transform ${
                pathname === "/"
                  ? "text-orange-400 scale-110 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]"
                  : "text-neutral-400"
              }`}
            />
            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                pathname === "/" ? "text-white font-bold" : "text-neutral-400"
              }`}
            >
              Início
            </span>
            {pathname === "/" && (
              <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
            )}
          </Link>

          {/* 2. Buscar */}
          <Link
            href="/search"
            onClick={() => triggerSelectionHaptic()}
            className={`relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              pathname === "/search"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Search
              className={`w-5 h-5 transition-transform ${
                pathname === "/search"
                  ? "text-[#00E5FF] scale-110 drop-shadow-[0_0_8px_rgba(0,229,255,0.6)]"
                  : "text-neutral-400"
              }`}
            />
            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                pathname === "/search" ? "text-white font-bold" : "text-neutral-400"
              }`}
            >
              Buscar
            </span>
            {pathname === "/search" && (
              <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
            )}
          </Link>

          {/* 3. BOTÃO CENTRAL ELEVADO COM GAMEPAD GLOW (Inspirado no App Nativo) */}
          <div className="flex-1 flex items-center justify-center relative -top-3.5 z-50">
            <button
              onClick={() => {
                triggerSelectionHaptic();
                setIsActionSheetOpen(true);
              }}
              className="relative group flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-[#00E5FF] via-[#00c8e6] to-[#008ba3] text-black shadow-[0_4px_22px_rgba(0,229,255,0.6)] border-4 border-[#0b0d12] active:scale-90 hover:scale-105 transition-all duration-200 cursor-pointer"
              title="Ações Rápidas Gamer"
              aria-label="Abrir menu de ações rápidas gamer"
            >
              <Gamepad2 className="w-7 h-7 text-black fill-black/20 stroke-[2.2] group-hover:rotate-6 transition-transform" />
              {/* Anel pulsante de neon */}
              <span className="absolute inset-0 rounded-full border border-white/40 animate-pulse pointer-events-none" />
            </button>
          </div>

          {/* 4. Meus Jogos / Perfil */}
          <Link
            href={profileHref}
            onClick={() => triggerSelectionHaptic()}
            className={`relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              pathname?.startsWith("/perfil")
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Trophy
              className={`w-5 h-5 transition-transform ${
                pathname?.startsWith("/perfil")
                  ? "text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  : "text-neutral-400"
              }`}
            />
            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                pathname?.startsWith("/perfil") ? "text-white font-bold" : "text-neutral-400"
              }`}
            >
              Meus Jogos
            </span>
            {pathname?.startsWith("/perfil") && (
              <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
            )}
          </Link>

          {/* 5. PRO / Rankings */}
          <Link
            href={isPremium ? "/rankings" : "/planos"}
            onClick={() => triggerSelectionHaptic()}
            className={`relative flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 rounded-xl transition-all active:scale-95 touch-manipulation ${
              pathname === "/planos" || pathname === "/rankings"
                ? "text-white font-bold"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {isPremium ? (
              <Star
                className={`w-5 h-5 transition-transform ${
                  pathname === "/rankings"
                    ? "text-yellow-400 scale-110 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]"
                    : "text-neutral-400"
                }`}
              />
            ) : (
              <Crown
                className={`w-5 h-5 transition-transform ${
                  pathname === "/planos"
                    ? "text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                    : "text-neutral-400"
                }`}
              />
            )}
            <span
              className={`text-[10px] font-medium tracking-tight mt-0.5 ${
                pathname === "/planos" || pathname === "/rankings" ? "text-white font-bold" : "text-neutral-400"
              }`}
            >
              {isPremium ? "Rankings" : "PRO"}
            </span>
            {(pathname === "/planos" || pathname === "/rankings") && (
              <span className="absolute bottom-0.5 w-1.5 h-1.5 rounded-full bg-[#00E5FF] shadow-[0_0_6px_#00E5FF]" />
            )}
          </Link>
        </div>
      </nav>

      {/* Sheet de Ações Rápidas Aberto pelo Botão Gamer Central */}
      <MobileQuickActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
      />
    </>
  );
}
