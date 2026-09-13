import { Article } from "./types/article.types";
import { ARTICLES_BATCH_1 } from "./articles/articlesBatch1";
import { ARTICLES_BATCH_2 } from "./articles/articlesBatch2";
import { ARTICLES_BATCH_3 } from "./articles/articlesBatch3";
import { ARTICLES_BATCH_4 } from "./articles/articlesBatch4";

/**
 * Acervo editorial completo do MyGameList.
 * Organizado de forma modular para conformidade de complexidade e aprovação AdSense (30+ artigos).
 */
export const ARTICLES_DATA: Article[] = [
  ...ARTICLES_BATCH_1,
  ...ARTICLES_BATCH_2,
  ...ARTICLES_BATCH_3,
  ...ARTICLES_BATCH_4,
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
