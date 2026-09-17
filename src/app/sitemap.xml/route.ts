import { readSitemapMeta } from "@/lib/sitemapIndex";

/**
 * SITEMAP INDEX — o arquivo que o Google Search Console recebe.
 *
 * Com `generateSitemaps()` o Next serve as partições em `/sitemap/[id].xml`, mas **não gera
 * o índice**. Sem este arquivo, `/sitemap.xml` cairia no 404 do app e o Google não
 * descobriria partição nenhuma.
 *
 * Padrão de mercado: o protocolo aceita 50.000 URLs por arquivo, mas o Google recomenda
 * fatiar acima de ~10.000 — arquivos menores são reprocessados mais rápido e um erro de
 * parsing invalida menos coisa.
 *
 * Custo: 1 leitura do Firestore (o meta do índice) por regeneração, e nenhuma varredura.
 * Com `revalidate` de 24h isso é desprezível.
 */
export const revalidate = 86400;

const URLS_PER_SITEMAP = 10_000;

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";
  const lastModified = new Date().toISOString();

  let partitions = 1;
  try {
    const { entryCount } = await readSitemapMeta();
    partitions = Math.max(1, Math.ceil(entryCount / URLS_PER_SITEMAP));
  } catch {
    // Índice indisponível: publica ao menos a partição 0, que tem as páginas fixas.
  }

  const entries = Array.from({ length: partitions }, (_, id) =>
    `  <sitemap>\n    <loc>${baseUrl}/sitemap/${id}.xml</loc>\n    <lastmod>${lastModified}</lastmod>\n  </sitemap>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
