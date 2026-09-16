"use client";

import React from "react";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import {
  X,
  Sparkles,
  Crown,
  Palette,
  Dices,
  Download,
  Smartphone,
  ShieldCheck,
  ChevronRight,
  SlidersHorizontal,
  Settings,
  Share2,
  Globe,
  Lock,
  Upload,
  Gamepad2,
} from "lucide-react";
import AdaptiveModal from "./ui/AdaptiveModal";

export interface ProfileToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  isPremium: boolean;
  isAdmin: boolean;
  onOpenManagePlan: () => void;
  onOpenUpgrade: () => void;
  onOpenCustomizer: () => void;
  onOpenPrivacy?: () => void;
  onOpenTitles?: () => void;
  onOpenRoulette: () => void;
  onOpenWrapped: () => void;
  onOpenExport: () => void;
  onOpenImporter?: () => void;
  onOpenSteamInventory?: () => void;
  onOpenShare?: () => void;
  onOpenGamerCard?: () => void;
  onInstallPwa: () => void;
}

export default function ProfileToolsModal({
  isOpen,
  onClose,
  user,
  isPremium,
  isAdmin,
  onOpenManagePlan,
  onOpenUpgrade,
  onOpenCustomizer,
  onOpenRoulette,
  onOpenWrapped,
  onOpenExport,
  onOpenImporter,
  onOpenSteamInventory,
  onOpenShare,
  onOpenGamerCard,
  onInstallPwa,
}: ProfileToolsModalProps) {
  if (!isOpen) return null;

  const handleAction = (action?: () => void) => {
    onClose();
    action?.();
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-md">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Ações &amp; Ferramentas
              </h3>
              <p className="text-[11px] text-gray-400">
                Atalhos rápidos para gerenciar seu perfil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 max-h-[68vh] overflow-y-auto pr-0.5 -mr-0.5 no-scrollbar">
          {/* Seção 1: CONTA & CUSTOMIZAÇÃO */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 px-1">
              Conta &amp; Estilo
            </span>

            {/* Plano */}
            {isPremium ? (
              <button
                type="button"
                onClick={() => handleAction(onOpenManagePlan)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/25 transition-all text-left group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Gerenciar Plano
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-400 text-black">
                        PRO
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">Vigência, faturas e benefícios ativos</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleAction(onOpenUpgrade)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-left group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shrink-0">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                        Seja PRO / VIP
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-black">
                        UPGRADE
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">Zero anúncios, temas exclusivos e selos</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
              </button>
            )}

            {/* Personalizar Perfil Completo */}
            <button
              type="button"
              onClick={() => handleAction(onOpenCustomizer)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Personalizar Perfil
                  </span>
                  <p className="text-[10px] text-gray-400 truncate">Capa, avatar, insígnias, temas e bio</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
            </button>
          </div>

          {/* Seção 2: CATÁLOGO & UTILITÁRIOS */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 px-1">
              Catálogo &amp; Jogos
            </span>

            {/* Importar */}
            {onOpenImporter && (
              <button
                type="button"
                onClick={() => handleAction(onOpenImporter)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-cyan-950/30 hover:bg-cyan-950/50 border border-cyan-500/30 transition-all text-left group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                        Importar Biblioteca
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-cyan-500/20 text-cyan-300">
                        STEAM • PSN • XBOX
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 truncate">Sincronize jogos de múltiplas plataformas</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
              </button>
            )}

            {/* Exportar */}
            <button
              type="button"
              onClick={() => handleAction(onOpenExport)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Exportar Coleção
                  </span>
                  <p className="text-[10px] text-gray-400 truncate">Baixe sua biblioteca em CSV ou JSON</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
            </button>

            {/* Roleta do Backlog */}
            <button
              type="button"
              onClick={() => handleAction(onOpenRoulette)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Dices className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Roleta do Backlog
                  </span>
                  <p className="text-[10px] text-gray-400 truncate">Sorteie o próximo game para zerar</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
            </button>

            {/* Retrospectiva Wrapped */}
            <button
              type="button"
              onClick={() => handleAction(onOpenWrapped)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white group-hover:text-pink-300 transition-colors">
                    Retrospectiva Gamer
                  </span>
                  <p className="text-[10px] text-gray-400 truncate">Estatísticas e cartões anuais do Vault</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
            </button>

            {/* Inventário Steam */}
            {onOpenSteamInventory && (
              <button
                type="button"
                onClick={() => handleAction(onOpenSteamInventory)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/25 transition-all text-left group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                      Inventário Steam &amp; Skins
                    </span>
                    <p className="text-[10px] text-gray-400 truncate">CS2, TF2 e itens colecionáveis</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
              </button>
            )}
          </div>

          {/* Seção 3: SOCIAL & APLICATIVO */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 px-1">
              Social &amp; Aplicativo
            </span>

            {/* Gerador de Card Gamer */}
            {onOpenGamerCard && (
              <button
                type="button"
                onClick={() => handleAction(onOpenGamerCard)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      Gerador de Card Gamer
                    </span>
                    <p className="text-[10px] text-gray-400 truncate">Cartão 9:16 para Instagram Stories</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
              </button>
            )}

            {/* Compartilhar Perfil */}
            {onOpenShare && (
              <button
                type="button"
                onClick={() => handleAction(onOpenShare)}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      Compartilhar Perfil
                    </span>
                    <p className="text-[10px] text-gray-400 truncate">Copie link, WhatsApp ou QR Code</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
              </button>
            )}

            {/* Instalar PWA */}
            <button
              type="button"
              onClick={() => handleAction(onInstallPwa)}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99]"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    Instalar App no Celular
                  </span>
                  <p className="text-[10px] text-gray-400 truncate">Adicionar atalho rápido offline</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
            </button>

            {/* Painel Admin (se admin) */}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={onClose}
                className="w-full flex items-center justify-between p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-left group active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-amber-300">
                      Painel do Administrador
                    </span>
                    <p className="text-[10px] text-gray-400 truncate">Gerenciamento da plataforma</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-all shrink-0" />
              </Link>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </AdaptiveModal>
  );
}
