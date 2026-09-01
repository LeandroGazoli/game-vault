export type GameStatus = "completed" | "playing" | "dropped" | "backlog";

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
  id: number | string;
  slug: string;
  name: string;
  released: string | null;
  background_image: string | null;
  rating: number;              // Nota RAWG (0 a 5)
  rating_top?: number;
  metacritic: number | null;    // Nota Metacritic (0 a 100)
  metacritic_url?: string;
  playtime?: number;            // Média de horas estimada RAWG
  description_raw?: string;
  genres: GenreItem[];
  platforms?: PlatformItem[];
  developers?: { id: number; name: string }[];
  publishers?: { id: number; name: string }[];
  screenshots?: { id: number; image: string }[];
  hltb?: HLTBData | null;
}

export interface UserGame {
  id?: string;
  gameId: number | string;
  gameSlug: string;
  gameTitle: string;
  gameCover: string | null;
  status: GameStatus;
  userRating: number | null;       // Nota pessoal dada pelo usuário (0 a 10 ou 1 a 5)
  userPlaytimeHours: number | null;// Tempo real que o usuário gastou jogando
  userReview: string;              // Resenha ou anotações pessoais
  platformPlayed: string;          // Ex: "PC", "PlayStation 5", "Nintendo Switch", "Xbox"
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
  createdAt: string;
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
