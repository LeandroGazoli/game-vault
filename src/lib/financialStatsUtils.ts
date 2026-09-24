import { UserGame } from "@/lib/types";

export interface FinancialStatsSummary {
  totalSpentBrl: number;
  gamesWithPriceCount: number;
  averagePricePerGame: number;
  costPerHourPlayed: number;
  spentCurrentYear: number;
  bestValueGames: {
    gameId: number;
    gameTitle: string;
    gameCover: string | null;
    price: number;
    hours: number;
    costPerHour: number;
  }[];
  worstValueGames: {
    gameId: number;
    gameTitle: string;
    gameCover: string | null;
    price: number;
    hours: number;
    costPerHour: number;
  }[];
  acquisitionDistribution: {
    boughtCount: number;
    subscriptionCount: number;
    giftCount: number;
    freeCount: number;
  };
  spendingByPlatform: {
    platform: string;
    total: number;
    gamesCount: number;
  }[];
}

/**
 * Calcula o Resumo de Investimento e Custo-Benefício Gamer com base na biblioteca do usuário.
 */
export function computeFinancialStats(games: UserGame[]): FinancialStatsSummary {
  let totalSpentBrl = 0;
  let totalHoursForPricedGames = 0;
  let gamesWithPriceCount = 0;
  let spentCurrentYear = 0;
  const currentYearStr = String(new Date().getFullYear());

  let boughtCount = 0;
  let subscriptionCount = 0;
  let giftCount = 0;
  let freeCount = 0;

  const platformSpendMap: Record<string, { total: number; gamesCount: number }> = {};
  const pricedGamesWithValue: {
    gameId: number;
    gameTitle: string;
    gameCover: string | null;
    price: number;
    hours: number;
    costPerHour: number;
  }[] = [];

  games.forEach((game) => {
    const price = typeof game.pricePaid === "number" ? game.pricePaid : null;
    const hours = game.userPlaytimeHours || 0;

    // Contabilizar tipo de aquisição
    if (game.acquisitionType === "subscription") subscriptionCount++;
    else if (game.acquisitionType === "gift") giftCount++;
    else if (game.acquisitionType === "free_to_play" || price === 0) freeCount++;
    else if (price !== null && price > 0) boughtCount++;

    if (price !== null && price >= 0) {
      totalSpentBrl += price;
      gamesWithPriceCount++;
      totalHoursForPricedGames += hours;

      // Gasto no ano corrente
      if (game.createdAt && game.createdAt.startsWith(currentYearStr)) {
        spentCurrentYear += price;
      }

      // Por plataforma
      const plat = game.platformPlayed || "Outro";
      if (!platformSpendMap[plat]) {
        platformSpendMap[plat] = { total: 0, gamesCount: 0 };
      }
      platformSpendMap[plat].total += price;
      platformSpendMap[plat].gamesCount++;

      // Cálculo de Custo por Hora
      if (hours > 0 && price > 0) {
        const costPerHour = Number((price / hours).toFixed(2));
        pricedGamesWithValue.push({
          gameId: game.gameId,
          gameTitle: game.gameTitle,
          gameCover: game.gameCover,
          price,
          hours,
          costPerHour,
        });
      }
    }
  });

  const averagePricePerGame =
    gamesWithPriceCount > 0 ? Number((totalSpentBrl / gamesWithPriceCount).toFixed(2)) : 0;

  const costPerHourPlayed =
    totalHoursForPricedGames > 0
      ? Number((totalSpentBrl / totalHoursForPricedGames).toFixed(2))
      : 0;

  // Ordenar para melhor custo-benefício (menor custo por hora)
  pricedGamesWithValue.sort((a, b) => a.costPerHour - b.costPerHour);
  const bestValueGames = pricedGamesWithValue.slice(0, 5);

  // Ordenar para pior custo-benefício (maior custo por hora)
  const worstValueGames = [...pricedGamesWithValue].reverse().slice(0, 5);

  const spendingByPlatform = Object.entries(platformSpendMap)
    .map(([platform, data]) => ({
      platform,
      total: Number(data.total.toFixed(2)),
      gamesCount: data.gamesCount,
    }))
    .sort((a, b) => b.total - a.total);

  return {
    totalSpentBrl: Number(totalSpentBrl.toFixed(2)),
    gamesWithPriceCount,
    averagePricePerGame,
    costPerHourPlayed,
    spentCurrentYear: Number(spentCurrentYear.toFixed(2)),
    bestValueGames,
    worstValueGames,
    acquisitionDistribution: {
      boughtCount,
      subscriptionCount,
      giftCount,
      freeCount,
    },
    spendingByPlatform,
  };
}
