"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import Logo from "../Logo";
import UserAvatar from "../UserAvatar";
import PlanBadge from "../PlanBadge";
import { triggerPwaInstall } from "../PwaInstallPrompt";
import { getProfileUrl } from "@/lib/routes";
import {
  X,
  User,
  Gamepad2,
  Calendar as CalendarIcon,
  Sparkles,
  Trophy,
  BookOpen,
  Lightbulb,
  ShieldCheck,
  LogOut,
  Smartphone,
  ChevronRight,
} from "lucide-react";

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAuth: () => void;
}

export default function NavDrawer({ isOpen, onClose, onOpenAuth }: NavDrawerProps) {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuth();
  const { stats } = useGameLibrary();

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  // O portal não pode existir no PRIMEIRO render do cliente.
  //
  // `typeof document === "undefined"` só protege o servidor. Na hidratação o document já
  // existe, então o React injetava esta <div> em document.body — um nó que não estava no
  // HTML do servidor. Resultado: "server rendered HTML didn't match the client" (#418), e o
  // React descartava a árvore inteira para remontar.
  //
  // Diferente dos outros portais do projeto, este não pode sair com `!isOpen`: a <div> fica
  // montada de propósito, com `opacity-0`, para a transição de abrir/fechar funcionar.
  // Por isso a flag de montagem.
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  if (!montado || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ease-out ${
        isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide Drawer Panel */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-[88vw] max-w-[350px] h-[100dvh] bg-[#0c0e14] border-l border-[#242a36] flex flex-col shadow-2xl z-[101] transform-gpu will-change-transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-label="Menu principal de navegação"
      >
        {/* Header do Drawer */}
        <div className="shrink-0 px-4 pt-[max(env(safe-area-inset-top,0px)+12px,1rem)] pb-3 border-b border-[#242a36] flex items-center justify-between bg-[#0e1017]">
          <Logo size="sm" />
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 text-neutral-400 hover:text-white transition-all flex items-center justify-center border border-white/10 cursor-pointer"
            title="Fechar menu"
            aria-label="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 space-y-4 no-scrollbar [-webkit-overflow-scrolling:touch]">
          {/* Card de Usuário / Login */}
          {user ? (
            <Link
              href={user.username ? getProfileUrl(user.username) : "/perfil"}
              onClick={onClose}
              className="block p-3 rounded-2xl bg-[#141822] border border-white/10 hover:border-emerald-500/40 transition-all space-y-2 active:scale-[0.98] group"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar photoURL={user.photoURL} name={user.displayName} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-bold text-white truncate max-w-[130px] group-hover:text-emerald-400 transition-colors">
                        {user.displayName}
                      </h4>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                    <span className="text-[10px] text-neutral-400 font-mono block truncate">
                      @{user.username || "gamer"}
                    </span>
                  </div>
                </div>
                <PlanBadge plan={user.plan || "free"} size="sm" />
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono pt-2 border-t border-white/5 text-neutral-400">
                <span>{stats.totalGames} jogos</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{stats.completedCount} zerados</span>
                <span>•</span>
                <span className="text-amber-300 font-bold">{stats.totalPlaytimeHours}h</span>
              </div>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Entrar ou Cadastrar Conta</span>
            </button>
          )}

          {/* Links Principais do Catálogo */}
          <div className="space-y-0.5">
            <span className="text-[9px] uppercase font-mono font-bold text-neutral-400 tracking-wider px-2 block mb-1">
              Catálogo & Comunidade
            </span>
            {[
              { href: "/search", label: "Catálogo Completo", icon: Gamepad2, color: "text-cyan-400" },
              { href: "/calendar", label: "Calendário de Lançamentos", icon: CalendarIcon, color: "text-cyan-300" },
              { href: "/rankings", label: "Rankings da Comunidade", icon: Sparkles, color: "text-amber-400" },
              { href: "/conquistas", label: "Central de Conquistas", icon: Trophy, color: "text-amber-300" },
              { href: "/artigos", label: "Artigos & Guias Gamer", icon: BookOpen, color: "text-emerald-400", badge: "NOVO" },
              { href: "/indies", label: "Vitrine de Jogos Indie", icon: Gamepad2, color: "text-purple-400" },
              { href: "/inventario-steam", label: "Inventário Steam & Skins", icon: Sparkles, color: "text-cyan-300" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
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
                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Atalhos Rápidos de Plataformas */}
          <div className="space-y-1 pt-1">
            <span className="text-[9px] uppercase font-mono font-bold text-neutral-400 tracking-wider px-2 block mb-1">
              Plataformas Rápidas
            </span>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              {[
                { label: "💻 PC Gamer", href: "/search?platform=PC" },
                { label: "🎮 PS5", href: "/search?platform=PlayStation%205" },
                { label: "🟢 Xbox Series", href: "/search?platform=Xbox%20Series" },
                { label: "🔴 Switch", href: "/search?platform=Nintendo%20Switch" },
                { label: "🕹️ Retrô", href: "/search?platform=Retro" },
                { label: "🇧🇷 PT-BR", href: "/search?q=dublado" },
              ].map((plat) => (
                <Link
                  key={plat.label}
                  href={plat.href}
                  onClick={onClose}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 transition-colors active:scale-95 text-xs truncate text-center"
                >
                  {plat.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Suporte & PWA */}
          <div className="space-y-1.5 pt-1">
            <Link
              href="/feedback"
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />
                <span>Ideias & Reportar Bugs</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
            </Link>

            <button
              type="button"
              onClick={() => {
                onClose();
                triggerPwaInstall();
              }}
              className="w-full py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center justify-between transition-colors active:scale-95 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
                <span>Instalar App Mobile</span>
              </div>
              <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/20 px-1.5 py-0.5 rounded">
                PWA
              </span>
            </button>
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom,0px)+12px,1rem)] border-t border-white/10 bg-[#0a0c10] space-y-2">
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
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
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta</span>
            </button>
          )}

          <div className="flex items-center justify-center gap-3 text-[10px] text-neutral-400 pt-0.5">
            <Link href="/sobre" onClick={onClose} className="hover:text-white">Sobre</Link>
            <span>•</span>
            <Link href="/termos" onClick={onClose} className="hover:text-white">Termos</Link>
            <span>•</span>
            <Link href="/privacidade" onClick={onClose} className="hover:text-white">Privacidade</Link>
          </div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
