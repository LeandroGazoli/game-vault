export type GameStatus = "completed" | "playing" | "dropped" | "backlog";

export type CompletionType = "main_story" | "main_extra" | "completionist" | "platinum" | "custom";

export type UserPlan = "free" | "pro" | "vip";

export type ProfileTheme = "cyan" | "gold" | "purple" | "crimson" | "emerald";

export const ADMIN_EMAILS = ["leandro.gazolig@gmail.com"];

export const PRESET_BANNERS = [
  {
    id: "cyberpunk",
    name: "Cyberpunk Neon",
    url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "elden_ring",
    name: "Dark Fantasy Epic",
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "retro_synthwave",
    name: "Retro Synthwave",
    url: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "deep_space",
    name: "Nebulosa Cósmica",
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=400&auto=format&fit=crop&q=80",
  },
  {
    id: "gold_vip",
    name: "Obsidian Gold VIP",
    url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&auto=format&fit=crop&q=80",
    preview: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80",
  },
];

export interface HLTBData {
  gameTitle?: string;
  mainStory: number | null;     // Horas (ex: 35)
  mainExtra: number | null;     // Horas (ex: 60)
  completionist: number | null; // Horas (ex: 120)
  source?: string;
}

export interface PlatformItem {
  platform: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface GenreItem {
  id: number;
  name: string;
  slug: string;
}

export interface Game {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  metacritic: number | null;
  released: string | null;
  genres: { id: number; name: string }[];
  platforms: PlatformItem[];
  hltb?: HLTBData | null;
  description_raw?: string;
  rating?: number;
  ratings_count?: number;
  playtime?: number;
  short_screenshots?: { id: number; image: string }[];
}

export interface UserGame {
  id?: string;                     // ID único do registro no Firestore
  userId?: string;                 // ID do usuário
  gameId: number;                  // ID do jogo no IGDB/RAWG
  gameSlug: string;
  gameTitle: string;
  gameCover: string | null;
  status: GameStatus;
  completionType?: CompletionType | null; // Ex: "main_story", "main_extra", "completionist", "platinum"
  userRating: number | null;       // Nota pessoal dada pelo usuário (0 a 10)
  userPlaytimeHours: number | null;// Tempo real que o usuário gastou jogando
  userReview: string;              // Resenha ou anotações pessoais
  platformPlayed: string;          // Plataforma principal
  platformsPlayed?: string[];      // Múltiplas plataformas selecionadas
  isFavorite: boolean;
  completedAt: string | null;      // Data em que zerou (ISO string)
  startedAt: string | null;        // Data de início
  createdAt: string;
  updatedAt: string;
  metacritic: number | null;
  hltbData?: HLTBData | null;
  genres?: string[];
  releaseYear?: string;
}

export interface UserProfile {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  bio: string;
  favoriteGame?: string;
  plan?: UserPlan;                 // "free" | "pro" | "vip"
  isPremium?: boolean;             // Flag rápida para VIP/Pro
  isAdmin?: boolean;               // Flag de Administrador da plataforma
  hideAds?: boolean;               // Opção de desativar anúncios
  bannerURL?: string | null;       // Capa personalizada do perfil
  theme?: ProfileTheme;            // Tema de cores (ex: "cyan", "gold", "purple", "crimson", "emerald")
  customTitle?: string | null;     // Título Gamer (ex: "Caçador de Platinas", "Mestre dos RPGs")
  premiumUntil?: string | null;    // Data de expiração da assinatura
  createdAt: string;
  updatedAt?: string;
}

export interface LibraryStats {
  totalGames: number;
  completedCount: number;
  playingCount: number;
  droppedCount: number;
  backlogCount: number;
  totalPlaytimeHours: number;
  averageRating: number;
  topGenres: { name: string; count: number }[];
}
