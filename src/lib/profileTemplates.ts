import {
  ProfileTemplate,
  ProfileTemplateId,
  ProfileSectionConfig,
  DEFAULT_PROFILE_SECTIONS,
} from "./types/profile.types";

/**
 * Templates oficiais refinados para organização modular do perfil gamer.
 */
export const OFFICIAL_PROFILE_TEMPLATES: Record<Exclude<ProfileTemplateId, "custom">, ProfileTemplate> = {
  tracker: {
    id: "tracker",
    name: "Game Tracker",
    description: "Prioridade máxima para jogos em andamento e progresso do backlog.",
    iconName: "Gamepad2",
    sections: [
      { id: "playing_now", label: "Jogando Agora", visible: true, order: 0 },
      { id: "game_tracker", label: "Métricas & Progresso", visible: true, order: 1 },
      { id: "library", label: "Biblioteca de Jogos", visible: true, order: 2 },
      { id: "recent_games", label: "Atividades Recentes", visible: true, order: 3 },
      { id: "achievements", label: "Conquistas & Nível", visible: true, order: 4 },
      { id: "showcase", label: "Jogo em Destaque", visible: true, order: 5 },
      { id: "bio", label: "Bio & Apresentação", visible: true, order: 6 },
    ],
  },
  gamer: {
    id: "gamer",
    name: "Gamer Hero",
    description: "Foco nas conquistas, nível de XP, placar de honra e insígnias.",
    iconName: "Trophy",
    sections: [
      { id: "achievements", label: "Conquistas & Nível", visible: true, order: 0 },
      { id: "playing_now", label: "Jogando Agora", visible: true, order: 1 },
      { id: "showcase", label: "Jogo em Destaque", visible: true, order: 2 },
      { id: "game_tracker", label: "Métricas do Tracker", visible: true, order: 3 },
      { id: "library", label: "Biblioteca Completa", visible: true, order: 4 },
      { id: "bio", label: "Bio & Apresentação", visible: true, order: 5 },
      { id: "recent_games", label: "Atividades Recentes", visible: false, order: 6 },
    ],
  },
  compact: {
    id: "compact",
    name: "Ultra Compacto",
    description: "Densidade máxima de informações sem rolagem desnecessária.",
    iconName: "Minimize2",
    sections: [
      { id: "playing_now", label: "Jogando Agora", visible: true, order: 0 },
      { id: "game_tracker", label: "Métricas Rápidas", visible: true, order: 1 },
      { id: "library", label: "Biblioteca Compacta", visible: true, order: 2 },
      { id: "achievements", label: "Conquistas & Nível", visible: true, order: 3 },
      { id: "bio", label: "Bio", visible: false, order: 4 },
      { id: "showcase", label: "Destaque", visible: false, order: 5 },
      { id: "recent_games", label: "Recentes", visible: false, order: 6 },
    ],
  },
  minimal: {
    id: "minimal",
    name: "Minimalista",
    description: "Visual clean e direto com foco exclusivo na coleção de jogos.",
    iconName: "Sparkles",
    sections: [
      { id: "library", label: "Biblioteca Completa", visible: true, order: 0 },
      { id: "playing_now", label: "Jogando Agora", visible: true, order: 1 },
      { id: "bio", label: "Apresentação", visible: true, order: 2 },
      { id: "game_tracker", label: "Métricas", visible: false, order: 3 },
      { id: "achievements", label: "Conquistas", visible: false, order: 4 },
      { id: "showcase", label: "Destaque", visible: false, order: 5 },
      { id: "recent_games", label: "Recentes", visible: false, order: 6 },
    ],
  },
};

/**
 * Retorna a lista de seções ordenadas e mescladas com defaults seguros
 */
export function resolveProfileSections(
  customSections?: ProfileSectionConfig[] | null,
  templateId: ProfileTemplateId = "tracker"
): ProfileSectionConfig[] {
  if (customSections && Array.isArray(customSections) && customSections.length > 0) {
    // Garante que se novas seções forem adicionadas no futuro, elas entrem com defaults
    const existingIds = new Set(customSections.map((s) => s.id));
    const merged = [...customSections];

    for (const def of DEFAULT_PROFILE_SECTIONS) {
      if (!existingIds.has(def.id)) {
        merged.push({ ...def, order: merged.length });
      }
    }

    return merged.sort((a, b) => a.order - b.order);
  }

  if (templateId !== "custom" && OFFICIAL_PROFILE_TEMPLATES[templateId]) {
    return [...OFFICIAL_PROFILE_TEMPLATES[templateId].sections].sort((a, b) => a.order - b.order);
  }

  return [...DEFAULT_PROFILE_SECTIONS];
}
