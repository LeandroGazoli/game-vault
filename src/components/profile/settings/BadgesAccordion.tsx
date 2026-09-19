"use client";

import React, { useMemo } from "react";
import {
  Trophy,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  X,
  PlusCircle,
} from "lucide-react";
import { DEFAULT_GAMER_TITLES, GAMER_EMOJI_SUGGESTIONS } from "@/lib/types";

interface BadgesAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  equippedTitles: string[];
  moveEquippedTitle: (index: number, direction: "up" | "down") => void;
  unequipTitle: (title: string) => void;
  toggleEquipTitle: (title: string) => void;
  createdTitles: string[];
  newTitleInput: string;
  setNewTitleInput: (val: string) => void;
  newTitleEmoji: string;
  setNewTitleEmoji: (val: string) => void;
  handleCreateCustomTitle: () => void;
  isPremium: boolean;
}

export default function BadgesAccordion({
  isOpen,
  onToggle,
  equippedTitles,
  moveEquippedTitle,
  unequipTitle,
  toggleEquipTitle,
  createdTitles,
  newTitleInput,
  setNewTitleInput,
  newTitleEmoji,
  setNewTitleEmoji,
  handleCreateCustomTitle,
  isPremium,
}: BadgesAccordionProps) {
  const equippedSet = useMemo(() => new Set(equippedTitles), [equippedTitles]);

  return (
    <div className={`rounded-2xl bg-[#141822] border transition-all duration-300 overflow-hidden shadow-sm ${
      isOpen ? "border-amber-400/40 ring-1 ring-amber-400/20" : "border-white/10"
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-[#1a2130]/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-[14px] text-white tracking-tight">
                3. Insígnias &amp; Prestígio
              </h3>
              <span className="px-1.5 py-0.5 bg-[#4edea3]/20 text-[#4edea3] text-[9px] font-mono font-bold rounded">
                {equippedTitles.length} / 3
              </span>
            </div>
            <p className="text-[11px] text-gray-400">
              Reordene os 3 slots, criador custom e catálogo
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-amber-400" : ""
          }`}
        />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-white/5 animate-fadeIn">
          {/* Slots Equipados */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Slots Equipados (Ordem de Exibição)
            </label>

            {equippedTitles.length === 0 ? (
              <div className="p-4 rounded-xl bg-[#1a2130] border border-white/10 text-center text-xs text-gray-400">
                Nenhuma insígnia equipada. Selecione abaixo para adicionar ao seu perfil.
              </div>
            ) : (
              equippedTitles.map((title, idx) => (
                <div
                  key={`${title}-${idx}`}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a2130] border border-white/10 shadow-sm"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="font-mono text-xs font-bold text-[#4edea3]">
                      #{idx + 1}
                    </span>
                    <span className="font-bold text-xs text-white truncate">
                      {title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {idx > 0 && (
                      <button
                        type="button"
                        onClick={() => moveEquippedTitle(idx, "up")}
                        title="Subir"
                        className="p-1 rounded bg-[#141822] text-gray-400 hover:text-white"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                    )}
                    {idx < equippedTitles.length - 1 && (
                      <button
                        type="button"
                        onClick={() => moveEquippedTitle(idx, "down")}
                        title="Descer"
                        className="p-1 rounded bg-[#141822] text-gray-400 hover:text-white"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => unequipTitle(title)}
                      title="Desequipar"
                      className="p-1 rounded bg-[#141822] text-red-400 hover:bg-red-500/20"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Criador de Insígnia Custom */}
          <div className="p-3.5 rounded-2xl bg-[#1a2130]/70 border border-white/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-[#10b981]" /> Criador de Insígnia Custom
              </span>
              <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                isPremium
                  ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
              }`}>
                {isPremium ? "PRO ATIVO" : "PRO EXCLUSIVO"}
              </span>
            </div>
            <div className="flex gap-2">
              <select
                value={newTitleEmoji}
                onChange={(e) => setNewTitleEmoji(e.target.value)}
                className="w-14 bg-[#141822] text-center rounded-xl border border-white/10 text-base py-1.5 text-white focus:outline-none focus:border-emerald-500"
              >
                {GAMER_EMOJI_SUGGESTIONS.map((em) => (
                  <option key={em} value={em}>{em}</option>
                ))}
              </select>
              <input
                type="text"
                value={newTitleInput}
                onChange={(e) => setNewTitleInput(e.target.value)}
                placeholder="Ex: Mestre dos Troféus..."
                className="flex-1 bg-[#141822] rounded-xl px-3 py-1.5 text-xs border border-white/10 text-white placeholder:text-gray-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleCreateCustomTitle}
                className="px-3.5 py-1.5 rounded-xl bg-[#10b981] hover:bg-emerald-400 text-black text-xs font-bold active:scale-95 transition-all cursor-pointer shrink-0"
              >
                Criar
              </button>
            </div>
          </div>

          {/* Minhas Insígnias Criadas */}
          {createdTitles && createdTitles.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                Minhas Insígnias Criadas ({createdTitles.length})
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {createdTitles.map((title) => {
                  const isEquipped = equippedSet.has(title);
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => toggleEquipTitle(title)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer active:scale-95 ${
                        isEquipped
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                          : "bg-[#1a2130] border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      <span>{title}</span>
                      <span className={`text-[10px] font-mono px-1 rounded ${isEquipped ? "bg-emerald-500/30 text-emerald-200" : "bg-white/10 text-gray-400"}`}>
                        {isEquipped ? "✓ Equipado" : "+ Equipar"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Catálogo Nativo MGL */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Catálogo MGL (Equipar 1-Toque)
            </span>
            <div className="flex flex-wrap gap-2 pt-1">
              {DEFAULT_GAMER_TITLES.map((title) => {
                const isEquipped = equippedSet.has(title);
                return (
                  <button
                    key={title}
                    type="button"
                    onClick={() => toggleEquipTitle(title)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                      isEquipped
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold shadow-sm"
                        : "bg-[#1a2130] border-white/10 text-gray-300 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <span>{title}</span>
                    <span className="text-[10px] font-bold">{isEquipped ? "✓" : "+"}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
