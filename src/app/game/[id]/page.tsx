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
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Layers,
  Monitor,
  Trophy,
  Gamepad2,
  Clock,
  Star,
  Heart,
  Share2,
  ExternalLink,
  Edit3,
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
        <div className="h-80 rounded-3xl bg-surface-100/60" />
        <div className="h-40 rounded-3xl bg-surface-100/40" />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="rounded-3xl border border-gray-800 bg-surface-100/40 p-12 text-center">
        <h2 className="text-xl font-bold text-white">Jogo não encontrado</h2>
        <p className="text-xs text-gray-400 mt-2">
          Não conseguimos carregar as informações deste jogo.
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Início
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Botão Voltar */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Voltar
      </button>

      {/* Hero Header do Jogo */}
      <div className="relative rounded-3xl overflow-hidden border border-gray-800 bg-surface-100 shadow-2xl">
        {/* Backdrop Banner */}
        <div className="relative h-64 sm:h-96 w-full overflow-hidden bg-gray-950">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
              className="w-full h-full object-cover object-center filter brightness-50"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-950 via-purple-950 to-gray-950" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-surface-100/60 to-transparent" />
        </div>

        {/* Informações Principais sobrepostas */}
        <div className="relative -mt-24 sm:-mt-32 p-6 sm:p-8 flex flex-col md:flex-row items-start gap-6">
          {/* Capa Poster */}
          <div className="w-36 sm:w-48 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-700/80 bg-gray-900 flex-shrink-0">
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
                <span className="flex items-center gap-1 text-xs font-mono text-gray-300 bg-black/50 border border-gray-700/60 px-2.5 py-1 rounded-full">
                  <Calendar className="w-3 h-3 text-indigo-400" />
                  {game.released.substring(0, 4)}
                </span>
              )}
              {game.genres?.map((g) => (
                <span
                  key={g.id}
                  className="text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2.5 py-1 rounded-full"
                >
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              {game.name}
            </h1>

            {/* Badges de Notas: Metacritic & Comunidade */}
            <div className="flex flex-wrap items-center gap-4 pt-1">
              {game.metacritic && (
                <div className="flex items-center gap-2 bg-surface-50/80 border border-gray-800 px-3 py-1.5 rounded-xl">
                  <MetacriticBadge score={game.metacritic} size="md" showLabel />
                </div>
              )}

              {userGame && (
                <div className="flex items-center gap-2 bg-surface-50/80 border border-gray-800 px-3 py-1.5 rounded-xl">
                  <span className="text-xs text-gray-400 font-medium">Seu Status:</span>
                  <StatusBadge status={userGame.status} size="md" />
                </div>
              )}
            </div>

            {/* Botão de Ação: Registrar / Editar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
              >
                <Edit3 className="w-4 h-4" />
                {userGame ? "Atualizar Meu Status / Resenha" : "Adicionar ao Meu Perfil"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Seção HowLongToBeat */}
      <section className="space-y-3">
        <HltbCard hltb={game.hltb} />
      </section>

      {/* Grid: Sinopse & Painel de Review do Usuário */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Sinopse / Detalhes (2 Colunas) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-gray-800 bg-surface-100/70 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white">Sobre o Jogo</h3>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {game.description_raw || "Descrição não disponível para este jogo."}
            </p>
          </div>

          {/* Plataformas e Detalhes Técnicos */}
          <div className="rounded-3xl border border-gray-800 bg-surface-100/70 p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Monitor className="w-5 h-5 text-indigo-400" /> Plataformas Disponíveis
            </h3>
            <div className="flex flex-wrap gap-2">
              {game.platforms && game.platforms.length > 0 ? (
                game.platforms.map((p) => (
                  <span
                    key={p.platform.id}
                    className="text-xs font-medium px-3 py-1.5 rounded-xl bg-surface-50 border border-gray-800 text-gray-300"
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
          <div className="rounded-3xl border border-indigo-500/20 bg-surface-100/90 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-indigo-400" /> Seu Progresso
            </h3>

            {userGame ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-gray-800">
                  <span className="text-xs text-gray-400">Status atual:</span>
                  <StatusBadge status={userGame.status} size="md" />
                </div>

                {userGame.userRating !== null && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-gray-800">
                    <span className="text-xs text-gray-400">Sua Nota:</span>
                    <span className="font-mono font-black text-amber-400 text-base">
                      {userGame.userRating.toFixed(1)} / 10
                    </span>
                  </div>
                )}

                {userGame.userPlaytimeHours !== null && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-gray-800">
                    <span className="text-xs text-gray-400">Tempo jogado:</span>
                    <span className="font-mono font-bold text-indigo-300 text-sm">
                      {userGame.userPlaytimeHours} horas
                    </span>
                  </div>
                )}

                {userGame.platformPlayed && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-gray-800">
                    <span className="text-xs text-gray-400">Plataforma:</span>
                    <span className="text-xs font-semibold text-gray-200">
                      {userGame.platformPlayed}
                    </span>
                  </div>
                )}

                {userGame.userReview && (
                  <div className="p-3.5 rounded-xl bg-surface-50 border border-gray-800 space-y-1">
                    <span className="text-[11px] uppercase font-bold text-gray-500">
                      Sua Resenha / Anotações
                    </span>
                    <p className="text-xs text-gray-300 italic whitespace-pre-line">
                      &quot;{userGame.userReview}&quot;
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-surface-50 hover:bg-surface-200 border border-gray-700 text-xs font-semibold text-gray-200 transition-colors"
                >
                  Editar Dados Registrados
                </button>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <Gamepad2 className="w-10 h-10 text-gray-600 mx-auto" />
                <p className="text-xs text-gray-400">
                  Você ainda não adicionou este jogo à sua biblioteca.
                </p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md"
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
