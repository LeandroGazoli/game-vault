/**
 * Tipagens do Módulo de Perfil e Game Tracker Expandido.
 * Inspirado nas melhores práticas de hiper-personalização e identidade gamer.
 */

export type ProfileSectionId =
  | "now_playing"
  | "twitch_live"
  | "game_tracker"
  | "financial_stats"
  | "library"
  | "recent_games"
  | "achievements"
  | "franchise_badges"
  | "showcase_trophies"
  | "gamer_gallery"
  | "bio"
  | "showcase"
  | "favorite_characters"
  | "setup_showcase"
  | "activity_heatmap";

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

/** Configuração de Personagem Favorito exibido no Perfil */
export interface FavoriteCharacter {
  id: string;
  name: string;
  gameTitle: string;
  imageUrl: string;
}

/** Configuração de Troféu / Conquista Importada (Steam / PSN / Xbox) */
export interface ImportedTrophyItem {
  id: string;
  gameTitle: string;
  trophyName: string;
  description?: string;
  iconUrl: string;
  platform: "steam" | "psn" | "xbox" | "retroachievements";
  unlockedAt?: string;
  rarity?: number; // Rarity %
  isPlatinum?: boolean;
}

/** Item da Galeria de Mídias (Screenshots e Clipes de Vídeo até 90s) do Jogador */
export interface GamerGalleryItem {
  id: string;
  gameTitle: string;
  imageUrl: string; // URL ou Base64 Data URL
  mediaType?: "image" | "video";
  videoUrl?: string;
  videoDurationSeconds?: number;
  isSpoiler?: boolean;
  caption?: string;
  likesCount?: number;
  uploadedAt: string;
}

/** Configuração de Hardware e Periféricos do Setup Gamer */
export interface GamerSetupConfig {
  photoUrl?: string | null;
  cpu?: string;
  gpu?: string;
  ram?: string;
  mouse?: string;
  keyboard?: string;
  monitor?: string;
  controller?: string;
  headset?: string;
}

/** Configuração de Trilha Sonora / OST em Destaque do Perfil */
export interface ProfileMusicConfig {
  enabled: boolean;
  title: string;
  artist?: string;
  audioUrl: string; // Ex: MP3 ou stream de áudio
}

/** Configuração padrão inicial das seções do Perfil */
export const DEFAULT_PROFILE_SECTIONS: ProfileSectionConfig[] = [
  { id: "twitch_live", label: "Transmissão Ao Vivo (Twitch)", visible: true, order: 0 },
  { id: "now_playing", label: "Jogando Agora (Rail Rotativo)", visible: true, order: 1 },
  { id: "game_tracker", label: "Game Tracker & Métricas", visible: true, order: 2 },
  { id: "financial_stats", label: "Resumo de Investimento & ROI", visible: true, order: 3 },
  { id: "showcase_trophies", label: "Vitrine de Troféus & Platinas", visible: true, order: 4 },
  { id: "gamer_gallery", label: "Galeria de Clipes & Screenshots", visible: true, order: 5 },
  { id: "activity_heatmap", label: "Mapa de Atividade Gamer", visible: true, order: 6 },
  { id: "library", label: "Biblioteca Completa", visible: true, order: 7 },
  { id: "recent_games", label: "Atividades & Recentes", visible: true, order: 8 },
  { id: "franchise_badges", label: "Insígnias de Franquias", visible: true, order: 9 },
  { id: "achievements", label: "Conquistas & Nível", visible: true, order: 10 },
  { id: "favorite_characters", label: "Personagens Favoritos", visible: true, order: 11 },
  { id: "setup_showcase", label: "Setup Gamer & Hardware", visible: true, order: 12 },
  { id: "bio", label: "Apresentação & Bio", visible: true, order: 13 },
  { id: "showcase", label: "Jogo em Destaque", visible: true, order: 14 },
];
