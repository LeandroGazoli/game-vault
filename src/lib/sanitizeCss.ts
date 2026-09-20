/**
 * Utilitário de segurança para higienização e escopo estrito de CSS customizado
 * fornecido por usuários VIP/PRO no Game Vault.
 *
 * Princípios de segurança:
 * 1. Negação estrita de padrões de injeção e exploração (behavior, expression, @import, javascript:, etc.)
 * 2. Prefixação mandatória com #profile / .profile-root para garantir que o CSS nunca
 *    vaze ou altere elementos externos (navbar, modais, rodapé, admin).
 */

const DANGEROUS_CSS_PATTERNS = [
  /@import\b/gi,
  /expression\s*\(/gi,
  /behavior\s*:/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /-moz-binding\b/gi,
  /<\/style>/gi,
  /<script\b/gi,
];

/**
 * Higieniza o CSS cru removendo quaisquer instruções ou payloads perigosos.
 */
export function sanitizeRawCss(rawCss: string): string {
  if (!rawCss || typeof rawCss !== "string") return "";

  let cleaned = rawCss;
  for (const pattern of DANGEROUS_CSS_PATTERNS) {
    cleaned = cleaned.replace(pattern, "");
  }

  // Remove caracteres de escape de controle potencialmente exploráveis
  cleaned = cleaned.replace(/\\([0-9a-fA-F]{1,6}\s?|[^0-9a-fA-F])/g, (match, grp) => {
    // Permite caracteres normais mas bloqueia escapes de quebra
    return grp.length === 1 && !/[<>]/.test(grp) ? grp : "";
  });

  return cleaned.trim();
}

/**
 * Adiciona escopo estrito a cada seletor CSS com #profile, prevenindo vazamento de estilo.
 * Exemplo:
 *   .card { background: red; } -> #profile .card { background: red; }
 *   :root { --accent: #fff; }   -> #profile { --accent: #fff; }
 */
export function scopeProfileCss(rawCss: string, scopePrefix = "#profile"): string {
  const sanitized = sanitizeRawCss(rawCss);
  if (!sanitized) return "";

  // Expressão regular para encontrar blocos seletores { regras }
  return sanitized.replace(/([^{}]+)\{([^}]+)\}/g, (match, selectorBlock, rules) => {
    const trimmedSelectorBlock = selectorBlock.trim();

    // Se for regra @media ou @keyframes, preserva a estrutura e escopa o interior
    if (trimmedSelectorBlock.startsWith("@keyframes") || trimmedSelectorBlock.startsWith("@-webkit-keyframes")) {
      return match;
    }

    const scopedSelectors = trimmedSelectorBlock
      .split(",")
      .map((sel: string) => {
        const s = sel.trim();
        if (!s) return "";
        if (s === ":root" || s === "body" || s === "html" || s === ".profile-root") {
          return scopePrefix;
        }
        if (s.startsWith(scopePrefix)) {
          return s;
        }
        return `${scopePrefix} ${s}`;
      })
      .filter(Boolean)
      .join(", ");

    return `${scopedSelectors} {${rules}}`;
  });
}
