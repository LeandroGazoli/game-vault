export interface ArticleAuthor {
  name: string;
  role: string;
  avatar: string;
  bio: string;
}

export interface ArticleSection {
  heading: string;
  content: string[];
  callout?: {
    type: "tip" | "info" | "quote";
    text: string;
  };
}

export interface RelatedGameRef {
  id: number;
  name: string;
  slug: string;
  coverImage: string;
  metacritic?: number;
  hltbMain?: number;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  category: "guias" | "analises" | "listas" | "especiais" | "industria";
  categoryLabel: string;
  readTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
  coverImage: string;
  coverAlt: string;
  author: ArticleAuthor;
  tags: string[];
  featured?: boolean;
  sections: ArticleSection[];
  relatedGames?: RelatedGameRef[];
}
