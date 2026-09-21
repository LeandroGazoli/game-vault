import fs from "node:fs";
import path from "node:path";

const workerPath = path.resolve(".open-next/worker.js");

if (!fs.existsSync(workerPath)) {
  console.error("❌ .open-next/worker.js not found. Make sure opennextjs-cloudflare build has run.");
  process.exit(1);
}

let content = fs.readFileSync(workerPath, "utf8");

// Converter logic bundled inline into the worker to avoid import resolution issues in wrangler
const converterCode = `
function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)));
}

function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

function extractFrontmatter(html, fallbackUrl) {
  const getMeta = (pattern) => {
    const match = pattern.exec(html);
    return match ? decodeHtmlEntities(match[1].trim()) : null;
  };

  let title =
    getMeta(/<meta[^>]+name=["']title["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']title["']/i) ||
    getMeta(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);

  if (!title) {
    const titleTagMatch = /<title[^>]*>([^<]+)<\\/title>/i.exec(html);
    if (titleTagMatch) {
      title = decodeHtmlEntities(titleTagMatch[1].trim());
    }
  }

  const description =
    getMeta(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
    getMeta(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i);

  const image =
    getMeta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

  const canonical =
    getMeta(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i) ||
    fallbackUrl;

  const lines = [];
  if (title) lines.push(\`title: "\${title.replace(/"/g, '\\\\"')}"\`);
  if (description) lines.push(\`description: "\${description.replace(/"/g, '\\\\"')}"\`);
  if (image) lines.push(\`image: "\${image.replace(/"/g, '\\\\"')}"\`);
  if (canonical) lines.push(\`url: "\${canonical.replace(/"/g, '\\\\"')}"\`);

  if (lines.length === 0) return "";
  return \`---\\n\${lines.join("\\n")}\\n---\\n\\n\`;
}

function extractJsonLdBlocks(html) {
  const jsonLdBlocks = [];
  const regex = /<script[^>]+type=["']application\\/ld\\+json["'][^>]*>([\\s\\S]*?)<\\/script>/gi;
  let match;

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

function convertBodyToMarkdown(html) {
  let body = html;
  const bodyMatch = /<body[^>]*>([\\s\\S]*?)<\\/body>/i.exec(html);
  if (bodyMatch) {
    body = bodyMatch[1];
  }

  body = body
    .replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, "")
    .replace(/<style\\b[^<]*(?:(?!<\\/style>)<[^<]*)*<\\/style>/gi, "")
    .replace(/<nav\\b[^<]*(?:(?!<\\/nav>)<[^<]*)*<\\/nav>/gi, "")
    .replace(/<header\\b[^<]*(?:(?!<\\/header>)<[^<]*)*<\\/header>/gi, "")
    .replace(/<footer\\b[^<]*(?:(?!<\\/footer>)<[^<]*)*<\\/footer>/gi, "")
    .replace(/<noscript\\b[^<]*(?:(?!<\\/noscript>)<[^<]*)*<\\/noscript>/gi, "")
    .replace(/<svg\\b[^<]*(?:(?!<\\/svg>)<[^<]*)*<\\/svg>/gi, "")
    .replace(/<iframe\\b[^<]*(?:(?!<\\/iframe>)<[^<]*)*<\\/iframe>/gi, "");

  body = body.replace(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/gi, (_, content) => \`\\n\\n# \${content.trim()}\\n\\n\`);
  body = body.replace(/<h2[^>]*>([\\s\\S]*?)<\\/h2>/gi, (_, content) => \`\\n\\n## \${content.trim()}\\n\\n\`);
  body = body.replace(/<h3[^>]*>([\\s\\S]*?)<\\/h3>/gi, (_, content) => \`\\n\\n### \${content.trim()}\\n\\n\`);
  body = body.replace(/<h4[^>]*>([\\s\\S]*?)<\\/h4>/gi, (_, content) => \`\\n\\n#### \${content.trim()}\\n\\n\`);
  body = body.replace(/<h5[^>]*>([\\s\\S]*?)<\\/h5>/gi, (_, content) => \`\\n\\n##### \${content.trim()}\\n\\n\`);
  body = body.replace(/<h6[^>]*>([\\s\\S]*?)<\\/h6>/gi, (_, content) => \`\\n\\n###### \${content.trim()}\\n\\n\`);

  body = body.replace(/<pre[^>]*><code[^>]*>([\\s\\S]*?)<\\/code><\\/pre>/gi, (_, code) => \`\\n\\n\\\`\\\`\\\`\\n\${code.trim()}\\n\\\`\\\`\\\`\\n\\n\`);
  body = body.replace(/<code[^>]*>([\\s\\S]*?)<\\/code>/gi, (_, code) => \` \\\`\${code.trim()}\\\` \`);

  body = body.replace(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*>/gi, "![$2]($1)");
  body = body.replace(/<img[^>]+alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*>/gi, "![$1]($2)");
  body = body.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, "![]($1)");

  body = body.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/gi, (_, href, text) => {
    const cleanText = text.replace(/<[^>]+>/g, "").trim();
    return cleanText ? \`[\${cleanText}](\${href})\` : "";
  });

  body = body.replace(/<(?:strong|b)[^>]*>([\\s\\S]*?)<\\/(?:strong|b)>/gi, "**$1**");
  body = body.replace(/<(?:em|i)[^>]*>([\\s\\S]*?)<\\/(?:em|i)>/gi, "*$1*");

  body = body.replace(/<li[^>]*>([\\s\\S]*?)<\\/li>/gi, (_, content) => \`\\n- \${content.trim()}\`);
  body = body.replace(/<\\/ul>/gi, "\\n\\n");
  body = body.replace(/<\\/ol>/gi, "\\n\\n");

  body = body.replace(/<p[^>]*>([\\s\\S]*?)<\\/p>/gi, (_, content) => \`\\n\\n\${content.trim()}\\n\\n\`);
  body = body.replace(/<br\\s*\\/?>/gi, "\\n");
  body = body.replace(/<hr\\s*\\/?>/gi, "\\n\\n---\\n\\n");
  body = body.replace(/<blockquote[^>]*>([\\s\\S]*?)<\\/blockquote>/gi, (_, content) => \`\\n\\n> \${content.trim()}\\n\\n\`);

  body = body.replace(/<[^>]+>/g, " ");
  body = decodeHtmlEntities(body);
  body = body
    .replace(/[ \\t]+/g, " ")
    .replace(/\\n\\s+\\n/g, "\\n\\n")
    .replace(/\\n{3,}/g, "\\n\\n")
    .trim();

  return body;
}

function convertHtmlToMarkdownDocument(html, requestUrl) {
  const originalTokens = estimateTokens(html);
  const frontmatter = extractFrontmatter(html, requestUrl);
  const jsonLdBlocks = extractJsonLdBlocks(html);
  const bodyMarkdown = convertBodyToMarkdown(html);

  let fullMarkdown = \`\${frontmatter}\${bodyMarkdown}\`;
  if (jsonLdBlocks.length > 0) {
    fullMarkdown += \`\\n\\n\\\`\\\`\\\`json\\n\${jsonLdBlocks.join("\\n")}\\n\\\`\\\`\\\`\`;
  }
  fullMarkdown = fullMarkdown.trim() + "\\n";
  const markdownTokens = estimateTokens(fullMarkdown);

  return {
    markdown: fullMarkdown,
    markdownTokens,
    originalTokens,
  };
}
`;

// Target to replace
const originalInvocation = `            // @ts-expect-error: resolved by wrangler build
            const { handler } = await import("./server-functions/default/handler.mjs");
            return handler(reqOrResp, env, ctx, request.signal);`;

const newInvocation = `            // @ts-expect-error: resolved by wrangler build
            const { handler } = await import("./server-functions/default/handler.mjs");
            const resp = await handler(reqOrResp, env, ctx, request.signal);

            // Content Negotiation for Agents (Markdown for Agents)
            const acceptHeader = request.headers.get("accept") || "";
            const isMarkdownAccepted =
              acceptHeader.includes("text/markdown") &&
              !acceptHeader.includes("text/html;q=");

            if (
              isMarkdownAccepted &&
              resp.status === 200 &&
              resp.headers.get("content-type")?.includes("text/html")
            ) {
              const html = await resp.text();
              const { markdown, markdownTokens, originalTokens } = convertHtmlToMarkdownDocument(html, request.url);
              
              const newHeaders = new Headers(resp.headers);
              newHeaders.set("Content-Type", "text/markdown; charset=utf-8");
              newHeaders.set("Vary", "Accept");
              newHeaders.set("Content-Signal", "ai-train=yes, search=yes, ai-input=yes");
              newHeaders.set("x-markdown-tokens", String(markdownTokens));
              newHeaders.set("x-original-tokens", String(originalTokens));
              newHeaders.delete("content-length");

              return new Response(markdown, {
                status: 200,
                headers: newHeaders,
              });
            }

            return resp;`;

if (!content.includes(converterCode)) {
  content = converterCode + "\n" + content;
}

if (content.includes(originalInvocation)) {
  content = content.replace(originalInvocation, newInvocation);
  fs.writeFileSync(workerPath, content, "utf8");
  console.log("✅ .open-next/worker.js successfully patched with Markdown Content Negotiation!");
} else {
  console.log("ℹ️ Worker already patched or original pattern not found.");
}

// Also patch .open-next/server-functions/default/handler.mjs to avoid Dynamic require error on middleware-manifest.json
const handlerPath = path.resolve(".open-next/server-functions/default/handler.mjs");
if (fs.existsSync(handlerPath)) {
  let handlerContent = fs.readFileSync(handlerPath, "utf8");
  const badMiddlewareRequire = "getMiddlewareManifest(){return this.minimalMode?null:require(this.middlewareManifestPath)}";
  const safeMiddlewareRequire = "getMiddlewareManifest(){return null}";
  if (handlerContent.includes(badMiddlewareRequire)) {
    handlerContent = handlerContent.replace(badMiddlewareRequire, safeMiddlewareRequire);
    fs.writeFileSync(handlerPath, handlerContent, "utf8");
    console.log("✅ .open-next/server-functions/default/handler.mjs successfully patched for middleware-manifest!");
  }
}
