"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { getGameUrl } from "@/lib/routes";
import { Game, GameStatus, CompletionType, HLTBData, DLCItem, UserGameDLC } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import MetacriticBadge from "./MetacriticBadge";
import AuthModal from "./AuthModal";
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
  Lock,
  User,
  Monitor,
  Package,
  Layers,
} from "lucide-react";
import { CONSOLE_CATEGORIES, POPULAR_CONSOLES } from "@/lib/platformUtils";

interface GameModalProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenAuthModal?: () => void;
}

export default function GameModal({
  game,
  isOpen,
  onClose,
}: GameModalProps) {
  const { user } = useAuth();
  const { getGameInLibrary, addOrUpdateGame, deleteGame } = useGameLibrary();
  const [isAuthOpen, setIsAuthOpen] = useState(false);

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
  const [hltb, setHltb] = useState<HLTBData | null>(game?.hltb || null);
  const [isFavorite, setIsFavorite] = useState<boolean>(false);

  // Estados de Expansões & DLCs
  const [availableDlcs, setAvailableDlcs] = useState<DLCItem[]>([]);
  const [userDlcs, setUserDlcs] = useState<UserGameDLC[]>([]);
  const [includeDlcHours, setIncludeDlcHours] = useState<boolean>(true);
  const [isDlcsExpanded, setIsDlcsExpanded] = useState<boolean>(false);
  const [parentGameInfo, setParentGameInfo] = useState<{ id: number; name: string } | null>(null);
  const [isLoadingDlcs, setIsLoadingDlcs] = useState<boolean>(false);

  // Controle de expansão do acordeão "Detalhes"
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);
  const [showAllConsoles, setShowAllConsoles] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const existingInLibrary = game ? getGameInLibrary(game.id) : undefined;

  // Carrega lista de DLCs disponíveis e dados do jogo pai
  useEffect(() => {
    if (!game || !isOpen) return;

    const directDlcs: DLCItem[] = [
      ...(game.dlcs || []),
      ...(game.expansions || []),
    ];

    if (directDlcs.length > 0) {
      const unique = Array.from(new Map(directDlcs.map((item) => [item.id, item])).values());
      setAvailableDlcs(unique);
    } else {
      setIsLoadingDlcs(true);
      fetch(`/api/games/${game.id}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data: Game | null) => {
          if (data) {
            const combined: DLCItem[] = [
              ...(data.dlcs || []),
              ...(data.expansions || []),
            ];
            const unique = Array.from(new Map(combined.map((item) => [item.id, item])).values());
            setAvailableDlcs(unique);
            if (data.parent_game) {
              setParentGameInfo(data.parent_game);
            }
          }
        })
        .catch(() => {})
        .finally(() => setIsLoadingDlcs(false));
    }

    if (game.parent_game) {
      setParentGameInfo(game.parent_game);
    } else {
      const existing = getGameInLibrary(game.id);
      if (existing?.parentGameId && existing?.parentGameTitle) {
        setParentGameInfo({ id: existing.parentGameId, name: existing.parentGameTitle });
      } else {
        setParentGameInfo(null);
      }
    }
  }, [game, isOpen, getGameInLibrary]);

  // Carrega os dados existentes do jogo ao abrir o modal
  useEffect(() => {
    if (game) {
      if (game.hltb) {
        setHltb(game.hltb);
      } else {
        fetch(`/api/games/hltb?name=${encodeURIComponent(game.name)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.hltb) {
              setHltb(data.hltb);
              game.hltb = data.hltb;
            }
          })
          .catch(() => {});
      }

      const existing = getGameInLibrary(game.id);
      if (existing) {
        setStatus(existing.status);
        setCompletionType(existing.completionType || (existing.status === "completed" ? "main_story" : null));
        setRating(existing.userRating ?? null);
        
        const existingDlcs = existing.dlcs || [];
        setUserDlcs(existingDlcs);
        const incDlcs = existing.includeDlcHoursInTotal ?? true;
        setIncludeDlcHours(incDlcs);
        if (existingDlcs.length > 0) {
          setIsDlcsExpanded(true);
        }

        // Calcula tempo do jogo base sem somar repetidamente as DLCs
        const dlcHoursSum = existingDlcs.reduce((acc, d) => acc + (d.playtimeHours && d.playtimeHours > 0 ? d.playtimeHours : 0), 0);
        if (existing.userPlaytimeHours) {
          if (incDlcs && dlcHoursSum > 0 && existing.userPlaytimeHours >= dlcHoursSum) {
            const base = existing.userPlaytimeHours - dlcHoursSum;
            setPlaytime(base > 0 ? String(base) : "");
          } else {
            setPlaytime(String(existing.userPlaytimeHours));
          }
        } else {
          setPlaytime("");
        }

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
        setUserDlcs([]);
        setIncludeDlcHours(true);
        setIsDlcsExpanded(false);
        const defaultPlat = game.platforms && game.platforms.length > 0
          ? [game.platforms[0].platform.name]
          : ["PC"];
        setSelectedPlatforms(defaultPlat);
        setSelectedChallenges([]);
        setReview("");
        setIsFavorite(false);
        setIsDetailsExpanded(false);
      }
    }
  }, [game, isOpen, getGameInLibrary]);

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
    const activeHltb = hltb || game.hltb;
    if (type === "main_story" && activeHltb?.mainStory) {
      setPlaytime(String(activeHltb.mainStory));
    } else if (type === "main_extra" && activeHltb?.mainExtra) {
      setPlaytime(String(activeHltb.mainExtra));
    } else if (type === "completionist" && activeHltb?.completionist) {
      setPlaytime(String(activeHltb.completionist));
    } else if (type === "platinum" && activeHltb?.completionist) {
      setPlaytime(String(activeHltb.completionist));
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

  // Manipuladores de DLCs
  const handleToggleDlcStatus = (dlc: DLCItem, nextStatus: GameStatus | null) => {
    setUserDlcs((prev) => {
      if (!nextStatus) {
        return prev.filter((d) => d.id !== dlc.id);
      }
      const existingIdx = prev.findIndex((d) => d.id === dlc.id);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          status: nextStatus,
          completedAt: nextStatus === "completed" ? (copy[existingIdx].completedAt || new Date().toISOString()) : null,
        };
        return copy;
      } else {
        return [
          ...prev,
          {
            id: dlc.id,
            name: dlc.name,
            coverUrl: dlc.coverUrl || null,
            status: nextStatus,
            playtimeHours: null,
            completedAt: nextStatus === "completed" ? new Date().toISOString() : null,
          },
        ];
      }
    });
  };

  const handleUpdateDlcHours = (dlcId: number, hoursStr: string) => {
    const val = hoursStr ? parseFloat(hoursStr) : null;
    setUserDlcs((prev) =>
      prev.map((d) => (d.id === dlcId ? { ...d, playtimeHours: val && val > 0 ? val : null } : d))
    );
  };

  const handleMarkAllDlcs = (allStatus: GameStatus) => {
    const updated: UserGameDLC[] = availableDlcs.map((d) => {
      const existing = userDlcs.find((u) => u.id === d.id);
      return {
        id: d.id,
        name: d.name,
        coverUrl: d.coverUrl || null,
        status: allStatus,
        playtimeHours: existing?.playtimeHours || null,
        completedAt: allStatus === "completed" ? (existing?.completedAt || new Date().toISOString()) : null,
      };
    });
    setUserDlcs(updated);
  };

  const handleClearAllDlcs = () => {
    setUserDlcs([]);
  };

  // Horas consolidadas
  const dlcHoursTotal = userDlcs.reduce(
    (acc, d) => acc + (d.playtimeHours && d.playtimeHours > 0 ? d.playtimeHours : 0),
    0
  );
  const baseHoursVal = playtime ? parseFloat(playtime) || 0 : 0;
  const effectiveTotalPlaytime = includeDlcHours ? baseHoursVal + dlcHoursTotal : baseHoursVal;

  // Salva no banco de dados / biblioteca
  const handleSave = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setIsSaving(true);
    try {
      const calculatedTotal = effectiveTotalPlaytime > 0 ? Number(effectiveTotalPlaytime.toFixed(1)) : null;

      await addOrUpdateGame({
        gameId: game.id,
        gameSlug: game.slug,
        gameTitle: game.name,
        gameCover: game.background_image,
        status,
        completionType: status === "completed" ? (completionType || "main_story") : null,
        userRating: rating !== null ? rating : null,
        userPlaytimeHours: calculatedTotal,
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
        dlcs: userDlcs.length > 0 ? userDlcs : undefined,
        parentGameId: parentGameInfo?.id || game.parent_game?.id || existingInLibrary?.parentGameId || null,
        parentGameTitle: parentGameInfo?.name || game.parent_game?.name || existingInLibrary?.parentGameTitle || null,
        includeDlcHoursInTotal: includeDlcHours,
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

  const modalContent = (
    <>
      <div
        className="fixed inset-0 z-[999] !m-0 !mt-0 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn pt-[max(env(safe-area-inset-top,0px)+8px,0.75rem)] pb-[max(env(safe-area-inset-bottom,0px)+8px,0.75rem)]"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-xl rounded-[32px] bg-[#18191c] border border-white/10 shadow-2xl p-5 sm:p-8 space-y-5 sm:space-y-6 text-white my-auto overflow-hidden max-h-[92dvh] flex flex-col justify-between"
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

            {/* Aviso se este jogo for uma DLC/Expansão oficial */}
            {parentGameInfo && (
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs text-amber-200 animate-fadeIn">
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="truncate">
                    Esta é uma DLC/Expansão oficial de <strong>{parentGameInfo.name}</strong>.
                  </span>
                </div>
                <Link
                  href={getGameUrl(parentGameInfo)}
                  onClick={onClose}
                  className="px-3 py-1 rounded-full bg-amber-400 hover:bg-amber-300 text-black font-bold text-[11px] transition-colors flex-shrink-0"
                >
                  Ver Jogo Base
                </Link>
              </div>
            )}

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
                {/* Biblioteca */}
                <button
                  type="button"
                  onClick={() => setStatus("library")}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
                    status === "library"
                      ? "bg-indigo-400 text-black font-bold shadow-lg shadow-indigo-400/20"
                      : "bg-white/10 text-gray-300 hover:bg-white/15"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  Biblioteca
                </button>

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
                    {(hltb?.mainStory || game.hltb?.mainStory) && (
                      <span className="opacity-75 font-mono">({(hltb?.mainStory || game.hltb?.mainStory)}h)</span>
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
                    {(hltb?.mainExtra || game.hltb?.mainExtra) && (
                      <span className="opacity-75 font-mono">({(hltb?.mainExtra || game.hltb?.mainExtra)}h)</span>
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
                    {(hltb?.completionist || game.hltb?.completionist) && (
                      <span className="opacity-75 font-mono">({(hltb?.completionist || game.hltb?.completionist)}h)</span>
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
                4.5 EXPANSÕES & DLCS DISPONÍVEIS
            ========================================== */}
            {(availableDlcs.length > 0 || isLoadingDlcs) && (
              <div className="rounded-2xl border border-cyan-500/25 bg-gradient-to-b from-cyan-950/20 via-neutral-900/60 to-[#18191c] p-3.5 sm:p-4 space-y-3 shadow-lg">
                <div
                  className="flex items-center justify-between cursor-pointer select-none"
                  onClick={() => setIsDlcsExpanded(!isDlcsExpanded)}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-[#00E5FF] border border-cyan-500/30">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
                        Expansões &amp; DLCs Oficiais
                        {availableDlcs.length > 0 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-[#00E5FF] border border-cyan-500/30 font-bold">
                            {userDlcs.filter((d) => d.status === "completed").length}/{availableDlcs.length} Zeradas
                          </span>
                        )}
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Anexe suas DLCs e consolide as horas de jogo diretamente neste título
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-all"
                  >
                    {isDlcsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isDlcsExpanded && (
                  <div className="space-y-3 pt-3 border-t border-white/10 animate-fadeIn">
                    {/* Botões Rápidos e Opção de Somar Horas */}
                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMarkAllDlcs("completed")}
                          className="text-[11px] px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 font-bold transition-all flex items-center gap-1 active:scale-95"
                        >
                          <Trophy className="w-3 h-3" />
                          Marcar Todas como Zeradas
                        </button>
                        {userDlcs.length > 0 && (
                          <button
                            type="button"
                            onClick={handleClearAllDlcs}
                            className="text-[11px] px-2.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all active:scale-95"
                          >
                            Desmarcar Todas
                          </button>
                        )}
                      </div>

                      {/* Toggle de Consolidação de Horas */}
                      <label className="flex items-center gap-2 cursor-pointer text-xs text-cyan-300 font-medium select-none">
                        <input
                          type="checkbox"
                          checked={includeDlcHours}
                          onChange={(e) => setIncludeDlcHours(e.target.checked)}
                          className="rounded border-cyan-500/40 text-[#00E5FF] focus:ring-0 focus:ring-offset-0 bg-white/10"
                        />
                        Somar horas das DLCs no tempo total
                      </label>
                    </div>

                    {/* Lista de DLCs */}
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {availableDlcs.map((dlc) => {
                        const userDlc = userDlcs.find((d) => d.id === dlc.id);
                        const curStatus = userDlc?.status || null;

                        return (
                          <div
                            key={dlc.id}
                            className={`p-2.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                              curStatus === "completed"
                                ? "bg-emerald-950/30 border-emerald-500/40"
                                : curStatus === "playing"
                                ? "bg-cyan-950/30 border-cyan-500/40"
                                : curStatus === "backlog"
                                ? "bg-amber-950/30 border-amber-500/40"
                                : "bg-white/[0.03] border-white/5 hover:border-white/15"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-10 h-12 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 flex-shrink-0">
                                {dlc.coverUrl ? (
                                  <img src={dlc.coverUrl} alt={dlc.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-[9px] text-gray-500 font-mono">
                                    DLC
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-white truncate" title={dlc.name}>
                                  {dlc.name}
                                </p>
                                {dlc.releaseDate && (
                                  <span className="text-[10px] text-gray-400 font-mono">
                                    {dlc.releaseDate.substring(0, 4)}
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                              {/* Seletor de Status da DLC */}
                              <div className="flex items-center gap-0.5 bg-black/50 p-0.5 rounded-lg border border-white/10">
                                <button
                                  type="button"
                                  onClick={() => handleToggleDlcStatus(dlc, null)}
                                  className={`text-[10px] px-2 py-0.5 rounded transition-all ${
                                    !curStatus ? "bg-white/20 text-white font-bold" : "text-gray-400 hover:text-gray-200"
                                  }`}
                                  title="Não joguei"
                                >
                                  Não
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleDlcStatus(dlc, "backlog")}
                                  className={`text-[10px] px-2 py-0.5 rounded transition-all ${
                                    curStatus === "backlog" ? "bg-amber-500 text-black font-bold" : "text-gray-400 hover:text-gray-200"
                                  }`}
                                  title="Quero Jogar"
                                >
                                  Quero
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleDlcStatus(dlc, "playing")}
                                  className={`text-[10px] px-2 py-0.5 rounded transition-all ${
                                    curStatus === "playing" ? "bg-cyan-500 text-black font-bold" : "text-gray-400 hover:text-gray-200"
                                  }`}
                                  title="Jogando"
                                >
                                  Jogando
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleDlcStatus(dlc, "completed")}
                                  className={`text-[10px] px-2 py-0.5 rounded transition-all ${
                                    curStatus === "completed" ? "bg-emerald-500 text-black font-bold" : "text-gray-400 hover:text-gray-200"
                                  }`}
                                  title="Zerada"
                                >
                                  Zerada
                                </button>
                              </div>

                              {/* Input de Horas da DLC (opcional) */}
                              {curStatus && (
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.5"
                                    placeholder="h"
                                    value={userDlc?.playtimeHours ?? ""}
                                    onChange={(e) => handleUpdateDlcHours(dlc.id, e.target.value)}
                                    className="w-12 rounded-md bg-white/10 border border-white/10 px-1 py-0.5 text-[11px] text-white text-center font-mono focus:outline-none focus:border-cyan-400"
                                    title="Horas jogadas nesta DLC"
                                  />
                                  <span className="text-[10px] text-gray-400 font-mono">h</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumo Consolidado de Horas */}
                    {dlcHoursTotal > 0 && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs font-mono flex items-center justify-between text-gray-300">
                        <span>Horas Consolidadas:</span>
                        <span className="text-cyan-300">
                          Base ({playtime || 0}h) + DLCs ({dlcHoursTotal}h) ={" "}
                          <strong className="text-white text-sm font-bold">
                            {effectiveTotalPlaytime}h Total
                          </strong>
                        </span>
                      </div>
                    )}
                  </div>
                )}
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium text-gray-300">
                        Plataformas Jogadas (seleção múltipla)
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAllConsoles(!showAllConsoles)}
                        className="text-[11px] text-[#00E5FF] hover:underline font-medium"
                      >
                        {showAllConsoles ? "Ocultar catálogo completo" : "Ver todos os consoles (+Retrô)"}
                      </button>
                    </div>

                    {/* 1. Se o jogo tiver plataformas cadastradas no IGDB, destaca aqui primeiro */}
                    {game.platforms && game.platforms.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/25 border border-cyan-500/20 space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> Plataformas oficiais deste jogo:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {game.platforms.map((p) => {
                            const platName = p.platform.name;
                            const isSelected = selectedPlatforms.includes(platName);
                            return (
                              <button
                                key={platName}
                                type="button"
                                onClick={() => togglePlatform(platName)}
                                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                                  isSelected
                                    ? "bg-[#00E5FF] text-black font-bold shadow-sm shadow-[#00E5FF]/20"
                                    : "bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 border border-cyan-500/30"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                                {platName}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 2. Plataformas Populares (Modernos + Retrô mais jogados) */}
                    {!showAllConsoles && (
                      <div className="flex flex-wrap gap-1.5">
                        {POPULAR_CONSOLES.map((plat) => {
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
                    )}

                    {/* 3. Catálogo Completo por Fabricante (PlayStation, Xbox, Nintendo, Sega, etc.) */}
                    {showAllConsoles && (
                      <div className="space-y-3 pt-2 border-t border-white/10 animate-fadeIn">
                        {Object.entries(CONSOLE_CATEGORIES).map(([category, consoles]) => (
                          <div key={category} className="space-y-1.5">
                            <span className="text-[11px] font-semibold text-gray-400 block">{category}</span>
                            <div className="flex flex-wrap gap-1.5">
                              {consoles.map((plat) => {
                                const isSelected = selectedPlatforms.includes(plat);
                                return (
                                  <button
                                    key={plat}
                                    type="button"
                                    onClick={() => togglePlatform(plat)}
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium transition-all ${
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
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Inputs de Tempo e Datas */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Horas Totais */}
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">
                        {availableDlcs.length > 0 ? "Horas (Jogo Base)" : "Horas Jogadas"}
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
                      {dlcHoursTotal > 0 && (
                        <p className="text-[10px] text-cyan-300 font-mono mt-1 px-1">
                          Base: {playtime || "0"}h + DLCs: {dlcHoursTotal}h ={" "}
                          <strong>{effectiveTotalPlaytime}h Total</strong>
                        </p>
                      )}
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

            {/* Banner de Aviso caso o usuário não esteja logado */}
            {!user && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-amber-300 text-xs">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  <span>Você precisa entrar na sua conta para salvar jogos.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                  className="px-3 py-1 rounded-full bg-amber-400 text-black font-bold text-[11px] flex-shrink-0 hover:bg-amber-300"
                >
                  Entrar
                </button>
              </div>
            )}
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
              className={`rounded-full font-bold text-xs sm:text-sm py-3 px-8 transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center gap-2 ${
                user
                  ? "bg-white hover:bg-gray-200 text-black"
                  : "bg-gradient-to-r from-cyan-400 to-indigo-500 text-black"
              }`}
            >
              {isSaving
                ? "Salvando..."
                : !user
                ? "Fazer Login para Salvar"
                : existingInLibrary
                ? "Salvar Alterações"
                : "Adicionar Jogo"}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Autenticação */}
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );

  if (mounted && typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
