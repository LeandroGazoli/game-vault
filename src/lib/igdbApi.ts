import { Game, GenreItem, PlatformItem } from "./types";

const TWITCH_CLIENT_ID = process.env.TWITCH_CLIENT_ID || process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID || "";
const TWITCH_CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET || "";
const IGDB_API_URL = "https://api.igdb.com/v4";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getTwitchAccessToken(): Promise<string | null> {
  if (!TWITCH_CLIENT_ID || !TWITCH_CLIENT_SECRET) {
    console.error("[Twitch/IGDB] TWITCH_CLIENT_ID ou TWITCH_CLIENT_SECRET não configurados nas variáveis de ambiente.");
    return null;
  }

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
      const errorText = await res.text();
      console.error("[Twitch/IGDB] Falha ao autenticar na Twitch OAuth:", res.status, errorText);
    }
  } catch (err) {
    console.error("[Twitch/IGDB] Erro de rede na requisição OAuth da Twitch:", err);
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

  const backdropUrl = (item.artworks && item.artworks[0]?.image_id)
    ? getIGDBImageUrl(item.artworks[0].image_id, "1080p")
    : (item.screenshots && item.screenshots[0]?.image_id)
    ? getIGDBImageUrl(item.screenshots[0].image_id, "1080p")
    : coverUrl;

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

  const franchises = item.franchises
    ? (item.franchises.map((f: any) => f.name).filter(Boolean) as string[])
    : item.franchise?.name
    ? [item.franchise.name]
    : [];

  const collections = item.collections
    ? (item.collections.map((c: any) => c.name).filter(Boolean) as string[])
    : item.collection?.name
    ? [item.collection.name]
    : [];

  const player_perspectives = item.player_perspectives
    ? (item.player_perspectives.map((p: any) => p.name).filter(Boolean) as string[])
    : [];

  const age_ratings = item.age_ratings
    ? item.age_ratings.map((ar: any) => ({
        organization: ar.organization?.name || (typeof ar.organization === "string" ? ar.organization : "Outro"),
        rating: ar.rating_category?.rating || ar.rating?.toString() || "",
      })).filter((ar: any) => Boolean(ar.rating))
    : [];

  // Mapear Suporte a PT-BR
  const ptbrItems = item.language_supports?.filter((ls: any) =>
    ls.language?.name?.toLowerCase()?.includes("portuguese (brazil)")
  ) || [];

  const ptbrSupport = ptbrItems.length > 0 ? {
    audio: ptbrItems.some((ls: any) => ls.language_support_type?.name === "Audio" || ls.language_support_type?.id === 1),
    subtitles: ptbrItems.some((ls: any) => ls.language_support_type?.name === "Subtitles" || ls.language_support_type?.id === 2),
    interface: ptbrItems.some((ls: any) => ls.language_support_type?.name === "Interface" || ls.language_support_type?.id === 3),
  } : undefined;

  // Mapear DLCs, Expansões e Jogo Pai
  const dlcs = item.dlcs
    ? (item.dlcs.map((d: any) => ({
        id: d.id,
        name: d.name,
        slug: d.slug,
        coverUrl: d.cover?.image_id ? getIGDBImageUrl(d.cover.image_id, "cover_big") : null,
        releaseDate: d.first_release_date ? new Date(d.first_release_date * 1000).toISOString().split("T")[0] : null,
        category: d.category,
      })).filter((d: any) => Boolean(d.name)))
    : [];

  const expansions = item.expansions
    ? (item.expansions.map((e: any) => ({
        id: e.id,
        name: e.name,
        slug: e.slug,
        coverUrl: e.cover?.image_id ? getIGDBImageUrl(e.cover.image_id, "cover_big") : null,
        releaseDate: e.first_release_date ? new Date(e.first_release_date * 1000).toISOString().split("T")[0] : null,
        category: e.category,
      })).filter((e: any) => Boolean(e.name)))
    : [];

  const parent_game = item.parent_game
    ? {
        id: item.parent_game.id,
        name: item.parent_game.name,
        slug: item.parent_game.slug,
        coverUrl: item.parent_game.cover?.image_id ? getIGDBImageUrl(item.parent_game.cover.image_id, "cover_big") : null,
      }
    : null;

  return {
    id: item.id,
    slug: item.slug || String(item.id),
    name: item.name,
    released: releaseDate,
    background_image: coverUrl,
    backdrop_image: backdropUrl,
    rating: scoreFormatted,
    metacritic: metacriticScore,
    playtime: item.total_rating_count || item.hypes || undefined,
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
    age_ratings,
    franchises,
    collections,
    player_perspectives,
    ptbrSupport,
    dlcs,
    expansions,
    parent_game,
    category: item.category,
    isAdult: Boolean(
      (item.themes && item.themes.some((t: any) => t.id === 42 || (typeof t === "string" && (t.toLowerCase() === "erotic" || t.toLowerCase() === "adult")) || (typeof t.name === "string" && (t.name.toLowerCase() === "erotic" || t.name.toLowerCase() === "adult")))) ||
      age_ratings.some((ar: any) => {
        const org = (ar.organization || "").toUpperCase();
        const rating = (ar.rating || "").toUpperCase();
        if (org.includes("CLASS_IND") || org.includes("CLASSIND") || org.includes("PEGI") || org.includes("USK")) {
          return rating.includes("18") || rating === "18";
        }
        if (org.includes("ESRB")) {
          return rating.includes("AO") || rating.includes("ADULTS ONLY");
        }
        if (org.includes("CERO")) {
          return rating === "Z" || rating.includes("Z");
        }
        if (org.includes("ACB")) {
          return rating.includes("R18") || rating.includes("18+");
        }
        return false;
      })
    ),
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
  private isTimerScheduled = false;

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

  private processNext() {
    if (this.queue.length === 0) return;
    if (this.activeRequests >= this.maxConcurrency) return;

    const now = Date.now();
    const timeSinceLast = now - this.lastDispatchTime;
    if (timeSinceLast < this.minIntervalMs) {
      if (!this.isTimerScheduled) {
        this.isTimerScheduled = true;
        setTimeout(() => {
          this.isTimerScheduled = false;
          this.processNext();
        }, this.minIntervalMs - timeSinceLast);
      }
      return;
    }

    const nextTask = this.queue.shift();
    if (!nextTask) return;

    this.activeRequests++;
    this.lastDispatchTime = Date.now();

    (async () => {
      try {
        await nextTask();
      } finally {
        this.activeRequests--;
        this.processNext();
      }
    })();
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

export interface SearchFilterOptions {
  query?: string;
  genreId?: number;
  genreIds?: number[];
  themeId?: number;
  platformId?: number;
  platformIds?: number[];
  minRating?: number;
  perspectiveId?: number;
  gameModeId?: number;
  sort?: "popular" | "top_rated" | "recent" | "upcoming" | "name_asc" | string;
  limit?: number;
  offset?: number;
  onlyAdult?: boolean;
  includeAdult?: boolean;
}

// 1. Busca Geral e Filtros Adaptativos no IGDB com Paginação (TTL: 45 min)
export async function searchAndFilterGamesIGDB(
  options: SearchFilterOptions
): Promise<Game[]> {
  const {
    query = "",
    genreId,
    genreIds,
    themeId,
    platformId,
    platformIds,
    minRating,
    perspectiveId,
    gameModeId,
    sort = "popular",
    limit = 36,
    offset = 0,
    onlyAdult,
    includeAdult,
  } = options;

  const escapedQuery = query.replace(/"/g, "").trim();
  const whereParts: string[] = ["cover != null", "parent_game = null"];

  // Tratamento de conteúdo adulto (+18): Tema 42 no IGDB é Erotic
  if (onlyAdult) {
    whereParts.push("themes = (42)");
  } else if (!includeAdult) {
    whereParts.push("themes != (42)");
  }

  // Filtros de Plataforma
  if (platformIds && platformIds.length > 0) {
    whereParts.push(`platforms = (${platformIds.join(",")})`);
  } else if (platformId) {
    whereParts.push(`platforms = (${platformId})`);
  }

  // Filtros de Gênero / Tema
  if (genreIds && genreIds.length > 0) {
    whereParts.push(`genres = (${genreIds.join(",")})`);
  } else if (genreId) {
    whereParts.push(`genres = (${genreId})`);
  }
  if (themeId) {
    whereParts.push(`themes = (${themeId})`);
  }

  // Filtro de Perspectiva e Modos de Jogo
  if (perspectiveId && perspectiveId > 0) {
    whereParts.push(`player_perspectives = (${perspectiveId})`);
  }
  if (gameModeId && gameModeId > 0) {
    whereParts.push(`game_modes = (${gameModeId})`);
  }

  // Filtro de Nota Mínima
  if (minRating && minRating > 0) {
    whereParts.push(`(aggregated_rating >= ${minRating} | rating >= ${minRating})`);
  }

  let body = "";
  const nowSec = Math.floor(Date.now() / 1000);

  const fieldsList = "fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id, category, parent_game.name, parent_game.id, parent_game.slug, themes.id, themes.name, age_ratings.organization.name, age_ratings.rating_category.rating, age_ratings.rating;";

  if (escapedQuery) {
    // Busca Textual com Filtros opcionais (em buscas textuais, IGDB não aceita cláusula sort)
    const whereClause = whereParts.length > 0 ? `where ${whereParts.join(" & ")};` : "";
    body = `${fieldsList} search "${escapedQuery}"; ${whereClause} limit ${limit}; offset ${offset};`;
  } else {
    // Exploração Adaptativa (sem query textual, ordenação dinâmica permitida)
    const isFiltered = Boolean(
      (platformIds && platformIds.length > 0) ||
      platformId ||
      (genreIds && genreIds.length > 0) ||
      genreId ||
      themeId ||
      (perspectiveId && perspectiveId > 0) ||
      (gameModeId && gameModeId > 0) ||
      (minRating && minRating > 0) ||
      onlyAdult
    );

    let sortClause = "sort total_rating_count desc;";
    if (sort === "top_rated") {
      whereParts.push("(aggregated_rating != null | rating != null)");
      if (!isFiltered) {
        whereParts.push("total_rating_count > 15");
      }
      sortClause = "sort aggregated_rating desc;";
    } else if (sort === "recent") {
      whereParts.push(`first_release_date != null & first_release_date <= ${nowSec}`);
      sortClause = "sort first_release_date desc;";
    } else if (sort === "upcoming") {
      whereParts.push(`first_release_date != null & first_release_date > ${nowSec}`);
      sortClause = "sort first_release_date asc;";
    } else if (sort === "name_asc") {
      sortClause = "sort name asc;";
    } else {
      // popular
      if (!isFiltered) {
        whereParts.push("total_rating_count > 25");
      }
      sortClause = "sort total_rating_count desc;";
    }

    const whereClause = whereParts.length > 0 ? `where ${whereParts.join(" & ")};` : "";
    body = `${fieldsList} ${whereClause} ${sortClause} limit ${limit}; offset ${offset};`;
  }

  const data = await fetchIGDB("games", body, TTL_CONFIG.SEARCH);
  return data.map(mapIGDBGameToGame);
}

export async function searchGamesIGDB(query: string, limit = 50, offset = 0): Promise<Game[]> {
  return searchAndFilterGamesIGDB({ query, limit, offset });
}

// 2. Lançamentos Recentes - Últimos 60 dias (TTL: 6 horas) - Apenas jogos principais, remakes e remasters
export async function getRecentReleasesIGDB(limit = 24): Promise<Game[]> {
  // Arredonda o timestamp em blocos de 30 minutos para garantir chaves de cache determinísticas
  const nowSec = Math.floor(Date.now() / (1000 * 1800)) * 1800;
  const sixtyDaysAgo = nowSec - (60 * 24 * 60 * 60);
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id, themes.id, themes.name, age_ratings.organization.name, age_ratings.rating_category.rating; where first_release_date <= ${nowSec} & first_release_date >= ${sixtyDaysAgo} & cover != null & parent_game = null & themes != (42); sort first_release_date desc; limit ${limit};`;
  const data = await fetchIGDB("games", body, TTL_CONFIG.RECENT_RELEASES);
  return data.map(mapIGDBGameToGame);
}

// 3. Em Breve - Próximos Lançamentos (TTL: 6 horas) - Expurgando cosméticos, DLCs e pacotes de roupas
export async function getUpcomingGamesIGDB(limit = 24): Promise<Game[]> {
  // Arredonda o timestamp em blocos de 30 minutos para garantir chaves de cache determinísticas
  const nowSec = Math.floor(Date.now() / (1000 * 1800)) * 1800;
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, hypes, screenshots.image_id, themes.id, themes.name, age_ratings.organization.name, age_ratings.rating_category.rating; where first_release_date > ${nowSec} & cover != null & parent_game = null & themes != (42); sort first_release_date asc; limit ${limit};`;
  const data = await fetchIGDB("games", body, TTL_CONFIG.UPCOMING);
  return data.map(mapIGDBGameToGame);
}

// 4. Rankings MGL - Mais Populares, Bem Avaliados, Desejados, Dublados, Retrô e Curtos (TTL: 36 horas)
export async function getRankingsIGDB(
  category: "popular" | "top_rated" | "hyped" | "ptbr" | "retro" | "short" = "popular",
  limit = 20
): Promise<Game[]> {
  const safeLimit = Math.min(Math.max(limit, 5), 100);

  if (category === "ptbr") {
    return await getPtBrDubbedGamesIGDB(safeLimit);
  }
  if (category === "short") {
    return await getShortGamesIGDB(safeLimit);
  }

  let body = "";
  const nowSec = Math.floor(Date.now() / (1000 * 3600)) * 3600;
  const fields = "fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, total_rating_count, rating, aggregated_rating, hypes, themes.id, themes.name, age_ratings.organization.name, age_ratings.rating_category.rating;";

  if (category === "top_rated") {
    body = `${fields} where aggregated_rating != null & total_rating_count > 20 & cover != null & parent_game = null & themes != (42); sort aggregated_rating desc; limit ${safeLimit};`;
  } else if (category === "hyped") {
    body = `${fields} where hypes != null & hypes > 0 & cover != null & first_release_date > ${nowSec} & parent_game = null & themes != (42); sort hypes desc; limit ${safeLimit};`;
  } else if (category === "retro") {
    // Clássicos retrô lançados antes de 2005 (era dourada dos games)
    body = `${fields} where first_release_date < 1104537600 & total_rating_count > 25 & cover != null & parent_game = null & themes != (42); sort total_rating_count desc; limit ${safeLimit};`;
  } else {
    // Mais populares por contagem total de avaliações e relevância
    body = `${fields} where total_rating_count > 40 & cover != null & parent_game = null & themes != (42); sort total_rating_count desc; limit ${safeLimit};`;
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

  const body = `fields name, slug, summary, cover.image_id, first_release_date, genres.name, platforms.name, hypes, aggregated_rating; where first_release_date >= ${startSec} & first_release_date <= ${endSec} & cover != null & parent_game = null; sort first_release_date asc; limit 100;`;
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
  const numId = Number(id);

  // Consulta rica do jogo e duração nativa (game_time_to_beats) em paralelo
  const [gameData, hltbData] = await Promise.all([
    fetchIGDB(
      "games",
      `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id, artworks.image_id, videos.name, videos.video_id, themes.name, game_modes.name, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, websites.category, websites.url, similar_games.name, similar_games.cover.image_id, similar_games.rating, age_ratings.organization.name, age_ratings.rating_category.rating, franchises.name, collections.name, player_perspectives.name, language_supports.language.name, language_supports.language_support_type.name, category, dlcs.name, dlcs.id, dlcs.slug, dlcs.cover.image_id, dlcs.first_release_date, dlcs.category, expansions.name, expansions.id, expansions.slug, expansions.cover.image_id, expansions.first_release_date, expansions.category, parent_game.name, parent_game.id, parent_game.slug, parent_game.cover.image_id; where id = ${numId}; limit 1;`,
      TTL_CONFIG.GAME_DETAILS
    ),
    fetchIGDB(
      "game_time_to_beats",
      `fields completely, hastily, normally, count, game_id; where game_id = ${numId}; limit 1;`,
      TTL_CONFIG.GAME_DETAILS
    ).catch(() => []),
  ]);

  if (gameData.length === 0) return null;

  const game = mapIGDBGameToGame(gameData[0]);

  // Se houver dados oficiais de tempo de zeramento do IGDB, preenche o hltb nativamente
  if (hltbData && hltbData.length > 0 && hltbData[0]) {
    const b = hltbData[0];
    const mainSec = b.normally || b.hastily;
    if (mainSec) {
      const mainStory = Math.round(mainSec / 3600);
      const completionist = b.completely ? Math.round(b.completely / 3600) : null;
      const mainExtra = completionist && mainStory ? Math.round((mainStory + completionist) / 2) : null;

      game.hltb = {
        gameTitle: game.name,
        mainStory: mainStory > 0 ? mainStory : null,
        mainExtra: mainExtra && mainExtra > mainStory ? mainExtra : null,
        completionist: completionist && completionist > mainStory ? completionist : null,
        source: "IGDB Community Time",
      };
    }
  }

  return game;
}

// 7. Contador Total de Jogos para Busca ou Filtros Adaptativos (TTL: 45 min)
export async function getFilteredGamesCountIGDB(options: SearchFilterOptions): Promise<number> {
  const {
    query = "",
    genreId,
    genreIds,
    themeId,
    platformId,
    platformIds,
    minRating,
    perspectiveId,
    gameModeId,
    sort = "popular",
    onlyAdult,
    includeAdult,
  } = options;

  const escapedQuery = query.replace(/"/g, "").trim();
  const whereParts: string[] = ["cover != null", "parent_game = null"];

  // Tratamento de conteúdo adulto (+18): Tema 42 no IGDB é Erotic
  if (onlyAdult) {
    whereParts.push("themes = (42)");
  } else if (!includeAdult) {
    whereParts.push("themes != (42)");
  }

  if (platformIds && platformIds.length > 0) {
    whereParts.push(`platforms = (${platformIds.join(",")})`);
  } else if (platformId) {
    whereParts.push(`platforms = (${platformId})`);
  }

  if (genreIds && genreIds.length > 0) {
    whereParts.push(`genres = (${genreIds.join(",")})`);
  } else if (genreId) {
    whereParts.push(`genres = (${genreId})`);
  }
  if (themeId) {
    whereParts.push(`themes = (${themeId})`);
  }

  if (perspectiveId && perspectiveId > 0) {
    whereParts.push(`player_perspectives = (${perspectiveId})`);
  }
  if (gameModeId && gameModeId > 0) {
    whereParts.push(`game_modes = (${gameModeId})`);
  }

  if (minRating && minRating > 0) {
    whereParts.push(`(aggregated_rating >= ${minRating} | rating >= ${minRating})`);
  }

  const nowSec = Math.floor(Date.now() / 1000);
  const isFiltered = Boolean(
    (platformIds && platformIds.length > 0) ||
    platformId ||
    (genreIds && genreIds.length > 0) ||
    genreId ||
    themeId ||
    (perspectiveId && perspectiveId > 0) ||
    (gameModeId && gameModeId > 0) ||
    (minRating && minRating > 0) ||
    onlyAdult
  );

  if (!escapedQuery) {
    if (sort === "top_rated") {
      whereParts.push("(aggregated_rating != null | rating != null)");
      if (!isFiltered) whereParts.push("total_rating_count > 15");
    } else if (sort === "recent") {
      whereParts.push(`first_release_date != null & first_release_date <= ${nowSec}`);
    } else if (sort === "upcoming") {
      whereParts.push(`first_release_date != null & first_release_date > ${nowSec}`);
    } else if (sort === "popular" && !isFiltered) {
      whereParts.push("total_rating_count > 25");
    }
  }

  const whereClause = whereParts.length > 0 ? `where ${whereParts.join(" & ")};` : "";
  const body = escapedQuery ? `search "${escapedQuery}"; ${whereClause}` : whereClause;
  if (!body) return 0;

  const cacheKey = `games_count:${body}`;
  const cached = getFromCache<number>(cacheKey);
  if (cached && !cached.isStale) return cached.data;

  try {
    const res = await igdbDispatcher.schedule(async () => {
      const token = await getTwitchAccessToken();
      if (!token) return { count: 0 };
      const response = await fetch(`${IGDB_API_URL}/games/count`, {
        method: "POST",
        headers: {
          "Client-ID": TWITCH_CLIENT_ID,
          "Authorization": `Bearer ${token}`,
          "Content-Type": "text/plain",
        },
        body,
      });
      if (!response.ok) return { count: 0 };
      return response.json();
    });

    const count = typeof res?.count === "number" ? res.count : 0;
    if (count > 0) {
      setToCache(cacheKey, count, TTL_CONFIG.SEARCH);
    }
    return count;
  } catch (err) {
    console.error("Erro ao obter contagem de jogos do IGDB:", err);
    return 0;
  }
}

export async function getGamesCountIGDB(query: string): Promise<number> {
  return getFilteredGamesCountIGDB({ query });
}

// 8. Jogos Dublados em Português Brasileiro (TTL: 36 horas)
export async function getPtBrDubbedGamesIGDB(limit = 20): Promise<Game[]> {
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id, language_supports.language.name, language_supports.language_support_type.name, themes.id, themes.name, age_ratings.organization.name, age_ratings.rating_category.rating; where language_supports.language = 21 & language_supports.language_support_type = 1 & cover != null & total_rating_count > 10 & parent_game = null & themes != (42); sort total_rating_count desc; limit ${limit};`;
  const data = await fetchIGDB("games", body, TTL_CONFIG.RANKINGS);
  return data.map(mapIGDBGameToGame);
}

// 9. Jogos Curtos para Zerar no Fim de Semana (Normalmente até 10 horas) (TTL: 36 horas)
export async function getShortGamesIGDB(limit = 20): Promise<Game[]> {
  const hltbData = await fetchIGDB(
    "game_time_to_beats",
    `fields game_id, normally, count; where normally <= 36000 & normally >= 7200 & count >= 10; sort count desc; limit ${limit * 2};`,
    TTL_CONFIG.RANKINGS
  );

  if (!Array.isArray(hltbData) || hltbData.length === 0) return [];

  const gameIds = hltbData.map((h: any) => h.game_id).slice(0, limit).join(",");
  if (!gameIds) return [];

  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id, themes.id, themes.name, age_ratings.organization.name, age_ratings.rating_category.rating; where id = (${gameIds}) & cover != null & themes != (42); limit ${limit};`;
  const data = await fetchIGDB("games", body, TTL_CONFIG.RANKINGS);

  const timeMap = new Map<number, number>();
  hltbData.forEach((h: any) => timeMap.set(h.game_id, Math.round(h.normally / 3600)));

  return data.map((item: any) => {
    const game = mapIGDBGameToGame(item);
    const hours = timeMap.get(item.id);
    if (hours) {
      game.hltb = {
        gameTitle: game.name,
        mainStory: hours,
        mainExtra: Math.round(hours * 1.5),
        completionist: Math.round(hours * 2),
        source: "IGDB Community Time",
      };
    }
    return game;
  });
}

// 10. Jogos por Categoria (Gênero / Tema) com Ordenação e Filtro por Plataforma (TTL: 12 horas)
export async function getGamesByCategoryIGDB(
  categorySlug: string,
  sort = "popular",
  platform?: string,
  limit = 40,
  offset = 0
): Promise<Game[]> {
  const { getCategoryBySlug } = await import("./categoriesData");
  const category = getCategoryBySlug(categorySlug);
  if (!category) return [];

  const nowSec = Math.floor(Date.now() / 1000);
  let filterParts = ["cover != null", "parent_game = null"];

  if (category.igdbThemeId !== 42) {
    filterParts.push("themes != (42)");
  }

  if (category.slug === "luta") {
    filterParts.push("genres = (4)", "genres != (5)");
  } else if (category.igdbGenreId) {
    filterParts.push(`genres = (${category.igdbGenreId})`);
  } else if (category.igdbThemeId) {
    filterParts.push(`themes = (${category.igdbThemeId})`);
  }

  // Filtro de Plataforma (se informado)
  if (platform) {
    const pLower = platform.toLowerCase();
    if (pLower.includes("pc") || pLower.includes("windows")) {
      filterParts.push("platforms = (6)");
    } else if (pLower.includes("ps5") || pLower.includes("playstation 5")) {
      filterParts.push("platforms = (167)");
    } else if (pLower.includes("ps4") || pLower.includes("playstation 4")) {
      filterParts.push("platforms = (48)");
    } else if (pLower.includes("xbox") || pLower.includes("series")) {
      filterParts.push("platforms = (169)");
    } else if (pLower.includes("switch") || pLower.includes("nintendo")) {
      filterParts.push("platforms = (130)");
    } else if (pLower.includes("retro") || pLower.includes("retrô")) {
      filterParts.push(`first_release_date <= 978307200`); // Lançados até o ano 2000
    }
  }

  // Ordenação
  let sortClause = "sort total_rating_count desc;";
  if (sort === "top_rated") {
    filterParts.push("aggregated_rating != null", "total_rating_count > 20");
    sortClause = "sort aggregated_rating desc;";
  } else if (sort === "recent") {
    filterParts.push(`first_release_date != null & first_release_date <= ${nowSec}`);
    sortClause = "sort first_release_date desc;";
  } else {
    // popular
    filterParts.push("total_rating_count > 15");
    sortClause = "sort total_rating_count desc;";
  }

  const whereClause = `where ${filterParts.join(" & ")};`;
  const body = `fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id; ${whereClause} ${sortClause} limit ${limit}; offset ${offset};`;

  const data = await fetchIGDB("games", body, TTL_CONFIG.RECENT_RELEASES);
  return data.map(mapIGDBGameToGame);
}

// 11. Jogos por Coleção Curada (TTL: 24 horas)
export async function getGamesByCollectionIGDB(
  collectionSlug: string,
  limit = 40
): Promise<Game[]> {
  const { getCollectionBySlug } = await import("./collectionsData");
  const collection = getCollectionBySlug(collectionSlug);
  if (!collection) return [];

  if (collection.gameQueryType === "ptbr") {
    return getPtBrDubbedGamesIGDB(limit);
  }

  if (collection.gameQueryType === "short") {
    return getShortGamesIGDB(limit);
  }

  let body = "";
  const fields = "fields name, slug, summary, storyline, cover.image_id, first_release_date, genres.name, platforms.name, aggregated_rating, total_rating, rating, screenshots.image_id, themes.id, themes.name, age_ratings.organization.name, age_ratings.rating_category.rating;";

  if (collection.gameQueryType === "goty") {
    body = `${fields} where aggregated_rating >= 90 & total_rating_count > 200 & cover != null & parent_game = null & themes != (42); sort total_rating_count desc; limit ${limit};`;
  } else if (collection.gameQueryType === "soulslike") {
    // Soulslike principais conhecidos
    body = `${fields} where (name ~ *"Dark Souls"* | name ~ *"Elden Ring"* | name ~ *"Bloodborne"* | name ~ *"Sekiro"* | name ~ *"Lies of P"* | name ~ *"Nioh"* | name ~ *"Lords of the Fallen"*) & cover != null & parent_game = null & themes != (42); sort total_rating_count desc; limit ${limit};`;
  } else if (collection.gameQueryType === "indie") {
    body = `${fields} where genres = (32) & (aggregated_rating >= 85 | rating >= 85) & total_rating_count > 40 & cover != null & parent_game = null & themes != (42); sort total_rating_count desc; limit ${limit};`;
  } else if (collection.gameQueryType === "scifi") {
    body = `${fields} where themes = (18) & total_rating_count > 50 & cover != null & parent_game = null & themes != (42); sort total_rating_count desc; limit ${limit};`;
  } else if (collection.gameQueryType === "horror") {
    body = `${fields} where themes = (19) & total_rating_count > 40 & cover != null & parent_game = null & themes != (42); sort total_rating_count desc; limit ${limit};`;
  } else if (collection.gameQueryType === "retro") {
    body = `${fields} where first_release_date <= 978307200 & total_rating_count > 25 & cover != null & parent_game = null & themes != (42); sort total_rating_count desc; limit ${limit};`;
  } else {
    body = `${fields} where total_rating_count > 80 & cover != null & parent_game = null & themes != (42); sort total_rating_count desc; limit ${limit};`;
  }

  const data = await fetchIGDB("games", body, TTL_CONFIG.RANKINGS);
  return data.map(mapIGDBGameToGame);
}


