"use client";

import React, { useMemo, useState } from "react";
import { ProfileSectionConfig, ProfileSectionId } from "@/lib/types/profile.types";
import { GripVertical, EyeOff, ArrowUp, ArrowDown, Columns, LayoutList } from "lucide-react";
import { triggerSelectionHaptic } from "@/lib/capacitor";

export interface ProfileModularContainerProps {
  sections: ProfileSectionConfig[];
  renderSection: (sectionId: ProfileSectionId) => React.ReactNode;
  className?: string;
  targetPlacement?: "main" | "sidebar";
  isCustomizing?: boolean;
  onMoveSection?: (sectionId: ProfileSectionId, direction: "up" | "down") => void;
  onToggleVisibility?: (sectionId: ProfileSectionId) => void;
  onChangePlacement?: (sectionId: ProfileSectionId, placement: "main" | "sidebar") => void;
  onReorderSections?: (newSections: ProfileSectionConfig[]) => void;
}

/**
 * Container Modular do Perfil com Suporte a Drag-and-Drop Direto na Página.
 * Renderiza as seções ordenadas e visíveis.
 * Quando `isCustomizing` está ativo, envolve cada seção em um quadro interativo
 * com handles de arraste, troca de coluna e controles visuais.
 */
export default function ProfileModularContainer({
  sections,
  renderSection,
  className = "space-y-6",
  targetPlacement,
  isCustomizing = false,
  onMoveSection,
  onToggleVisibility,
  onChangePlacement,
  onReorderSections,
}: ProfileModularContainerProps) {
  const [draggedSectionId, setDraggedSectionId] = useState<ProfileSectionId | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<ProfileSectionId | null>(null);

  // Ordena as seções por `order` e filtra apenas as correspondentes ao placement
  // Se estiver customizando, mostra as seções (as ocultas ficam com estilo diferenciado ou filtradas)
  const activeSections = useMemo(() => {
    return [...sections]
      .filter((s) => {
        if (!isCustomizing && s.visible === false) return false;
        if (targetPlacement) {
          const placement = s.placement || "main";
          return placement === targetPlacement;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [sections, targetPlacement, isCustomizing]);

  const handleDragStart = (e: React.DragEvent, id: ProfileSectionId) => {
    if (!isCustomizing) return;
    setDraggedSectionId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent, id: ProfileSectionId) => {
    if (!isCustomizing) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverSectionId !== id) {
      setDragOverSectionId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverSectionId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: ProfileSectionId) => {
    if (!isCustomizing) return;
    e.preventDefault();
    setDragOverSectionId(null);

    const sourceId = draggedSectionId || (e.dataTransfer.getData("text/plain") as ProfileSectionId);
    if (!sourceId || sourceId === targetId) {
      setDraggedSectionId(null);
      return;
    }

    triggerSelectionHaptic();

    // Reordena no array completo mantendo as ordens consistentes
    const updated = [...sections];
    const sourceIndex = updated.findIndex((s) => s.id === sourceId);
    const targetIndex = updated.findIndex((s) => s.id === targetId);

    if (sourceIndex >= 0 && targetIndex >= 0) {
      const [movedItem] = updated.splice(sourceIndex, 1);
      // Se mover para uma área com targetPlacement específico, atualiza o placement do item
      if (targetPlacement) {
        movedItem.placement = targetPlacement;
      }
      updated.splice(targetIndex, 0, movedItem);

      const reordered = updated.map((s, idx) => ({ ...s, order: idx }));
      onReorderSections?.(reordered);
    }

    setDraggedSectionId(null);
  };

  return (
    <div
      className={`profile-sections-container ${className} ${
        isCustomizing ? "p-1 rounded-3xl border-2 border-dashed border-emerald-500/30 bg-emerald-950/10 min-h-[140px]" : ""
      }`}
      onDragOver={(e) => {
        if (isCustomizing && activeSections.length === 0) {
          e.preventDefault();
          e.dataTransfer.dropEffect = "move";
        }
      }}
      onDrop={(e) => {
        if (isCustomizing && activeSections.length === 0 && draggedSectionId && targetPlacement) {
          e.preventDefault();
          // Mover seção vazia para esta coluna
          onChangePlacement?.(draggedSectionId, targetPlacement);
          setDraggedSectionId(null);
        }
      }}
    >
      {/* Indicador de Coluna Vazia no Modo Customizar */}
      {isCustomizing && activeSections.length === 0 && (
        <div className="p-8 text-center border border-dashed border-white/10 rounded-2xl text-gray-500 text-xs font-mono">
          Arraste blocos para cá ou alterne no cabeçalho dos quadros.
        </div>
      )}

      {activeSections.map((section, idx) => {
        const content = renderSection(section.id);
        if (!content && !isCustomizing) return null;

        const isCurrentlyDragged = draggedSectionId === section.id;
        const isCurrentlyOver = dragOverSectionId === section.id;

        return (
          <section
            key={section.id}
            id={`profile-${section.id}`}
            draggable={isCustomizing}
            onDragStart={(e) => handleDragStart(e, section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, section.id)}
            className={`profile-section profile-section-${section.id} relative transition-all duration-200 ${
              isCustomizing
                ? "rounded-3xl border-2 p-1.5 sm:p-2 group/card select-none cursor-grab active:cursor-grabbing shadow-xl " +
                  (isCurrentlyDragged
                    ? "opacity-30 border-emerald-400 border-dashed scale-[0.98]"
                    : isCurrentlyOver
                    ? "border-emerald-400 bg-emerald-500/10 scale-[1.01]"
                    : section.visible === false
                    ? "border-amber-500/40 bg-black/40 opacity-70"
                    : "border-white/10 hover:border-emerald-500/50 bg-[#121622]/60")
                : ""
            }`}
            data-section-id={section.id}
          >
            {/* Barra Superior de Controles do Quadro Móvel (Apenas em Modo de Customização) */}
            {isCustomizing && (
              <div className="mb-2 px-3 py-1.5 bg-[#181d2c] border border-white/10 rounded-2xl flex items-center justify-between gap-2 shadow-md">
                {/* Lado Esquerdo: Grip Handle & Título do Bloco */}
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="p-1 text-gray-400 hover:text-emerald-400 cursor-grab active:cursor-grabbing transition-colors"
                    title="Clique e arraste para reposicionar este quadro"
                  >
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-white truncate font-mono">
                    {section.label}
                  </span>
                  {section.visible === false && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                      Oculto
                    </span>
                  )}
                </div>

                {/* Lado Direito: Ações Rápidas (Subir, Descer, Trocar Coluna, Ocultar) */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Alternar Coluna Principal vs Barra Lateral */}
                  {onChangePlacement && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerSelectionHaptic();
                        onChangePlacement(
                          section.id,
                          section.placement === "sidebar" ? "main" : "sidebar"
                        );
                      }}
                      className={`px-2 py-1 rounded-xl text-[10px] font-mono font-bold border transition-colors flex items-center gap-1 ${
                        section.placement === "sidebar"
                          ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                          : "bg-white/5 text-gray-300 border-white/10 hover:text-white"
                      }`}
                      title={
                        section.placement === "sidebar"
                          ? "Mover para Coluna Principal"
                          : "Fixar na Barra Lateral"
                      }
                    >
                      {section.placement === "sidebar" ? (
                        <>
                          <LayoutList className="w-3 h-3" />
                          <span className="hidden sm:inline">Sidebar</span>
                        </>
                      ) : (
                        <>
                          <Columns className="w-3 h-3" />
                          <span className="hidden sm:inline">Principal</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Subir */}
                  {onMoveSection && (
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => {
                        triggerSelectionHaptic();
                        onMoveSection(section.id, "up");
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      title="Mover quadro para cima"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Descer */}
                  {onMoveSection && (
                    <button
                      type="button"
                      disabled={idx === activeSections.length - 1}
                      onClick={() => {
                        triggerSelectionHaptic();
                        onMoveSection(section.id, "down");
                      }}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 disabled:opacity-20 disabled:pointer-events-none transition-colors"
                      title="Mover quadro para baixo"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Ocultar / Mostrar */}
                  {onToggleVisibility && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerSelectionHaptic();
                        onToggleVisibility(section.id);
                      }}
                      className={`p-1.5 rounded-lg transition-colors ${
                        section.visible === false
                          ? "bg-amber-500/20 text-amber-300"
                          : "bg-white/5 hover:bg-white/10 text-gray-400 hover:text-rose-400"
                      }`}
                      title={section.visible === false ? "Tornar visível" : "Ocultar quadro"}
                    >
                      <EyeOff className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Conteúdo Real do Componente */}
            <div className={isCustomizing ? "pointer-events-none opacity-90" : ""}>
              {content || (
                <div className="p-6 rounded-2xl bg-[#141822] border border-white/5 text-center text-xs text-gray-500 font-mono">
                  {section.label} (Sem dados adicionados)
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
