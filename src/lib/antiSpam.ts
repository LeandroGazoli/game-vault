// Sistema de Anti-Fraude e Anti-Spam do MyGameList
// Protege a plataforma contra bots, spam repetitivo, votação fraudulenta, links maliciosos e inundações (flooding).

import { FeedbackItem } from "./types";

// Lista de padrões de spam, golpes, links maliciosos e convites não autorizados
const SPAM_PATTERNS = [
  /\b(discord\.gg|discordapp\.com\/invite)\b/i,
  /\b(t\.me|telegram\.me)\b/i,
  /\b(wa\.me|api\.whatsapp\.com)\b/i,
  /\b(bit\.ly|tinyurl\.com|cutt\.ly|is\.gd|rb\.gy)\b/i,
  /\b(free[\s_-]?(vbucks|robux|gems|coins|skins|money|nitro))\b/i,
  /\b(cassino|bet365|blaze|tigrinho|fortune[\s_-]?tiger|apostas?|pix[\s_-]?gr[aá]tis)\b/i,
  /\b(hack|cheat|aimbot|wallhack|cracked[\s_-]?account)\b/i,
  /\b(crypto|bitcoin|eth|airdrop|nft[\s_-]?claim)\b/i,
  /\b(follow[\s_-]?me|subscribe[\s_-]?to|instagram\.com\/[a-z0-9_]+)\b/i,
];

// Configurações de Rate Limiting
export const SPAM_CONFIG = {
  FEEDBACK_COOLDOWN_SECONDS: 45, // Tempo mínimo entre postagens de ideias/bugs por usuário
  MAX_FEEDBACKS_PER_DAY: 5,      // Limite diário de ideias/bugs por usuário
  COMMENT_COOLDOWN_SECONDS: 10,  // Tempo mínimo entre comentários
  MIN_TITLE_WORDS: 2,            // Mínimo de palavras reais no título
  MIN_DESC_WORDS: 3,             // Mínimo de palavras reais na descrição
  MAX_REPETITIVE_CHARS: 5,       // Ex: "aaaaaa" -> bloqueia se >= 5 caracteres repetidos
};

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Detecta caracteres repetidos em sequência (ex: "aaaaaa", ".........", "kkkkkk")
 */
function hasExcessiveRepetition(text: string): boolean {
  const repetitionRegex = /(.)\1{4,}/i;
  return repetitionRegex.test(text);
}

/**
 * Detecta se o texto foi digitado quase que inteiramente em caixa alta (Gritos/Spam)
 */
function isExcessiveUppercase(text: string): boolean {
  if (text.length < 15) return false;
  const lettersOnly = text.replace(/[^a-zA-ZÀ-ÿ]/g, "");
  if (lettersOnly.length < 10) return false;
  const upperCount = (lettersOnly.match(/[A-ZÁÉÍÓÚÂÊÔÃÕÇ]/g) || []).length;
  return upperCount / lettersOnly.length > 0.75;
}

/**
 * Conta palavras significativas (com 2 ou mais letras)
 */
function countMeaningfulWords(text: string): number {
  const words = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length >= 2 && !/^[0-9]+$/.test(w));
  return words.length;
}

/**
 * Validação profunda de texto contra fraudes, links e spam para Feedback/Ideias
 */
export function validateFeedbackSpam(
  title: string,
  description: string,
  honeypot?: string
): ValidationResult {
  // 1. Verificação de Honeypot (Se preenchido, é um bot automatizado)
  if (honeypot && honeypot.trim().length > 0) {
    return {
      isValid: false,
      error: "Tentativa de envio automatizado detectada. Ação bloqueada pelo sistema de segurança.",
    };
  }

  const cleanTitle = title.trim();
  const cleanDesc = description.trim();

  // 2. Comprimento Mínimo e Máximo
  if (cleanTitle.length < 5) {
    return { isValid: false, error: "O título deve ter no mínimo 5 caracteres informativos." };
  }
  if (cleanTitle.length > 120) {
    return { isValid: false, error: "O título é muito longo (máximo 120 caracteres)." };
  }
  if (cleanDesc.length < 15) {
    return { isValid: false, error: "A descrição precisa de pelo menos 15 caracteres com detalhes sobre sua ideia ou bug." };
  }
  if (cleanDesc.length > 3000) {
    return { isValid: false, error: "A descrição excede o limite máximo permitido de 3.000 caracteres." };
  }

  // 3. Contagem de palavras reais
  if (countMeaningfulWords(cleanTitle) < SPAM_CONFIG.MIN_TITLE_WORDS) {
    return { isValid: false, error: "Por favor, elabore um título com palavras reais e compreensíveis." };
  }
  if (countMeaningfulWords(cleanDesc) < SPAM_CONFIG.MIN_DESC_WORDS) {
    return { isValid: false, error: "Por favor, explique melhor sua sugestão usando palavras compreensíveis." };
  }

  // 4. Detecção de caracteres repetidos sem sentido (mashing de teclado)
  if (hasExcessiveRepetition(cleanTitle) || hasExcessiveRepetition(cleanDesc)) {
    return { isValid: false, error: "Detectamos repetições excessivas de caracteres. Escreva um texto natural." };
  }

  // 5. Verificação de Padrões de Phishing / Golpes / Links não autorizados
  const fullContent = `${cleanTitle} ${cleanDesc}`;
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(fullContent)) {
      return {
        isValid: false,
        error: "O conteúdo contém links externos, convites ou termos não permitidos pelas diretrizes da comunidade.",
      };
    }
  }

  // 6. Verificação de CAPS LOCK excessivo
  if (isExcessiveUppercase(cleanTitle)) {
    return {
      isValid: false,
      error: "Evite escrever o título inteiramente em letras maiúsculas (CAPS LOCK).",
    };
  }

  return { isValid: true };
}

/**
 * Validação de Comentários contra Spam
 */
export function validateCommentSpam(content: string): ValidationResult {
  const clean = content.trim();
  if (clean.length < 3) {
    return { isValid: false, error: "O comentário precisa ter no mínimo 3 caracteres." };
  }
  if (clean.length > 1000) {
    return { isValid: false, error: "O comentário excede o limite de 1.000 caracteres." };
  }
  if (hasExcessiveRepetition(clean)) {
    return { isValid: false, error: "Comentário com repetição excessiva de caracteres bloqueado." };
  }
  for (const pattern of SPAM_PATTERNS) {
    if (pattern.test(clean)) {
      return { isValid: false, error: "Links promocionais e termos restritos não são permitidos nos comentários." };
    }
  }
  return { isValid: true };
}

/**
 * Checa Cooldown de postagem de Feedback por usuário (Local + Timestamp)
 */
export function checkFeedbackCooldown(userId: string): {
  allowed: boolean;
  waitSeconds?: number;
  reason?: string;
} {
  if (typeof window === "undefined" || !userId) return { allowed: true };

  const lastSubmitKey = `mgl_last_feedback_submit_${userId}`;
  const dailyCountKey = `mgl_feedback_daily_${userId}`;

  // Checa Cooldown de segundos
  const lastSubmitStr = localStorage.getItem(lastSubmitKey);
  if (lastSubmitStr) {
    const lastSubmitTime = parseInt(lastSubmitStr, 10);
    const elapsedSeconds = Math.floor((Date.now() - lastSubmitTime) / 1000);

    if (elapsedSeconds < SPAM_CONFIG.FEEDBACK_COOLDOWN_SECONDS) {
      const wait = SPAM_CONFIG.FEEDBACK_COOLDOWN_SECONDS - elapsedSeconds;
      return {
        allowed: false,
        waitSeconds: wait,
        reason: `Aguarde mais ${wait} segundo(s) antes de publicar uma nova sugestão (Anti-Spam).`,
      };
    }
  }

  // Checa Cota Diária
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const dailyDataStr = localStorage.getItem(dailyCountKey);
  if (dailyDataStr) {
    try {
      const { date, count } = JSON.parse(dailyDataStr);
      if (date === todayStr && count >= SPAM_CONFIG.MAX_FEEDBACKS_PER_DAY) {
        return {
          allowed: false,
          reason: `Você atingiu o limite de ${SPAM_CONFIG.MAX_FEEDBACKS_PER_DAY} postagens por dia. Tente novamente amanhã!`,
        };
      }
    } catch {
      // JSON inválido, ignora
    }
  }

  return { allowed: true };
}

/**
 * Registra a publicação para controle de cooldown e cota diária
 */
export function recordFeedbackSubmission(userId: string): void {
  if (typeof window === "undefined" || !userId) return;

  const lastSubmitKey = `mgl_last_feedback_submit_${userId}`;
  const dailyCountKey = `mgl_feedback_daily_${userId}`;

  localStorage.setItem(lastSubmitKey, Date.now().toString());

  const todayStr = new Date().toISOString().slice(0, 10);
  let count = 1;

  const dailyDataStr = localStorage.getItem(dailyCountKey);
  if (dailyDataStr) {
    try {
      const parsed = JSON.parse(dailyDataStr);
      if (parsed.date === todayStr) {
        count = (parsed.count || 0) + 1;
      }
    } catch {}
  }

  localStorage.setItem(dailyCountKey, JSON.stringify({ date: todayStr, count }));
}

/**
 * Checa Cooldown de comentários
 */
export function checkCommentCooldown(userId: string): {
  allowed: boolean;
  waitSeconds?: number;
  reason?: string;
} {
  if (typeof window === "undefined" || !userId) return { allowed: true };

  const lastKey = `mgl_last_comment_${userId}`;
  const lastStr = localStorage.getItem(lastKey);
  if (lastStr) {
    const lastTime = parseInt(lastStr, 10);
    const elapsed = Math.floor((Date.now() - lastTime) / 1000);
    if (elapsed < SPAM_CONFIG.COMMENT_COOLDOWN_SECONDS) {
      const wait = SPAM_CONFIG.COMMENT_COOLDOWN_SECONDS - elapsed;
      return {
        allowed: false,
        waitSeconds: wait,
        reason: `Aguarde ${wait}s para enviar outro comentário.`,
      };
    }
  }
  return { allowed: true };
}

export function recordCommentSubmission(userId: string): void {
  if (typeof window === "undefined" || !userId) return;
  localStorage.setItem(`mgl_last_comment_${userId}`, Date.now().toString());
}

/**
 * Verifica se já existe publicação com título idêntico ou muito semelhante enviada pelo mesmo usuário
 */
export function checkDuplicateFeedback(
  userId: string,
  newTitle: string,
  existingFeedbacks: FeedbackItem[]
): { isDuplicate: boolean; reason?: string } {
  const normalizedNew = newTitle.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

  const userRecentItems = existingFeedbacks.filter((item) => item.authorId === userId);

  for (const item of userRecentItems) {
    const normalizedExisting = item.title.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

    // Verificação exata ou substring direta
    if (normalizedNew === normalizedExisting) {
      return {
        isDuplicate: true,
        reason: "Você já enviou uma publicação com este mesmo título anteriormente.",
      };
    }
  }

  return { isDuplicate: false };
}
