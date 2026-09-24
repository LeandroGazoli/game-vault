"use client";

import React, { useState, useEffect } from "react";
import { MostAnticipatedGame } from "@/lib/types/profile.types";
import { Clock, Plus, Trash2, Calendar, Sparkles, ExternalLink, Gamepad2 } from "lucide-react";
import Image from "next/image";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";

interface MostAnticipatedSectionProps {
  games?: MostAnticipatedGame[];
  isOwner?: boolean;
  onSaveGames?: (games: MostAnticipatedGame[]) => Promise<void>;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  isReleased: boolean;
}

function calculateTimeRemaining(targetDateStr: string): TimeRemaining {
  const target = new Date(targetDateStr).getTime();
  const now = new Date().getTime();
  const diff = target - now;

  if (diff <= 0 || isNaN(diff)) {
    return { days: 0, hours: 0, minutes: 0, isReleased: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return { days, hours, minutes, isReleased: false };
}

export default function MostAnticipatedSection({
  games: initialGames = [],
  isOwner = false,
  onSaveGames,
}: MostAnticipatedSectionProps) {
  const [games, setGames] = useState<MostAnticipatedGame[]>(initialGames);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newPlatform, setNewPlatform] = useState("");
  const [newCover, setNewCover] = useState("");
  const [newHype, setNewHype] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Tick timer a cada minuto
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    triggerSuccessHaptic();
    setIsSaving(true);
    const newGame: MostAnticipatedGame = {
      id: "ant_" + Date.now(),
      gameTitle: newTitle.trim(),
      releaseDate: newDate,
      platform: newPlatform.trim() || undefined,
      coverUrl: newCover.trim() || undefined,
      hypeReason: newHype.trim() || undefined,
    };

    const updated = [...games, newGame];
    setGames(updated);
    if (onSaveGames) {
      await onSaveGames(updated);
    }
    setNewTitle("");
    setNewDate("");
    setNewPlatform("");
    setNewCover("");
    setNewHype("");
    setIsAdding(false);
    setIsSaving(false);
  };

  const handleRemoveGame = async (id: string) => {
    triggerSelectionHaptic();
    const updated = games.filter((g) => g.id !== id);
    setGames(updated);
    if (onSaveGames) {
      await onSaveGames(updated);
    }
  };

  if (!isOwner && games.length === 0) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#141822] p-4 sm:p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              Mais Aguardados
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono border border-amber-500/20">
                Countdown
              </span>
            </h3>
            <p className="text-[11px] text-gray-400">Jogos mais esperados com contagem regressiva até o lançamento</p>
          </div>
        </div>

        {isOwner && (
          <button
            type="button"
            onClick={() => {
              triggerSelectionHaptic();
              setIsAdding(!isAdding);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-semibold active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar</span>
          </button>
        )}
      </div>

      {/* Formulário de Inclusão Rápida para o Dono */}
      {isAdding && (
        <form onSubmit={handleAddGame} className="p-4 rounded-2xl bg-[#0b0d12] border border-white/10 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Nome do Jogo *
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: GTA VI, The Witcher 4..."
                required
                className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Data Prevista de Lançamento *
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                required
                className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                Plataforma (Opcional)
              </label>
              <input
                type="text"
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value)}
                placeholder="Ex: PS5, PC, Xbox Series"
                className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                URL da Imagem da Capa (Opcional)
              </label>
              <input
                type="url"
                value={newCover}
                onChange={(e) => setNewCover(e.target.value)}
                placeholder="https://..."
                className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
              Por que você está no hype? (Opcional)
            </label>
            <input
              type="text"
              value={newHype}
              onChange={(e) => setNewHype(e.target.value)}
              placeholder="Ex: Gráficos ultra-realistas e história incrível..."
              className="w-full bg-[#141822] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl text-gray-400 hover:text-white text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs active:scale-95 transition-all"
            >
              {isSaving ? "Salvando..." : "Salvar no Perfil"}
            </button>
          </div>
        </form>
      )}

      {/* Grid de Jogos com Contagem Regressiva */}
      {games.length === 0 ? (
        <div className="py-8 text-center border border-dashed border-white/10 rounded-2xl bg-[#0b0d12]/50 space-y-2">
          <Calendar className="w-8 h-8 text-gray-500 mx-auto" />
          <p className="text-xs text-gray-400">Nenhum jogo na lista de mais aguardados ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {games.map((game) => {
            const time = calculateTimeRemaining(game.releaseDate);
            return (
              <div
                key={game.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0e1118] hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                {/* Banner / Capa com gradiente */}
                <div className="relative h-28 w-full bg-[#181d28] overflow-hidden">
                  {game.coverUrl ? (
                    <Image
                      src={game.coverUrl}
                      alt={game.gameTitle}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-amber-950/40 via-[#181d28] to-slate-900">
                      <Gamepad2 className="w-10 h-10 text-amber-500/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0e1118] via-transparent to-black/40" />

                  {/* Badges Flutuantes */}
                  {game.platform && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] font-semibold text-gray-200 border border-white/10">
                      {game.platform}
                    </span>
                  )}

                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveGame(game.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 hover:bg-rose-500 text-gray-400 hover:text-white transition-colors"
                      title="Remover"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Conteúdo & Countdown */}
                <div className="p-3 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">{game.gameTitle}</h4>
                    {game.hypeReason && (
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5 italic">"{game.hypeReason}"</p>
                    )}
                  </div>

                  {/* Contador Regressivo */}
                  <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between">
                    {time.isReleased ? (
                      <div className="w-full text-center py-0.5 text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Já Lançado!</span>
                      </div>
                    ) : (
                      <div className="w-full grid grid-cols-3 text-center divide-x divide-white/10">
                        <div>
                          <div className="text-sm font-extrabold text-amber-300 font-mono">{time.days}</div>
                          <div className="text-[9px] uppercase tracking-wider text-gray-500">Dias</div>
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-white font-mono">{time.hours}</div>
                          <div className="text-[9px] uppercase tracking-wider text-gray-500">Horas</div>
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-white font-mono">{time.minutes}</div>
                          <div className="text-[9px] uppercase tracking-wider text-gray-500">Min</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
