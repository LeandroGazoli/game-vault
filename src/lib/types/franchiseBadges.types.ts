/**
 * Tipagens para o Sistema de Insígnias por Franquia (Franchise Badges).
 * Permite ao jogador colecionar insígnias temáticas (Dark Souls, Resident Evil, etc.)
 * onde cada jogo concluído ou platinado acende uma estrela ou estágio da insígnia.
 */

export interface FranchiseBadgeGame {
  id: string; // Ex: "dark-souls-1"
  title: string;
  gameId?: number; // IGDB ID se disponível
  platformTag?: string; // Ex: "PS3", "PS4", "PC"
  requiredForPlat?: boolean;
}

export interface FranchiseBadgeDef {
  id: string; // Ex: "dark_souls", "resident_evil", "god_of_war", "persona"
  name: string; // Ex: "Dark Souls", "Resident Evil"
  tagline: string; // Ex: "Prepare to Die", "Survival Horror Legacy"
  category: "soulsborne" | "horror" | "rpg" | "action" | "adventure" | "nintendo";
  iconName: string; // Ícone Lucide ou representação visual
  accentColor: string; // Hex ou Tailwind (ex: "#ef4444" ou "amber")
  games: FranchiseBadgeGame[];
  minGamesForBronze: number;
  minGamesForSilver: number;
  minGamesForGold: number;
  minGamesForPlat: number;
}

export interface UserFranchiseBadgeProgress {
  badgeId: string;
  unlockedTier: "none" | "bronze" | "silver" | "gold" | "platinum";
  completedGamesCount: number;
  totalGamesCount: number;
  completedGameIds: string[];
  isHallOfFameEligible: boolean;
  unlockedAt?: string;
}
