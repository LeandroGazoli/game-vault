/**
 * Utilitários compartilhados para o sistema de busca e curadoria IA do MyGameList.
 */

// Tempo de inatividade na digitação antes de considerar chamar a IA (evita buscas a cada tecla)
export const AI_SEARCH_DEBOUNCE_MS = 1200;

// Quantidade mínima de caracteres para a IA ser elegível a acionamento automático
export const MIN_AI_QUERY_LENGTH = 5;

/**
 * Detecta se a busca é descritiva/por intenção/estilo em vez de um título específico de jogo.
 * Ex: "quero um jogo estilo dark souls", "jogos de corrida na chuva", "indie relaxante", etc.
 * Protegido contra falsos positivos durante digitação parcial.
 */
export function isDescriptiveOrIntentQuery(q: string): boolean {
  const text = q.trim().toLowerCase();
  // Proteção: não disparar em fragmentos curtos enquanto o usuário ainda está digitando
  if (text.length < MIN_AI_QUERY_LENGTH) return false;

  const words = text.split(/\s+/).filter(Boolean);
  // Frases com 4 ou mais palavras são consideradas descritivas de intenção
  if (words.length >= 4) return true;

  const intentPhrases = [
    "quero", "queria", "procuro", "busco", "gostaria", "preciso", "indique", "recomende",
    "recomendacao", "recomendação", "sugestao", "sugestão", "indicação", "indicacoes", "indicações",
    "jogo de", "jogos de", "jogo com", "jogos com", "jogo tipo", "jogos tipo",
    "estilo", "parecido", "parecidos", "semelhante", "semelhantes", "melhores", "mais avaliados",
    "para jogar", "relaxar", "desafiador", "desafiadores", "mundo aberto",
    "souls-like", "soulslike", "roguelike", "roguelite", "metroidvania",
    "com historia", "com história", "boa trama", "coop", "multiplayer",
    "tela dividida", "cooperativo", "terror psicologico", "terror psicológico",
    "gratis", "grátis", "barato", "passar o tempo"
  ];

  // Verifica com limites de palavra para não disparar em substrings acidentais
  return intentPhrases.some((phrase) => {
    const escaped = phrase.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    const regex = new RegExp(`(^|\\s)${escaped}(\\s|$)`, "i");
    return regex.test(text) && (words.length >= 2 || text.length >= 8);
  });
}

