"use client";

import React, { useState, useEffect } from "react";
import { Game, GameStatus, UserGame } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import MetacriticBadge from "./MetacriticBadge";
import HltbCard from "./HltbCard";
import {
  X,
  Trophy,
  Gamepad2,
  XCircle,
  Clock,
  Heart,
  Trash2,
  Save,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface GameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal?: () => void;
}

const PLATFORM_OPTIONS = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X/S",
  "Xbox One",
  "Nintendo Switch",
  "Steam Deck",
  "Mobile",
];

export default function GameModal({
  game,
  isOpen,
  onClose,
  onOpenAuthModal,
}: GameModalProps) {
  const { user } = useAuth();
  const { getGameInLibrary, addOrUpdateGame, deleteGame } = useGameLibrary();

  const [status, setStatus] = useState<GameStatus>("playing");
  const [rating, setRating] = useState<number>(8.5);
  const [hasRated, setHasRated] = useState<boolean>(false);
  const [playtime, setPlaytime] = useState<string>("");
  const [review, setReview] = useState<string>("");
  const [platform, setPlatform] = useState<string>("PC");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);

  const existingInLibrary = game ? getGameInLibrary(game.id) : undefined;

  useEffect(() => {
    if (game) {
      const existing = getGameInLibrary(game.id);
      if (existing) {
        setStatus(existing.status);
        if (existing.userRating !== null && existing.userRating !== undefined) {
          setRating(existing.userRating);
          setHasRated(true);
        } else {
          setRating(8.0);
          setHasRated(false);
        }
        setPlaytime(existing.userPlaytimeHours ? String(existing.userPlaytimeHours) : "");
        setReview(existing.userReview || "");
        setPlatform(existing.platformPlayed || "PC");
        setIsFavorite(existing.isFavorite || false);
      } else {
        setStatus("playing");
        setRating(8.0);
        setHasRated(false);
        setPlaytime("");
        setReview("");
        setPlatform("PC");
        setIsFavorite(false);
      }
    }
  }, [game, isOpen]);

  if (!isOpen || !game) return null;

  const handleSave = async () => {
    if (!user) {
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    setIsSaving(true);
    try {
      await addOrUpdateGame({
        gameId: game.id,
        gameSlug: game.slug,
        gameTitle: game.name,
        gameCover: game.background_image,
        status,
        userRating: hasRated ? Number(rating) : null,
        userPlaytimeHours: playtime ? parseFloat(playtime) : null,
        userReview: review.trim(),
        platformPlayed: platform,
        isFavorite,
        metacritic: game.metacritic,
        hltbData: game.hltb,
        genres: game.genres?.map((g) => g.name) || [],
        releaseYear: game.released ? game.released.substring(0, 4) : "",
      });
      onClose();
    } catch (err) {
      console.error("Erro ao salvar jogo:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!user || !existingInLibrary) return;
    if (confirm(`Deseja remover "${game.name}" da sua biblioteca?`)) {
      await deleteGame(game.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-2xl rounded-2xl bg-surface-100 border border-gray-800 shadow-2xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Banner do Jogo */}
        <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-gray-950">
          {game.background_image ? (
            <img
              src={game.background_image}
              alt={game.name}
              className="w-full h-full object-cover object-center filter brightness-60"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-indigo-950 to-purple-950" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-surface-100 via-surface-100/40 to-transparent" />

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Informações no Banner */}
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {game.released && (
                  <span className="text-xs font-mono text-gray-300 bg-black/40 px-2 py-0.5 rounded">
                    {game.released.substring(0, 4)}
                  </span>
                )}
                {game.genres && game.genres.length > 0 && (
                  <span className="text-xs text-indigo-300 bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded">
                    {game.genres.slice(0, 2).map((g) => g.name).join(", ")}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight truncate">
                {game.name}
              </h2>
            </div>

            {game.metacritic && (
              <div className="flex flex-col items-end">
                <MetacriticBadge score={game.metacritic} size="md" showLabel />
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo do Formulário */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[calc(85vh-13rem)] overflow-y-auto">
          {/* Card de Tempos HowLongToBeat */}
          <HltbCard hltb={game.hltb} />

          {/* Seletor de Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Status do Jogo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setStatus("completed")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  status === "completed"
                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-lg shadow-emerald-500/10"
                    : "bg-surface-50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                }`}
              >
                <Trophy className="w-4 h-4 text-emerald-400" />
                Zerado
              </button>

              <button
                type="button"
                onClick={() => setStatus("playing")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  status === "playing"
                    ? "bg-blue-500/20 border-blue-500 text-blue-300 shadow-lg shadow-blue-500/10"
                    : "bg-surface-50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                }`}
              >
                <Gamepad2 className="w-4 h-4 text-blue-400" />
                Jogando
              </button>

              <button
                type="button"
                onClick={() => setStatus("dropped")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  status === "dropped"
                    ? "bg-rose-500/20 border-rose-500 text-rose-300 shadow-lg shadow-rose-500/10"
                    : "bg-surface-50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-400" />
                Dropado
              </button>

              <button
                type="button"
                onClick={() => setStatus("backlog")}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                  status === "backlog"
                    ? "bg-amber-500/20 border-amber-500 text-amber-300 shadow-lg shadow-amber-500/10"
                    : "bg-surface-50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                }`}
              >
                <Clock className="w-4 h-4 text-amber-400" />
                Quero Jogar
              </button>
            </div>
          </div>

          {/* Nota Pessoal e Horas Jogadas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Avaliação Pessoal */}
            <div className="p-3.5 rounded-xl border border-gray-800 bg-surface-50">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Sua Nota Pessoal
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasRated"
                    checked={hasRated}
                    onChange={(e) => setHasRated(e.target.checked)}
                    className="rounded border-gray-700 bg-gray-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="hasRated" className="text-xs text-gray-400 cursor-pointer">
                    Avaliar
                  </label>
                </div>
              </div>

              {hasRated ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.5"
                      value={rating}
                      onChange={(e) => setRating(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <span className="ml-3 font-mono font-black text-xl text-indigo-400 min-w-[3rem] text-right">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-500 font-mono">
                    <span>0 (Péssimo)</span>
                    <span>5 (Médio)</span>
                    <span>10 (Obra-prima)</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic py-1">
                  Marque &quot;Avaliar&quot; para dar sua nota de 0 a 10
                </p>
              )}
            </div>

            {/* Horas Gastas */}
            <div className="p-3.5 rounded-xl border border-gray-800 bg-surface-50">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Tempo Gasto Jogando (Horas)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="9999"
                  step="0.5"
                  placeholder={game.hltb?.mainStory ? `Ex: ${game.hltb.mainStory}` : "Ex: 45"}
                  value={playtime}
                  onChange={(e) => setPlaytime(e.target.value)}
                  className="w-full rounded-lg bg-surface-100 border border-gray-700 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2 text-xs text-gray-500">horas</span>
              </div>
              {game.hltb?.mainStory && (
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Média para zerar a história: <strong className="text-indigo-300">{game.hltb.mainStory}h</strong>
                </p>
              )}
            </div>
          </div>

          {/* Plataforma e Favorito */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Plataforma Jogada
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-lg bg-surface-50 border border-gray-700 px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
              >
                {PLATFORM_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => setIsFavorite(!isFavorite)}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  isFavorite
                    ? "bg-pink-500/20 border-pink-500/50 text-pink-300"
                    : "bg-surface-50 border-gray-700 text-gray-400 hover:text-gray-200"
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? "fill-pink-400 text-pink-400" : ""}`} />
                {isFavorite ? "Favorito ❤️" : "Marcar Favorito"}
              </button>
            </div>
          </div>

          {/* Anotações e Resenha Pessoal */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
              Sua Resenha / Anotações Pessoais
            </label>
            <textarea
              rows={3}
              placeholder="O que você achou do jogo, história, jogabilidade, gráficos ou motivos de ter dropado..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full rounded-xl bg-surface-50 border border-gray-700 p-3 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none resize-none"
            />
          </div>
        </div>

        {/* Rodapé do Modal */}
        <div className="p-4 sm:p-5 bg-surface-50 border-t border-gray-800 flex items-center justify-between">
          <div>
            {existingInLibrary && (
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-1.5 text-xs font-medium text-rose-400 hover:text-rose-300 px-3 py-2 rounded-lg hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Remover da lista
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Salvando..." : existingInLibrary ? "Atualizar Status" : "Adicionar ao Perfil"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
