import React from "react";
import Link from "next/link";
import { Tags, ChevronRight, Tag, Search, Sparkles, Layers } from "lucide-react";
import { translateGenre, translateTheme, getCategoryHubUrl } from "@/lib/gameUtils";

interface GameCategoriesHubProps {
  genres?: { id: number | string; name: string }[];
  themes?: string[];
}

export default function GameCategoriesHub({
  genres,
  themes,
}: GameCategoriesHubProps) {
  if ((!genres || genres.length === 0) && (!themes || themes.length === 0)) {
    return null;
  }

  return (
    <div className="rounded-[28px] sm:rounded-[32px] border border-white/10 bg-[#18191c] p-5 sm:p-8 space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div className="space-y-0.5">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Tags className="w-5 h-5 text-[#00E5FF]" /> Categorias &amp; Estilos do Jogo
          </h3>
          <p className="text-xs text-gray-400">
            Clique em qualquer categoria para buscar e explorar outros títulos do mesmo estilo no acervo.
          </p>
        </div>
        <Link
          href="/categorias"
          className="text-xs font-semibold text-[#00E5FF] hover:text-cyan-300 flex items-center gap-1 w-fit transition-colors group"
        >
          <span>Ver todas as categorias</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid de Cards Interativos de Categorias */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {genres?.map((g) => {
          const { searchUrl, curatedUrl } = getCategoryHubUrl(g.name);
          return (
            <div
              key={g.id}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-cyan-950/20 border border-white/10 hover:border-cyan-500/40 transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 font-mono">
                    Gênero
                  </span>
                  <Tag className="w-3.5 h-3.5 text-cyan-400/60 group-hover:text-cyan-400 transition-colors" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-[#00E5FF] transition-colors">
                  {translateGenre(g.name)}
                </h4>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={searchUrl}
                  className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-500/30 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 min-h-[40px]"
                  title={`Buscar jogos de ${translateGenre(g.name)}`}
                >
                  <Search className="w-3 h-3" />
                  <span>Buscar Jogos</span>
                </Link>
                {curatedUrl && (
                  <Link
                    href={curatedUrl}
                    className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs flex items-center justify-center transition-all cursor-pointer min-h-[40px]"
                    title="Ver página especial da categoria"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}

        {themes?.slice(0, 4).map((t) => {
          const { searchUrl, curatedUrl } = getCategoryHubUrl(t);
          return (
            <div
              key={t}
              className="p-3.5 rounded-2xl bg-white/5 hover:bg-purple-950/20 border border-white/10 hover:border-purple-500/40 transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400 font-mono">
                    Tema / Ambientação
                  </span>
                  <Layers className="w-3.5 h-3.5 text-purple-400/60 group-hover:text-purple-400 transition-colors" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                  {translateTheme(t)}
                </h4>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Link
                  href={searchUrl}
                  className="flex-1 py-2 px-3 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 hover:text-white border border-purple-500/30 font-medium text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 min-h-[40px]"
                  title={`Buscar jogos com tema ${translateTheme(t)}`}
                >
                  <Search className="w-3 h-3" />
                  <span>Buscar Jogos</span>
                </Link>
                {curatedUrl && (
                  <Link
                    href={curatedUrl}
                    className="py-2 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs flex items-center justify-center transition-all cursor-pointer min-h-[40px]"
                    title="Ver página especial da categoria"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
