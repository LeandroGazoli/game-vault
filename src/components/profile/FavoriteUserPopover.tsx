"use client";

import React, { useState, useRef, useEffect } from "react";
import { Star, Check, Bell, BellOff, Tv, BookOpen, Trophy, FileText, ChevronDown } from "lucide-react";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";

export interface FavoriteAlertSettings {
  reviews: boolean;
  completions: boolean;
  guides: boolean;
  lives: boolean;
}

export interface FavoriteUserPopoverProps {
  targetUserId: string;
  targetUsername: string;
  initialFavorited?: boolean;
  initialSettings?: Partial<FavoriteAlertSettings>;
  onToggleFavorite?: (isFavorited: boolean, settings: FavoriteAlertSettings) => Promise<void>;
}

const DEFAULT_SETTINGS: FavoriteAlertSettings = {
  reviews: true,
  completions: true,
  guides: true,
  lives: true,
};

export default function FavoriteUserPopover({
  targetUserId,
  targetUsername,
  initialFavorited = false,
  initialSettings,
  onToggleFavorite,
}: FavoriteUserPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(initialFavorited);
  const [settings, setSettings] = useState<FavoriteAlertSettings>({
    ...DEFAULT_SETTINGS,
    ...initialSettings,
  });
  const [isSaving, setIsSaving] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsFavorited(initialFavorited);
    if (initialSettings) {
      setSettings((prev) => ({ ...prev, ...initialSettings }));
    }
  }, [initialFavorited, initialSettings]);

  // Fecha o popover ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleStarClick = async () => {
    triggerSelectionHaptic();
    const nextFavorited = !isFavorited;
    setIsFavorited(nextFavorited);
    if (nextFavorited) {
      setIsOpen(true);
    }
    if (onToggleFavorite) {
      setIsSaving(true);
      await onToggleFavorite(nextFavorited, settings);
      setIsSaving(false);
    }
  };

  const toggleSetting = async (key: keyof FavoriteAlertSettings) => {
    triggerSelectionHaptic();
    const nextSettings = { ...settings, [key]: !settings[key] };
    setSettings(nextSettings);
    if (onToggleFavorite) {
      setIsSaving(true);
      await onToggleFavorite(isFavorited, nextSettings);
      setIsSaving(false);
    }
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Botão de Estrela de Favorito */}
      <button
        type="button"
        onClick={handleStarClick}
        title={isFavorited ? "Configurar notificações do usuário favorito" : "Favoritar usuário"}
        aria-label="Favoritar usuário"
        className={`p-2 rounded-2xl border transition-all active:scale-95 flex items-center justify-center ${
          isFavorited
            ? "bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-md shadow-amber-500/10"
            : "bg-[#1c2230] hover:bg-[#252f42] border-white/10 text-gray-400 hover:text-white"
        }`}
      >
        <Star
          className={`w-4 h-4 transition-transform duration-200 ${
            isFavorited ? "fill-amber-400 scale-110" : ""
          }`}
        />
      </button>

      {/* Popover Compacto com os 4 Toggles Independentes */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 p-3 rounded-2xl bg-[#141822] border border-white/10 shadow-2xl z-50 animate-fadeIn space-y-2.5 backdrop-blur-xl">
          <div className="flex items-center justify-between pb-1.5 border-b border-white/5">
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="text-xs font-bold text-white tracking-tight">
                Notificações de @{targetUsername}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 font-semibold">
              Prioritário
            </span>
          </div>

          <p className="text-[10px] text-gray-400 leading-tight">
            Escolha exatamente quais alertas você deseja receber em tempo real:
          </p>

          <div className="space-y-1.5">
            {/* Toggle 1: Reviews */}
            <button
              type="button"
              onClick={() => toggleSetting("reviews")}
              className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                settings.reviews ? "bg-white/10 text-white" : "bg-white/5 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] font-semibold">Nova Análise / Review</span>
              </div>
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                settings.reviews ? "bg-emerald-500 border-emerald-400 text-black" : "border-white/20"
              }`}>
                {settings.reviews && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* Toggle 2: 100% Zerados */}
            <button
              type="button"
              onClick={() => toggleSetting("completions")}
              className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                settings.completions ? "bg-white/10 text-white" : "bg-white/5 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-semibold">Completou 100% / Platina</span>
              </div>
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                settings.completions ? "bg-emerald-500 border-emerald-400 text-black" : "border-white/20"
              }`}>
                {settings.completions && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* Toggle 3: Guias e Artigos */}
            <button
              type="button"
              onClick={() => toggleSetting("guides")}
              className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                settings.guides ? "bg-white/10 text-white" : "bg-white/5 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-semibold">Publicou Guia ou Artigo</span>
              </div>
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                settings.guides ? "bg-emerald-500 border-emerald-400 text-black" : "border-white/20"
              }`}>
                {settings.guides && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>

            {/* Toggle 4: Lives na Twitch */}
            <button
              type="button"
              onClick={() => toggleSetting("lives")}
              className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition-colors ${
                settings.lives ? "bg-white/10 text-white" : "bg-white/5 text-gray-400"
              }`}
            >
              <div className="flex items-center gap-2">
                <Tv className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-[11px] font-semibold">Entrou Ao Vivo na Twitch</span>
              </div>
              <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                settings.lives ? "bg-purple-500 border-purple-400 text-black" : "border-white/20"
              }`}>
                {settings.lives && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          </div>

          <div className="pt-1 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-[11px] font-bold active:scale-95 transition-all"
            >
              Pronto
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
