/**
 * Tipagens do Módulo de Perfil e Game Tracker.
 * Define identificadores semânticos de seções, templates de layout e configurações modulares.
 */

export type ProfileSectionId =
  | "playing_now"
  | "game_tracker"
  | "library"
  | "recent_games"
  | "achievements"
  | "bio"
  | "showcase";

export interface ProfileSectionConfig {
  id: ProfileSectionId;
  label: string;
  visible: boolean;
  order: number;
}

export type ProfileTemplateId = "tracker" | "gamer" | "compact" | "minimal" | "custom";

export interface ProfileTemplate {
  id: ProfileTemplateId;
  name: string;
  description: string;
  iconName: string;
  sections: ProfileSectionConfig[];
  isCustom?: boolean;
  isVipProOnly?: boolean;
}

export interface ProfileModularSettings {
  activeTemplate: ProfileTemplateId;
  sections: ProfileSectionConfig[];
  customTemplate?: ProfileTemplate | null;
}

/** Configuração padrão inicial das seções do Perfil */
export const DEFAULT_PROFILE_SECTIONS: ProfileSectionConfig[] = [
  { id: "playing_now", label: "Jogando Agora", visible: true, order: 0 },
  { id: "game_tracker", label: "Game Tracker & Métricas", visible: true, order: 1 },
  { id: "library", label: "Biblioteca Completa", visible: true, order: 2 },
  { id: "recent_games", label: "Atividades & Recentes", visible: true, order: 3 },
  { id: "achievements", label: "Conquistas & Nível", visible: true, order: 4 },
  { id: "bio", label: "Apresentação & Bio", visible: true, order: 5 },
  { id: "showcase", label: "Jogo em Destaque", visible: true, order: 6 },
];
