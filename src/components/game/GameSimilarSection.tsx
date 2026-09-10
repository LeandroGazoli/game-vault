import React from "react";
import Link from "next/link";
import { Sparkles, ChevronRight, Plus } from "lucide-react";
import { Game } from "@/lib/types";
import { getGameUrl } from "@/lib/routes";
import { triggerSelectionHaptic } from "@/lib/capacitor";

interface GameSimilarSectionProps {
  game: Game;
  onSelectGameToSave: (gameToSave: any) => void;
}

export default function GameSimilarSection({
  game,
  onSelectGameToSave,
}: GameSimilarSectionProps) {
  const franchiseName = game.franchises?.[0] || game.collections?.[0] || "";

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Franquia / Saga se houver */}
      {franchiseName && (
        <section className="rounded-[28px] sm:rounded-[32px] border border-amber-500/25 bg-gradient-to-r from-amber-950/20 via-[#18191c] to-black p-5 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Universo &amp; Linha do Tempo
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Saga {franchiseName}
              </h3>
              <p className="text-xs text-gray-300 max-w-2xl leading-relaxed">
                Quer mergulhar na cronologia completa? Encontre todos os títulos, edições e expansões desta franquia no acervo.
              </p>
            </div>

            <Link
              href={`/search?q=${encodeURIComponent(franchiseName)}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold transition-all shadow-lg self-start sm:self-auto flex-shrink-0 min-h-[44px]"
            >
              <span>Ver Todos os Jogos da Saga</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* Títulos Semelhantes */}
      {game.similar_games && game.similar_games.length > 0 && (
        <section className="rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#18191c] p-5 sm:p-8 space-y-6 shadow-2xl">
          <div className="space-y-1 border-b border-white/5 pb-4">
            <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" /> Títulos Semelhantes Recomendados
            </h3>
            <p className="text-xs text-gray-400">
              Se você curte {game.name}, talvez também vá gostar destes títulos selecionados pelo IGDB.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {game.similar_games.slice(0, 12).map((sg) => (
              <div
                key={sg.id}
                className="group rounded-2xl bg-white/5 border border-white/10 overflow-hidden hover:border-cyan-500/40 transition-all hover:scale-[1.03] flex flex-col justify-between"
              >
                <Link href={getGameUrl(sg)} className="block flex-1 flex flex-col">
                  <div className="relative aspect-[3/4] w-full bg-neutral-900 overflow-hidden">
                    {sg.coverUrl ? (
                      <img
                        src={sg.coverUrl}
                        alt={sg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                        Sem Capa
                      </div>
                    )}
                    {sg.rating && (
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-amber-400 border border-amber-400/30">
                        ★ {sg.rating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-bold text-white group-hover:text-[#00E5FF] transition-colors line-clamp-2">
                      {sg.name}
                    </h4>
                  </div>
                </Link>

                <div className="p-2 pt-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      triggerSelectionHaptic();
                      onSelectGameToSave({
                        id: sg.id,
                        name: sg.name,
                        background_image: sg.coverUrl,
                        slug: String(sg.id),
                        rating: sg.rating ? Number((sg.rating * 10).toFixed(0)) : undefined,
                      });
                    }}
                    className="w-full min-h-[36px] py-1.5 rounded-xl bg-white/10 hover:bg-cyan-500 hover:text-black text-[10px] font-bold text-gray-200 transition-all flex items-center justify-center gap-1 border border-white/10 shadow-sm active:scale-95"
                    title="Salvar ou registrar este jogo no seu perfil"
                  >
                    <Plus className="w-3 h-3 text-cyan-400 group-hover:text-black" />
                    <span>+ Salvar</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
