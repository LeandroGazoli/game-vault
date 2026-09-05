import { Game, AgeRatingItem } from "./types";
import { findGenreFilter } from "./filterConstants";

/**
 * Formata de forma inteligente o tempo estimado de conclusão do jogo.
 * - Prioridade 1: Horas reais registradas pelo usuário (ex: "45h")
 * - Prioridade 2: Média oficial da história principal no HowLongToBeat (ex: "25h")
 * - Se o jogo ainda não foi lançado: "TBD" (To Be Determined / A Definir)
 * - Se o jogo já foi lançado e não possui dados no HLTB: "N/D" (Não Disponível)
 * NUNCA exibe placeholders arbitrários como "30h".
 */
export function formatGameDuration(
  game: Game,
  userHours?: number | null
): { text: string; isEstimated: boolean; isTbd: boolean } {
  if (typeof userHours === "number" && userHours > 0) {
    return { text: `${userHours}h`, isEstimated: false, isTbd: false };
  }

  const hltbHours = game.hltb?.mainStory;
  if (typeof hltbHours === "number" && hltbHours > 0) {
    return { text: `${hltbHours}h`, isEstimated: true, isTbd: false };
  }

  // Verifica se o jogo é futuro
  if (game.released) {
    const releaseTime = new Date(game.released).getTime();
    if (releaseTime > Date.now()) {
      return { text: "TBD", isEstimated: true, isTbd: true };
    }
  } else {
    // Sem data de lançamento confirmada
    return { text: "TBD", isEstimated: true, isTbd: true };
  }

  return { text: "N/D", isEstimated: true, isTbd: false };
}

/**
 * Encurta e padroniza nomes de gêneros para evitar quebra de layout nos cards.
 * Ex: "Role-playing (RPG)" -> "RPG"
 */
export function formatGenreName(name?: string | null): string {
  if (!name) return "";
  const trimmed = name.trim();
  if (/role-playing/i.test(trimmed) || /rpg/i.test(trimmed)) return "RPG";
  if (/action-adventure/i.test(trimmed)) return "Ação/Aventura";
  if (/action/i.test(trimmed)) return "Ação";
  if (/adventure/i.test(trimmed)) return "Aventura";
  if (/shooter/i.test(trimmed) || /fps/i.test(trimmed)) return "Tiro";
  if (/strategy/i.test(trimmed)) return "Estratégia";
  if (/horror/i.test(trimmed)) return "Terror";
  if (/platform/i.test(trimmed)) return "Plataforma";
  if (/racing/i.test(trimmed)) return "Corrida";
  if (/sport/i.test(trimmed)) return "Esporte";
  if (/fighting/i.test(trimmed)) return "Luta";
  if (/puzzle/i.test(trimmed)) return "Puzzle";
  if (/hack and slash/i.test(trimmed)) return "Hack & Slash";
  if (/simulator/i.test(trimmed)) return "Simulador";
  // Remove parênteses se houver (ex: "Turn-based strategy (TBS)" -> "TBS")
  const match = trimmed.match(/\(([^)]+)\)/);
  if (match && match[1]) return match[1];
  return trimmed.length > 14 ? trimmed.substring(0, 12) + "…" : trimmed;
}

/**
 * Traduz o nome completo do gênero para Português Brasileiro (PT-BR) com clareza.
 */
export function translateGenre(name?: string | null): string {
  if (!name) return "";
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes("role-playing") || lower === "rpg") return "RPG";
  if (lower.includes("action-adventure")) return "Ação & Aventura";
  if (lower === "action" || lower.includes("hack and slash") || lower.includes("beat 'em up")) return "Ação";
  if (lower === "adventure") return "Aventura";
  if (lower === "shooter" || lower.includes("fps")) return "Tiro (Shooter)";
  if (lower.includes("tactical")) return "Tático";
  if (lower.includes("turn-based strategy") || lower.includes("tbs")) return "Estratégia por Turnos";
  if (lower.includes("real time strategy") || lower.includes("rts")) return "Estratégia em Tempo Real";
  if (lower === "strategy") return "Estratégia";
  if (lower === "simulator") return "Simulador";
  if (lower === "sport") return "Esporte";
  if (lower === "racing") return "Corrida";
  if (lower === "fighting") return "Luta";
  if (lower === "platform") return "Plataforma";
  if (lower === "puzzle") return "Quebra-Cabeça / Puzzle";
  if (lower === "arcade") return "Arcade";
  if (lower === "indie") return "Indie";
  if (lower.includes("card") || lower.includes("board")) return "Cartas & Tabuleiro";
  if (lower.includes("point-and-click")) return "Point & Click";
  if (lower === "music") return "Música & Ritmo";
  if (lower.includes("visual novel")) return "Visual Novel";
  if (lower === "pinball") return "Pinball";
  if (lower.includes("quiz") || lower.includes("trivia")) return "Quiz & Trivia";
  if (lower.includes("moba")) return "MOBA";

  return formatGenreName(trimmed);
}

/**
 * Traduz Modos de Jogo do IGDB para Português Brasileiro (PT-BR).
 */
export function translateGameMode(mode?: string | null): string {
  if (!mode) return "";
  const trimmed = mode.trim();
  const lower = trimmed.toLowerCase();

  if (lower === "single player" || lower === "singleplayer") return "Um Jogador";
  if (lower === "multiplayer") return "Multijogador";
  if (lower.includes("co-operative") || lower.includes("coop") || lower.includes("co-op")) return "Cooperativo (Co-op)";
  if (lower.includes("split screen") || lower.includes("splitscreen")) return "Tela Dividida";
  if (lower.includes("massively multiplayer online") || lower.includes("mmo")) return "MMO Online";
  if (lower.includes("battle royale")) return "Battle Royale";

  return trimmed;
}

/**
 * Traduz Perspectivas de Câmera do Jogador do IGDB para Português Brasileiro (PT-BR).
 */
export function translatePlayerPerspective(perspective?: string | null): string {
  if (!perspective) return "";
  const trimmed = perspective.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes("first person") || lower === "first-person") return "Primeira Pessoa (FPS)";
  if (lower.includes("third person") || lower === "third-person") return "Terceira Pessoa";
  if (lower.includes("bird view") || lower.includes("isometric")) return "Visão Isométrica / Superior";
  if (lower.includes("side view") || lower === "side-scroller") return "Visão Lateral (2D)";
  if (lower.includes("virtual reality") || lower === "vr") return "Realidade Virtual (VR)";
  if (lower.includes("auditory")) return "Auditivo";
  if (lower.includes("text")) return "Baseado em Texto";

  return trimmed;
}

/**
 * Traduz Temas e Ambientação do IGDB para Português Brasileiro (PT-BR).
 */
export function translateTheme(theme?: string | null): string {
  if (!theme) return "";
  const trimmed = theme.trim();
  const lower = trimmed.toLowerCase();

  if (lower.includes("science fiction") || lower.includes("sci-fi")) return "Ficção Científica (Sci-Fi)";
  if (lower === "fantasy") return "Fantasia";
  if (lower === "horror") return "Terror / Horror";
  if (lower === "survival") return "Sobrevivência";
  if (lower === "historical") return "Histórico";
  if (lower === "stealth") return "Furtividade (Stealth)";
  if (lower === "open world") return "Mundo Aberto";
  if (lower === "warfare" || lower === "war") return "Guerra";
  if (lower === "comedy") return "Comédia";
  if (lower === "business") return "Negócios / Gestão";
  if (lower === "drama") return "Drama";
  if (lower === "mystery") return "Mistério";
  if (lower === "sandbox") return "Sandbox";
  if (lower === "kids") return "Infantil";
  if (lower === "party") return "Festa / Party";
  if (lower === "romance") return "Romance";
  if (lower === "erotic") return "Adulto (+18)";
  if (lower === "educational") return "Educativo";
  if (lower === "action") return "Ação";
  if (lower === "thriller") return "Suspense / Thriller";

  return trimmed;
}

/**
 * Traduz descrições de classificações etárias norte-americanas (ESRB) para texto amigável em PT-BR.
 */
export function translateAgeRatingText(rating?: string | null): string {
  if (!rating) return "";
  const upper = rating.toUpperCase().trim();

  if (upper.includes("EVERYONE 10+")) return "Maiores de 10 Anos (ESRB 10+)";
  if (upper === "EVERYONE" || upper.includes("EVERYONE")) return "Livre / Para Todos (ESRB E)";
  if (upper.includes("TEEN")) return "Adolescentes / 13+ (ESRB Teen)";
  if (upper.includes("MATURE 17+") || upper.includes("MATURE")) return "Maiores de 17 Anos (ESRB M)";
  if (upper.includes("ADULTS ONLY 18+") || upper.includes("ADULTS ONLY")) return "Adulto / 18+ (ESRB AO)";
  if (upper.includes("RATING PENDING")) return "Classificação Pendente";

  return rating;
}

/**
 * Identifica se um texto está predominantemente em inglês analisando stop-words frequentes.
 */
export function isLikelyEnglish(text?: string | null): boolean {
  if (!text || text.trim().length < 25) return false;
  const sample = text.toLowerCase().slice(0, 500);

  // Palavras exclusivas ou extremamente frequentes no inglês
  const englishMatches = sample.match(/\b(the|and|is|are|in|with|of|to|for|from|by|which|their|players|gameplay|features|set in|takes place)\b/g);
  // Palavras indicativas de português
  const portugueseMatches = sample.match(/\b(o|a|os|as|um|uma|de|do|da|dos|das|em|no|na|nos|nas|com|para|por|que|este|esta|jogo|jogadores|história)\b/g);

  const engCount = englishMatches ? englishMatches.length : 0;
  const ptCount = portugueseMatches ? portugueseMatches.length : 0;

  return engCount >= 3 && engCount > ptCount;
}

/**
 * Calcula a idade exata com base na data de nascimento (formato 'YYYY-MM-DD').
 * Seguro contra desvios de fuso horário UTC / local.
 */
export function calculateAge(birthDateStr?: string | null): number {
  if (!birthDateStr) return 0;
  const parts = birthDateStr.split("-").map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return 0;
  const [bYear, bMonth, bDay] = parts;
  const today = new Date();
  const cYear = today.getFullYear();
  const cMonth = today.getMonth() + 1;
  const cDay = today.getDate();

  let age = cYear - bYear;
  if (cMonth < bMonth || (cMonth === bMonth && cDay < bDay)) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Verifica se o usuário tem 18 anos ou mais a partir da sua data de nascimento informada.
 */
export function isUserAdult(birthDate?: string | null): boolean {
  if (!birthDate) return false;
  return calculateAge(birthDate) >= 18;
}

export interface PrimaryAgeRatingInfo {
  label: string;
  badgeText: string;
  bgClass: string;
  textClass: string;
  borderClass?: string;
  organization: string;
  description: string;
  isAdult: boolean;
}

/**
 * Retorna as informações formatadas da classificação indicativa prioritária (CLASS_IND Brasil > ESRB > PEGI).
 */
export function getPrimaryAgeRating(ageRatings?: AgeRatingItem[]): PrimaryAgeRatingInfo | null {
  if (!ageRatings || ageRatings.length === 0) return null;

  // 1. Prioridade: Classificação Indicativa Brasileira (CLASS_IND)
  const classInd = ageRatings.find(
    (r) => r.organization.toUpperCase().includes("CLASS_IND") || r.organization.toUpperCase().includes("CLASSIND")
  );
  if (classInd) {
    const raw = classInd.rating.toUpperCase();
    if (raw.includes("18") || raw === "18") {
      return {
        label: "18 Anos",
        badgeText: "18",
        bgClass: "bg-[#111111]",
        textClass: "text-red-500",
        borderClass: "border-red-500",
        organization: "CLASS_IND",
        description: "Não recomendado para menores de 18 anos",
        isAdult: true,
      };
    }
    if (raw.includes("16") || raw === "16") {
      return {
        label: "16 Anos",
        badgeText: "16",
        bgClass: "bg-[#d9222a]",
        textClass: "text-white font-black",
        organization: "CLASS_IND",
        description: "Não recomendado para menores de 16 anos",
        isAdult: false,
      };
    }
    if (raw.includes("14") || raw === "14") {
      return {
        label: "14 Anos",
        badgeText: "14",
        bgClass: "bg-[#e5591f]",
        textClass: "text-white font-black",
        organization: "CLASS_IND",
        description: "Não recomendado para menores de 14 anos",
        isAdult: false,
      };
    }
    if (raw.includes("12") || raw === "12") {
      return {
        label: "12 Anos",
        badgeText: "12",
        bgClass: "bg-[#f5a200]",
        textClass: "text-black font-black",
        organization: "CLASS_IND",
        description: "Não recomendado para menores de 12 anos",
        isAdult: false,
      };
    }
    if (raw.includes("10") || raw === "10") {
      return {
        label: "10 Anos",
        badgeText: "10",
        bgClass: "bg-[#0b75ba]",
        textClass: "text-white font-black",
        organization: "CLASS_IND",
        description: "Não recomendado para menores de 10 anos",
        isAdult: false,
      };
    }
    return {
      label: "Livre",
      badgeText: "L",
      bgClass: "bg-[#0c8a3f]",
      textClass: "text-white font-black",
      organization: "CLASS_IND",
      description: "Classificação Livre para todos os públicos",
      isAdult: false,
    };
  }

  // 2. Fallback: ESRB (Estados Unidos)
  const esrb = ageRatings.find((r) => r.organization.toUpperCase().includes("ESRB"));
  if (esrb) {
    const raw = esrb.rating.toUpperCase();
    if (raw.includes("ADULTS ONLY") || raw.includes("AO")) {
      return {
        label: "ESRB AO (18+)",
        badgeText: "AO",
        bgClass: "bg-black",
        textClass: "text-red-500",
        borderClass: "border-red-500",
        organization: "ESRB",
        description: "ESRB Adults Only 18+",
        isAdult: true,
      };
    }
    if (raw.includes("MATURE") || raw.includes("M") || raw.includes("17")) {
      return {
        label: "ESRB M (17+)",
        badgeText: "M",
        bgClass: "bg-neutral-800",
        textClass: "text-amber-300 font-bold",
        borderClass: "border-amber-500/40",
        organization: "ESRB",
        description: "ESRB Mature 17+",
        isAdult: false,
      };
    }
    if (raw.includes("TEEN") || raw.includes("T")) {
      return {
        label: "ESRB T (13+)",
        badgeText: "T",
        bgClass: "bg-neutral-800",
        textClass: "text-cyan-300 font-bold",
        borderClass: "border-cyan-500/40",
        organization: "ESRB",
        description: "ESRB Teen 13+",
        isAdult: false,
      };
    }
    if (raw.includes("10+")) {
      return {
        label: "ESRB 10+",
        badgeText: "E10+",
        bgClass: "bg-neutral-800",
        textClass: "text-blue-300 font-bold",
        borderClass: "border-blue-500/40",
        organization: "ESRB",
        description: "ESRB Everyone 10+",
        isAdult: false,
      };
    }
    return {
      label: "ESRB E",
      badgeText: "E",
      bgClass: "bg-neutral-800",
      textClass: "text-emerald-300 font-bold",
      borderClass: "border-emerald-500/40",
      organization: "ESRB",
      description: "ESRB Everyone (Livre)",
      isAdult: false,
    };
  }

  // 3. Fallback: PEGI (Europa)
  const pegi = ageRatings.find((r) => r.organization.toUpperCase().includes("PEGI"));
  if (pegi) {
    const raw = pegi.rating.toUpperCase();
    const is18 = raw.includes("18") || raw.includes("EIGHTEEN") || raw === "5";
    const badge = is18
      ? "18"
      : raw.includes("16") || raw.includes("SIXTEEN") || raw === "4"
      ? "16"
      : raw.includes("12") || raw.includes("TWELVE") || raw === "3"
      ? "12"
      : raw.includes("7") || raw.includes("SEVEN") || raw === "2"
      ? "7"
      : raw.includes("3") || raw.includes("THREE") || raw === "1"
      ? "3"
      : pegi.rating;

    return {
      label: `PEGI ${badge}`,
      badgeText: badge,
      bgClass: is18 ? "bg-black" : "bg-neutral-800",
      textClass: is18 ? "text-red-500 font-black" : "text-white font-bold",
      borderClass: is18 ? "border-red-500" : "border-white/20",
      organization: "PEGI",
      description: `PEGI ${badge} Anos`,
      isAdult: is18,
    };
  }

  return null;
}

/**
 * Detecta centralizadamente se um jogo possui conteúdo estritamente adulto/erótico ou pornográfico.
 * IMPORTANTE: Jogos convencionais com classificação 18+ por violência, drogas ou crimes
 * (como GTA V, Cyberpunk 2077, The Witcher 3, God of War) NÃO são bloqueados.
 * Apenas títulos de cunho estritamente erótico/pornográfico (Hentai, Eroge, Pornô, IGDB Tema 42, ESRB AO)
 * são sinalizados para bloqueio com verificação de maioridade.
 */
export function isAdultGame(game?: Partial<Game> | null): boolean {
  if (!game) return false;

  // 1. Flag direta isAdult se já mapeada
  if (game.isAdult === true) return true;

  // 2. Análise de Temas do IGDB (Tema 42 no IGDB é 'Erotic')
  if (Array.isArray(game.themes)) {
    const hasAdultTheme = game.themes.some((t: any) => {
      if (typeof t === "string") {
        const lower = t.toLowerCase().trim();
        return (
          lower === "erotic" ||
          lower.includes("hentai") ||
          lower.includes("eroge") ||
          lower === "porn" ||
          lower === "pornography"
        );
      }
      if (typeof t === "object" && t !== null) {
        if (t.id === 42) return true;
        const name = (t.name || "").toLowerCase().trim();
        return (
          name === "erotic" ||
          name.includes("hentai") ||
          name.includes("eroge") ||
          name === "porn" ||
          name === "pornography"
        );
      }
      return false;
    });
    if (hasAdultTheme) return true;
  }

  // 3. Análise de Keywords Estritas (Apenas termos explicitamente pornográficos/eróticos)
  // NOTA: Palavras genéricas como 'nudity', 'sexual content' ou 'sex' NÃO devem bloquear o jogo,
  // pois jogos convencionais como The Witcher 3, Cyberpunk 2077 e Baldur's Gate 3 possuem essas tags.
  if (Array.isArray(game.keywords)) {
    const hasAdultKeyword = game.keywords.some((kw: any) => {
      const name = (typeof kw === "string" ? kw : kw?.name || kw?.slug || "").toLowerCase().trim();
      return (
        name === "erotic" ||
        name === "erotica" ||
        name.includes("hentai") ||
        name.includes("eroge") ||
        name.includes("porn") ||
        name.includes("nsfw") ||
        name === "adult only" ||
        name.includes("high sexual content") ||
        name.includes("high-sexual-content") ||
        name === "sex game"
      );
    });
    if (hasAdultKeyword) return true;
  }

  // 4. Análise de Classificações Indicativas Oficiais
  // Apenas ESRB AO (Adults Only 18+) nos EUA é reservado para pornografia explícita comercial.
  // Classificações gerais de 18 anos como CLASS_IND 18 (Brasil) e PEGI 18 (Europa)
  // são atribuídas a jogos convencionais de ação/violência (GTA, Cyberpunk, God of War)
  // e portanto NÃO acionam o bloqueio de pornografia.
  if (Array.isArray(game.age_ratings) && game.age_ratings.length > 0) {
    const hasAoRating = game.age_ratings.some((ar) => {
      const org = (ar.organization || "").toUpperCase();
      const rating = (ar.rating || "").toUpperCase();
      if (org.includes("ESRB")) {
        return rating.includes("ADULTS ONLY") || rating.includes("AO") || rating === "12";
      }
      return false;
    });

    if (hasAoRating) return true;
  }

  // 5. Gêneros estritamente adultos/pornográficos
  if (Array.isArray(game.genres)) {
    const hasAdultGenre = game.genres.some((g) => {
      const gName = (g.name || "").toLowerCase();
      return gName.includes("erotic") || gName.includes("hentai") || gName.includes("eroge");
    });
    if (hasAdultGenre) return true;
  }

  return false;
}

/**
 * Retorna a URL de busca otimizada para uma categoria, gênero ou tema de jogo.
 * Se o termo corresponder a um filtro reconhecido, direciona para /search?genre=[id].
 * Caso contrário, realiza uma busca textual precisa em /search?q=[termo].
 */
export function getCategorySearchUrl(nameOrSlug?: string | null): string {
  if (!nameOrSlug) return "/search";
  const trimmed = nameOrSlug.trim();
  const filter = findGenreFilter(trimmed);
  if (filter && filter.id !== "all") {
    return `/search?genre=${encodeURIComponent(filter.id)}`;
  }
  return `/search?q=${encodeURIComponent(trimmed)}`;
}

/**
 * Retorna tanto a URL de busca no catálogo quanto a URL de página curada (/categorias/[slug]) se houver.
 */
export function getCategoryHubUrl(nameOrSlug?: string | null): { searchUrl: string; curatedUrl?: string } {
  if (!nameOrSlug) return { searchUrl: "/search" };
  const trimmed = nameOrSlug.trim();
  const lower = trimmed.toLowerCase();

  const curatedMap: Record<string, string> = {
    "luta": "/categorias/luta",
    "fighting": "/categorias/luta",
    "hack and slash": "/categorias/luta",
    "beat 'em up": "/categorias/luta",
    "mundo aberto": "/categorias/mundo-aberto",
    "open world": "/categorias/mundo-aberto",
    "boa trama": "/categorias/boa-trama",
    "drama": "/categorias/boa-trama",
    "narrativa": "/categorias/boa-trama",
    "casuais": "/categorias/casuais",
    "casual": "/categorias/casuais",
    "corrida": "/categorias/corrida",
    "racing": "/categorias/corrida",
    "rpg": "/categorias/rpg",
    "role-playing": "/categorias/rpg",
    "terror": "/categorias/terror",
    "horror": "/categorias/terror",
    "tiro": "/categorias/tiro",
    "shooter": "/categorias/tiro",
    "indie": "/categorias/indie",
    "plataforma": "/categorias/plataforma",
    "platform": "/categorias/plataforma",
  };

  let curatedUrl: string | undefined;
  for (const [key, slug] of Object.entries(curatedMap)) {
    if (lower === key || lower.includes(key)) {
      curatedUrl = slug;
      break;
    }
  }

  const searchUrl = getCategorySearchUrl(trimmed);
  return { searchUrl, curatedUrl };
}


