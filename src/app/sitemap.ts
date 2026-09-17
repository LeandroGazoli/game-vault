import { MetadataRoute } from "next";
import { CATEGORIES_DATA } from "@/lib/categoriesData";
import { COLLECTIONS_DATA } from "@/lib/collectionsData";
import { getCombinedArticles } from "@/lib/articlesService";
import { getRankingsIGDB, getRecentReleasesIGDB } from "@/lib/igdbApi";
import { slugify, getGameUrl } from "@/lib/routes";
import { getRegisteredGamePages } from "@/lib/gameRegistry";
import { readSitemapMeta } from "@/lib/sitemapIndex";

/**
 * O sitemap era estático (gerado só no build), então páginas de jogos novas ficavam de
 * fora até o próximo deploy. Com ISR ele se regenera sozinho; 24h mantém a lista fresca
 * sem varrer o Firestore a cada requisição.
 */
export const revalidate = 86400;

/**
 * Teto de páginas de jogos no sitemap. Cada documento é UMA LEITURA do Firestore a cada
 * regeneração, e `game_translations` tem dezenas de milhares de docs.
 *
 * O default é BAIXO de propósito. O default anterior era 45.000, e isso mordia de dois
 * jeitos que passaram despercebidos:
 *  - as vars do `wrangler.jsonc` são do RUNTIME do Worker e NÃO alcançam o `next build`,
 *    então todo build local ignorava o limite configurado e lia a coleção inteira;
 *  - um sitemap sem cache multiplicava isso por requisição de crawler.
 * Resultado real observado: ~33k leituras por build, 144k num dia.
 *
 * Para publicar o sitemap completo, defina SITEMAP_GAME_LIMIT explicitamente no ambiente
 * que vai gerá-lo — assim o custo é uma decisão consciente, nunca um acidente.
 */
/**
 * 3.000 é o default porque o custo deixou de depender dele: o sitemap lê o índice agregado
 * (`system/sitemap_index`), e buscar 3.000 ou 33.249 entradas custa as mesmas ~2-9 leituras.
 * O limite controla só o tamanho do XML.
 *
 * Antes o default era 45.000 E o sitemap varria `game_translations` — 33.249 leituras por
 * build. Baixei para 500 como contenção emergencial; com o índice no lugar, 500 só
 * empobrecia o SEO sem economizar nada.
 *
 * Um sitemap único aceita 50.000 URLs e 50 MB. Para publicar as 33.249, é preciso particionar
 * em sitemap index — está em pauta.
 */
const SITEMAP_DEFAULT_LIMIT = 50_000;
const REGISTRY_GAME_LIMIT = Number(process.env.SITEMAP_GAME_LIMIT || SITEMAP_DEFAULT_LIMIT);

/** Total de URLs de jogo efetivamente publicadas, respeitando o teto do protocolo. */
export function sitemapGameLimit(entryCount: number): number {
  return Math.min(entryCount, REGISTRY_GAME_LIMIT, 50_000);
}

const POPULAR_FALLBACK_IDS = [
  1942,   // The Witcher 3
  119277, // Elden Ring
  119171, // Baldur's Gate 3
  1020,   // Grand Theft Auto V
  19560,  // God of War
  112875, // Cyberpunk 2077
  125174, // Deathloop
  134585, // Horizon Forbidden West
  145952, // Resident Evil 4 Remake
  1877,   // The Last of Us
  26192,  // The Last of Us Part II
  114283, // Alan Wake 2
  2155,   // Red Dead Redemption 2
];

/**
 * URLs por partição. O padrão do protocolo aceita 50.000 por arquivo, mas o Google recomenda
 * fatiar acima de ~10.000 — arquivos menores são reprocessados mais rápido e um erro de
 * parsing invalida menos coisa.
 */
const URLS_PER_SITEMAP = 10_000;

/**
 * Particiona o sitemap. A partição 0 leva as páginas estáticas, artigos, categorias,
 * coleções e rankings; as demais levam só jogos do registro.
 *
 * Custo: 1 leitura (meta do índice) aqui, e cada partição lê apenas os chunks que cobrem a
 * sua faixa. Nenhuma varredura de coleção.
 */
export async function generateSitemaps() {
  const { entryCount } = await readSitemapMeta();
  const gameTotal = Math.min(entryCount, REGISTRY_GAME_LIMIT);
  // Partição 0 já carrega o conteúdo fixo; reserva-se espaço para ele.
  const partitions = Math.max(1, Math.ceil(gameTotal / URLS_PER_SITEMAP));
  return Array.from({ length: partitions }, (_, id) => ({ id }));
}

export default async function sitemap({
  id = 0,
}: { id?: number } = {}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";
  const lastModified = new Date();

  // 1. Rotas Estáticas Principais
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/calendar`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rankings`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/categorias`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/colecoes`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/planos`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/artigos`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/indies`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/indies/cadastrar`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/sobre`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/termos`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacidade`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // 2. Rotas Dinâmicas de Artigos e Guias Editoriais
  const allArticles = await getCombinedArticles();
  const articlePages: MetadataRoute.Sitemap = allArticles.map((art) => ({
    url: `${baseUrl}/artigos/${art.slug}`,
    lastModified: new Date(art.updatedAt || art.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Rotas Dinâmicas de Categorias
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES_DATA.map((cat) => ({
    url: `${baseUrl}/categorias/${cat.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Rotas Dinâmicas de Coleções
  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS_DATA.map((col) => ({
    url: `${baseUrl}/colecoes/${col.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Rotas Dinâmicas dos Jogos Mais Populares e Recentes (com slug semântico)
  let gamePages: MetadataRoute.Sitemap = [];
  try {
    const [popularGames, recentGames] = await Promise.all([
      getRankingsIGDB("popular", 40).catch(() => []),
      getRecentReleasesIGDB(20).catch(() => []),
    ]);

    const combinedGames = [...popularGames, ...recentGames];
    const uniqueGames = new Map<number, { id: number; slug: string; name: string }>();

    combinedGames.forEach((g) => {
      if (g && g.id && !uniqueGames.has(g.id)) {
        uniqueGames.set(g.id, { id: g.id, slug: g.slug || slugify(g.name || String(g.id)), name: g.name });
      }
    });

    // Se a API não responder no momento do build, garante os títulos consagrados
    if (uniqueGames.size === 0) {
      POPULAR_FALLBACK_IDS.forEach((id) => uniqueGames.set(id, { id, slug: String(id), name: String(id) }));
    }

    gamePages = Array.from(uniqueGames.values()).map((g) => ({
      // Usa getGameUrl para gerar o MESMO slug canônico da página (evita URLs do sitemap
      // que redirecionam / divergem da canônica).
      url: `${baseUrl}${getGameUrl({ id: g.id, name: g.name, slug: g.slug })}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  } catch {
    gamePages = POPULAR_FALLBACK_IDS.map((id) => ({
      url: `${baseUrl}/game/${id}`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    }));
  }

  // 5. Páginas de jogos já registradas (todo jogo cuja página renderizou e ganhou
  // tradução PT-BR). É o que faz o catálogo real aparecer no sitemap, e não apenas os
  // ~60 títulos de rankings acima. Falha aqui nunca derruba o sitemap.
  const gameOffset = id * URLS_PER_SITEMAP;
  const gameCount = Math.min(URLS_PER_SITEMAP, Math.max(0, REGISTRY_GAME_LIMIT - gameOffset));

  const registryPages: MetadataRoute.Sitemap = (
    await getRegisteredGamePages({ offset: gameOffset, limit: gameCount, direction: "desc" })
  ).map((page) => {
    // Um `updatedAt` corrompido geraria Invalid Date e quebraria a serialização do
    // sitemap inteiro — na dúvida, usa a data da geração.
    const parsed = page.updatedAt ? new Date(page.updatedAt) : null;
    return {
      url: `${baseUrl}${page.path}`,
      lastModified: parsed && !Number.isNaN(parsed.getTime()) ? parsed : lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    };
  });

  // Dedupe por URL — um jogo popular também está no registro. A primeira ocorrência
  // vence, então rankings (priority 0.7) têm precedência sobre o registro (0.6).
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();
  // Conteúdo fixo só na partição 0 — repeti-lo em todas duplicaria URL entre arquivos,
  // o que o Google trata como erro de sitemap.
  const fixedPages = id === 0
    ? [...staticPages, ...articlePages, ...categoryPages, ...collectionPages, ...gamePages]
    : [];

  for (const entry of [...fixedPages, ...registryPages]) {
    if (!byUrl.has(entry.url)) byUrl.set(entry.url, entry);
  }

  return Array.from(byUrl.values());
}
