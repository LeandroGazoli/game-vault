"use client";

import React from "react";
import { ProfileSectionConfig } from "@/lib/types/profile.types";
import { Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

export interface ProfileSectionsReorderListProps {
  sections: ProfileSectionConfig[];
  onToggleVisibility: (id: string) => void;
  onMoveSection: (index: number, direction: "up" | "down") => void;
  onReorderSections?: (reordered: ProfileSectionConfig[]) => void;
  onChangePlacement?: (id: string, placement: "main" | "sidebar") => void;
}

export default function ProfileSectionsReorderList({
  sections,
  onToggleVisibility,
  onMoveSection,
  onReorderSections,
  onChangePlacement,
}: ProfileSectionsReorderListProps) {
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updated = [...sections];
    const itemToMove = updated.splice(draggedIndex, 1)[0];
    updated.splice(targetIndex, 0, itemToMove);

    const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
    onReorderSections?.(reordered);
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-2">
      <div className="text-[11px] text-gray-400 font-mono px-1 flex items-center justify-between">
        <span>Arraste ou use as setas para reordenar</span>
        <span>Posição: Principal ou Lateral</span>
      </div>

      {sections.map((section, idx) => (
        <div
          key={section.id}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-grab active:cursor-grabbing ${
            draggedIndex === idx ? "opacity-40 border-emerald-400 border-dashed" : ""
          } ${
            section.visible
              ? "bg-[#161a26] border-white/10 shadow-sm"
              : "bg-[#10131c] border-white/5 text-gray-400"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-5 font-mono text-xs text-gray-500 font-bold shrink-0">{idx + 1}.</span>
            <div className="min-w-0">
              <div className={`text-xs sm:text-sm font-bold truncate ${section.visible ? "text-white" : "text-gray-400"}`}>
                {section.label}
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <span className={`text-[10px] font-mono ${section.visible ? "text-emerald-400" : "text-gray-500"}`}>
                  {section.visible ? "Visível" : "Oculto"}
                </span>
                <span className="text-[10px] text-gray-600">•</span>
                <span className="text-[10px] font-mono text-gray-400">
                  {section.placement === "sidebar" ? "📌 Barra Lateral (Desktop)" : "📄 Coluna Principal"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
            {/* Seletor de Coluna (Principal vs Sidebar Lateral) */}
            {onChangePlacement && (
              <button
                type="button"
                onClick={() =>
                  onChangePlacement(
                    section.id,
                    section.placement === "sidebar" ? "main" : "sidebar"
                  )
                }
                className={`px-2 py-1.5 rounded-xl text-[10px] font-mono font-bold border transition-colors ${
                  section.placement === "sidebar"
                    ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30"
                    : "bg-white/5 text-gray-400 border-white/5 hover:text-white"
                }`}
                title="Mudar posição entre Coluna Principal e Barra Lateral"
              >
                {section.placement === "sidebar" ? "Sidebar" : "Principal"}
              </button>
            )}

            <button
              type="button"
              onClick={() => onToggleVisibility(section.id)}
              className={`p-2 rounded-xl transition-colors ${
                section.visible
                  ? "bg-[#1c2230] hover:bg-[#252f42] text-emerald-400"
                  : "bg-[#1c2230] hover:bg-[#252f42] text-gray-500"
              }`}
              title={section.visible ? "Ocultar seção" : "Exibir seção"}
            >
              {section.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>

            <button
              type="button"
              disabled={idx === 0}
              onClick={() => onMoveSection(idx, "up")}
              className="p-2 rounded-xl bg-[#1c2230] hover:bg-[#252f42] text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Mover para cima"
            >
              <ArrowUp className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={idx === sections.length - 1}
              onClick={() => onMoveSection(idx, "down")}
              className="p-2 rounded-xl bg-[#1c2230] hover:bg-[#252f42] text-gray-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="Mover para baixo"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
