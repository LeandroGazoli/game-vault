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
