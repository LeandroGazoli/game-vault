"use client";

import { useState, useEffect, useCallback } from "react";
import { UserProfile } from "@/lib/types";
import {
  ProfileTemplateId,
  ProfileSectionConfig,
  ProfileTemplate,
} from "@/lib/types/profile.types";
import { resolveProfileSections } from "@/lib/profileTemplates";
import { triggerSuccessHaptic } from "@/lib/capacitor";

export function useProfileModules(user: UserProfile | null, updateUserProfile?: (data: any) => Promise<void>) {
  const [activeTemplate, setActiveTemplate] = useState<ProfileTemplateId>(() => {
    return (user as any)?.activeProfileTemplate || "tracker";
  });

  const [sections, setSections] = useState<ProfileSectionConfig[]>(() => {
    return resolveProfileSections((user as any)?.profileSectionsOrder, activeTemplate);
  });

  // Sincroniza se o perfil do usuário for atualizado
  useEffect(() => {
    if (!user) return;
    const userTmpl = (user as any).activeProfileTemplate || "tracker";
    const userSections = (user as any).profileSectionsOrder;
    setActiveTemplate(userTmpl);
    setSections(resolveProfileSections(userSections, userTmpl));
  }, [user]);

  const applySections = useCallback(
    async (newSections: ProfileSectionConfig[], templateId: ProfileTemplateId) => {
      setSections(newSections);
      setActiveTemplate(templateId);
      triggerSuccessHaptic();

      if (updateUserProfile) {
        try {
          await updateUserProfile({
            activeProfileTemplate: templateId,
            profileSectionsOrder: newSections,
          });
        } catch (err) {
          console.error("Erro ao persistir seções do perfil:", err);
        }
      }
    },
    [updateUserProfile]
  );

  return {
    activeTemplate,
    setActiveTemplate,
    sections,
    setSections,
    customTemplate: (user as any)?.customProfileTemplate as ProfileTemplate | null,
    applySections,
  };
}
