export type IndieSpotlightLocation = "search" | "game_detail" | "home";

export type IndieGameStatus = "pending" | "approved" | "rejected";

export interface IndieGame {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  descriptionMode?: "tiptap" | "html" | "markdown" | null;
  developerName: string;
  developerEmail: string;
  studioWebsite?: string;
  contactDiscord?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  coverImage: string;
  bannerImage?: string;
  trailerUrl?: string;
  platforms: string[];
  genres: string[];
  steamUrl?: string;
  itchUrl?: string;
  releaseDate?: string;
  // Vinculação ao catálogo geral (IGDB / RAWG)
  linkedGameId?: number | string;
  linkedGameSlug?: string;
  linkedGameName?: string;
  // Notas e Atualizações do Desenvolvedor (Dev Notes / Devlog)
  devNotes?: string;
  devNotesMode?: "tiptap" | "html" | "markdown" | null;
  status: IndieGameStatus;
  votesCount: number;
  voters: string[]; // UIDs dos usuários que votaram
  isSpotlight: boolean;
  spotlightLocations: IndieSpotlightLocation[];
  submittedBy: string; // UID do usuário que submeteu
  createdAt: string;
  updatedAt: string;

  // Ficha técnica & metadados expandidos (equivalentes à página de jogos)
  storyline?: string;
  publisherName?: string;
  gameModes?: string[]; // Ex: "Single-player", "Multiplayer", "Co-op"
  playerPerspectives?: string[]; // Ex: "Primeira pessoa", "Terceira pessoa", "Isométrica", "2D Side-scroller"
  themes?: string[]; // Ex: "Ficção Científica", "Fantasia", "Sobrevivência", "Cyberpunk"
  ageRating?: string; // Ex: "Livre", "10+", "12+", "14+", "16+", "18+"
  ptbrSupport?: {
    audio?: boolean;
    subtitles?: boolean;
    interface?: boolean;
  };
  screenshots?: string[]; // URLs de capturas de tela adicionais
  artworks?: string[];
  systemRequirements?: {
    minimum?: string;
    recommended?: string;
  };
}

export interface IndieComment {
  id: string;
  gameId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: string;
}

export interface IndieSubmissionForm {
  title: string;
  tagline: string;
  description: string;
  descriptionMode?: "tiptap" | "html" | "markdown" | null;
  developerName: string;
  developerEmail: string;
  studioWebsite?: string;
  contactDiscord?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  coverImage: string;
  bannerImage?: string;
  trailerUrl?: string;
  platforms: string[];
  genres: string[];
  steamUrl?: string;
  itchUrl?: string;
  releaseDate?: string;
  // Vinculação ao catálogo geral (IGDB / RAWG)
  linkedGameId?: number | string;
  linkedGameSlug?: string;
  linkedGameName?: string;
  // Notas e Atualizações do Desenvolvedor (Dev Notes / Devlog)
  devNotes?: string;
  devNotesMode?: "tiptap" | "html" | "markdown" | null;

  // Campos expandidos da ficha técnica
  storyline?: string;
  publisherName?: string;
  gameModes?: string[];
  playerPerspectives?: string[];
  themes?: string[];
  ageRating?: string;
  ptbrSupport?: {
    audio?: boolean;
    subtitles?: boolean;
    interface?: boolean;
  };
  screenshots?: string[];
  systemRequirements?: {
    minimum?: string;
    recommended?: string;
  };
}

// Título gamer exclusivo concedido ao desenvolvedor que tem jogo aprovado
export const INDIE_CREATOR_TITLE = "👾 Criador Indie MyGameList";
