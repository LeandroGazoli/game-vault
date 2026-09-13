import { Article } from "./types/article.types";

/**
 * Fallback estático mínimo caso o Firestore esteja em manutenção temporária.
 * Todos os 32 artigos oficiais e novas publicações vivem dinamicamente no Firestore (coleção 'articles').
 */
export const ARTICLES_DATA: Article[] = [
  {
    id: "art-1",
    slug: "melhores-jogos-rpg-2026",
    title: "Os Melhores Jogos de RPG da Atualidade: Duração, Narrativa e Notas",
    subtitle: "Uma análise aprofundada dos RPGs mais aclamados pela crítica e como escolher sua próxima jornada épica.",
    excerpt: "Dos combates estratégicos por turnos aos mundos abertos implacáveis, confira nossa seleção definitiva de RPGs, tempos médios para zerar e diferenciais de cada obra-prima.",
    category: "guias",
    categoryLabel: "Guia Completo",
    readTimeMinutes: 7,
    publishedAt: "2026-09-10T10:00:00.000Z",
    updatedAt: "2026-09-12T14:30:00.000Z",
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg",
    coverAlt: "Baldur's Gate 3 - Personagens e arte conceitual",
    featured: true,
    author: {
      name: "Leandro Gazoli",
      role: "Editor-Chefe & Fundador do MyGameList",
      avatar: "/logo-mgl.png",
      bio: "Entusiasta de RPGs ocidentais e orientais, colecionador de jogos e arquiteto de software gamer.",
    },
    tags: ["RPG", "Baldur's Gate 3", "Elden Ring", "The Witcher 3", "Metacritic", "HowLongToBeat"],
    sections: [
      {
        heading: "A Renascença dos RPGs no Cenário Moderno",
        content: [
          "O gênero de RPG (Role-Playing Game) atingiu um nível de maturidade sem precedentes. O que antes era considerado um nicho técnico com tabelas matemáticas complexas tornou-se a vanguarda das experiências imersivas nos videogames.",
        ],
      },
    ],
  },
];

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES_DATA.find((a) => a.slug === slug);
}

export function getAllArticles(): Article[] {
  return ARTICLES_DATA;
}

export function getFeaturedArticles(): Article[] {
  return ARTICLES_DATA.filter((a) => a.featured);
}
