"use client";

import React, { useState } from "react";
import { Check, RotateCcw, X, Plus, Eye, EyeOff, LayoutGrid, Sparkles } from "lucide-react";
import { ProfileSectionConfig, ProfileTemplateId } from "@/lib/types/profile.types";
import { triggerSelectionHaptic, triggerSuccessHaptic } from "@/lib/capacitor";

export interface ProfilePageCustomizerBarProps {
  isEditing: boolean;
  onExit: () => void;
  onSave: () => Promise<void>;
  onResetDefaults: () => void;
  sections: ProfileSectionConfig[];
  onToggleVisibility: (id: string) => void;
  isSaving?: boolean;
}

export default function ProfilePageCustomizerBar({
  isEditing,
  onExit,
  onSave,
  onResetDefaults,
  sections,
  onToggleVisibility,
  isSaving = false,
}: ProfilePageCustomizerBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!isEditing) return null;

  const hiddenSections = sections.filter((s) => !s.visible);
  const visibleCount = sections.filter((s) => s.visible).length;

  return (
    <>
      {/* Barra Flutuante de Controle no Topo */}
      <aside
        aria-label="Barra de customização do perfil"
        className="sticky top-2 z-[90] w-full max-w-5xl mx-auto mb-4 px-2 sm:px-0 animate-fadeIn"
      >
        <div className="bg-[#121622]/95 backdrop-blur-md border border-emerald-500/40 shadow-2xl shadow-emerald-950/40 rounded-2xl p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2.5">
          {/* Lado Esquerdo: Status & Dica */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 animate-pulse">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white truncate">
                  Modo de Organização da Página
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {visibleCount}/{sections.length} Ativas
                </span>
              </div>
              <p className="text-[11px] text-gray-400 truncate hidden xs:block">
                Arraste os quadros na página ou use as setas para reposicionar.
              </p>
            </div>
          </div>

          {/* Lado Direito: Ações */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            {/* Botão de Gaveta para Seções Ocultas */}
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                setDrawerOpen((v) => !v);
              }}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                drawerOpen || hiddenSections.length > 0
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                  : "bg-white/5 border-white/10 text-gray-300 hover:bg-white/10"
              }`}
              title="Gerenciar blocos ocultos"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {hiddenSections.length > 0 ? `Ocultas (${hiddenSections.length})` : "Blocos"}
              </span>
            </button>

            {/* Restaurar padrão */}
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                onResetDefaults();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors"
              title="Restaurar layout padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Padrão</span>
            </button>

            {/* Cancelar / Sair */}
            <button
              type="button"
              onClick={() => {
                triggerSelectionHaptic();
                onExit();
              }}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white text-xs font-semibold transition-colors"
              title="Sair do modo de edição"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Cancelar</span>
            </button>

            {/* Salvar Layout */}
            <button
              type="button"
              disabled={isSaving}
              onClick={async () => {
                triggerSuccessHaptic();
                await onSave();
              }}
              className="px-3.5 sm:px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black text-xs font-black shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{isSaving ? "Salvando..." : "Salvar & Concluir"}</span>
            </button>
          </div>
        </div>

        {/* Drawer / Painel retrátil de seções ocultas */}
        {drawerOpen && (
          <div className="mt-2 bg-[#141824] border border-amber-500/30 rounded-2xl p-3 shadow-xl space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Painel de Blocos do Perfil
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                Clique no olho para reativar um bloco na tela
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 pt-1 max-h-48 overflow-y-auto pr-1">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`p-2 rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                    section.visible
                      ? "bg-[#181d2c] border-emerald-500/30 text-white"
                      : "bg-[#0f1118] border-white/5 text-gray-400"
                  }`}
                >
                  <span className="truncate font-medium">{section.label}</span>
                  <button
                    type="button"
                    onClick={() => {
                      triggerSelectionHaptic();
                      onToggleVisibility(section.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      section.visible
                        ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                        : "bg-white/5 text-gray-400 hover:text-white"
                    }`}
                    title={section.visible ? "Ocultar da página" : "Exibir na página"}
                  >
                    {section.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
