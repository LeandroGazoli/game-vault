"use client";

import React, { useState, useEffect } from "react";
import { Game } from "@/lib/types";
import TopTenImdbSection from "@/components/TopTenImdbSection";
import CatalogRow from "@/components/CatalogRow";
import RankingsSection from "@/components/RankingsSection";
import LiveSearchInput from "@/components/LiveSearchInput";
import AdBanner from "@/components/ads/AdBanner";
import { useAuth } from "@/context/AuthContext";
import { useGameLibrary } from "@/context/GameLibraryContext";
import Link from "next/link";
import {
  Flame,
  Trophy,
  Clock,
  Sparkles,
  Gamepad2,
  Calendar as CalendarIcon,
} from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();
  const { stats } = useGameLibrary();
  
  const [topTenGames, setTopTenGames] = useState<Game[]>([]);
  const [releases, setReleases] = useState<Game[]>([]);
  const [upcoming, setUpcoming] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [popRes, relRes, upRes] = await Promise.all([
          fetch("/api/games/search"),
          fetch("/api/games/releases"),
          fetch("/api/games/upcoming"),
        ]);

        if (popRes.ok) {
          const data = await popRes.json();
          setTopTenGames(data.games || []);
        }

        if (relRes.ok) {
          const data = await relRes.json();
          setReleases(data.games || []);
        }

        if (upRes.ok) {
          const data = await upRes.json();
          setUpcoming(data.games || []);
        }
      } catch (err) {
        console.error("Erro ao carregar catálogo da home:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* ==========================================
          1. HERO SECTION COM BUSCA E RESUMO
      ========================================== */}
      <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#1c1d22] via-[#141518] to-surface-50 p-6 sm:p-12 text-center sm:text-left shadow-2xl">
        <div className="absolute inset-0 bg-gradient-radial from-cyan-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Catálogo Vivo IGDB • Metacritic • HowLongToBeat
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Descubra, Registre e Acompanhe <br />
            <span className="gamer-gradient-text">Seus Jogos Favoritos.</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-gray-300 max-w-2xl leading-relaxed">
            Seu acervo gamer completo com <strong>lançamentos em tempo real</strong>, <strong>calendário de estreias</strong>, rankings da comunidade e tempos exatos de zeramento.
          </p>

          {/* Barra de Busca no Hero com Autocomplete ao Vivo */}
          <div className="mt-8 max-w-xl">
            <LiveSearchInput
              variant="hero"
              placeholder="Busque por Elden Ring, GTA, God of War, Zelda..."
            />
          </div>

          {/* Mini resumo do usuário se autenticado */}
          {user && (
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-400 border-t border-white/10 pt-4">
              <span className="text-gray-300">
                Olá, <strong className="text-white">{user.displayName}</strong>!
              </span>
              <span className="flex items-center gap-1 text-[#00E5FF]">
                <Trophy className="w-3.5 h-3.5" /> {stats.completedCount} zerados
              </span>
              <span className="flex items-center gap-1 text-blue-400">
                <Gamepad2 className="w-3.5 h-3.5" /> {stats.playingCount} jogando
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <Clock className="w-3.5 h-3.5" /> {stats.totalPlaytimeHours}h registradas
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          PUBLICIDADE 1: LEADERBOARD SUPERIOR
      ========================================== */}
      <AdBanner slot="HOME_TOP_LEADERBOARD" />

      {/* ==========================================
          2. TOP 10 NO GAMEVAULT (Estilo IMDb / Disney+)
      ========================================== */}
      {!loading && topTenGames.length > 0 && (
        <TopTenImdbSection games={topTenGames} />
      )}

      {/* ==========================================
          PUBLICIDADE 2: IN-FEED BANNER CENTRAL
      ========================================== */}
      <AdBanner slot="HOME_IN_FEED" />

      {/* ==========================================
          3. LANÇAMENTOS RECENTES (Últimos 60 Dias)
      ========================================== */}
      {!loading && releases.length > 0 && (
        <CatalogRow
          title="Lançamentos Recentes"
          subtitle="Jogos recém-lançados disponíveis para jogar agora"
          icon={Flame}
          games={releases}
          actionHref="/calendar"
          actionText="Ver no Calendário →"
        />
      )}

      {/* ==========================================
          4. EM BREVE (Próximos Lançamentos)
      ========================================== */}
      {!loading && upcoming.length > 0 && (
        <CatalogRow
          title="Em Breve nos Games"
          subtitle="Títulos aguardados que serão lançados nos próximos meses"
          icon={CalendarIcon}
          games={upcoming}
          actionHref="/calendar"
          actionText="Calendário Completo →"
        />
      )}

      {/* ==========================================
          5. RANKINGS MGL (Populares, Avaliados, Desejados)
      ========================================== */}
      <RankingsSection />

      {/* ==========================================
          6. BANNER DO CALENDÁRIO DE LANÇAMENTOS
      ========================================== */}
      <section className="rounded-3xl bg-gradient-to-r from-cyan-950/40 via-surface-100 to-indigo-950/40 border border-cyan-500/20 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" /> Calendário Mensal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Nunca perca a estreia de um grande jogo.
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 max-w-xl">
            Acompanhe o dia a dia de lançamentos mês a mês, filtre por datas e adicione os títulos mais aguardados diretamente à sua lista de desejos.
          </p>
        </div>

        <Link
          href="/calendar"
          className="rounded-full bg-white hover:bg-gray-200 text-black font-bold px-8 py-3.5 text-sm transition-all shadow-xl hover:scale-105 flex-shrink-0"
        >
          Abrir Calendário de Lançamentos →
        </Link>
      </section>
    </div>
  );
}
