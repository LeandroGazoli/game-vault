"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "../UserAvatar";
import PlanBadge from "../PlanBadge";
import { triggerPwaInstall } from "../PwaInstallPrompt";
import { getProfileUrl } from "@/lib/routes";
import { trackSignUpClick } from "@/lib/analytics";
import {
  User,
  Trophy,
  Upload,
  Sparkles,
  ShieldCheck,
  Crown,
  Download,
  Lightbulb,
  LogOut,
  ChevronDown,
} from "lucide-react";

export function openGameImporter() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("open-game-importer"));
  }
}

interface NavUserMenuProps {
  onOpenAuth: () => void;
}

export default function NavUserMenu({ onOpenAuth }: NavUserMenuProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin, isPremium, isLoading } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpen = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center gap-1.5 p-1 rounded-full bg-white/5 border border-white/10 shrink-0 animate-pulse">
        <div className="w-7 h-7 rounded-full bg-white/15 shrink-0" />
        <div className="w-16 h-3 rounded-full bg-white/15 hidden md:block" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={() => {
          trackSignUpClick("navbar_header_cta");
          onOpenAuth();
        }}
        className="flex h-8 sm:h-9 px-3 sm:px-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-extrabold items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 shrink-0 cursor-pointer"
        title="Entrar ou cadastrar-se"
      >
        <User className="w-3.5 h-3.5 text-black" />
        <span className="hidden sm:inline">Entrar</span>
      </button>
    );
  }

  const profileHref = user.username ? getProfileUrl(user.username) : "/perfil";

  return (
    <div
      ref={menuRef}
      className="relative shrink-0"
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 p-1 pr-2 rounded-full bg-white/5 border border-white/10 hover:border-emerald-500/40 hover:bg-white/10 transition-all cursor-pointer"
        title={`Menu de ${user.displayName}`}
        aria-expanded={isOpen}
      >
        <UserAvatar photoURL={user.photoURL} name={user.displayName} size="sm" />
        <span className="text-xs font-semibold text-gray-200 max-w-[80px] truncate hidden md:inline">
          {user.displayName}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-gray-400 transition-transform hidden sm:inline ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-60 rounded-2xl bg-[#0c0e14] border border-[#2a3242] p-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fadeIn space-y-1">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.displayName}</p>
              <p className="text-[10px] text-gray-400 font-mono truncate">@{user.username || "gamer"}</p>
            </div>
            <PlanBadge plan={user.plan || "free"} size="sm" />
          </div>

          <div className="py-1 space-y-0.5">
            <Link
              href={profileHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Meu Perfil</span>
            </Link>

            <Link
              href={user.username ? `/perfil/${encodeURIComponent(user.username)}/conquistas` : "/conquistas"}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-amber-300 hover:text-white hover:bg-amber-500/15 transition-colors"
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Conquistas & Missões</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (pathname?.startsWith("/perfil")) {
                  openGameImporter();
                } else {
                  window.location.href = `${profileHref}?action=import`;
                }
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300 hover:text-white bg-cyan-950/30 hover:bg-cyan-950/60 border border-[#00E5FF]/20 hover:border-[#00E5FF]/40 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Upload className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Importar Biblioteca</span>
              </div>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#00E5FF]/20 text-[#00E5FF]">NOVO</span>
            </button>

            <Link
              href="/inventario-steam"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Inventário Steam & Skins</span>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Painel Admin</span>
              </Link>
            )}

            {!isPremium && (
              <Link
                href="/planos"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Seja PRO</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-mono">UPGRADE</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                triggerPwaInstall();
              }}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Instalar App PWA</span>
              </div>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-[#00E5FF]">APP</span>
            </button>
          </div>

          <div className="pt-1 border-t border-white/10">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sair da Conta</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
