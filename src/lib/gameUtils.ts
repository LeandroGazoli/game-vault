import { Game } from "./types";

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

/**
 * Detecta centralizadamente se um jogo possui conteúdo adulto (+18).
 * Analisa a flag isAdult, temas do IGDB (Erotic / ID 42) e classificações indicativas (CLASS_IND 18, PEGI 18, ESRB AO).
 */
export function isAdultGame(game?: Partial<Game> | null): boolean {
  if (!game) return false;

  // 1. Flag direta isAdult se já mapeada
  if (game.isAdult === true) return true;

  // 2. Análise de Temas (Tema 42 no IGDB é 'Erotic')
  if (Array.isArray(game.themes)) {
    const hasAdultTheme = game.themes.some((t: any) => {
      if (typeof t === "string") {
        const lower = t.toLowerCase().trim();
        return lower === "erotic" || lower === "adult" || lower === "adulto (+18)" || lower.includes("hentai") || lower.includes("eroge");
      }
      if (typeof t === "object" && t !== null) {
        if (t.id === 42) return true;
        const name = (t.name || "").toLowerCase().trim();
        return name === "erotic" || name === "adult" || name === "adulto (+18)";
      }
      return false;
    });
    if (hasAdultTheme) return true;
  }

  // 3. Análise de Classificações Indicativas Oficiais
  if (Array.isArray(game.age_ratings) && game.age_ratings.length > 0) {
    const has18PlusRating = game.age_ratings.some((ar) => {
      const org = (ar.organization || "").toUpperCase();
      const rating = (ar.rating || "").toUpperCase();

      // Classificação Brasileira (CLASS_IND)
      if (org.includes("CLASS_IND") || org.includes("CLASSIND")) {
        return rating.includes("18") || rating === "18";
      }
      // Classificação Europeia (PEGI)
      if (org.includes("PEGI")) {
        return rating.includes("18") || rating === "18";
      }
      // Classificação Americana (ESRB AO - Adults Only)
      if (org.includes("ESRB")) {
        return rating.includes("ADULTS ONLY") || rating.includes("AO");
      }
      // Classificação Alemã (USK)
      if (org.includes("USK")) {
        return rating.includes("18");
      }
      // Classificação Japonesa (CERO Z - 18+)
      if (org.includes("CERO")) {
        return rating === "Z" || rating.includes("Z");
      }
      // Classificação Australiana (ACB R18+)
      if (org.includes("ACB")) {
        return rating.includes("R18") || rating.includes("18+");
      }

      return false;
    });

    if (has18PlusRating) return true;
  }

  // 4. Gêneros com indicação adulta explícita
  if (Array.isArray(game.genres)) {
    const hasAdultGenre = game.genres.some((g) => {
      const gName = (g.name || "").toLowerCase();
      return gName.includes("erotic") || gName.includes("hentai") || gName.includes("eroge");
    });
    if (hasAdultGenre) return true;
  }

  return false;
}

