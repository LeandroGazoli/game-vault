import { MetadataRoute } from "next";
import { CATEGORIES_DATA } from "@/lib/categoriesData";
import { COLLECTIONS_DATA } from "@/lib/collectionsData";
import { getRankingsIGDB, getRecentReleasesIGDB } from "@/lib/igdbApi";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  // 2. Rotas Dinâmicas de Categorias
  const categoryPages: MetadataRoute.Sitemap = CATEGORIES_DATA.map((cat) => ({
    url: `${baseUrl}/categorias/${cat.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 3. Rotas Dinâmicas de Coleções
  const collectionPages: MetadataRoute.Sitemap = COLLECTIONS_DATA.map((col) => ({
    url: `${baseUrl}/colecoes/${col.slug}`,
    lastModified,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // 4. Rotas Dinâmicas dos Jogos Mais Populares e Recentes
  let gamePages: MetadataRoute.Sitemap = [];
  try {
    const [popularGames, recentGames] = await Promise.all([
      getRankingsIGDB("popular", 40).catch(() => []),
      getRecentReleasesIGDB(20).catch(() => []),
    ]);

    const combinedGames = [...popularGames, ...recentGames];
    const uniqueIds = new Set<number>();

    combinedGames.forEach((g) => {
      if (g && g.id) uniqueIds.add(g.id);
    });

    // Se a API não responder no momento do build, garante os títulos consagrados
    if (uniqueIds.size === 0) {
      POPULAR_FALLBACK_IDS.forEach((id) => uniqueIds.add(id));
    }

    gamePages = Array.from(uniqueIds).map((id) => ({
      url: `${baseUrl}/game/${id}`,
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

  return [...staticPages, ...categoryPages, ...collectionPages, ...gamePages];
}
