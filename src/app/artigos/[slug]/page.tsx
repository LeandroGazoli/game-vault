import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug, ARTICLES_DATA } from "@/lib/articlesData";
import JsonLd from "@/components/seo/JsonLd";
import AdBanner from "@/components/ads/AdBanner";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Sparkles,
  Quote,
  Lightbulb,
  Gamepad2,
  Share2,
  Trophy,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export async function generateStaticParams() {
  return ARTICLES_DATA.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    return {
      title: "Artigo não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${SITE_URL}/artigos/${slug}`;

  return {
    title: `${article.title} • MyGameList Editorial`,
    description: article.excerpt,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonicalUrl,
      siteName: "MyGameList",
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      tags: article.tags,
      images: [
        {
          url: article.coverImage,
          width: 1200,
          height: 630,
          alt: article.coverAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt,
      images: [article.coverImage],
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/artigos/${slug}`;
  const formattedDate = new Date(article.publishedAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      "@type": "Person",
      name: article.author.name,
      jobTitle: article.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: "MyGameList",
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo-mgl.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Artigos", item: `${SITE_URL}/artigos` },
      { "@type": "ListItem", position: 3, name: article.title, item: canonicalUrl },
    ],
  };

  return (
    <>
      <JsonLd data={[articleSchema, breadcrumbSchema]} />
      <article className="max-w-4xl mx-auto space-y-8 py-6 px-4">
        {/* Navegação Voltar */}
        <Link
          href="/artigos"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Artigos &amp; Guias
        </Link>

        {/* Header do Artigo */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase tracking-wider font-mono">
              {article.categoryLabel}
            </span>
            <span className="text-gray-500">•</span>
            <span className="flex items-center gap-1 text-gray-400 font-mono">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              {formattedDate}
            </span>
            <span className="text-gray-500">•</span>
            <span className="flex items-center gap-1 text-gray-400 font-mono">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {article.readTimeMinutes} min de leitura
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
            {article.title}
          </h1>

          <p className="text-sm sm:text-lg text-gray-300 leading-relaxed font-normal">
            {article.subtitle}
          </p>

          {/* Card do Autor */}
          <div className="flex items-center gap-3 pt-3 border-t border-white/10">
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className="w-10 h-10 rounded-full border border-white/20 object-cover"
            />
            <div>
              <p className="text-xs font-bold text-white">{article.author.name}</p>
              <p className="text-[11px] text-gray-400">{article.author.role}</p>
            </div>
          </div>
        </header>

        {/* Imagem de Capa */}
        <div className="relative rounded-3xl overflow-hidden border border-white/10 aspect-video bg-neutral-900 shadow-2xl">
          <img
            src={article.coverImage}
            alt={article.coverAlt}
            className="w-full h-full object-cover filter brightness-[0.9]"
          />
        </div>

        {/* Conteúdo Principal do Artigo */}
        <div className="prose prose-invert max-w-none space-y-8 text-sm sm:text-base text-gray-300 leading-relaxed">
          {article.sections.map((section, idx) => (
            <section key={idx} className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight border-b border-white/10 pb-2">
                {section.heading}
              </h2>

              {section.content.map((paragraph, pIdx) => (
                <p key={pIdx} className="text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
              ))}

              {section.callout && (
                <div className="my-6 p-5 rounded-2xl bg-[#141822] border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
                  {section.callout.type === "quote" ? (
                    <Quote className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <p className="italic">{section.callout.text}</p>
                </div>
              )}
            </section>
          ))}
        </div>

        {/* Banner de Anúncio In-Content (Respeitando conformidade AdSense de texto denso) */}
        <div className="pt-4">
          <AdBanner slot="GAME_DETAIL_IN_CONTENT" />
        </div>

        {/* Jogos Relacionados */}
        {article.relatedGames && article.relatedGames.length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-[#141822] p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
              Jogos Mencionados no Artigo
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {article.relatedGames.map((game) => (
                <Link
                  key={game.id}
                  href={`/game/${game.id}/${game.slug}`}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/5 border border-white/5 hover:border-emerald-500/40 transition-colors group"
                >
                  <img
                    src={game.coverImage}
                    alt={game.name}
                    className="w-12 h-16 rounded-xl object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white group-hover:text-emerald-400 truncate">
                      {game.name}
                    </p>
                    {game.metacritic && (
                      <span className="text-[10px] font-mono text-amber-400">
                        Metacritic: {game.metacritic}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  );
}
