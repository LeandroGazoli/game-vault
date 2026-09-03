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
