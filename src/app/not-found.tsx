import React from "react";
import Link from "next/link";
import { Gamepad2, Compass, Flame, Calendar, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-12 px-4">
      <div className="max-w-xl w-full text-center space-y-8 relative">
        {/* Glow de fundo */}
        <div className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-cyan-500/10 blur-[100px]" />

        {/* Ícone 404 Estilo Cartucho/Gamer */}
        <div className="relative inline-flex items-center justify-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-b from-white/10 to-white/5 border border-white/10 flex items-center justify-center shadow-2xl backdrop-blur-xl">
            <Gamepad2 className="w-12 h-12 text-[#00E5FF] animate-pulse" />
          </div>
          <span className="absolute -bottom-2 -right-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 font-mono text-xs font-black">
            404
          </span>
        </div>

        {/* Título & Descrição */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight font-display">
            Página Não Encontrada
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto leading-relaxed">
            Parece que este jogo ou página saiu do mapa! O endereço pode ter mudado ou você encontrou uma área secreta ainda não explorada.
          </p>
        </div>

        {/* Ações de Recuperação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Início
          </Link>
          <Link
            href="/search"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all hover:border-white/20 active:scale-95"
          >
            <Search className="w-4 h-4 text-[#00E5FF]" />
            Buscar no Acervo
          </Link>
        </div>

        {/* Atalhos Rápidos Recomendados */}
        <div className="pt-6 border-t border-white/5">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-mono mb-4">
            Explorar seções populares
          </p>
          <div className="grid grid-cols-3 gap-2 sm:gap-3 text-left">
            <Link
              href="/calendar"
              className="p-3 rounded-xl bg-[#14171f] border border-white/5 hover:border-cyan-500/30 transition-all group"
            >
              <Calendar className="w-4 h-4 text-cyan-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white group-hover:text-cyan-300">Lançamentos</div>
              <div className="text-[10px] text-gray-400">Calendário 2026</div>
            </Link>

            <Link
              href="/rankings"
              className="p-3 rounded-xl bg-[#14171f] border border-white/5 hover:border-amber-500/30 transition-all group"
            >
              <Flame className="w-4 h-4 text-amber-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white group-hover:text-amber-300">Rankings</div>
              <div className="text-[10px] text-gray-400">Top Metacritic</div>
            </Link>

            <Link
              href="/categorias"
              className="p-3 rounded-xl bg-[#14171f] border border-white/5 hover:border-purple-500/30 transition-all group"
            >
              <Compass className="w-4 h-4 text-purple-400 mb-1.5 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white group-hover:text-purple-300">Categorias</div>
              <div className="text-[10px] text-gray-400">Por Gênero &amp; Estilo</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
