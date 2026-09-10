"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Bookmark,
  Gamepad2,
  Trophy,
  Archive,
  Package,
  Check,
  Edit3,
  Sword,
  Compass,
  Crown,
} from "lucide-react";
import { Game, GameStatus, CompletionType } from "@/lib/types";
import { useGameLibrary } from "@/context/GameLibraryContext";
import { useAuth } from "@/context/AuthContext";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";

interface MobileGameStatusSheetProps {
  game: Game | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenFullModal?: () => void;
}

type SheetStep = "status" | "details";

const STATUS_OPTIONS = [
  {
    id: "backlog" as GameStatus,
    label: "Desejados",
    subtitle: "Lista de Desejos",
    icon: Bookmark,
    iconColor: "text-amber-400",
    savesDirectly: true,
  },
  {
    id: "playing" as GameStatus,
    label: "Jogando",
    subtitle: "Jogando agora",
    icon: Gamepad2,
    iconColor: "text-cyan-400",
    savesDirectly: false,
  },
  {
    id: "completed" as GameStatus,
    label: "Zerados",
    subtitle: "Jogos zerados",
    icon: Trophy,
    iconColor: "text-emerald-400",
    savesDirectly: false,
  },
  {
    id: "dropped" as GameStatus,
    label: "Arquivados",
    subtitle: "Para todo o resto",
    icon: Archive,
    iconColor: "text-neutral-400",
    savesDirectly: false,
  },
];

const RATING_VALUES = [null, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0] as const;

function getRatingEmoji(score: number | null): string {
  if (score === null) return "😐";
  if (score <= 2) return "🤮";
  if (score <= 4) return "😕";
  if (score <= 6) return "🙂";
  if (score <= 8) return "😃";
  return "🤩";
}

export default function MobileGameStatusSheet({
  game,
  isOpen,
  onClose,
  onOpenFullModal,
}: MobileGameStatusSheetProps) {
  const { user } = useAuth();
  const { getGameInLibrary, addOrUpdateGame } = useGameLibrary();

  const [step, setStep] = useState<SheetStep>("status");
  const [status, setStatus] = useState<GameStatus>("backlog");
  const [isOwned, setIsOwned] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [review, setReview] = useState("");
  const [completionType, setCompletionType] = useState<CompletionType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  const existingInLibrary = game ? getGameInLibrary(game.id) : undefined;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen || !game) return;

    const existing = existingInLibrary;
    if (existing) {
      const existingStatus = existing.status === "library" ? "backlog" : existing.status;
      setStatus(existingStatus);
      setIsOwned(existing.status === "library");
      setRating(existing.userRating ?? null);
      setReview(existing.userReview || "");
      setCompletionType(existing.completionType || null);
      const savesDirectly = existing.status === "backlog" || existing.status === "library";
      setStep(savesDirectly ? "status" : "details");
    } else {
      setStatus("backlog");
      setIsOwned(false);
      setRating(null);
      setReview("");
      setCompletionType(null);
      setStep("status");
    }
  }, [isOpen, game]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !game || !mounted || typeof document === "undefined") return null;

  const handleSelectStatus = (opt: typeof STATUS_OPTIONS[number]) => {
    triggerSelectionHaptic();
    setStatus(opt.id);
    if (opt.id === "completed") {
      setCompletionType(null);
    }
    if (!opt.savesDirectly) {
      setStep("details");
    }
  };

  const handleSave = async () => {
    if (!game) return;
    if (!user) {
      onClose();
      return;
    }
    setIsSaving(true);
    try {
      const effectiveStatus: GameStatus = isOwned && status === "backlog" ? "library" : status;
      await addOrUpdateGame({
        gameId: game.id,
        gameSlug: game.slug,
        gameTitle: game.name,
        gameCover: game.background_image,
        status: effectiveStatus,
        completionType: effectiveStatus === "completed" ? (completionType || "main_story") : null,
        userRating: rating,
        userReview: review.trim(),
        platformPlayed: existingInLibrary?.platformPlayed || "PC",
        platformsPlayed: existingInLibrary?.platformsPlayed || ["PC"],
        isFavorite: existingInLibrary?.isFavorite || false,
        completedAt:
          effectiveStatus === "completed"
            ? existingInLibrary?.completedAt || new Date().toISOString()
            : null,
        startedAt: existingInLibrary?.startedAt || null,
        metacritic: game.metacritic,
        hltbData: game.hltb,
        genres: game.genres?.map((g) => g.name) || [],
        releaseYear: game.released ? game.released.substring(0, 4) : "",
      });
      await triggerSuccessHaptic();
      onClose();
    } catch (err) {
      console.error("Erro ao salvar jogo:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const currentStatusOption = STATUS_OPTIONS.find((o) => o.id === status);
  const StatusIcon = currentStatusOption?.icon || Trophy;

  const SaveButton = ({ className }: { className?: string }) => (
    <button
      type="button"
      onClick={handleSave}
      disabled={isSaving}
      className={`w-full py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black text-base font-black transition-all shadow-lg active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 touch-manipulation ${className ?? ""}`}
    >
      {isSaving ? "Salvando..." : user ? "Salvar" : "Entrar para Salvar"}
    </button>
  );

  // ─── Step 1 ──────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end md:hidden"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full rounded-t-[28px] bg-[#1a1a1f] border-t border-white/10 shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Title */}
        <div className="px-5 py-3">
          <h2 className="text-xl font-bold text-white text-center">Adicionar à</h2>
        </div>

        {/* Status rows */}
        <div className="px-4 space-y-2 pb-2">
          {STATUS_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const isSelected = status === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleSelectStatus(opt)}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl border transition-all active:scale-[0.99] touch-manipulation text-left ${
                  isSelected
                    ? "bg-amber-400 text-black border-amber-400"
                    : "bg-[#252529] text-white border-transparent"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? "bg-black/15" : "bg-white/8"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${isSelected ? "text-black" : opt.iconColor}`}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-bold ${isSelected ? "text-black" : "text-white"}`}>
                    {opt.label}
                  </div>
                  <div className={`text-xs ${isSelected ? "text-black/70" : "text-neutral-400"}`}>
                    {opt.subtitle}
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-black/15 flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-black stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}

          {/* Possuídos toggle */}
          <button
            type="button"
            onClick={() => {
              triggerSelectionHaptic();
              setIsOwned((p) => !p);
            }}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-[#252529] touch-manipulation"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/8">
              <Package className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="text-sm font-bold text-white">Possuídos</div>
              <div className="text-xs text-neutral-400">Tenho na minha coleção</div>
            </div>
            <div
              className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
                isOwned ? "bg-amber-400" : "bg-white/15"
              }`}
            >
              <div
                className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                  isOwned ? "translate-x-7" : "translate-x-1"
                }`}
              />
            </div>
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pt-3 pb-[max(env(safe-area-inset-bottom,0px)+16px,20px)]">
          <SaveButton />
        </div>
      </div>
    </div>
  );

  // ─── Step 2 ──────────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <div
      className="fixed inset-0 z-[100] flex flex-col justify-end md:hidden"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full rounded-t-[28px] bg-[#1a1a1f] border-t border-white/10 shadow-2xl animate-slideUp max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {/* Game title */}
          <div className="px-5 pt-2 pb-3">
            <h2 className="text-xl font-bold text-white leading-tight">{game.name}</h2>
          </div>

          {/* Rating circles */}
          <div className="flex items-center gap-2.5 px-5 pb-4 overflow-x-auto scrollbar-none">
            {RATING_VALUES.map((val) => {
              const isSelected = rating === val;
              const label = val === null ? getRatingEmoji(null) : String(val);
              return (
                <button
                  key={val === null ? "ns" : val}
                  type="button"
                  onClick={() => {
                    triggerSelectionHaptic();
                    setRating(val);
                  }}
                  className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold transition-all active:scale-90 touch-manipulation ${
                    isSelected
                      ? "bg-amber-400 text-black shadow-md"
                      : "bg-[#2a2a2f] text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          {/* Review textarea */}
          <div className="px-5 pb-4">
            <textarea
              rows={3}
              placeholder="Escrever uma Avaliação..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="w-full rounded-2xl bg-[#252529] border border-white/8 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/25 resize-none"
            />
          </div>

          {/* Status pill + Edit */}
          <div className="px-5 pb-4">
            <div className="flex items-center rounded-2xl bg-[#252529] border border-white/8 overflow-hidden">
              <div className="flex-1 flex items-center gap-3 px-4 py-3.5">
                <StatusIcon className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-white">
                  {currentStatusOption?.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  triggerSelectionHaptic();
                  setStep("status");
                }}
                className="flex items-center gap-1.5 px-4 py-3.5 border-l border-white/8 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            </div>
          </div>

          {/* Completion type (only for "completed") */}
          {status === "completed" && (
            <div className="px-5 pb-4">
              <div className="rounded-2xl bg-[#252529] border border-white/8 overflow-hidden divide-y divide-white/5">
                {(
                  [
                    { id: null, label: "Não selecionado", Icon: null },
                    { id: "main_story" as CompletionType, label: "História principal", Icon: Sword },
                    { id: "main_extra" as CompletionType, label: "História principal + secundárias", Icon: Compass },
                    { id: "completionist" as CompletionType, label: "100% de conclusão", Icon: Crown },
                  ] as Array<{ id: CompletionType | null; label: string; Icon: React.ElementType | null }>
                ).map((opt) => {
                  const isSelected = completionType === opt.id;
                  return (
                    <button
                      key={opt.id ?? "ns"}
                      type="button"
                      onClick={() => {
                        triggerSelectionHaptic();
                        setCompletionType(opt.id);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-white/5 touch-manipulation transition-colors ${
                        isSelected ? "bg-white/5" : ""
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? "border-amber-400 bg-amber-400" : "border-white/30"
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-black" />}
                      </div>
                      {opt.Icon && (
                        <opt.Icon
                          className={`w-4 h-4 flex-shrink-0 ${
                            isSelected ? "text-amber-400" : "text-neutral-400"
                          }`}
                        />
                      )}
                      <span
                        className={`text-sm ${
                          isSelected ? "text-white font-semibold" : "text-neutral-300"
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Adicionar + (opens full modal) */}
          {onOpenFullModal && (
            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullModal();
                }}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-400 text-sm font-bold active:scale-95 transition-all touch-manipulation"
              >
                <span>Adicionar</span>
                <span className="text-base font-black leading-none">+</span>
              </button>
            </div>
          )}
        </div>

        {/* Fixed save footer */}
        <div className="flex-shrink-0 px-4 pt-3 pb-[max(env(safe-area-inset-bottom,0px)+16px,20px)] border-t border-white/8 bg-[#1a1a1f]">
          <SaveButton />
        </div>
      </div>
    </div>
  );

  return createPortal(
    step === "status" ? renderStep1() : renderStep2(),
    document.body
  );
}
