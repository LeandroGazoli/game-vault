import { Game, GenreItem, PlatformItem } from "./types";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "nn3y51ox7m6a7knczssqz8j593y7dd";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "ggfnhzk9cjm0wc8lubdh31s7bl2ud6";
const IGDB_API_URL = "https://api.igdb.com/v4";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getTwitchAccessToken(): Promise<string | null> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt - 60000) {
    return cachedToken.token;
  }

  try {
    const res = await fetch(
      `https://id.twitch.tv/oauth2/token?client_id=${TWITCH_CLIENT_ID}&client_secret=${TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
      { method: "POST" }
    );

    if (res.ok) {
      const data = await res.json();
      cachedToken = {
        token: data.access_token,
        expiresAt: Date.now() + (data.expires_in * 1000),
      };
      return cachedToken.token;
    } else {
      console.warn("Falha ao autenticar na Twitch:", await res.text());
    }
  } catch (err) {
    console.error("Erro na requisição OAuth da Twitch:", err);
  }

  return null;
}

export function getIGDBImageUrl(imageId: string | undefined, size: "cover_big" | "1080p" | "720p" | "screenshot_big" = "cover_big"): string | null {
  if (!imageId) return null;
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${imageId}.jpg`;
}

export function mapIGDBGameToGame(item: any): Game {
  const coverUrl = item.cover?.image_id
    ? getIGDBImageUrl(item.cover.image_id, "cover_big")
    : (item.screenshots && item.screenshots[0]?.image_id)
    ? getIGDBImageUrl(item.screenshots[0].image_id, "720p")
    : null;

  const genres: GenreItem[] = item.genres?.map((g: any) => ({
    id: g.id,
    name: g.name,
    slug: g.name.toLowerCase().replace(/\s+/g, "-"),
  })) || [];

  const platforms: PlatformItem[] = item.platforms?.map((p: any) => ({
    platform: {
      id: p.id,
      name: p.name,
      slug: p.name.toLowerCase().replace(/\s+/g, "-"),
    },
  })) || [];

  const releaseDate = item.first_release_date
    ? new Date(item.first_release_date * 1000).toISOString().split("T")[0]
    : null;

  const metacriticScore = item.aggregated_rating
    ? Math.round(item.aggregated_rating)
    : item.total_rating
    ? Math.round(item.total_rating)
    : item.rating
    ? Math.round(item.rating)
    : null;

  const scoreFormatted = item.rating
    ? Number((item.rating / 10).toFixed(1))
    : item.aggregated_rating
    ? Number((item.aggregated_rating / 10).toFixed(1))
    : 8.0;

  const screenshots = item.screenshots
    ? (item.screenshots.map((s: any) => getIGDBImageUrl(s.image_id, "1080p")).filter(Boolean) as string[])
    : [];

  const artworks = item.artworks
    ? (item.artworks.map((a: any) => getIGDBImageUrl(a.image_id, "1080p")).filter(Boolean) as string[])
    : [];

  const videos = item.videos
    ? item.videos.map((v: any) => ({
        id: v.id,
        name: v.name || "Trailer",
        video_id: v.video_id,
      })).filter((v: any) => Boolean(v.video_id))
    : [];

  const developers = item.involved_companies
    ? (item.involved_companies
        .filter((c: any) => c.developer && c.company?.name)
        .map((c: any) => c.company.name) as string[])
    : [];

  const publishers = item.involved_companies
    ? (item.involved_companies
        .filter((c: any) => c.publisher && c.company?.name)
        .map((c: any) => c.company.name) as string[])
    : [];

  const game_modes = item.game_modes ? (item.game_modes.map((m: any) => m.name) as string[]) : [];
  const themes = item.themes ? (item.themes.map((t: any) => t.name) as string[]) : [];

  const websites = item.websites
    ? item.websites.map((w: any) => ({
        id: w.id,
        category: w.category,
        url: w.url,
      }))
    : [];

  const similar_games = item.similar_games
    ? item.similar_games.map((sg: any) => ({
        id: sg.id,
        name: sg.name,
        coverUrl: sg.cover?.image_id ? getIGDBImageUrl(sg.cover.image_id, "cover_big") : null,
        rating: sg.rating ? Number((sg.rating / 10).toFixed(1)) : null,
      }))
    : [];

  return {
    id: item.id,
    slug: item.slug || String(item.id),
    name: item.name,
    released: releaseDate,
    background_image: coverUrl,
    rating: scoreFormatted,
    metacritic: metacriticScore,
    playtime: item.total_rating_count || item.hypes || 30,
    description_raw: item.summary || item.storyline || "Sem sinopse disponível no momento.",
    storyline: item.storyline || undefined,
    genres,
    platforms,
    hltb: null,
    screenshots,
    artworks,
    videos,
    developers,
    publishers,
    game_modes,
    themes,
    websites,
    similar_games,
  };
}

// =========================================================================
// CONFIGURAÇÃO DE TTL DE CACHE EM MEMÓRIA (VALORES TRIPLICADOS CONFORME SOLICITADO)
// =========================================================================
export const TTL_CONFIG = {
  SEARCH: 45 * 60 * 1000,           // 45 minutos (triplo de 15m)
  RECENT_RELEASES: 6 * 3600 * 1000, // 6 horas (triplo de 2h)
  UPCOMING: 6 * 3600 * 1000,        // 6 horas (triplo de 2h)
  RANKINGS: 36 * 3600 * 1000,       // 36 horas (triplo de 12h)
  CALENDAR: 72 * 3600 * 1000,       // 72 horas / 3 dias (triplo de 24h)
  GAME_DETAILS: 144 * 3600 * 1000,  // 144 horas / 6 dias (triplo de 48h)
};

// =========================================================================
// CACHE EM MEMÓRIA NO SERVIDOR (RESILIENTE A REQUISIÇÕES POST DO IGDB)
// =========================================================================
interface CacheEntry<T> {
  data: T;
  cachedAt: number;
  ttl: number;
}

const igdbCache = new Map<string, CacheEntry<any>>();
const MAX_CACHE_ENTRIES = 800; // Limite de entradas para economizar memória do container

function getFromCache<T>(key: string): { data: T; isStale: boolean } | null {
  const entry = igdbCache.get(key);
  if (!entry) return null;

  const isStale = Date.now() - entry.cachedAt > entry.ttl;
  return { data: entry.data, isStale };
}

function setToCache<T>(key: string, data: T, ttl: number): void {
  if (igdbCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = igdbCache.keys().next().value;
    if (oldestKey) igdbCache.delete(oldestKey);
  }
  igdbCache.set(key, { data, cachedAt: Date.now(), ttl });
}

// =========================================================================
// FILA DE CONCORRÊNCIA & RATE LIMITER (MÁX 3 REQ/S E MÁX 4 CONEXÕES ABERTAS)
// Teto oficial da IGDB: 4 req/s e 8 conexões. Operamos com 50% de margem de segurança.
// =========================================================================
class RequestDispatcher {
  private queue: Array<() => Promise<void>> = [];
  private activeRequests = 0;
  private readonly maxConcurrency = 4;
  private readonly minIntervalMs = 340; // ~3 requisições por segundo
  private lastDispatchTime = 0;

  async schedule<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.queue.length === 0) return;
    if (this.activeRequests >= this.maxConcurrency) return;

    const now = Date.now();
    const timeSinceLast = now - this.lastDispatchTime;
    if (timeSinceLast < this.minIntervalMs) {
      setTimeout(() => this.processNext(), this.minIntervalMs - timeSinceLast);
      return;
    }

    const nextTask = this.queue.shift();
    if (!nextTask) return;

    this.activeRequests++;
    this.lastDispatchTime = Date.now();

    try {
      await nextTask();
    } finally {
      this.activeRequests--;
      this.processNext();
    }
  }
}

const igdbDispatcher = new RequestDispatcher();

// =========================================================================
// RETRY COM BACKOFF EXPONENCIAL & JITTER CONTRA 429
// =========================================================================
async function fetchIGDBWithRetry(
  endpoint: string,
  body: string,
  maxRetries = 3
): Promise<any[]> {
  const token = await getTwitchAccessToken();
  if (!token) return [];

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(`${IGDB_API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body,
      });

      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : [];
      }

      // Trata rate limit (429) ou instabilidade temporária (502, 503, 504)
      if (res.status === 429 || res.status >= 500) {
        const retryAfterHeader = res.headers.get("Retry-After");
        let delayMs = retryAfterHeader
          ? parseInt(retryAfterHeader, 10) * 1000
          : 400 * Math.pow(2, attempt - 1);
        
        // Jitter aleatório (50ms - 150ms) para dispersar concorrência
        delayMs += Math.floor(Math.random() * 100) + 50;

        console.warn(
          `[IGDB RateLimit/Retry] Status ${res.status} em '${endpoint}'. Tentativa ${attempt}/${maxRetries} aguardando ${delayMs}ms.`
        );

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }
      }

      console.warn(`Erro IGDB (${endpoint}):`, res.status, await res.text());
      break;
    } catch (err) {
      console.error(`Exceção IGDB (${endpoint}) tentativa ${attempt}:`, err);
      if (attempt < maxRetries) {
        const delayMs = 500 * Math.pow(2, attempt - 1) + Math.floor(Math.random() * 100);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
    }
  }

  return [];
}

// =========================================================================
// FUNÇÃO CENTRAL fetchIGDB COM CACHE, FILA E STALE FALLBACK
// =========================================================================
async function fetchIGDB(endpoint: string, body: string, ttl = TTL_CONFIG.RECENT_RELEASES): Promise<any[]> {
  const cacheKey = `${endpoint}:${body}`;
  const cached = getFromCache<any[]>(cacheKey);

  // 1. Se existir no cache e estiver válido (fresh), entrega em 0ms sem rede
  if (cached && !cached.isStale) {
    return cached.data;
  }

  // 2. Se não estiver em cache ou expirou, processa através da fila controlada
  try {
    const data = await igdbDispatcher.schedule(() => fetchIGDBWithRetry(endpoint, body));

    if (data && data.length > 0) {
      setToCache(cacheKey, data, ttl);
      return data;
    }

    // 3. Fallback gracioso: se a API falhou mas temos dados stale, entrega o stale
    if (cached && cached.data && cached.data.length > 0) {
      console.warn(`[IGDB Fallback] Entregando dados em cache stale para: ${endpoint}`);
      return cached.data;
    }

    return data;
  } catch (err) {
    console.error(`Erro ao despachar requisição IGDB (${endpoint}):`, err);
    if (cached && cached.data) {
      return cached.data;
    }
    return [];
  }
}

// =========================================================================
// CONSULTAS DE NEGÓCIO EXPORTADAS COM TTLs DEDICADOS
// =========================================================================

// 1. Busca Geral no IGDB com Paginação (TTL: 45 min)
export async function searchGamesIGDB(query: string, limit = 50, offset = 0): Promise<Game[]> {
  const escapedQuery = query.replace(/"/g, "").trim();
  if (!escapedQuery) return [];
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id; search "${escapedQuery}"; limit ${limit}; offset ${offset};`;
  const data = await fetchIGDB("games", body, TTL_CONFIG.SEARCH);
  return data.map(mapIGDBGameToGame);
}

// 2. Lançamentos Recentes - Últimos 60 dias (TTL: 6 horas)
export async function getRecentReleasesIGDB(limit = 24): Promise<Game[]> {
  // Arredonda o timestamp em blocos de 30 minutos para garantir chaves de cache determinísticas
  const nowSec = Math.floor(Date.now() / (1000 * 1800)) * 1800;
  const sixtyDaysAgo = nowSec - (60 * 24 * 60 * 60);
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id; where first_release_date <= ${nowSec} & first_release_date >= ${sixtyDaysAgo} & cover != null; sort first_release_date desc; limit ${limit};`;
  const data = await fetchIGDB("games", body, TTL_CONFIG.RECENT_RELEASES);
  return data.map(mapIGDBGameToGame);
}

// 3. Em Breve - Próximos Lançamentos (TTL: 6 horas)
export async function getUpcomingGamesIGDB(limit = 24): Promise<Game[]> {
  // Arredonda o timestamp em blocos de 30 minutos para garantir chaves de cache determinísticas
  const nowSec = Math.floor(Date.now() / (1000 * 1800)) * 1800;
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, hypes, screenshots.image_id; where first_release_date > ${nowSec} & cover != null; sort first_release_date asc; limit ${limit};`;
  const data = await fetchIGDB("games", body, TTL_CONFIG.UPCOMING);
  return data.map(mapIGDBGameToGame);
}

// 4. Rankings MGL - Mais Populares, Bem Avaliados, Desejados (TTL: 36 horas)
export async function getRankingsIGDB(category: "popular" | "top_rated" | "hyped" = "popular", limit = 20): Promise<Game[]> {
  let body = "";
  // Arredonda timestamp para blocos de 1 hora
  const nowSec = Math.floor(Date.now() / (1000 * 3600)) * 3600;

  if (category === "top_rated") {
    body = `fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating; where aggregated_rating != null & total_rating_count > 40 & cover != null; sort aggregated_rating desc; limit ${limit};`;
  } else if (category === "hyped") {
    body = `fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, hypes, rating; where hypes != null & hypes > 0 & cover != null & first_release_date > ${nowSec}; sort hypes desc; limit ${limit};`;
  } else {
    // Mais populares por contagem total de avaliações e relevância
    body = `fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, total_rating_count, rating, aggregated_rating; where total_rating_count > 100 & cover != null; sort total_rating_count desc; limit ${limit};`;
  }

  const data = await fetchIGDB("games", body, TTL_CONFIG.RANKINGS);
  return data.map(mapIGDBGameToGame);
}

// 5. Calendário de Lançamentos - Jogos do Mês (TTL: 72 horas / 3 dias)
export async function getCalendarGamesIGDB(year: number, month: number): Promise<Record<string, Game[]>> {
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

  const startSec = Math.floor(startDate.getTime() / 1000);
  const endSec = Math.floor(endDate.getTime() / 1000);

  const body = `fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, hypes, aggregated_rating; where first_release_date >= ${startSec} & first_release_date <= ${endSec} & cover != null; sort first_release_date asc; limit 100;`;
  const data = await fetchIGDB("games", body, TTL_CONFIG.CALENDAR);

  const grouped: Record<string, Game[]> = {};

  data.forEach((item) => {
    if (item.first_release_date) {
      const dateKey = new Date(item.first_release_date * 1000).toISOString().split("T")[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(mapIGDBGameToGame(item));
    }
  });

  return grouped;
}

// 6. Detalhes de um Jogo por ID (TTL: 144 horas / 6 dias)
export async function getGameDetailsIGDB(id: string | number): Promise<Game | null> {
  if (isNaN(Number(id))) return null;
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id, artworks.image_id, videos.name, videos.video_id, themes.name, game_modes.name, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, websites.category, websites.url, similar_games.name, similar_games.cover.image_id, similar_games.rating; where id = ${id}; limit 1;`;
  const data = await fetchIGDB("games", body, TTL_CONFIG.GAME_DETAILS);
  if (data.length > 0) return mapIGDBGameToGame(data[0]);
  return null;
}

