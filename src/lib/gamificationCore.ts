/**
 * Lógica PURA de gamificação — sem dependências de React/lucide.
 * Pode ser importada tanto no cliente quanto no servidor (Admin SDK / route handlers).
 */
import {
  GamificationMetric,
  GamificationMissionDef,
  LibraryStats,
  UserGame,
} from "./types";

// ==========================================
// Avaliação de métricas contra as estatísticas do usuário
// ==========================================

export interface MetricContext {
  stats?: LibraryStats | null;
  level?: number;
}

const METRIC_UNIT: Record<GamificationMetric, string> = {
  completed: "jogos",
  hours: "horas",
  library: "jogos",
  rated: "avaliações",
  playing: "jogos",
  level: "nível",
};

export function getMetricValue(metric: GamificationMetric, ctx: MetricContext): number {
  const stats = ctx.stats;
  if (metric === "level") return ctx.level ?? 1;
  if (!stats) return 0;
  switch (metric) {
    case "completed":
      return stats.completedCount || 0;
    case "hours":
      return Math.floor(stats.totalPlaytimeHours || 0);
    case "library":
      return stats.totalGames || 0;
    case "rated":
      return Math.max(0, stats.ratedCount ?? 0);
    case "playing":
      return stats.playingCount || 0;
    default:
      return 0;
  }
}

export interface EvaluatedDef {
  current: number;
  target: number;
  isUnlocked: boolean;
  percent: number;
  progressText: string;
  unit: string;
}

export function evaluateDef(
  def: { metric: GamificationMetric; targetValue: number },
  ctx: MetricContext
): EvaluatedDef {
  const target = Math.max(1, def.targetValue || 1);
  const current = getMetricValue(def.metric, ctx);
  const capped = Math.min(current, target);
  const isUnlocked = current >= target;
  const percent = Math.min(100, Math.floor((capped / target) * 100));
  const unit = METRIC_UNIT[def.metric] || "";
  return {
    current,
    target,
    isUnlocked,
    percent,
    progressText: `${capped} / ${target} ${unit}`.trim(),
    unit,
  };
}

// ==========================================
// Missões de temporada: filtro por janela de datas
// ==========================================

export function getActiveSeasonMissions(
  missions: GamificationMissionDef[],
  now: Date
): GamificationMissionDef[] {
  const ts = now.getTime();
  return missions.filter((m) => {
    if (m.type !== "season" || !m.isActive) return false;
    if (m.startsAt) {
      const start = new Date(m.startsAt).getTime();
      if (!isNaN(start) && ts < start) return false;
    }
    if (m.endsAt) {
      const end = new Date(m.endsAt).getTime();
      if (!isNaN(end) && ts > end) return false;
    }
    return true;
  });
}

// ==========================================
// Missões diárias: seleção determinística por data (pool + rotação)
// ==========================================

/** Chave de data local no formato YYYY-MM-DD. */
export function getDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Hash determinístico simples (djb2) para gerar seed a partir de uma string. */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return hash >>> 0;
}

/** PRNG determinístico (mulberry32) a partir de uma seed numérica. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Seleciona `count` missões diárias do pool de forma determinística para a data dada.
 * Mesma data => mesma seleção (estável ao recarregar a página no mesmo dia).
 */
export function getDailyMissions(
  pool: GamificationMissionDef[],
  count: number,
  dateKey: string
): GamificationMissionDef[] {
  const active = pool.filter((m) => m.type === "daily" && m.isActive);
  if (active.length === 0) return [];
  const n = Math.max(0, Math.min(count, active.length));
  if (n === 0) return [];
  if (n >= active.length) return [...active];

  // Ordem estável do pool (por id) para reprodutibilidade independente da ordem de leitura
  const sorted = [...active].sort((a, b) => a.id.localeCompare(b.id));
  const rand = mulberry32(hashString(dateKey));

  // Fisher–Yates determinístico
  const indices = sorted.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, n).map((i) => sorted[i]);
}

// ==========================================
// Recomputo de estatísticas a partir dos jogos (paridade com GameLibraryContext)
// Usado no servidor para validar desbloqueios de forma à prova de forja.
// ==========================================

export function computeLibraryStats(games: UserGame[]): LibraryStats {
  let totalPlaytime = 0;
  let ratingSum = 0;
  let ratedCount = 0;
  const genreMap: Record<string, number> = {};

  let completed = 0;
  let playing = 0;
  let dropped = 0;
  let backlog = 0;
  let libraryCount = 0;

  for (const g of games) {
    if (g.status === "completed") completed++;
    else if (g.status === "playing") playing++;
    else if (g.status === "dropped") dropped++;
    else if (g.status === "backlog") backlog++;
    else if (g.status === "library") libraryCount++;

    if (g.userPlaytimeHours && g.userPlaytimeHours > 0) {
      totalPlaytime += g.userPlaytimeHours;
    }
    if (g.userRating && g.userRating > 0) {
      ratingSum += g.userRating;
      ratedCount++;
    }
    if (g.genres) {
      for (const genre of g.genres) {
        genreMap[genre] = (genreMap[genre] || 0) + 1;
      }
    }
  }

  const topGenres = Object.entries(genreMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalGames: games.length,
    completedCount: completed,
    playingCount: playing,
    droppedCount: dropped,
    backlogCount: backlog,
    libraryCount,
    totalPlaytimeHours: totalPlaytime,
    averageRating: ratedCount > 0 ? Number((ratingSum / ratedCount).toFixed(1)) : 0,
    ratedCount,
    topGenres,
  };
}
