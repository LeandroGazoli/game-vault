import React from "react";
import Link from "next/link";
import { Package, Plus, Check } from "lucide-react";
import { Game, UserGame } from "@/lib/types";
import { GameDlc } from "./gameDetailHelpers";
import { getGameUrl } from "@/lib/routes";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface GameDlcsSectionProps {
  game: Game;
  uniqueDlcs: GameDlc[];
  userGame?: UserGame;
  onOpenModal: () => void;
}

export default function GameDlcsSection({
  game,
  uniqueDlcs,
  userGame,
  onOpenModal,
}: GameDlcsSectionProps) {
  if (uniqueDlcs.length === 0) return null;

  return (
    <section className="rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#18191c] p-5 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
        <div className="space-y-1">
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-[#00E5FF]" /> Expansões &amp; DLCs Oficiais ({uniqueDlcs.length})
          </h3>
          <p className="text-xs text-gray-400">
            Conteúdos adicionais, expansões de história e DLCs lançadas para {game.name}.
          </p>
        </div>

        {userGame?.dlcs && userGame.dlcs.length > 0 && (
          <span className="px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs text-[#00E5FF] font-mono font-bold w-fit">
            {userGame.dlcs.filter((d) => d.status === "completed").length} de {uniqueDlcs.length} DLCs Zeradas
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {uniqueDlcs.map((dlc) => {
          const userDlc = userGame?.dlcs?.find((d) => d.id === dlc.id);

          return (
            <div
              key={dlc.id}
              className={`group rounded-2xl border transition-all hover:scale-[1.02] flex flex-col justify-between overflow-hidden ${
                userDlc?.status === "completed"
                  ? "bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500"
                  : userDlc?.status === "playing"
                  ? "bg-cyan-950/20 border-cyan-500/40 hover:border-cyan-500"
                  : "bg-white/5 border-white/10 hover:border-white/20"
              }`}
            >
              <Link href={getGameUrl(dlc)} className="block">
                <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden">
                  {dlc.coverUrl ? (
                    <img
                      src={dlc.coverUrl}
                      alt={dlc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-600 font-mono">
                      DLC
                    </div>
                  )}

                  {userDlc && (
                    <div className="absolute top-2 right-2 z-10">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono shadow-md ${
                          userDlc.status === "completed"
                            ? "bg-emerald-500 text-black"
                            : userDlc.status === "playing"
                            ? "bg-cyan-500 text-black"
                            : "bg-amber-500 text-black"
                        }`}
                      >
                        {userDlc.status === "completed"
                          ? "Zerada"
                          : userDlc.status === "playing"
                          ? "Jogando"
                          : "Quero"}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-2.5 space-y-1">
                  <h4
                    className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2"
                    title={dlc.name}
                  >
                    {dlc.name}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                    <span>{dlc.releaseDate ? dlc.releaseDate.substring(0, 4) : "DLC"}</span>
                    {userDlc?.playtimeHours && (
                      <span className="text-cyan-300 font-bold">{userDlc.playtimeHours}h</span>
                    )}
                  </div>
                </div>
              </Link>

              <div className="p-2 pt-0">
                <button
                  type="button"
                  onClick={() => {
                    triggerSelectionHaptic();
                    onOpenModal();
                  }}
                  className={`w-full min-h-[36px] py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 border shadow-sm active:scale-95 cursor-pointer ${
                    userDlc
                      ? "bg-white/10 hover:bg-white/20 text-gray-200 border-white/15"
                      : "bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30"
                  }`}
                  title="Gerenciar progresso desta DLC"
                >
                  {userDlc ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Gerenciar</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Registrar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
