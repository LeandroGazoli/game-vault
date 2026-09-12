export type IndieSpotlightLocation = "search" | "game_detail" | "home";

export type IndieGameStatus = "pending" | "approved" | "rejected";

export interface IndieGame {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  developerName: string;
  developerEmail: string;
  studioWebsite?: string;
  contactDiscord?: string;
  coverImage: string;
  bannerImage?: string;
  trailerUrl?: string;
  platforms: string[];
  genres: string[];
  steamUrl?: string;
  itchUrl?: string;
  releaseDate?: string;
  status: IndieGameStatus;
  votesCount: number;
  voters: string[]; // UIDs dos usuários que votaram
  isSpotlight: boolean;
  spotlightLocations: IndieSpotlightLocation[];
  submittedBy: string; // UID do usuário que submeteu
  createdAt: string;
  updatedAt: string;
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
  developerName: string;
  developerEmail: string;
  studioWebsite?: string;
  contactDiscord?: string;
  coverImage: string;
  bannerImage?: string;
  trailerUrl?: string;
  platforms: string[];
  genres: string[];
  steamUrl?: string;
  itchUrl?: string;
  releaseDate?: string;
}
