"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Game } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import MetacriticBadge from "@/components/MetacriticBadge";
import StatusBadge from "@/components/StatusBadge";
import HltbCard from "@/components/HltbCard";
import GameModal from "@/components/GameModal";
import AdBanner from "@/components/ads/AdBanner";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Monitor,
  Trophy,
  Gamepad2,
  Clock,
  Star,
  Heart,
  Edit3,
  Sparkles,
} from "lucide-react";

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user } = useAuth();
  const { getGameInLibrary } = useGameLibrary();

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const userGame = game ? getGameInLibrary(game.id) : undefined;

  useEffect(() => {
    async function loadGame() {
      if (!id) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/games/${id}`);
        if (res.ok) {
          const data = await res.json();
          setGame(data);
        }
      } catch (err) {
        console.error("Erro ao carregar detalhes do jogo:", err);
      } finally {
        setLoading(false);
      }
    }
    loadGame();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-80 rounded-[32px] bg-[#18191c]" />
        <div className="h-40 rounded-[32px] bg-[#18191c]" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-12 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Jogo não encontrado</h2>
        <p className="text-xs text-gray-400">
          Não conseguimos carregar as informações deste título.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Botão Voltar */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Hero Header do Jogo */}
      <div className="relative rounded-[32px] overflow-hidden border border-white/10 bg-[#18191c] shadow-2xl">
        {/* Backdrop Banner */}
        <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-neutral-950">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
              className="w-full h-full object-cover object-center filter brightness-50"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-cyan-950 via-[#18191c] to-black" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-[#18191c] via-[#18191c]/60 to-transparent" />
        </div>

        {/* Informações Principais sobrepostas */}
        <div className="relative -mt-24 sm:-mt-32 p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6">
          {/* Capa Poster */}
          <div className="w-36 sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-white/10 bg-neutral-900 flex-shrink-0">
            {game.background_image ? (
              <img
                src={game.background_image}
                alt={game.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                Sem Capa
              </div>
            )}
          </div>

          {/* Dados do Jogo */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {game.released && (
                <span className="flex items-center gap-1 text-xs font-mono text-gray-300 bg-black/60 border border-white/10 px-3 py-1 rounded-full">
                  <Calendar className="w-3 h-3 text-[#00E5FF]" />
                  {game.released.substring(0, 4)}
                </span>
              )}
              {game.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-3 py-1 rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {game.name}
            </h1>

            {/* Badges de Notas: Metacritic & Comunidade */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {game.metacritic && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <MetacriticBadge score={game.metacritic} size="md" showLabel />
                </div>
              )}

              {userGame && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full">
                  <span className="text-xs text-gray-400 font-medium">Seu Status:</span>
                  <StatusBadge status={userGame.status} completionType={userGame.completionType} size="md" />
                </div>
              )}
            </div>

            {/* Botão de Ação: Registrar / Editar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-gray-200 text-black text-xs sm:text-sm font-bold shadow-xl transition-all hover:scale-105"
              >
                <Edit3 className="w-4 h-4" />
                {userGame ? "Atualizar Meu Registro / Resenha" : "+ Adicionar ao Meu Perfil"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção HowLongToBeat */}
      <section className="space-y-3">
        <HltbCard hltb={game.hltb} />
      </section>

      {/* Banner de Anúncio / Patrocínio no Jogo */}
      <AdBanner slot="GAME_DETAIL_IN_CONTENT" fallbackIndex={2} />

      {/* Grid: Sinopse & Painel de Review do Usuário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Sinopse / Detalhes (2 Colunas) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white">Sobre o Jogo</h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {game.description_raw || "Descrição não disponível para este jogo."}
            </p>
          </div>

          {/* Plataformas */}
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-[#00E5FF]" /> Plataformas Disponíveis
            </h3>
            <div className="flex flex-wrap gap-2">
              {game.platforms && game.platforms.length > 0 ? (
                game.platforms.map((p) => (
                  <span
                    key={p.platform.id}
                    className="text-xs font-medium px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-gray-300"
                  >
                    {p.platform.name}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-500">Múltiplas plataformas</span>
              )}
            </div>
          </div>
        </div>

        {/* Painel do Jogador (1 Coluna) */}
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/10 bg-[#18191c] p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Seu Registro
            </h3>

            {userGame ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <span className="text-gray-400">Status atual:</span>
                  <StatusBadge status={userGame.status} size="md" />
                </div>

                {userGame.userRating !== null && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-gray-400">Sua Nota:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      ⭐ {userGame.userRating.toFixed(1)} / 10
                    </span>
                  </div>
                )}

                {userGame.userPlaytimeHours !== null && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-gray-400">Tempo jogado:</span>
                    <span className="font-bold text-cyan-300 text-sm">
                      {userGame.userPlaytimeHours}h
                    </span>
                  </div>
                )}

                {userGame.platformPlayed && (
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                    <span className="text-gray-400">Plataforma:</span>
                    <span className="font-semibold text-gray-200">
                      {userGame.platformPlayed}
                    </span>
                  </div>
                )}

                {userGame.userReview && (
                  <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 font-sans">
                      Sua Resenha
                    </span>
                    <p className="text-xs text-gray-300 italic whitespace-pre-line font-sans">
                      &quot;{userGame.userReview}&quot;
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-bold text-white transition-colors mt-2"
                >
                  Editar Registro
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-xs text-gray-400">
                  Você ainda não registrou este jogo.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-3 rounded-full bg-white hover:bg-gray-200 text-black text-xs font-bold transition-all shadow-md"
                >
                  + Adicionar ao Meu Perfil
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <GameModal
        game={game}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
