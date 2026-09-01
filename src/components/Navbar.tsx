"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import AuthModal from "./AuthModal";
import {
  Gamepad2,
  Search,
  Trophy,
  User,
  LogOut,
  Flame,
  Clock,
  Sparkles,
  Menu,
  X,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const { user, logout, isDemoMode } = useAuth();
  const { stats } = useGameLibrary();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-gray-800/80 bg-surface-50/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-tight text-white flex items-center gap-1">
                Game<span className="text-indigo-400">Vault</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 font-mono -mt-1">
                Gamer Profile
              </span>
            </div>
          </Link>

          {/* Barra de Pesquisa */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-md relative"
          >
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar qualquer jogo (Elden Ring, God of War, Zelda...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-100/90 border border-gray-800 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:bg-surface-200 focus:outline-none transition-all"
            />
          </form>

          {/* Links de Navegação */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-orange-400" />
              Populares
            </Link>
            <Link
              href="/search"
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Search className="w-4 h-4 text-indigo-400" />
              Explorar
            </Link>
            <Link
              href="/profile"
              className="text-gray-300 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-emerald-400" />
              Meu Perfil ({stats.completedCount} zerados)
            </Link>
          </nav>

          {/* Área do Usuário */}
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-surface-100 border border-gray-800 hover:border-indigo-500/50 transition-colors"
                >
                  <img
                    src={
                      user.photoURL ||
                      "https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150&auto=format&fit=crop&q=80"
                    }
                    alt={user.displayName}
                    className="w-7 h-7 rounded-full object-cover border border-indigo-500/40"
                  />
                  <span className="text-xs font-semibold text-gray-200 max-w-[100px] truncate">
                    {user.displayName}
                  </span>
                </Link>

                <button
                  onClick={() => logout()}
                  title="Sair"
                  className="p-2 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-surface-100 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
              >
                <User className="w-3.5 h-3.5" />
                Entrar / Perfil
              </button>
            )}

            {/* Menu Mobile */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-800 bg-surface-50 p-4 space-y-3">
            <form onSubmit={handleSearchSubmit} className="relative mb-3">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Buscar jogos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface-100 border border-gray-800 text-sm text-white placeholder-gray-500 focus:outline-none"
              />
            </form>

            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm text-gray-300 hover:text-white"
            >
              <Flame className="w-4 h-4 text-orange-400" /> Populares
            </Link>
            <Link
              href="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm text-gray-300 hover:text-white"
            >
              <Search className="w-4 h-4 text-indigo-400" /> Explorar Todos
            </Link>
            <Link
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 py-2 text-sm text-gray-300 hover:text-white"
            >
              <Trophy className="w-4 h-4 text-emerald-400" /> Meu Perfil
            </Link>
          </div>
        )}
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
