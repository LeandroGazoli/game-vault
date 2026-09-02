const translationCache = new Map<string, string>();

/**
 * Traduz um texto em inglês para Português Brasileiro (PT-BR) com cache em memória
 */
export async function translateToPortuguese(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  const trimmed = text.trim();

  // 1. Verifica no Cache
  if (translationCache.has(trimmed)) {
    return translationCache.get(trimmed)!;
  }

  try {
    // Se o texto for pequeno (< 450 caracteres), traduz direto
    if (trimmed.length <= 450) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=en|pt-BR`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (res.ok) {
        const data = await res.json();
        const translated = data.responseData?.translatedText;
        if (translated && !translated.includes("MYMEMORY WARNING")) {
          translationCache.set(trimmed, translated);
          return translated;
        }
      }
      return trimmed;
    }

    // Para textos longos, divide em parágrafos / sentenças
    const paragraphs = trimmed.split("\n\n").filter(Boolean);
    const translatedParagraphs: string[] = [];

    for (const para of paragraphs) {
      if (para.length <= 450) {
        const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(para.trim())}&langpair=en|pt-BR`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const translated = data.responseData?.translatedText;
          if (translated && !translated.includes("MYMEMORY WARNING")) {
            translatedParagraphs.push(translated);
            continue;
          }
        }
        translatedParagraphs.push(para);
      } else {
        // Divide por sentenças
        const sentences = para.match(/[^.!?]+[.!?]+/g) || [para];
        let currentChunk = "";
        let translatedSentences = "";

        for (const sent of sentences) {
          if ((currentChunk + " " + sent).length > 380) {
            if (currentChunk.trim()) {
              const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(currentChunk.trim())}&langpair=en|pt-BR`;
              const res = await fetch(url);
              if (res.ok) {
                const data = await res.json();
                const trans = data.responseData?.translatedText;
                if (trans && !trans.includes("MYMEMORY WARNING")) {
                  translatedSentences += trans + " ";
                } else {
                  translatedSentences += currentChunk.trim() + " ";
                }
              } else {
                translatedSentences += currentChunk.trim() + " ";
              }
            }
            currentChunk = sent;
          } else {
            currentChunk += " " + sent;
          }
        }

        if (currentChunk.trim()) {
          const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(currentChunk.trim())}&langpair=en|pt-BR`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const trans = data.responseData?.translatedText;
            if (trans && !trans.includes("MYMEMORY WARNING")) {
              translatedSentences += trans;
            } else {
              translatedSentences += currentChunk.trim();
            }
          } else {
            translatedSentences += currentChunk.trim();
          }
        }

        translatedParagraphs.push(translatedSentences.trim());
      }
    }

    const fullTranslation = translatedParagraphs.join("\n\n");
    translationCache.set(trimmed, fullTranslation);
    return fullTranslation;
  } catch (error) {
    console.warn("Erro ao traduzir sinopse para PT-BR:", error);
    return trimmed;
  }
}
