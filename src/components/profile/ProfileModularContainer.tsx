"use client";

import React, { useMemo } from "react";
import { ProfileSectionConfig, ProfileSectionId } from "@/lib/types/profile.types";

export interface ProfileModularContainerProps {
  sections: ProfileSectionConfig[];
  renderSection: (sectionId: ProfileSectionId) => React.ReactNode;
  className?: string;
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
}: ProfileModularContainerProps) {
  // Ordena as seções por `order` e filtra apenas as marcadas como `visible`
  const activeSections = useMemo(() => {
    return [...sections]
      .filter((s) => s.visible !== false)
      .sort((a, b) => a.order - b.order);
  }, [sections]);

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
