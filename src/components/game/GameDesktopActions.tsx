import React from "react";
import { Check, Edit3, Plus, Heart, Star, Share2, ExternalLink } from "lucide-react";
import { UserGame } from "@/lib/types";
import { STATUS_CONFIG } from "@/components/StatusBadge";
import { GameWebsite, getWebsiteMeta } from "./gameDetailHelpers";

interface GameDesktopActionsProps {
  userGame?: UserGame;
  storeWebsites: GameWebsite[];
  onOpenModal: () => void;
  onQuickWishlist: () => void;
  onShare: () => void;
}

export default function GameDesktopActions({
  userGame,
  storeWebsites,
  onOpenModal,
  onQuickWishlist,
  onShare,
}: GameDesktopActionsProps) {
  const isBacklog = userGame?.status === "backlog";

  return (
    <div className="space-y-3 pt-2 border-t border-white/10">
      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Botão Primário: Vault */}
        <button
          type="button"
          onClick={onOpenModal}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-extrabold text-sm flex items-center gap-2.5 transition-all shadow-lg shadow-emerald-950/40 active:scale-98 cursor-pointer"
        >
          {userGame ? (
            <>
              <Check className="w-5 h-5 text-black stroke-[3]" />
              <span>No Meu Vault ({STATUS_CONFIG[userGame.status]?.label || "Salvo"})</span>
              <Edit3 className="w-3.5 h-3.5 ml-1 text-black/70" />
            </>
          ) : (
            <>
              <Plus className="w-5 h-5 text-black stroke-[3]" />
              <span>Adicionar ao Meu Vault</span>
            </>
          )}
        </button>

        {/* Botão Secundário: Desejar */}
        <button
          type="button"
          onClick={onQuickWishlist}
          className={`px-4 py-3 rounded-xl border font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
            isBacklog
              ? "bg-pink-500/20 text-pink-300 border-pink-500/50 hover:bg-pink-500/30"
              : "bg-white/5 hover:bg-white/10 border-white/10 hover:border-pink-500/40 text-white"
          }`}
        >
          <Heart className={`w-4 h-4 ${isBacklog ? "fill-pink-400 text-pink-400" : "text-pink-400"}`} />
          <span>{isBacklog ? "Desejado" : "Desejar"}</span>
        </button>

        {/* Botão Avaliar */}
        <button
          type="button"
          onClick={onOpenModal}
          className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 text-white font-bold text-sm flex items-center gap-2 transition-all cursor-pointer"
        >
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          <span>{userGame?.userRating ? `Nota: ${userGame.userRating}/10` : "Avaliar Jogo"}</span>
        </button>

        {/* Botão Compartilhar */}
        <button
          type="button"
          onClick={onShare}
          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all ml-auto cursor-pointer"
          title="Compartilhar este jogo"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Onde Comprar (Lojas Digitais) */}
      {storeWebsites.length > 0 && (
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-zinc-400 font-medium mr-1">Onde Comprar:</span>
          {storeWebsites.slice(0, 5).map((w) => {
            const meta = getWebsiteMeta(w.url);
            return (
              <a
                key={w.id}
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-white/10 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-300 flex items-center gap-1.5 transition-all text-xs"
                title={`Página oficial na ${meta.label}`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{meta.label}</span>
                <ExternalLink className="w-3 h-3 text-zinc-500" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
