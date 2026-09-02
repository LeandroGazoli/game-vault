import { UserGame, GameStatus, CompletionType } from "./types";

export interface ExportFilters {
  status?: string; // "all" | GameStatus
  onlyFavorites?: boolean;
  onlyRated?: boolean;
  platform?: string; // "all" | specific platform
  search?: string;
}

export function filterGamesForExport(
  games: UserGame[],
  filters: ExportFilters
): UserGame[] {
  return games.filter((game) => {
    // 1. Filtro por status
    if (filters.status && filters.status !== "all" && game.status !== filters.status) {
      return false;
    }

    // 2. Filtro por favoritos
    if (filters.onlyFavorites && !game.isFavorite) {
      return false;
    }

    // 3. Filtro por avaliação existente
    if (filters.onlyRated && (game.userRating === null || game.userRating === undefined)) {
      return false;
    }

    // 4. Filtro por plataforma
    if (filters.platform && filters.platform !== "all") {
      const platforms = game.platformsPlayed && game.platformsPlayed.length > 0
        ? game.platformsPlayed
        : game.platformPlayed
        ? [game.platformPlayed]
        : [];
      if (!platforms.includes(filters.platform)) {
        return false;
      }
    }

    // 5. Filtro por busca de texto
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase();
      const matchTitle = game.gameTitle.toLowerCase().includes(q);
      const matchReview = game.userReview?.toLowerCase().includes(q);
      if (!matchTitle && !matchReview) {
        return false;
      }
    }

    return true;
  });
}

const STATUS_LABELS: Record<GameStatus, string> = {
  completed: "Zerado",
  playing: "Jogando",
  backlog: "Quero Jogar (Backlog)",
  dropped: "Dropado",
};

const COMPLETION_LABELS: Record<CompletionType, string> = {
  main_story: "História Principal",
  main_extra: "História + Extras",
  completionist: "100% Completo",
  platinum: "Platina / Conquistas",
  custom: "Personalizado",
};

export function mapGameToExportRow(game: UserGame) {
  const platforms = game.platformsPlayed && game.platformsPlayed.length > 0
    ? game.platformsPlayed.join(", ")
    : game.platformPlayed || "";

  return {
    ID: game.gameId,
    "Título do Jogo": game.gameTitle,
    Status: STATUS_LABELS[game.status] || game.status,
    "Tipo de Conclusão": game.completionType ? COMPLETION_LABELS[game.completionType] || game.completionType : "",
    "Sua Nota (0-10)": game.userRating !== null && game.userRating !== undefined ? game.userRating : "",
    "Metacritic Score": game.metacritic || "",
    "Tempo Jogado (Horas)": game.userPlaytimeHours || "",
    Plataformas: platforms,
    Favorito: game.isFavorite ? "Sim" : "Não",
    "Data de Início": game.startedAt ? game.startedAt.split("T")[0] : "",
    "Data de Conclusão": game.completedAt ? game.completedAt.split("T")[0] : "",
    "Sua Resenha / Anotações": game.userReview ? `"${game.userReview.replace(/"/g, '""')}"` : "",
  };
}

/**
 * Exporta a lista de jogos para um arquivo CSV formatado com UTF-8 BOM para abrir direto no Excel
 */
export function downloadCsv(games: UserGame[], filename = "gamevault-jogos.csv") {
  if (!games || games.length === 0) return;

  const rows = games.map(mapGameToExportRow);
  const headers = Object.keys(rows[0]);

  const csvRows: string[] = [];
  // Cabeçalho delimitado por ponto e vírgula (padrão Brasil/Excel)
  csvRows.push(headers.map((h) => `"${h}"`).join(";"));

  for (const row of rows) {
    const values = headers.map((header) => {
      const val = (row as any)[header];
      if (typeof val === "string" && val.startsWith('"') && val.endsWith('"')) {
        return val;
      }
      return `"${String(val ?? "").replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(";"));
  }

  // \uFEFF adiciona o BOM UTF-8 para o Microsoft Excel reconhecer acentos
  const csvContent = "\uFEFF" + csvRows.join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  triggerDownload(blob, filename);
}

/**
 * Exporta a lista de jogos para um arquivo JSON estruturado
 */
export function downloadJson(games: UserGame[], filename = "gamevault-jogos.json") {
  if (!games) return;

  const exportPayload = {
    source: "GameVault",
    exportedAt: new Date().toISOString(),
    totalGames: games.length,
    games: games,
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);
  const blob = new Blob([jsonString], { type: "application/json;charset=utf-8;" });
  triggerDownload(blob, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
