"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Game, GameStatus, CompletionType } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import MetacriticBadge from "./MetacriticBadge";
import {
  X,
  Trophy,
  Gamepad2,
  XCircle,
  Clock,
  Heart,
  Trash2,
  ChevronDown,
  ChevronUp,
  Sword,
  Compass,
  Crown,
  Sparkles,
  RotateCcw,
  Check,
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
}: GameModalProps) {
  const { getGameInLibrary, addOrUpdateGame, deleteGame } = useGameLibrary();

  // Estados principais - Nota inicial é SEMPRE null (Não avaliada / NS) para novos jogos
  const [status, setStatus] = useState<GameStatus>("backlog");
  const [completionType, setCompletionType] = useState<CompletionType | null>(null);
  const [rating, setRating] = useState<number | null>(null); // null = "NS" (Sem avaliação)
  const [playtime, setPlaytime] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [completedDate, setCompletedDate] = useState<string>("");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["PC"]);
  const [selectedChallenges, setSelectedChallenges] = useState<string[]>([]);
  const [review, setReview] = useState<string>("");
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Controle de expansão do acordeão "Detalhes"
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const existingInLibrary = game ? getGameInLibrary(game.id) : undefined;

  // Carrega os dados existentes do jogo ao abrir o modal
  useEffect(() => {
    if (game) {
      const existing = getGameInLibrary(game.id);
      if (existing) {
        setStatus(existing.status);
        setCompletionType(existing.completionType || (existing.status === "completed" ? "main_story" : null));
        setRating(existing.userRating ?? null);
        setPlaytime(existing.userPlaytimeHours ? String(existing.userPlaytimeHours) : "");
        setStartDate(existing.startedAt ? existing.startedAt.split("T")[0] : "");
        setCompletedDate(existing.completedAt ? existing.completedAt.split("T")[0] : "");
        
        const platList = existing.platformsPlayed && existing.platformsPlayed.length > 0
          ? existing.platformsPlayed
          : existing.platformPlayed
          ? [existing.platformPlayed]
          : ["PC"];
        setSelectedPlatforms(platList);
        
        setReview(existing.userReview || "");
        setIsFavorite(existing.isFavorite || false);
        setIsDetailsExpanded(Boolean(existing.userReview || existing.userPlaytimeHours || existing.completedAt));
      } else {
        // Novo jogo: Padrão Quero Jogar e Sem Nota (NS)
        setStatus("backlog");
        setCompletionType(null);
        setRating(null); // SEM AVALIAÇÃO ATÉ O USUÁRIO MEXER
        setPlaytime("");
        setStartDate("");
        setCompletedDate("");
        setSelectedPlatforms(["PC"]);
        setSelectedChallenges([]);
        setReview("");
        setIsFavorite(false);
        setIsDetailsExpanded(false);
      }
    }
  }, [game, isOpen]);

  // Fecha o modal ao pressionar a tecla Esc
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !game) return null;

  // Manipulador de tipo de conclusão rápida (100%, História Principal, Platina, etc.)
  const handleSelectCompletionType = (type: CompletionType) => {
    setCompletionType(type);
    if (type === "main_story" && game.hltb?.mainStory) {
      setPlaytime(String(game.hltb.mainStory));
    } else if (type === "main_extra" && game.hltb?.mainExtra) {
      setPlaytime(String(game.hltb.mainExtra));
    } else if (type === "completionist" && game.hltb?.completionist) {
      setPlaytime(String(game.hltb.completionist));
    } else if (type === "platinum" && game.hltb?.completionist) {
      setPlaytime(String(game.hltb.completionist));
    }
  };

  // Alterna plataforma (seleção múltipla)
  const togglePlatform = (plat: string) => {
    setSelectedPlatforms((prev) => {
      if (prev.includes(plat)) {
        return prev.length > 1 ? prev.filter((p) => p !== plat) : prev;
      } else {
        return [...prev, plat];
      }
    });
  };

  // Reação dinâmica do Emoji para a nota
  const getRatingReaction = (score: number | null) => {
    if (score === null) return { emoji: "😑", text: "Não avaliado (NS)", color: "text-gray-400" };
    if (score <= 3.0) return { emoji: "🤮", text: "Ruim", color: "text-rose-400" };
    if (score <= 5.5) return { emoji: "😕", text: "Mediano", color: "text-amber-400" };
    if (score <= 7.5) return { emoji: "🙂", text: "Bom", color: "text-emerald-400" };
    if (score <= 9.0) return { emoji: "😃", text: "Muito Bom!", color: "text-[#00E5FF]" };
    return { emoji: "🤩", text: "Obra-Prima!", color: "text-purple-400" };
  };

  const reaction = getRatingReaction(rating);

  // Salva no banco de dados / biblioteca imediatamente
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await addOrUpdateGame({
        gameId: game.id,
        gameSlug: game.slug,
        gameTitle: game.name,
        gameCover: game.background_image,
        status,
        completionType: status === "completed" ? (completionType || "main_story") : null,
        userRating: rating !== null ? rating : null,
        userPlaytimeHours: playtime ? parseFloat(playtime) : null,
        userReview: review.trim(),
        platformPlayed: selectedPlatforms[0] || "PC",
        platformsPlayed: selectedPlatforms,
        isFavorite,
        completedAt: status === "completed" ? (completedDate ? new Date(completedDate).toISOString() : new Date().toISOString()) : null,
        startedAt: startDate ? new Date(startDate).toISOString() : null,
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
    if (!existingInLibrary) return;
    if (confirm(`Deseja remover "${game.name}" da sua biblioteca?`)) {
      await deleteGame(game.id);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-[32px] bg-[#18191c] border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-white my-8 overflow-hidden max-h-[90vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botão Fechar no Canto Superior Direito */}
        <div className="absolute top-5 right-5 flex items-center gap-2 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-all"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo Rolável */}
        <div className="space-y-6 overflow-y-auto pr-1">
          {/* ==========================================
              1. CABEÇALHO DO JOGO (Flex-row)
          ========================================== */}
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Capa com cantos arredondados */}
            <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 shadow-lg flex-shrink-0">
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

            {/* Informações do Jogo */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              <div className="flex items-center gap-2">
                {game.metacritic && <MetacriticBadge score={game.metacritic} size="sm" />}
                {game.released && (
                  <span className="text-xs font-mono text-gray-400">
                    {game.released.substring(0, 4)}
                  </span>
                )}
                {isFavorite && (
                  <span className="text-xs text-pink-400 flex items-center gap-0.5">
                    <Heart className="w-3.5 h-3.5 fill-pink-400" />
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-normal text-white tracking-tight leading-snug line-clamp-2">
                {game.name}
              </h2>

              {/* Indicador e Reação da Nota */}
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-lg">{reaction.emoji}</span>
                <span className={`text-xs font-semibold ${reaction.color}`}>
                  {rating !== null ? `${rating.toFixed(1)} / 10 • ${reaction.text}` : "NS (Não avaliado)"}
                </span>
              </div>
            </div>
          </div>

          {/* ==========================================
              2. SESSÃO DE AVALIAÇÃO (Range Slider)
          ========================================== */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-white/[0.04] border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Sua Nota
              </span>
              {rating !== null && (
                <button
                  type="button"
                  onClick={() => setRating(null)}
                  className="text-xs text-gray-400 hover:text-white font-medium px-2 py-0.5 rounded-full hover:bg-white/10 transition-colors"
                >
                  Zerar Nota (NS)
                </button>
              )}
            </div>

            {/* Range Slider Interativo */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold ${
                    rating === null ? "bg-white/20 text-white" : "bg-[#00E5FF] text-black"
                  }`}>
                    {rating !== null ? rating.toFixed(1) : "NS"}
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="10"
                  step="0.5"
                  value={rating !== null ? rating : 5}
                  onChange={(e) => setRating(parseFloat(e.target.value))}
                  className="w-full h-2.5 bg-neutral-800 rounded-full appearance-none cursor-pointer accent-[#00E5FF]"
                />

                <span className="text-xs text-gray-400 font-mono flex-shrink-0">
                  10
                </span>
              </div>

              <div className="flex justify-between text-[10px] text-gray-500 font-mono px-1">
                <span>{rating === null ? "Deslize para avaliar > > > > > > >" : "0 (Péssimo)"}</span>
                <span>{rating === null ? "" : "10 (Obra-Prima)"}</span>
              </div>
            </div>
          </div>

          {/* ==========================================
              3. GRUPO DE STATUS (Radio Pill Group)
          ========================================== */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Estado
              </span>
              <button
                type="button"
                onClick={() => setStatus("backlog")}
                className="text-gray-500 hover:text-gray-300 transition-colors p-1"
                title="Resetar para Quero Jogar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Quero Jogar / Backlog (Padrão) */}
              <button
                type="button"
                onClick={() => setStatus("backlog")}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  status === "backlog"
                    ? "bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20"
                    : "bg-white/10 text-gray-300 hover:bg-white/15"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                Quero Jogar
              </button>

              {/* Jogando */}
              <button
                type="button"
                onClick={() => setStatus("playing")}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  status === "playing"
                    ? "bg-blue-400 text-black font-bold shadow-lg shadow-blue-400/20"
                    : "bg-white/10 text-gray-300 hover:bg-white/15"
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Jogando
              </button>

              {/* Concluído / Zerado */}
              <button
                type="button"
                onClick={() => {
                  setStatus("completed");
                  if (!completionType) setCompletionType("main_story");
                }}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  status === "completed"
                    ? "bg-[#00E5FF] text-black font-bold shadow-lg shadow-[#00E5FF]/20"
                    : "bg-white/10 text-gray-300 hover:bg-white/15"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                Concluído
              </button>

              {/* Dropado / Abandonado */}
              <button
                type="button"
                onClick={() => setStatus("dropped")}
                className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
                  status === "dropped"
                    ? "bg-rose-500 text-white font-bold shadow-lg shadow-rose-500/20"
                    : "bg-white/10 text-gray-300 hover:bg-white/15"
                }`}
              >
                <XCircle className="w-3.5 h-3.5" />
                Dropado
              </button>
            </div>
          </div>

          {/* ==========================================
              4. TIPO DE FINALIZAÇÃO (Quando Concluído)
          ========================================== */}
          {status === "completed" && (
            <div className="space-y-2 p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Como você finalizou o jogo?
                </span>
                <span className="text-[10px] text-gray-400">Preenchimento rápido</span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {/* História Principal */}
                <button
                  type="button"
                  onClick={() => handleSelectCompletionType("main_story")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
                    completionType === "main_story"
                      ? "bg-cyan-400 text-black font-bold"
                      : "bg-white/10 text-gray-300 hover:bg-white/15"
                  }`}
                >
                  <Sword className="w-3 h-3" />
                  História Principal
                  {game.hltb?.mainStory && (
                    <span className="opacity-75 font-mono">({game.hltb.mainStory}h)</span>
                  )}
                </button>

                {/* História + Extras */}
                <button
                  type="button"
                  onClick={() => handleSelectCompletionType("main_extra")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
                    completionType === "main_extra"
                      ? "bg-purple-400 text-black font-bold"
                      : "bg-white/10 text-gray-300 hover:bg-white/15"
                  }`}
                >
                  <Compass className="w-3 h-3" />
                  História + Extras
                  {game.hltb?.mainExtra && (
                    <span className="opacity-75 font-mono">({game.hltb.mainExtra}h)</span>
                  )}
                </button>

                {/* 100% Complecionista */}
                <button
                  type="button"
                  onClick={() => handleSelectCompletionType("completionist")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
                    completionType === "completionist"
                      ? "bg-amber-400 text-black font-bold"
                      : "bg-white/10 text-gray-300 hover:bg-white/15"
                  }`}
                >
                  <Crown className="w-3 h-3" />
                  100% Completo
                  {game.hltb?.completionist && (
                    <span className="opacity-75 font-mono">({game.hltb.completionist}h)</span>
                  )}
                </button>

                {/* Platina */}
                <button
                  type="button"
                  onClick={() => handleSelectCompletionType("platinum")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
                    completionType === "platinum"
                      ? "bg-emerald-400 text-black font-bold"
                      : "bg-white/10 text-gray-300 hover:bg-white/15"
                  }`}
                >
                  <Trophy className="w-3 h-3" />
                  Platina / Conquistas
                </button>

                {/* Horas Customizadas */}
                <button
                  type="button"
                  onClick={() => handleSelectCompletionType("custom")}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 transition-all ${
                    completionType === "custom"
                      ? "bg-white text-black font-bold"
                      : "bg-white/10 text-gray-300 hover:bg-white/15"
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  Personalizado
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              5. SEÇÃO DE DETALHES (Acordeão Expansível)
          ========================================== */}
          <div className="border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
              className="w-full flex items-center justify-between text-xs uppercase tracking-wider font-semibold text-gray-300 hover:text-white transition-colors py-2"
            >
              <span>Detalhes (Plataformas, Horas, Datas, Resenha)</span>
              {isDetailsExpanded ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {isDetailsExpanded && (
              <div className="space-y-4 pt-3 animate-fadeIn">
                {/* Plataformas (Multi-seleção em pílulas) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-400">
                    Plataformas Jogadas (seleção múltipla)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORM_OPTIONS.map((plat) => {
                      const isSelected = selectedPlatforms.includes(plat);
                      return (
                        <button
                          key={plat}
                          type="button"
                          onClick={() => togglePlatform(plat)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            isSelected
                              ? "bg-white/25 text-white border border-white/40 shadow-sm"
                              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-transparent"
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                          {plat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Inputs de Tempo e Datas */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Horas Totais */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Horas Jogadas
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        placeholder="Ex: 45"
                        value={playtime}
                        onChange={(e) => setPlaytime(e.target.value)}
                        className="w-full rounded-full bg-white/10 border-transparent focus:border-white/30 px-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none"
                      />
                      <Clock className="w-3.5 h-3.5 text-gray-500 absolute right-3.5 top-2.5" />
                    </div>
                  </div>

                  {/* Data de Início */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Data de Início
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full rounded-full bg-white/10 border-transparent focus:border-white/30 px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Data de Conclusão */}
                  <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                      Data de Conclusão
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={completedDate}
                        onChange={(e) => setCompletedDate(e.target.value)}
                        className="w-full rounded-full bg-white/10 border-transparent focus:border-white/30 px-3 py-2 text-xs text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Conquistas & Desafios */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-xs font-medium text-gray-400">
                    Conquistas & Desafios Concluídos
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: "platina", label: "🏆 Platina / 100%" },
                      { id: "ng_plus", label: "🔄 NG+" },
                      { id: "all_endings", label: "🔀 Todos os finais" },
                      { id: "max_diff", label: "🔥 Dificuldade máxima" },
                      { id: "no_death", label: "🛡️ Sem mortes" },
                      { id: "speedrun", label: "⚡ Speedrun" },
                      { id: "pacifist", label: "☮️ Pacifista" },
                    ].map((ch) => {
                      const isSel = selectedChallenges.includes(ch.id);
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => {
                            setSelectedChallenges((prev) =>
                              prev.includes(ch.id)
                                ? prev.filter((c) => c !== ch.id)
                                : [...prev, ch.id]
                            );
                          }}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                            isSel
                              ? "bg-white/25 text-white border border-white/40 shadow-sm"
                              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-transparent"
                          }`}
                        >
                          {isSel && <Check className="w-3 h-3 inline mr-1" />}
                          {ch.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Resenha / Anotações */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-400">
                    Sua Resenha ou Notas Pessoais
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Escreva suas impressões sobre o jogo, história, jogabilidade..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="w-full rounded-2xl bg-white/5 border border-white/10 p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none"
                  />
                </div>

                {/* Botão Favorito */}
                <div>
                  <button
                    type="button"
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`rounded-full px-4 py-2 text-xs font-medium flex items-center gap-2 transition-all ${
                      isFavorite
                        ? "bg-pink-500/20 border border-pink-500/50 text-pink-300"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-pink-400 text-pink-400" : ""}`} />
                    {isFavorite ? "Marcado como Favorito ❤️" : "Marcar como Favorito"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ==========================================
            6. RODAPÉ / CALL TO ACTION (Pill Button)
        ========================================== */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4 mt-2">
          <div>
            {existingInLibrary ? (
              <button
                type="button"
                onClick={handleDelete}
                className="text-rose-400 hover:text-rose-300 text-xs font-medium flex items-center gap-1.5 px-3 py-2 rounded-full hover:bg-rose-500/10 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-white text-xs font-medium px-3 py-2 rounded-full transition-colors"
              >
                Cancelar
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-full bg-white hover:bg-gray-200 text-black font-bold text-xs sm:text-sm py-3 px-8 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? "Salvando..." : existingInLibrary ? "Salvar Alterações" : "Adicionar Jogo"}
          </button>
        </div>
      </div>
    </div>
  );
}
