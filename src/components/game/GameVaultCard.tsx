import React from "react";
import { Trophy, ChevronUp, ChevronDown, Edit3, Gamepad2, Plus } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { Game, UserGame } from "@/lib/types";

interface GameVaultCardProps {
  game: Game;
  userGame?: UserGame;
  isVaultExpanded: boolean;
  onToggleExpanded: () => void;
  onOpenModal: () => void;
}

export default function GameVaultCard({
  game,
  userGame,
  isVaultExpanded,
  onToggleExpanded,
  onOpenModal,
}: GameVaultCardProps) {
  return (
    <div className="rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#141822] p-5 sm:p-6 space-y-4 shadow-xl">
      <button
        type="button"
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between border-b border-white/5 pb-3 text-left transition-colors cursor-pointer group"
      >
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
              Meu Vault
            </h3>
            {game.metacritic && game.metacritic >= 90 && (
              <span className="text-[11px] text-amber-400/90 font-medium">
                ⭐ Obra-Prima ({game.metacritic}+ Metacritic)
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {userGame ? (
            <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
              Na Coleção
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
              Não Adicionado
            </span>
          )}
          {isVaultExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
          )}
        </div>
      </button>

      {isVaultExpanded && (
        userGame ? (
          <div className="space-y-3 font-mono text-xs">
            {/* SPEC SHEET DO VAULT COMPACTA (Estilo Print 2) */}
            <div className="rounded-2xl bg-[#0f1218] border border-white/[0.08] p-4 divide-y divide-white/[0.06]">
              <div className="flex items-center justify-between py-2">
                <span className="text-neutral-400 font-sans font-medium">Status no Vault</span>
                <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
              </div>

              {userGame.userRating !== null && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-400 font-sans font-medium">Sua Avaliação</span>
                  <span className="font-bold text-amber-400 text-sm">
                    ⭐ {userGame.userRating.toFixed(1)} / 10
                  </span>
                </div>
              )}

              {userGame.userPlaytimeHours !== null && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-400 font-sans font-medium">Tempo Dedicado</span>
                  <span className="font-bold text-cyan-300 text-sm">
                    {userGame.userPlaytimeHours} horas
                  </span>
                </div>
              )}

              {userGame.platformPlayed && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-400 font-sans font-medium">Plataforma</span>
                  <span className="font-semibold text-gray-200">
                    {userGame.platformPlayed}
                  </span>
                </div>
              )}

              {game.hltb?.mainStory ? (
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-400 font-sans font-medium flex items-center gap-1">
                    <span>Duração Média</span>
                    <span className="text-[10px] text-neutral-500" title="HowLongToBeat">ⓘ</span>
                  </span>
                  <span className="text-neutral-300">~{game.hltb.mainStory}h Campanha</span>
                </div>
              ) : null}

              {game.released && (
                <div className="flex items-center justify-between py-2">
                  <span className="text-neutral-400 font-sans font-medium">Lançamento Oficial</span>
                  <span className="text-neutral-300">
                    {new Date(game.released).getFullYear()}
                  </span>
                </div>
              )}

              {userGame.userReview && (
                <div className="pt-2">
                  <span className="text-neutral-400 font-sans font-medium block mb-1">Notas Pessoais:</span>
                  <p className="text-neutral-200 italic font-sans text-xs bg-white/5 p-2.5 rounded-xl border border-white/5">
                    &quot;{userGame.userReview}&quot;
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onOpenModal}
              className="w-full min-h-[48px] py-3 rounded-2xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-bold text-emerald-300 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 active:scale-98"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Registro no Vault</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-6 sm:py-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">
                Adicione este jogo ao seu Vault
              </h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
                Acompanhe seu progresso, registre suas horas jogadas, avalie com notas e organize seu backlog.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenModal}
              className="w-full min-h-[50px] py-3.5 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs sm:text-sm font-black transition-all shadow-xl shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Adicionar ao Meu Vault</span>
            </button>
          </div>
        )
      )}
    </div>
  );
}
