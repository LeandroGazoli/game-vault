"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { triggerSelectionHaptic } from "@/lib/capacitor";
import {
  Gamepad2,
  Dices,
  Upload,
  Sparkles,
  Palette,
  Crown,
  X,
  Plus,
  Smartphone,
} from "lucide-react";
import { triggerPwaInstall } from "./PwaInstallPrompt";

interface MobileQuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileQuickActionSheet({
  isOpen,
  onClose,
}: MobileQuickActionSheetProps) {
  const router = useRouter();
  const { user, isPremium } = useAuth();

  // Fecha com tecla ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Bloqueia rolagem de fundo enquanto aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || typeof document === "undefined") return null;

  const handleAction = (callback: () => void) => {
    triggerSelectionHaptic();
    onClose();
    callback();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden animate-fadeIn">
      {/* Backdrop com desfoque escuro e fechamento ao tocar fora */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Painel Inferior (Sheet Flutuante estilo iOS/Console Gamer) */}
      <div className="relative w-full max-w-lg mx-auto bg-[#0d0f14] border-t border-[#00E5FF]/30 rounded-t-[32px] p-5 pb-[max(env(safe-area-inset-bottom,0px)+16px,24px)] shadow-[0_-15px_50px_rgba(0,0,0,0.9)] ring-1 ring-white/10 z-10 space-y-4">
        {/* Puxador táctil superior */}
        <div className="flex items-center justify-center pt-1 pb-2">
          <div className="w-12 h-1.5 rounded-full bg-white/20" />
        </div>

        {/* Cabeçalho do Sheet com Ícone Neon e Botão Fechar */}
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#00E5FF]/15 border border-[#00E5FF]/40 text-[#00E5FF] flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.4)]">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white tracking-tight flex items-center gap-1.5">
                <span>Central de Ações Rápidas</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[#00E5FF]/20 text-[#00E5FF]">
                  MGL HUB
                </span>
              </h3>
              <p className="text-[11px] text-gray-400">Atalhos dinâmicos para sua biblioteca gamer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar menu de ações"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grid de Ações Rápidas Táteis */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          {/* 1. Adicionar Jogo */}
          <button
            onClick={() => handleAction(() => router.push("/search"))}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-gradient-to-br from-[#121622] to-[#181d2a] border border-[#00E5FF]/30 hover:border-[#00E5FF] transition-all text-left group active:scale-95 shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4 stroke-[3]" />
            </div>
            <span className="text-xs font-bold text-white">Adicionar Jogo</span>
            <span className="text-[10px] text-gray-400">Buscar no acervo de 800k+</span>
          </button>

          {/* 2. Roleta Gamer 3D */}
          <button
            onClick={() =>
              handleAction(() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-game-roulette"));
                }
              })
            }
            className="flex flex-col items-start p-3.5 rounded-2xl bg-gradient-to-br from-[#1a1426] to-[#221833] border border-purple-500/30 hover:border-purple-400 transition-all text-left group active:scale-95 shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Dices className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Roleta 3D</span>
            <span className="text-[10px] text-gray-400">Sortear próximo a jogar</span>
          </button>

          {/* 3. Importar Biblioteca */}
          <button
            onClick={() =>
              handleAction(() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("open-game-importer"));
                }
              })
            }
            className="flex flex-col items-start p-3.5 rounded-2xl bg-[#131720] border border-cyan-500/20 hover:border-cyan-400/50 transition-all text-left group active:scale-95 shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Importar Dados</span>
            <span className="text-[10px] text-gray-400">Steam, PSN, Xbox ou CSV</span>
          </button>

          {/* 4. Inventário Steam */}
          <button
            onClick={() => handleAction(() => router.push("/inventario-steam"))}
            className="flex flex-col items-start p-3.5 rounded-2xl bg-[#131720] border border-amber-500/20 hover:border-amber-400/50 transition-all text-left group active:scale-95 shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-white">Inventário Steam</span>
            <span className="text-[10px] text-gray-400">Visualizador de skins</span>
          </button>
        </div>

        {/* Ações Secundárias (Personalizar Perfil ou PRO) */}
        <div className="pt-1 space-y-2">
          {user ? (
            <Link
              href={user.username ? `/perfil/editar` : "/perfil"}
              onClick={() => handleAction(() => {})}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-xs font-bold text-gray-200 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Palette className="w-4 h-4 text-[#00E5FF]" />
                <span>Personalizar Perfil &amp; Temas</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">Editar →</span>
            </Link>
          ) : (
            <button
              onClick={() => handleAction(() => router.push("/perfil"))}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl bg-white text-black text-xs font-black transition-all shadow-md active:scale-95"
            >
              <span>Acessar ou Criar Conta Gamer</span>
            </button>
          )}

          {!isPremium && (
            <Link
              href="/planos"
              onClick={() => handleAction(() => {})}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-500/20 via-black to-amber-500/10 border border-amber-500/40 text-xs font-bold text-amber-300 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Desbloquear Recursos PRO</span>
              </div>
              <span className="text-[10px] font-extrabold uppercase bg-amber-400 text-black px-2 py-0.5 rounded-full">
                Seja VIP
              </span>
            </Link>
          )}

          {/* Instalar App PWA */}
          <button
            onClick={() => handleAction(() => triggerPwaInstall())}
            className="w-full flex items-center justify-between p-3 rounded-2xl bg-cyan-950/20 border border-cyan-500/25 hover:border-cyan-400 text-xs font-bold text-cyan-300 transition-colors cursor-pointer active:scale-98"
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-[#00E5FF]" />
              <span>Instalar Aplicativo (PWA)</span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-[#00E5FF]/20 text-[#00E5FF] px-2 py-0.5 rounded-full border border-[#00E5FF]/30">
              INSTALAR
            </span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
