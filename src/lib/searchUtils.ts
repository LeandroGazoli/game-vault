/**
 * Utilitários compartilhados para o sistema de busca e curadoria IA do MyGameList.
 */

/**
 * Detecta se a busca é descritiva/por intenção/estilo em vez de um título específico de jogo.
 * Ex: "quero um jogo estilo dark souls", "jogos de corrida na chuva", "indie relaxante", etc.
 */
export function isDescriptiveOrIntentQuery(q: string): boolean {
  const text = q.trim().toLowerCase();
  if (text.length < 3) return false;

  const intentWords = [
    "quero", "queria", "procuro", "busco", "gostaria", "preciso", "indique", "recomende",
    "recomendacao", "recomendação", "sugestao", "sugestão", "indicação", "indicacoes", "indicações",
    "jogo de", "jogos de", "jogo com", "jogos com", "jogo tipo", "jogos tipo",
    "estilo", "parecido", "parecidos", "semelhante", "semelhantes", "melhores", "mais avaliados",
    "para jogar", "relaxar", "desafiador", "desafiadores", "mundo aberto",
    "souls-like", "soulslike", "roguelike", "roguelite", "metroidvania",
    "com historia", "com história", "boa trama", "coop", "multiplayer",
    "tela dividida", "cooperativo", "terror psicologico", "terror psicológico",
    "gratis", "grátis", "barato", "passar o tempo", "curto", "longo"
  ];

  const hasIntentWord = intentWords.some((word) => text.includes(word));
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return hasIntentWord || wordCount >= 4;
}
