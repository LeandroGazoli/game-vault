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
  | "most_anticipated"
  | "guestbook"
  | "activity_heatmap";

export interface ProfileSectionConfig {
  id: ProfileSectionId;
  label: string;
  visible: boolean;
  order: number;
  placement?: "main" | "sidebar";
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

/** Configuração de Jogo Mais Aguardado com Contagem Regressiva */
export interface MostAnticipatedGame {
  id: string;
  gameTitle: string;
  coverUrl?: string;
  releaseDate: string; // ISO date string YYYY-MM-DD
  platform?: string;
  hypeReason?: string;
}

/** Configuração e Mensagem do Mural / Guestbook do Perfil */
export interface ProfileGuestbookEntry {
  id: string;
  authorUid: string;
  authorUsername: string;
  authorDisplayName: string;
  authorPhotoURL?: string | null;
  content: string;
  playedTogetherGameTitle?: string;
  createdAt: string; // ISO string
  approved: boolean; // Precisa de aprovação se requireApproval estiver ativo
}

export interface ProfileGuestbookConfig {
  enabled: boolean;
  requireApproval: boolean;
}

/** Configuração padrão inicial das seções do Perfil */
export const DEFAULT_PROFILE_SECTIONS: ProfileSectionConfig[] = [
  { id: "twitch_live", label: "Transmissão Ao Vivo (Twitch)", visible: true, order: 0, placement: "main" },
  { id: "now_playing", label: "Jogando Agora (Rail Rotativo)", visible: true, order: 1, placement: "main" },
  { id: "most_anticipated", label: "Mais Aguardados (Countdown)", visible: true, order: 2, placement: "main" },
  { id: "game_tracker", label: "Game Tracker & Métricas", visible: true, order: 3, placement: "main" },
  { id: "financial_stats", label: "Resumo de Investimento & ROI", visible: true, order: 4, placement: "main" },
  { id: "showcase_trophies", label: "Vitrine de Troféus & Platinas", visible: true, order: 5, placement: "main" },
  { id: "gamer_gallery", label: "Galeria de Clipes & Screenshots", visible: true, order: 6, placement: "main" },
  { id: "activity_heatmap", label: "Mapa de Atividade Gamer", visible: true, order: 7, placement: "main" },
  { id: "library", label: "Biblioteca Completa", visible: true, order: 8, placement: "main" },
  { id: "recent_games", label: "Atividades & Recentes", visible: true, order: 9, placement: "main" },
  { id: "franchise_badges", label: "Insígnias de Franquias", visible: true, order: 10, placement: "main" },
  { id: "achievements", label: "Conquistas & Nível", visible: true, order: 11, placement: "main" },
  { id: "favorite_characters", label: "Personagens Favoritos", visible: true, order: 12, placement: "main" },
  { id: "setup_showcase", label: "Setup Gamer & Hardware", visible: true, order: 13, placement: "sidebar" },
  { id: "guestbook", label: "Mural da Comunidade (Guestbook)", visible: true, order: 14, placement: "main" },
  { id: "bio", label: "Apresentação & Bio", visible: true, order: 15, placement: "main" },
  { id: "showcase", label: "Jogo em Destaque", visible: true, order: 16, placement: "main" },
];
