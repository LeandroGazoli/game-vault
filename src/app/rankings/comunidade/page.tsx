"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { UserProfile } from "@/lib/types";
import { getTopGamersLeaderboard } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import UserAvatar from "@/components/UserAvatar";
import {
  Trophy,
  Crown,
  Medal,
  Sparkles,
  Search,
  ArrowRight,
  Check,
  Gamepad2,
  Flame,
  Star,
  Zap,
  Users,
} from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

export default function CommunityLeaderboardPage() {
  const { user: authUser } = useAuth();
  const [gamers, setGamers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);
      try {
        const list = await getTopGamersLeaderboard(50);
        setGamers(list);
      } catch (err) {
        console.error("Erro ao carregar ranking da comunidade:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLeaderboard();
  }, []);

  const filteredGamers = useMemo(() => {
    if (!searchQuery.trim()) return gamers;
    const q = searchQuery.toLowerCase();
    return gamers.filter(
      (g) =>
        g.username?.toLowerCase().includes(q) ||
        g.displayName?.toLowerCase().includes(q)
    );
  }, [gamers, searchQuery]);

  const top1 = filteredGamers[0] || null;
  const top2 = filteredGamers[1] || null;
  const top3 = filteredGamers[2] || null;
  const restGamers = filteredGamers.slice(3);

  // Posição do usuário logado
  const userRankIndex = useMemo(() => {
    if (!authUser) return -1;
    return gamers.findIndex((g) => g.uid === authUser.uid);
  }, [gamers, authUser]);

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* ========================================================
          1. ABAS DE NAVEGAÇÃO ENTRE RANKING DE JOGOS E GAMERS
      ======================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold uppercase tracking-wider mb-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Leaderboard Oficial MyGameList</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Hall da Fama Gamer
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">
            Os maiores jogadores da comunidade ranqueados pelo Nível Gamer e XP acumulado.
          </p>
        </div>

        {/* Seletor de Abas Estilo Console */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#11141c] border border-white/10 w-full sm:w-auto">
          <Link
            href="/rankings"
            onClick={() => triggerSelectionHaptic()}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all whitespace-nowrap"
          >
            <Gamepad2 className="w-3.5 h-3.5" />
            <span>Melhores Jogos</span>
          </Link>
          <div className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#00E5FF]/20 to-cyan-500/20 border border-[#00E5FF] text-white shadow-[0_0_15px_rgba(0,229,255,0.4)] whitespace-nowrap">
            <Users className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Top Jogadores</span>
          </div>
        </div>
      </div>

      {/* ========================================================
          BARRA DE PESQUISA POR GAMER
      ======================================================== */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar jogador por nome ou @username..."
          className="w-full bg-[#11141c] border border-white/10 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#00E5FF] transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
          >
            Limpar
          </button>
        )}
      </div>

      {/* ========================================================
          2. PÓDIO TOP 3: CARDS HERO (#1 OURO, #2 PRATA, #3 BRONZE)
      ======================================================== */}
      {!searchQuery && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* #2 Prata (Ordem visual centralizada no desktop: 2, 1, 3) */}
          <div className="order-2 md:order-1 rounded-3xl p-5 bg-gradient-to-b from-slate-900/60 to-[#0e1118] border border-slate-400/30 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-400/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl bg-slate-400/20 text-slate-300 font-mono font-black text-xs border border-slate-400/40 flex items-center gap-1">
                <Medal className="w-3.5 h-3.5 text-slate-300" /> #2 Vice-Campeão
              </span>
              <span className="text-xs font-mono text-slate-400 font-bold">SILVER TIER</span>
            </div>

            {top2 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl p-1 bg-slate-400/30 border border-slate-300/40">
                    <UserAvatar photoURL={top2.photoURL} name={top2.displayName || top2.username} size="lg" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white truncate flex items-center gap-1.5">
                      <span>{top2.displayName || top2.username}</span>
                      {top2.isVerified && <Check className="w-3.5 h-3.5 text-[#00A3FF] stroke-[3]" />}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">@{top2.username}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">Nível Gamer</span>
                    <div className="text-sm font-black text-cyan-300 font-mono">
                      LV. {top2.gamerLevel || 1}
                    </div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">XP Total</span>
                    <div className="text-sm font-black text-[#00E5FF] font-mono">
                      {(top2.gamerXp || 0).toLocaleString("pt-BR")} XP
                    </div>
                  </div>
                </div>

                <Link
                  href={`/perfil/${top2.username}`}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Ver Perfil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">Vaga em disputa</p>
            )}
          </div>

          {/* #1 Campeão Ouro */}
          <div className="order-1 md:order-2 rounded-3xl p-6 bg-gradient-to-b from-amber-950/40 via-[#13151c] to-[#0e1118] border-2 border-amber-500/50 flex flex-col justify-between space-y-4 shadow-2xl shadow-amber-500/10 relative overflow-hidden transform md:-translate-y-2">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-mono font-black text-xs border border-amber-500/50 flex items-center gap-1.5 shadow-md">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" /> #1 LÍDER SUPREMO
              </span>
              <span className="text-xs font-mono text-amber-400 font-extrabold tracking-wider">CHAMPION</span>
            </div>

            {top1 ? (
              <div className="space-y-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="rounded-2xl p-1 bg-gradient-to-tr from-amber-400 via-amber-200 to-amber-500 border-2 border-amber-300 shadow-lg shadow-amber-500/30">
                    <UserAvatar photoURL={top1.photoURL} name={top1.displayName || top1.username} size="lg" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-white truncate flex items-center gap-1.5">
                      <span>{top1.displayName || top1.username}</span>
                      <Check className="w-4 h-4 text-[#00A3FF] stroke-[3]" />
                    </h3>
                    <p className="text-xs text-amber-300/80 font-mono">@{top1.username}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-amber-300/70 font-mono uppercase font-bold">Nível Gamer</span>
                    <div className="text-base font-black text-white font-mono flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>LV. {top1.gamerLevel || 1}</span>
                    </div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] text-amber-300/70 font-mono uppercase font-bold">XP Total</span>
                    <div className="text-base font-black text-amber-300 font-mono">
                      {(top1.gamerXp || 0).toLocaleString("pt-BR")} XP
                    </div>
                  </div>
                </div>

                <Link
                  href={`/perfil/${top1.username}`}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
                >
                  <span>Ver Perfil Lendário</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">Carregando líder...</p>
            )}
          </div>

          {/* #3 Bronze */}
          <div className="order-3 rounded-3xl p-5 bg-gradient-to-b from-amber-950/20 to-[#0e1118] border border-amber-700/30 flex flex-col justify-between space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-700/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-xl bg-amber-700/20 text-amber-400 font-mono font-black text-xs border border-amber-700/40 flex items-center gap-1">
                <Medal className="w-3.5 h-3.5 text-amber-600" /> #3 3º Lugar
              </span>
              <span className="text-xs font-mono text-amber-600 font-bold">BRONZE TIER</span>
            </div>

            {top3 ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl p-1 bg-amber-700/30 border border-amber-600/40">
                    <UserAvatar photoURL={top3.photoURL} name={top3.displayName || top3.username} size="lg" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-black text-white truncate flex items-center gap-1.5">
                      <span>{top3.displayName || top3.username}</span>
                      {top3.isVerified && <Check className="w-3.5 h-3.5 text-[#00A3FF] stroke-[3]" />}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono">@{top3.username}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="space-y-0.5">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">Nível Gamer</span>
                    <div className="text-sm font-black text-cyan-300 font-mono">
                      LV. {top3.gamerLevel || 1}
                    </div>
                  </div>
                  <div className="space-y-0.5 text-right">
                    <span className="text-[10px] text-gray-400 font-mono uppercase">XP Total</span>
                    <div className="text-sm font-black text-[#00E5FF] font-mono">
                      {(top3.gamerXp || 0).toLocaleString("pt-BR")} XP
                    </div>
                  </div>
                </div>

                <Link
                  href={`/perfil/${top3.username}`}
                  className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Ver Perfil</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <p className="text-xs text-gray-500 py-6 text-center">Vaga em disputa</p>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          3. TABELA / LISTA DOS DEMAIS JOGADORES (#4 ATÉ #50)
      ======================================================== */}
      <section className="rounded-3xl bg-[#0e1118] border border-white/10 overflow-hidden shadow-2xl space-y-0">
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#00E5FF]" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              Tabela de Mestres Gamer (Top 50)
            </h2>
          </div>
          <span className="text-xs font-mono text-gray-400">
            {filteredGamers.length} jogadores listados
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400 space-y-3 font-mono text-xs">
            <div className="w-8 h-8 rounded-full border-2 border-[#00E5FF] border-t-transparent animate-spin mx-auto" />
            <p>Carregando pontuações da comunidade...</p>
          </div>
        ) : filteredGamers.length === 0 ? (
          <div className="p-12 text-center text-gray-400 space-y-2">
            <p className="text-sm font-semibold text-white">Nenhum jogador encontrado</p>
            <p className="text-xs">Tente buscar por outro nome ou limpe o filtro.</p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {(searchQuery ? filteredGamers : restGamers).map((gamer, idx) => {
              const rankNumber = searchQuery ? idx + 1 : idx + 4;
              const isCurrentUser = authUser?.uid === gamer.uid;

              return (
                <div
                  key={gamer.uid || gamer.username}
                  className={`px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 transition-colors ${
                    isCurrentUser
                      ? "bg-[#00E5FF]/10 border-l-4 border-[#00E5FF]"
                      : "hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Posição + Avatar + Nome */}
                  <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                    <span className="w-7 text-center font-mono font-black text-xs sm:text-sm text-gray-400">
                      #{rankNumber}
                    </span>

                    <UserAvatar
                      photoURL={gamer.photoURL}
                      name={gamer.displayName || gamer.username}
                      size="md"
                      className="rounded-xl border border-white/10 shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          href={`/perfil/${gamer.username}`}
                          className="text-xs sm:text-sm font-bold text-white hover:text-[#00E5FF] transition-colors truncate"
                        >
                          {gamer.displayName || gamer.username}
                        </Link>
                        {gamer.isVerified && (
                          <Check className="w-3.5 h-3.5 text-[#00A3FF] stroke-[3] shrink-0" />
                        )}
                        {gamer.plan === "vip" && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            VIP
                          </span>
                        )}
                        {gamer.plan === "pro" && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            PRO
                          </span>
                        )}
                        {isCurrentUser && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#00E5FF] text-black uppercase">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 font-mono">@{gamer.username}</p>
                    </div>
                  </div>

                  {/* Nível + XP + Botão Perfil */}
                  <div className="flex items-center gap-3 sm:gap-6 shrink-0">
                    <div className="text-right">
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[#00E5FF] font-mono font-extrabold text-[10px]">
                        LV. {gamer.gamerLevel || 1}
                      </div>
                      <div className="text-xs font-black font-mono text-white mt-0.5">
                        {(gamer.gamerXp || 0).toLocaleString("pt-BR")}{" "}
                        <span className="text-[10px] text-cyan-400 font-normal">XP</span>
                      </div>
                    </div>

                    <Link
                      href={`/perfil/${gamer.username}`}
                      className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors"
                    >
                      <span>Ver</span>
                      <ArrowRight className="w-3 h-3 text-cyan-400" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================
          BARRA FIXA INFERIOR: SUA POSIÇÃO NO RANKING
      ======================================================== */}
      {authUser && userRankIndex >= 0 && (
        <div className="sticky bottom-4 z-30 p-3.5 sm:p-4 rounded-2xl bg-[#0c0f16]/95 border-2 border-[#00E5FF]/50 backdrop-blur-xl shadow-2xl shadow-cyan-500/20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] flex items-center justify-center font-mono font-black text-xs border border-[#00E5FF]/40">
              #{userRankIndex + 1}
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-1.5">
                <span>Sua Posição no Ranking Oficial</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#00E5FF] text-black font-black uppercase">
                  Top {Math.max(1, Math.round(((userRankIndex + 1) / Math.max(gamers.length, 1)) * 100))}%
                </span>
              </div>
              <p className="text-[11px] text-gray-300 font-mono">
                Nível {authUser.gamerLevel || 1} • {(authUser.gamerXp || 0).toLocaleString("pt-BR")} XP acumulados
              </p>
            </div>
          </div>

          <Link
            href="/perfil"
            className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-200 text-black font-bold text-xs transition-all shadow-md shrink-0"
          >
            Meu Perfil
          </Link>
        </div>
      )}
    </div>
  );
}
