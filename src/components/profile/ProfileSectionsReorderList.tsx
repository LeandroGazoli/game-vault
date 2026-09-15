"use client";

import React from "react";
import { ProfileSectionConfig } from "@/lib/types/profile.types";
import { Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";

export interface ProfileSectionsReorderListProps {
  sections: ProfileSectionConfig[];
  onToggleVisibility: (id: string) => void;
  onMoveSection: (index: number, direction: "up" | "down") => void;
}

export default function ProfileSectionsReorderList({
  sections,
  onToggleVisibility,
  onMoveSection,
}: ProfileSectionsReorderListProps) {
  return (
    <div className="space-y-2">
      {sections.map((section, idx) => (
        <div
          key={section.id}
          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-all ${
            section.visible
              ? "bg-[#161a26] border-white/10"
              : "bg-[#10131c] border-white/5 text-gray-400"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-5 font-mono text-xs text-gray-500 font-bold">{idx + 1}.</span>
            <div className="min-w-0">
              <div className={`text-xs sm:text-sm font-bold truncate ${section.visible ? "text-white" : "text-gray-400"}`}>
                {section.label}
              </div>
              <div className="text-[10px] text-gray-500 font-mono">
                {section.visible ? "Visível" : "Oculto"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
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
