"use client";

import React, { useState, useEffect } from "react";
import { Game } from "@/lib/types";
import GameCard from "@/components/GameCard";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import Link from "next/link";
import {
  Flame,
  Trophy,
  Clock,
  Sparkles,
  Search,
  Gamepad2,
  TrendingUp,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { stats } = useGameLibrary();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch("/api/games/search");
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch (err) {
        console.error("Erro ao carregar jogos populares:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const topMetacritic = [...games].sort((a, b) => (b.metacritic || 0) - (a.metacritic || 0)).slice(0, 8);
  const epicLongGames = games.filter((g) => (g.hltb?.mainStory || 0) >= 45).slice(0, 4);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-b from-indigo-950/40 via-surface-100/80 to-surface-50 p-6 sm:p-12 text-center sm:text-left shadow-2xl">
        <div className="absolute inset-0 bg-gradient-radial from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Rastreamento de Jogos • Metacritic • HowLongToBeat • IGDB
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Seu Perfil Gamer <br />
            <span className="gamer-gradient-text">Simples, Preciso e Completo.</span>
          </h1>

          <p className="mt-4 text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
            Organize tudo o que você está <strong>jogando</strong>, já <strong>zerou</strong> ou <strong>dropou</strong>.
            Acompanhe notas do Metacritic e descubra exatamente quantas horas você levará para zerar a história principal ou fazer 100%.
          </p>

          {/* Barra de Busca no Hero */}
          <div className="mt-8 max-w-xl">
            <form
              action="/search"
              method="GET"
              className="relative flex items-center"
            >
              <Search className="w-5 h-5 text-gray-400 absolute left-4" />
              <input
                type="text"
                name="q"
                placeholder="Busque por Elden Ring, God of War, The Witcher, Zelda..."
                className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-surface-50/90 border border-indigo-500/30 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xl text-sm"
              />
              <button
                type="submit"
                className="absolute right-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                Buscar
              </button>
            </form>
          </div>

          {/* Mini resumo do usuário se autenticado */}
          {user && (
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-400 border-t border-gray-800/80 pt-4">
              <span className="text-gray-300">
                Olá, <strong className="text-white">{user.displayName}</strong>!
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Trophy className="w-3.5 h-3.5" /> {stats.completedCount} zerados
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <Gamepad2 className="w-3.5 h-3.5" /> {stats.playingCount} em andamento
              </span>
              <span className="flex items-center gap-1 text-indigo-300">
                <Clock className="w-3.5 h-3.5" /> {stats.totalPlaytimeHours}h registradas
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Seção 1: Jogos em Destaque & Populares */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Em Alta na Comunidade
              </h2>
              <p className="text-xs text-gray-400">
                Os jogos mais aclamados e jogados com notas e tempos HowLongToBeat
              </p>
            </div>
          </div>

          <Link
            href="/search"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Ver catálogo completo →
          </Link>
        </div>

        {/* Grid de Jogos ou Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="h-64 rounded-2xl bg-surface-100/50 border border-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {games.slice(0, 8).map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        )}
      </section>

      {/* Seção 2: Maiores Notas no Metacritic */}
      {!loading && topMetacritic.length > 0 && (
        <section className="space-y-5 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Obras-Primas Aclamadas (85+)
                </h2>
                <p className="text-xs text-gray-400">
                  Jogos com as pontuações mais altas da crítica especializada
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {topMetacritic.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}

      {/* Seção 3: RPGs Épicos e Campanhas Longas */}
      {!loading && epicLongGames.length > 0 && (
        <section className="space-y-5 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Grandes Jornadas (50h+ de História)
                </h2>
                <p className="text-xs text-gray-400">
                  Mundos imersivos com mais de 50 horas de campanha principal
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {epicLongGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
