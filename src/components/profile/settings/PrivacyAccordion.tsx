"use client";

import React from "react";
import {
  ShieldCheck,
  ChevronDown,
  BarChart3,
  Clock,
  Star,
  EyeOff,
} from "lucide-react";
import { ProfileVisibility } from "@/lib/types";

interface PrivacyAccordionProps {
  isOpen: boolean;
  onToggle: () => void;
  visibility: ProfileVisibility;
  setVisibility: React.Dispatch<React.SetStateAction<ProfileVisibility>>;
}

export default function PrivacyAccordion({
  isOpen,
  onToggle,
  visibility,
  setVisibility,
}: PrivacyAccordionProps) {
  const isPublic = visibility.isPublic !== false;

  const togglePublic = (pub: boolean) => {
    setVisibility((prev) => ({ ...prev, isPublic: pub }));
  };

  const toggleField = (field: keyof ProfileVisibility) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className={`rounded-2xl bg-[#141822] border transition-all duration-300 overflow-hidden shadow-sm ${
      isOpen ? "border-[#4edea3]/40 ring-1 ring-[#4edea3]/20" : "border-white/10"
    }`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between text-left transition-colors hover:bg-[#1a2130]/50"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center shrink-0 border border-[#4edea3]/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-white tracking-tight">
              7. Privacidade &amp; Segurança da Conta
            </h3>
            <p className="text-[11px] text-gray-400">
              Público vs privado e 4 checkboxes de visibilidade
            </p>
          </div>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
            isOpen ? "rotate-180 text-[#4edea3]" : ""
          }`}
        />
      </button>

      {/* Body */}
      {isOpen && (
        <div className="p-4 space-y-4 border-t border-white/5 animate-fadeIn">
          {/* Toggle Público vs Privado */}
          <div className="p-3 rounded-xl bg-[#1a2130] border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Modo do Perfil</span>
              <span className="text-[11px] text-gray-400">
                {isPublic ? "Visível para toda a comunidade MGL" : "Apenas você pode ver o perfil"}
              </span>
            </div>
            <div className="flex bg-[#141822] p-0.5 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => togglePublic(true)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  isPublic
                    ? "bg-[#10b981] text-black shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Público
              </button>
              <button
                type="button"
                onClick={() => togglePublic(false)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                  !isPublic
                    ? "bg-[#10b981] text-black shadow"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Privado
              </button>
            </div>
          </div>

          {/* 4 Checkboxes Gamer */}
          <div className="space-y-2.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Controles Específicos de Privacidade
            </label>

            {/* Checkbox 1 */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a2130]/70 border border-white/10 cursor-pointer hover:bg-[#1a2130] transition-colors">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 text-[#4edea3]" />
                <div>
                  <span className="text-xs font-bold text-white block">Estatísticas Gerais da Biblioteca</span>
                  <span className="text-[10px] text-gray-400">Total zerados, platinas e backlog</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={visibility.showStats !== false}
                onChange={() => toggleField("showStats")}
                className="rounded border-white/20 text-[#10b981] focus:ring-0 bg-[#141822] w-4 h-4"
              />
            </label>

            {/* Checkbox 2 */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a2130]/70 border border-white/10 cursor-pointer hover:bg-[#1a2130] transition-colors">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#00E5FF]" />
                <div>
                  <span className="text-xs font-bold text-white block">Horas Jogadas por Título</span>
                  <span className="text-[10px] text-gray-400">Tempo total registrado em cada game</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={visibility.showPlaytime !== false}
                onChange={() => toggleField("showPlaytime")}
                className="rounded border-white/20 text-[#10b981] focus:ring-0 bg-[#141822] w-4 h-4"
              />
            </label>

            {/* Checkbox 3 */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a2130]/70 border border-white/10 cursor-pointer hover:bg-[#1a2130] transition-colors">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Notas Pessoais e Reviews</span>
                  <span className="text-[10px] text-gray-400">Suas análises e notas de 0 a 10</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={visibility.showRatings !== false}
                onChange={() => toggleField("showRatings")}
                className="rounded border-white/20 text-[#10b981] focus:ring-0 bg-[#141822] w-4 h-4"
              />
            </label>

            {/* Checkbox 4 */}
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a2130]/70 border border-white/10 cursor-pointer hover:bg-[#1a2130] transition-colors">
              <div className="flex items-center gap-2.5">
                <EyeOff className="w-4 h-4 text-rose-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Ocultar Jogos Dropados / Abandonados</span>
                  <span className="text-[10px] text-gray-400">Não exibir títulos que desistiu de jogar</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={visibility.showDropped === false}
                onChange={() => toggleField("showDropped")}
                className="rounded border-white/20 text-[#10b981] focus:ring-0 bg-[#141822] w-4 h-4"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
