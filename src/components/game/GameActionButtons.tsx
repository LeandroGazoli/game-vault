import React from "react";
import { Heart, Plus, Edit3 } from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import { UserGame } from "@/lib/types";

interface GameActionButtonsProps {
  userGame?: UserGame;
  onQuickWishlist: () => void;
  onOpenModal: () => void;
}

export default function GameActionButtons({
  userGame,
  onQuickWishlist,
  onOpenModal,
}: GameActionButtonsProps) {
  const isBacklog = userGame?.status === "backlog";

  return (
    <div className="grid grid-cols-12 gap-2 pt-1">
      {/* Botão Secundário: Desejar / Desejado */}
      <button
        type="button"
        onClick={onQuickWishlist}
        className={`col-span-4 min-h-[48px] flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl border text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-md ${
          isBacklog
            ? "bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border-pink-500/50"
            : "bg-white/5 hover:bg-white/10 text-gray-300 border-white/10"
        }`}
      >
        <Heart
          className={`w-4 h-4 ${
            isBacklog ? "fill-pink-400 text-pink-400" : "text-gray-400"
          }`}
        />
        <span className="truncate">{isBacklog ? "Desejado" : "Desejar"}</span>
      </button>

      {/* Botão Primário: Adicionar ou Editar Vault */}
      <button
        type="button"
        onClick={onOpenModal}
        className={`col-span-8 min-h-[48px] flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-[0.98] cursor-pointer shadow-xl ${
          userGame
            ? "bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300"
            : "bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25"
        }`}
      >
        {userGame ? (
          <>
            <StatusBadge
              status={userGame.status}
              completionType={userGame.completionType}
              size="sm"
            />
            <span className="truncate font-black">Editar no Vault</span>
            <Edit3 className="w-3.5 h-3.5 ml-auto flex-shrink-0" />
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 text-black stroke-[3]" />
            <span>Adicionar ao Meu Vault</span>
          </>
        )}
      </button>
    </div>
  );
}
