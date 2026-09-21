/**
 * Utilitário para conversão de HTML para Markdown padronizado para Agentes de IA.
 * 
 * Segue a especificação do Cloudflare "Markdown for Agents" e padrões do llmstxt.org / isitagentready.com:
 * 1. YAML frontmatter com metadados (title, description, image, canonicalUrl).
 * 2. Corpo do documento convertido em Markdown limpo (sem scripts, estilos, nav, footers, anúncios).
 * 3. Blocos de dados estruturados JSON-LD preservados ao final do documento em bloco ```json.
 */

export interface MarkdownConversionResult {
  markdown: string;
  markdownTokens: number;
  originalTokens: number;
}

/**
 * Decodifica entidades HTML básicas para texto puro.
 */
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

/**
 * Estima a quantidade de tokens a partir do comprimento do texto.
 * Regra padrão aproximada para modelos de IA (~4 caracteres por token).
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

/**
 * Extrai metadados do HTML para o Frontmatter YAML.
 */
function extractFrontmatter(html: string, fallbackUrl?: string): string {
  const getMeta = (pattern: RegExp): string | null => {
    const match = pattern.exec(html);
    return match ? decodeHtmlEntities(match[1].trim()) : null;
  };

  // title: <meta name="title"> -> <meta property="og:title"> -> <title>
  let title =
    getMeta(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']title["']/i) ||
    getMeta(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);

  if (!title) {
    const titleTagMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html);
    if (titleTagMatch) {
      title = decodeHtmlEntities(titleTagMatch[1].trim());
    }
  }

  // description: <meta name="description"> -> <meta property="og:description">
  const description =
    getMeta(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
    getMeta(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);

  // image: <meta property="og:image">
  const image =
    getMeta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

  // canonical URL
  const canonical =
    getMeta(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    fallbackUrl;

  const lines: string[] = [];
  if (title) lines.push(`title: "${title.replace(/"/g, '\\"')}"`);
  if (description) lines.push(`description: "${description.replace(/"/g, '\\"')}"`);
  if (image) lines.push(`image: "${image.replace(/"/g, '\\"')}"`);
  if (canonical) lines.push(`url: "${canonical.replace(/"/g, '\\"')}"`);

  if (lines.length === 0) return "";
  return `---\n${lines.join("\n")}\n---\n\n`;
}

/**
 * Extrai todos os blocos JSON-LD encontrados no documento HTML.
 */
function extractJsonLdBlocks(html: string): string[] {
  const jsonLdBlocks: string[] = [];
  const regex = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const rawContent = match[1].trim();
    if (rawContent) {
      try {
        const parsed = JSON.parse(rawContent);
        jsonLdBlocks.push(JSON.stringify(parsed, null, 2));
      } catch {
        jsonLdBlocks.push(rawContent);
      }
    }
  }

  return jsonLdBlocks;
}

/**
 * Converte HTML corporal em Markdown textual limpo e semântico.
 */
function convertBodyToMarkdown(html: string): string {
  // 1. Isola conteúdo do body (se houver)
  let body = html;
  const bodyMatch = /<body[^>]*>([\s\S]*?)<\/body>/i.exec(html);
  if (bodyMatch) {
    body = bodyMatch[1];
  }

  // 2. Remove tags indesejadas (scripts, styles, nav, footers, noscript, svg, iframes)
  body = body
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<header\b[^<]*(?:(?!<\/header>)<[^<]*)*<\/header>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");

  // 3. Converte headings
  body = body.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, (_, content) => `\n\n# ${content.trim()}\n\n`);
  body = body.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, content) => `\n\n## ${content.trim()}\n\n`);
  body = body.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, content) => `\n\n### ${content.trim()}\n\n`);
  body = body.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, content) => `\n\n#### ${content.trim()}\n\n`);
  body = body.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, (_, content) => `\n\n##### ${content.trim()}\n\n`);
  body = body.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, (_, content) => `\n\n###### ${content.trim()}\n\n`);

  // 4. Converte blocos de código pré-formatados
  body = body.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, (_, code) => `\n\n\`\`\`\n${code.trim()}\n\`\`\`\n\n`);
  body = body.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, (_, code) => ` \`${code.trim()}\` `);

  // 5. Converte links e imagens
  body = body.replace(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, "![$2]($1)");
  body = body.replace(/<img[^>]+alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/gi, "![$1]($2)");
  body = body.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, "![]($1)");

  body = body.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    const cleanText = text.replace(/<[^>]+>/g, "").trim();
    return cleanText ? `[${cleanText}](${href})` : "";
  });

  // 6. Converte ênfase (bold, italic)
  body = body.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, "**$1**");
  body = body.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, "*$1*");

  // 7. Converte listas
  body = body.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, content) => `\n- ${content.trim()}`);
  body = body.replace(/<\/ul>/gi, "\n\n");
  body = body.replace(/<\/ol>/gi, "\n\n");

  // 8. Converte parágrafos e quebras de linha
  body = body.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, content) => `\n\n${content.trim()}\n\n`);
  body = body.replace(/<br\s*\/?>/gi, "\n");
  body = body.replace(/<hr\s*\/?>/gi, "\n\n---\n\n");
  body = body.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_, content) => `\n\n> ${content.trim()}\n\n`);

  // 9. Remove quaisquer outras tags HTML restantes
  body = body.replace(/<[^>]+>/g, " ");

  // 10. Decodifica entidades HTML e normaliza espaçamentos e quebras
  body = decodeHtmlEntities(body);
  body = body
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s+\n/g, "\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return body;
}

/**
 * Converte um documento HTML completo para o formato Markdown compatível com Markdown for Agents.
 */
export function convertHtmlToMarkdownDocument(
  html: string,
  requestUrl?: string
): MarkdownConversionResult {
  const originalTokens = estimateTokens(html);

  // 1. Extração do Frontmatter YAML
  const frontmatter = extractFrontmatter(html, requestUrl);

  // 2. Extração de blocos JSON-LD
  const jsonLdBlocks = extractJsonLdBlocks(html);

  // 3. Conversão do corpo principal
  const bodyMarkdown = convertBodyToMarkdown(html);

  // 4. Montagem final
  let fullMarkdown = `${frontmatter}${bodyMarkdown}`;

  if (jsonLdBlocks.length > 0) {
    fullMarkdown += `\n\n\`\`\`json\n${jsonLdBlocks.join("\n")}\n\`\`\``;
  }

  fullMarkdown = fullMarkdown.trim() + "\n";
  const markdownTokens = estimateTokens(fullMarkdown);

  return {
    markdown: fullMarkdown,
    markdownTokens,
    originalTokens,
  };
}
