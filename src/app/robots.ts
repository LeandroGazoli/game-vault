import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

// Lista explícita de bots de IA e scrapers de treinamento a serem bloqueados nas áreas administrativas e privadas
const AI_CRAWLER_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "Google-Extended",
  "Claude-Web",
  "anthropic-ai",
  "ClaudeBot",
  "CCBot",
  "PerplexityBot",
  "Bytespider",
  "FacebookBot",
  "meta-externalagent",
  "Amazonbot",
  "cohere-ai",
  "Omgilibot",
];

export default function robots(): MetadataRoute.Robots {
  const aiRules = AI_CRAWLER_BOTS.map((bot) => ({
    userAgent: bot,
    disallow: [
      "/admin",
      "/admin/",
      "/api/admin/",
      "/api/",
      "/perfil",
      "/perfil/",
      "/profile",
      "/profile/",
    ],
  }));

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/admin/",
          "/perfil$",
          "/profile",
          "/profile/",
        ],
      },
      ...aiRules,
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
