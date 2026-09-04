const MAX_TRANSLATION_CACHE = 1000;
const translationCache = new Map<string, string>();

function setTranslationCache(key: string, value: string) {
  if (translationCache.size >= MAX_TRANSLATION_CACHE) {
    const oldest = translationCache.keys().next().value;
    if (oldest) translationCache.delete(oldest);
  }
  translationCache.set(key, value);
}

/**
 * Verifica se a tradução recebida é limpa e não contém mensagens de erro de APIs
 */
function isCleanTranslation(text: unknown): text is string {
  if (!text || typeof text !== "string") return false;
  const upper = text.toUpperCase();
  if (upper.includes("QUERY LENGTH LIMIT")) return false;
  if (upper.includes("MAX ALLOWED QUERY")) return false;
  if (upper.includes("MYMEMORY WARNING")) return false;
  if (upper.includes("YOU USED ALL YOUR FREE QUOTA")) return false;
  if (upper.includes("INVALID TARGET LANGUAGE")) return false;
  if (upper.includes("IS AN INVALID EMAIL")) return false;
  if (upper.includes("PLEASE SELECT TWO DISTINCT LANGUAGES")) return false;
  return true;
}

/**
 * Remove qualquer resquício de mensagens de erro de tradução que possam vir embutidas
 */
export function sanitizeTranslation(text?: string | null): string {
  if (!text) return "";
  return text
    .replace(/QUERY LENGTH LIMIT EXCEEDED[^\n]*/gi, "")
    .replace(/MAX ALLOWED QUERY\s*:\s*\d+\s*CHARS/gi, "")
    .replace(/MYMEMORY WARNING[^\n]*/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Divide qualquer texto de forma inteligente para que nenhum fragmento exceda maxLen (padrão: 300 caracteres).
 * Isso garante que o limite de 500 caracteres do MyMemory nunca seja atingido.
 */
function splitIntoSafeChunks(text: string, maxLen = 300): string[] {
  const clean = text.trim();
  if (clean.length <= maxLen) {
    return [clean];
  }

  const result: string[] = [];
  const sentences = clean.match(/[^.!?]+(?:[.!?]+|$)/g) || [clean];
  let currentChunk = "";

  for (const sent of sentences) {
    const trimmedSent = sent.trim();
    if (!trimmedSent) continue;

    if (trimmedSent.length > maxLen) {
      if (currentChunk.trim()) {
        result.push(currentChunk.trim());
        currentChunk = "";
      }

      // Divide sentença longa por vírgulas, ponto-e-vírgula ou espaços
      const parts = trimmedSent.split(/([,;:]\s+|\s+)/);
      let partChunk = "";

      for (const part of parts) {
        if (!part) continue;
        if (part.length > maxLen) {
          for (let i = 0; i < part.length; i += maxLen) {
            result.push(part.slice(i, i + maxLen));
          }
        } else if ((partChunk + part).length > maxLen) {
          if (partChunk.trim()) result.push(partChunk.trim());
          partChunk = part;
        } else {
          partChunk += part;
        }
      }
      if (partChunk.trim()) {
        result.push(partChunk.trim());
      }
    } else if ((currentChunk + " " + trimmedSent).length > maxLen) {
      if (currentChunk.trim()) result.push(currentChunk.trim());
      currentChunk = trimmedSent;
    } else {
      currentChunk += (currentChunk ? " " : "") + trimmedSent;
    }
  }

  if (currentChunk.trim()) {
    result.push(currentChunk.trim());
  }

  return result;
}

/**
 * Traduz um trecho individual respeitando os limites estritos da API
 */
async function translateChunk(chunk: string): Promise<string> {
  const trimmed = chunk.trim();
  if (!trimmed) return chunk;

  if (translationCache.has(trimmed)) {
    return translationCache.get(trimmed)!;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|pt-BR&de=contato@mygameslist.com.br`;
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(4000),
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const data = await res.json();
      const status = Number(data.responseStatus);
      const translated = data.responseData?.translatedText;

      if (status === 200 && isCleanTranslation(translated)) {
        const sanitized = sanitizeTranslation(translated);
        if (sanitized) {
          setTranslationCache(trimmed, sanitized);
          return sanitized;
        }
      }
    }
  } catch (err) {
    console.warn("Falha ao traduzir trecho:", err);
  }

  // Fallback seguro: retorna o texto original sem exibir mensagem de erro técnica ao usuário
  return trimmed;
}

/**
 * Traduz um texto em inglês para Português Brasileiro (PT-BR) com cache em memória,
 * garantindo integridade de parágrafos e segurança contra limites de requisição.
 */
export async function translateToPortuguese(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  const trimmed = sanitizeTranslation(text.trim());
  if (translationCache.has(trimmed)) {
    return translationCache.get(trimmed)!;
  }

  try {
    // Preserva parágrafos originais dividindo por quebras duplas
    const paragraphs = trimmed.split(/\n\s*\n/);
    const translatedParagraphs: string[] = [];

    for (const paragraph of paragraphs) {
      const cleanPara = paragraph.trim();
      if (!cleanPara) continue;

      // Garante que cada fatia tenha no máximo 300 caracteres (bem abaixo do limite de 500 do MyMemory)
      const chunks = splitIntoSafeChunks(cleanPara, 300);
      const translatedChunks = await Promise.all(chunks.map((c) => translateChunk(c)));

      translatedParagraphs.push(translatedChunks.join(" "));
    }

    const fullResult = sanitizeTranslation(translatedParagraphs.join("\n\n"));
    if (isCleanTranslation(fullResult) && fullResult.length > 0) {
      setTranslationCache(trimmed, fullResult);
      return fullResult;
    }

    return trimmed;
  } catch (error) {
    console.warn("Erro na tradução da sinopse:", error);
    return trimmed;
  }
}
