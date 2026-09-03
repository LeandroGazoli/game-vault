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
