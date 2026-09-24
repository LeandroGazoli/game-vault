"use client";

import React, { useMemo } from "react";
import { ProfileSectionConfig, ProfileSectionId } from "@/lib/types/profile.types";

export interface ProfileModularContainerProps {
  sections: ProfileSectionConfig[];
  renderSection: (sectionId: ProfileSectionId) => React.ReactNode;
  className?: string;
  targetPlacement?: "main" | "sidebar";
}

/**
 * Container Modular do Perfil.
 * Renderiza as seções ordenadas e visíveis, aplicando identificadores
 * e classes semânticas (#profile-[id], .profile-section-[id]) para customização global.
 */
export default function ProfileModularContainer({
  sections,
  renderSection,
  className = "space-y-6",
  targetPlacement,
}: ProfileModularContainerProps) {
  // Ordena as seções por `order` e filtra apenas as marcadas como `visible` e correspondentes ao placement
  const activeSections = useMemo(() => {
    return [...sections]
      .filter((s) => {
        if (s.visible === false) return false;
        if (targetPlacement) {
          const placement = s.placement || "main";
          return placement === targetPlacement;
        }
        return true;
      })
      .sort((a, b) => a.order - b.order);
  }, [sections, targetPlacement]);

  return (
    <div className={`profile-sections-container ${className}`}>
      {activeSections.map((section) => {
        const content = renderSection(section.id);
        if (!content) return null;

        return (
          <section
            key={section.id}
            id={`profile-${section.id}`}
            className={`profile-section profile-section-${section.id} transition-all duration-300`}
            data-section-id={section.id}
          >
            {content}
          </section>
        );
      })}
    </div>
  );
}
