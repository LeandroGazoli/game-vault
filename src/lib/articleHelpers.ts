import { ArticleSection } from "@/lib/types/article.types";

export function generateArticleSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function convertSectionsToHtml(sections: ArticleSection[]): string {
  if (!sections || sections.length === 0) return "";
  return sections
    .map((sec) => {
      const headingHtml = sec.heading ? `<h2>${sec.heading}</h2>` : "";
      const contentHtml = sec.content
        ? sec.content.map((p) => `<p>${p}</p>`).join("")
        : "";
      const calloutHtml = sec.callout
        ? `<blockquote><p>${sec.callout.text}</p></blockquote>`
        : "";
      return `${headingHtml}${contentHtml}${calloutHtml}`;
    })
    .join("");
}

export function buildArticlePayload(params: {
  initialArticle?: import("@/lib/types/article.types").Article | null;
  title: string;
  subtitle: string;
  slug: string;
  excerpt: string;
  category: import("@/lib/types/article.types").Article["category"];
  categoryLabel?: string;
  readTimeMinutes: number;
  coverImage: string;
  featured: boolean;
  tagsInput: string;
  contentHtml: string;
  sections: import("@/lib/types/article.types").ArticleSection[];
  currentAdminName?: string;
}): import("@/lib/types/article.types").Article {
  const {
    initialArticle,
    title,
    subtitle,
    slug,
    excerpt,
    category,
    categoryLabel,
    readTimeMinutes,
    coverImage,
    featured,
    tagsInput,
    contentHtml,
    sections,
    currentAdminName,
  } = params;

  const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);

  return {
    id: initialArticle?.id || `art-${Date.now()}`,
    slug: slug.trim(),
    title: title.trim(),
    subtitle: subtitle.trim(),
    excerpt: excerpt.trim(),
    category,
    categoryLabel: categoryLabel || "Guia",
    readTimeMinutes: Number(readTimeMinutes) || 5,
    publishedAt: initialArticle?.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    coverImage: coverImage.trim() || "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg",
    coverAlt: `${title} - Imagem de Capa`,
    featured,
    tags,
    author: initialArticle?.author || {
      name: currentAdminName || "Equipe Editorial MyGameList",
      role: "Editor Gamer",
      avatar: "/logo-mgl.png",
      bio: "Redação de guias, análises e curadoria de dados da plataforma.",
    },
    contentHtml,
    sections: sections.length > 0 ? sections : [{ heading: "Artigo", content: [excerpt] }],
  };
}

export function parseSteamNewsToArticleData(imported: {
  title: string;
  subtitle: string;
  excerpt: string;
  coverImage: string;
  tags: string[];
  content: string;
  sourceUrl: string;
}) {
  const paragraphsHtml = imported.content
    .split("\n\n")
    .map((p) => `<p>${p.trim()}</p>`)
    .join("");

  const contentHtml = `
    <h2>Visão Geral da Atualização</h2>
    <blockquote><p>Anúncio oficial importado via Steam News. <a href="${imported.sourceUrl}">Acesse o post original na Steam</a></p></blockquote>
    ${paragraphsHtml}
  `;

  return {
    title: imported.title,
    subtitle: imported.subtitle,
    slug: generateArticleSlug(imported.title),
    category: "industria" as const,
    excerpt: imported.excerpt,
    coverImage: imported.coverImage,
    tagsInput: imported.tags.join(", "),
    readTimeMinutes: 4,
    contentHtml,
  };
}

export function getInitialArticleFormData(initialArticle?: import("@/lib/types/article.types").Article | null) {
  if (initialArticle) {
    let content = "<p>Escreva o conteúdo do seu artigo aqui...</p>";
    if (initialArticle.contentHtml) {
      content = initialArticle.contentHtml;
    } else if (initialArticle.sections && initialArticle.sections.length > 0) {
      content = convertSectionsToHtml(initialArticle.sections);
    }

    return {
      title: initialArticle.title || "",
      subtitle: initialArticle.subtitle || "",
      slug: initialArticle.slug || "",
      category: initialArticle.category || ("guias" as const),
      readTimeMinutes: initialArticle.readTimeMinutes || 5,
      coverImage: initialArticle.coverImage || "",
      excerpt: initialArticle.excerpt || "",
      tagsInput: initialArticle.tags?.join(", ") || "",
      featured: Boolean(initialArticle.featured),
      sections: initialArticle.sections || [],
      contentHtml: content,
    };
  }

  return {
    title: "",
    subtitle: "",
    slug: "",
    category: "guias" as const,
    readTimeMinutes: 5,
    coverImage: "https://images.igdb.com/igdb/image/upload/t_1080p/co670h.jpg",
    excerpt: "",
    tagsInput: "Games, Análise, Backlog",
    featured: false,
    sections: [{ heading: "Introdução", content: [""] }],
    contentHtml: "<p>Escreva o conteúdo do seu artigo aqui...</p>",
  };
}
