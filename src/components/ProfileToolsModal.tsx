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

interface ProfileToolsModalProps {
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
  onOpenPrivacy,
  onOpenTitles,
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

  const handleAction = (action: () => void) => {
    onClose();
    action();
  };

  return (
    <AdaptiveModal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-shrink-0 pb-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-white shadow-md">
              <SlidersHorizontal className="w-5 h-5 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Ações &amp; Ferramentas
              </h3>
              <p className="text-xs text-gray-400">
                Ajustes e utilitários do seu perfil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Items List */}
        <div className="overflow-y-auto space-y-2 pr-1 -mr-1 py-1">
          {/* 1. Plano / Assinatura */}
          {isPremium ? (
            <button
              onClick={() => handleAction(onOpenManagePlan)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/20 hover:bg-cyan-950/40 border border-[#00E5FF]/25 hover:border-[#00E5FF]/50 transition-all text-left group active:scale-[0.99] min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] flex-shrink-0 shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                      Gerenciar Meu Plano
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00E5FF] text-black">
                      PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Detalhes do passe, validade e faturas
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          ) : (
            <button
              onClick={() => handleAction(onOpenUpgrade)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:from-amber-500/20 border border-amber-500/30 hover:border-amber-500/60 transition-all text-left group active:scale-[0.99] min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-sm">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                      Fazer Upgrade (Seja PRO)
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-black">
                      VIP
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Zero anúncios, selo neon e temas exclusivos
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* 2. Editar & Personalizar Perfil */}
          <button
            onClick={() => handleAction(onOpenCustomizer)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                <Palette className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Editar &amp; Personalizar Perfil
                </span>
                <p className="text-[11px] text-gray-400">
                  Dados, capa, temas, títulos, insígnias e links sociais
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 2.1. Importar Biblioteca Multi-Lojas (Destaque Principal) */}
          {onOpenImporter && (
            <button
              onClick={() => handleAction(onOpenImporter)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-cyan-950/30 hover:bg-cyan-950/60 border border-[#00E5FF]/30 hover:border-[#00E5FF]/60 transition-all text-left group active:scale-[0.99] min-h-[52px] shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF] flex-shrink-0">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                      Importar Jogos &amp; Lojas
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                      STEAM • XBOX • PSN
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Sincronize da Steam, Epic Games, Xbox, PlayStation e arquivos CSV/JSON
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* 2.1. Privacidade do Perfil (Atalho Direto) */}
          <button
            onClick={() => handleAction(onOpenPrivacy || onOpenCustomizer)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                user.isPublic !== false && user.visibility?.isPublic !== false
                  ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
                  : "bg-amber-500/15 border border-amber-500/30 text-amber-300"
              }`}>
                {user.isPublic !== false && user.visibility?.isPublic !== false ? (
                  <Globe className="w-5 h-5" />
                ) : (
                  <Lock className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                    Privacidade do Perfil
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                    user.isPublic !== false && user.visibility?.isPublic !== false
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-300 border-amber-500/30"
                  }`}>
                    {user.isPublic !== false && user.visibility?.isPublic !== false ? "Público" : "Privado"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Controle se outros podem ver seus jogos ao compartilhar
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 2.1. Títulos & Insígnias Gamer (Atalho Direto) */}
          <button
            onClick={() => handleAction(onOpenTitles || onOpenCustomizer)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent hover:from-amber-500/15 border border-amber-500/30 hover:border-amber-500/50 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 flex-shrink-0 shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Títulos &amp; Insígnias Gamer
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-400 text-black">
                    PRO / VIP
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Crie até 10 customizadas e equipe até 3 no seu perfil
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 3. Roleta do Backlog */}
          <button
            onClick={() => handleAction(onOpenRoulette)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Dices className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  Roleta do Backlog
                </span>
                <p className="text-[11px] text-gray-400">
                  Sorteie o próximo jogo para zerar da sua lista
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 4. Retrospectiva Gamer Wrapped */}
          <button
            onClick={() => handleAction(onOpenWrapped)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-[#00E5FF] flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-[#00E5FF] transition-colors">
                  Retrospectiva Gamer
                </span>
                <p className="text-[11px] text-gray-400">
                  Veja suas estatísticas do ano em cartões visuais
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 5. Exportar Biblioteca */}
          <button
            onClick={() => handleAction(onOpenExport)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Exportar Biblioteca
                </span>
                <p className="text-[11px] text-gray-400">
                  Baixe em Excel (CSV), JSON ou gere link dinâmico
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 5.2. Inventário Steam */}
          {onOpenSteamInventory && (
            <button
              onClick={() => handleAction(onOpenSteamInventory)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/20 hover:bg-blue-950/40 border border-blue-500/25 hover:border-blue-500/50 transition-all text-left group active:scale-[0.99] min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-300 flex-shrink-0">
                  <Gamepad2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                      Inventário Steam &amp; Skins
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300">
                      CS2 • TF2
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Visualizador de skins, armas, facas e itens colecionáveis
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* 5.3. Gerador de Card Gamer */}
          {onOpenGamerCard && (
            <button
              onClick={() => handleAction(onOpenGamerCard)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#00E5FF]/10 via-purple-600/10 to-transparent hover:from-[#00E5FF]/20 border border-[#00E5FF]/30 hover:border-[#00E5FF]/50 transition-all text-left group active:scale-[0.99] min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] flex-shrink-0 shadow-sm">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                      Gerador de Card Gamer
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                      NOVO
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Crie imagens 9:16 para Instagram Stories com suas estatísticas e jogos
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* 6. Compartilhar Perfil */}
          {onOpenShare && (
            <button
              onClick={() => handleAction(onOpenShare)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 flex-shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                    Compartilhar Perfil
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Copie seu link, envie no WhatsApp ou gere QR Code
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </button>
          )}

          {/* 7. Instalar PWA */}
          <button
            onClick={() => handleAction(onInstallPwa)}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group active:scale-[0.99] min-h-[52px]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 flex-shrink-0">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                    Instalar no Celular (PWA)
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-blue-500/20 text-blue-300">
                    App
                  </span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Adicione à tela inicial com acesso rápido offline
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 7. Painel de Administrador (se admin) */}
          {isAdmin && (
            <Link
              href="/admin"
              onClick={onClose}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition-all text-left group active:scale-[0.99] min-h-[52px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs sm:text-sm font-bold text-amber-300">
                    Painel do Administrador
                  </span>
                  <p className="text-[11px] text-gray-400">
                    Configuração de planos, preços e usuários
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
            </Link>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/10 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-full bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </AdaptiveModal>
  );
}
