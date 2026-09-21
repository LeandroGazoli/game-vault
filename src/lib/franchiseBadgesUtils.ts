import { UserGame } from "@/lib/types";
import { FranchiseBadgeDef, UserFranchiseBadgeProgress } from "@/lib/types/franchiseBadges.types";
import { OFFICIAL_FRANCHISE_BADGES } from "@/lib/franchiseBadgesData";

/**
 * Normaliza título de jogo para comparação tolerante a maiúsculas, pontuação e sufixos.
 */
function normalizeGameTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

/**
 * Calcula o progresso do usuário em cada insígnia de franquia cruzando com seus jogos zerados/completados.
 */
export function calculateFranchiseBadgesProgress(
  games: UserGame[],
  customBadges?: FranchiseBadgeDef[]
): {
  progressList: UserFranchiseBadgeProgress[];
  badges: FranchiseBadgeDef[];
  totalUnlockedBadges: number;
} {
  const badgesList = customBadges && customBadges.length > 0 ? customBadges : OFFICIAL_FRANCHISE_BADGES;

  // Filtrar jogos finalizados ou completados
  const finishedGames = games.filter(
    (g) =>
      g.status === "completed" ||
      g.status === "playing" ||
      g.completionType === "completionist"
  );

  const finishedNormalized = new Set(finishedGames.map((g) => normalizeGameTitle(g.gameTitle)));

  let totalUnlockedBadges = 0;

  const progressList: UserFranchiseBadgeProgress[] = badgesList.map((badge) => {
    const completedGameIds: string[] = [];

    badge.games.forEach((game) => {
      const normTarget = normalizeGameTitle(game.title);
      // Checa por correspondência direta ou parcial (ex: "Dark Souls Remastered" contendo "Dark Souls")
      const isCompleted = Array.from(finishedNormalized).some(
        (fin) => fin.includes(normTarget) || normTarget.includes(fin)
      );

      if (isCompleted) {
        completedGameIds.push(game.id);
      }
    });

    const completedGamesCount = completedGameIds.length;
    const totalGamesCount = badge.games.length;

    let unlockedTier: UserFranchiseBadgeProgress["unlockedTier"] = "none";

    if (completedGamesCount >= badge.minGamesForPlat) {
      unlockedTier = "platinum";
      totalUnlockedBadges++;
    } else if (completedGamesCount >= badge.minGamesForGold) {
      unlockedTier = "gold";
      totalUnlockedBadges++;
    } else if (completedGamesCount >= badge.minGamesForSilver) {
      unlockedTier = "silver";
      totalUnlockedBadges++;
    } else if (completedGamesCount >= badge.minGamesForBronze) {
      unlockedTier = "bronze";
      totalUnlockedBadges++;
    }

    return {
      badgeId: badge.id,
      unlockedTier,
      completedGamesCount,
      totalGamesCount,
      completedGameIds,
      isHallOfFameEligible: unlockedTier === "platinum",
    };
  });

  return {
    progressList,
    badges: badgesList,
    totalUnlockedBadges,
  };
}
