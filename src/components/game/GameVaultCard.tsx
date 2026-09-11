import React from "react";
import { ChevronUp, ChevronDown, Edit3, Gamepad2, Plus, Check } from "lucide-react";
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
    <div
      className={`glass-card rounded-2xl p-5 lg:p-6 relative overflow-hidden transition-all ${
        userGame
          ? "border-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.06)]"
          : "border-white/10"
      }`}
    >
      {/* Brilho radial de fundo verde esmeralda */}
      {userGame && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      )}

      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex items-center gap-2 text-left cursor-pointer group"
        >
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="font-black text-sm text-white uppercase tracking-wider group-hover:text-emerald-400 transition-colors">
            Meu Registro no Vault
          </h3>
        </button>

        <div className="flex items-center gap-2">
          {userGame ? (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              NA COLEÇÃO
            </span>
          ) : (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-zinc-400 border border-white/10">
              DISPONÍVEL
            </span>
          )}

          <button
            type="button"
            onClick={onToggleExpanded}
            className="p-1 rounded hover:bg-white/5 text-zinc-400 hover:text-white cursor-pointer transition-colors"
            title={isVaultExpanded ? "Recolher card" : "Expandir card"}
          >
            {isVaultExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isVaultExpanded && (
        userGame ? (
          <div className="space-y-4">
            {/* Lista Key-Value dos Dados do Jogador */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                <span className="text-zinc-400">Status Atual:</span>
                <div className="flex items-center gap-1.5">
                  <StatusBadge status={userGame.status} completionType={userGame.completionType} size="sm" />
                </div>
              </div>

              {userGame.platformPlayed && (
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-zinc-400">Plataforma Jogada:</span>
                  <span className="font-bold text-white font-mono">{userGame.platformPlayed}</span>
                </div>
              )}

              {userGame.userPlaytimeHours !== null && userGame.userPlaytimeHours > 0 && (
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-zinc-400">Tempo Registrado:</span>
                  <span className="font-bold text-cyan-300 font-mono">
                    {userGame.userPlaytimeHours} horas gravadas
                  </span>
                </div>
              )}

              {userGame.userRating !== null && (
                <div className="flex items-center justify-between py-1.5 border-b border-white/5">
                  <span className="text-zinc-400">Sua Avaliação:</span>
                  <span className="font-bold text-amber-400 font-mono flex items-center gap-1">
                    ★ {userGame.userRating.toFixed(1)} / 10
                  </span>
                </div>
              )}

              {userGame.userReview && (
                <div className="pt-1">
                  <span className="text-zinc-400 block mb-1">Notas Pessoais:</span>
                  <p className="text-zinc-200 italic text-xs bg-white/[0.03] p-2.5 rounded-xl border border-white/5">
                    &quot;{userGame.userReview}&quot;
                  </p>
                </div>
              )}
            </div>

            {/* Botão de Edição Rápida */}
            <button
              type="button"
              onClick={onOpenModal}
              className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar Registro Pessoal</span>
            </button>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3.5">
            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Adicione ao seu Vault
              </h4>
              <p className="text-[11px] text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Acompanhe seu progresso, registre horas jogadas e organize seu backlog.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenModal}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black text-xs font-extrabold transition-all shadow-lg shadow-emerald-950/40 active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
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
