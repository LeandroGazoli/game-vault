import React from "react";
import Link from "next/link";
import { ChevronRight, Plus, ArrowRight } from "lucide-react";
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
      {/* Banner da Franquia / Saga */}
      {franchiseName && (
        <section className="rounded-2xl p-6 lg:p-7 relative overflow-hidden bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-black/60 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-2xl">
          <div className="space-y-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              ★ Universo &amp; Linha do Tempo
            </span>
            <h3 className="text-xl font-black text-white">
              Saga {franchiseName} Completa
            </h3>
            <p className="text-xs text-zinc-300 max-w-lg leading-relaxed">
              Quer mergulhar na cronologia da franquia? Descubra a evolução desde os clássicos até os lançamentos mais recentes.
            </p>
          </div>

          <Link
            href={`/search?q=${encodeURIComponent(franchiseName)}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-extrabold text-xs tracking-wide uppercase transition-transform hover:scale-105 shadow-lg shadow-amber-950/50 whitespace-nowrap self-start sm:self-auto flex-shrink-0 cursor-pointer"
          >
            <span>Ver Todos os Jogos da Saga</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* Grade de Títulos Semelhantes Recomendados */}
      {game.similar_games && game.similar_games.length > 0 && (
        <section className="space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <span className="text-emerald-400">✦</span>
                <span>Títulos Semelhantes Recomendados</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Se você curtiu {game.name}, também vai adorar estes jogos baseados na base de dados IGDB:
              </p>
            </div>

            {franchiseName && (
              <Link
                href={`/search?q=${encodeURIComponent(franchiseName)}`}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
              >
                <span>Explorar Mais</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {game.similar_games.slice(0, 12).map((sg) => (
              <div
                key={sg.id}
                className="glass-card rounded-xl p-2.5 group hover:border-emerald-500/40 transition-all flex flex-col justify-between"
              >
                <Link href={getGameUrl(sg)} className="block flex-1 flex flex-col">
                  <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden mb-2.5 bg-zinc-900">
                    {sg.coverUrl ? (
                      <img
                        src={sg.coverUrl}
                        alt={sg.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                        Sem Capa
                      </div>
                    )}

                    {sg.rating && (
                      <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-black/80 font-mono font-bold text-[10px] text-emerald-400 border border-emerald-500/20">
                        {sg.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors truncate mb-1">
                    {sg.name}
                  </h4>
                  <p className="text-[10px] text-zinc-400 mb-2 truncate">
                    Semelhante
                  </p>
                </Link>

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
                  className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-emerald-500 hover:text-black font-bold text-[11px] text-zinc-300 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="Salvar ou registrar este jogo no seu perfil"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Salvar</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
