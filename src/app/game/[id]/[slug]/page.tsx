import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getGameDetailsIGDB } from "@/lib/igdbApi";
import GameDetailClient from "../GameDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import { getGameUrl } from "@/lib/routes";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, slug } = await params;
  const game = await getGameDetailsIGDB(id).catch(() => null);

  if (!game) {
    return {
      title: "Jogo não encontrado",
      description: "As informações deste título não foram encontradas no acervo do GameVault.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${game.name} - Avaliação, Duração & Detalhes`;
  const cleanDescription = game.description_raw
    ? game.description_raw.slice(0, 160).replace(/\s+/g, " ").trim() + "..."
    : `Confira notas do Metacritic, tempo de conclusão no HowLongToBeat, plataformas e ficha técnica de ${game.name} no GameVault.`;

  const coverImage = game.background_image || (game.screenshots && game.screenshots[0]) || `${SITE_URL}/og-image.jpg`;
  const canonicalUrl = `${SITE_URL}${getGameUrl(game)}`;

  return {
    title,
    description: cleanDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | GameVault`,
      description: cleanDescription,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: `${game.name} - Capa Oficial`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | GameVault`,
      description: cleanDescription,
      images: [coverImage],
    },
  };
}

export default async function GameSlugPage({ params }: PageProps) {
  const { id, slug } = await params;
  const game = await getGameDetailsIGDB(id).catch(() => null);

  if (!game) {
    notFound();
  }

  // 301 Permanent Redirect se o slug na URL estiver desatualizado ou incorreto
  if (game.slug && slug !== game.slug) {
    permanentRedirect(getGameUrl(game));
  }

  const canonicalUrl = `${SITE_URL}${getGameUrl(game)}`;

  const videoGameSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description: game.description_raw || `Ficha técnica completa de ${game.name}.`,
    image: game.background_image || undefined,
    url: canonicalUrl,
    datePublished: game.released || undefined,
    genre: game.genres?.map((g) => g.name) || [],
    gamePlatform: game.platforms?.map((p) => p.platform?.name).filter(Boolean) || [],
    ...(game.metacritic
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: game.metacritic,
            bestRating: 100,
            worstRating: 0,
            ratingCount: 1,
          },
        }
      : {}),
    ...(game.developers && game.developers.length > 0
      ? {
          author: game.developers.map((name) => ({ "@type": "Organization", name })),
        }
      : {}),
    ...(game.publishers && game.publishers.length > 0
      ? {
          publisher: game.publishers.map((name) => ({ "@type": "Organization", name })),
        }
      : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Início",
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Catálogo de Jogos",
        item: `${SITE_URL}/search`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: game.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[videoGameSchema, breadcrumbSchema]} />
      <GameDetailClient id={id} initialGame={game} />
    </>
  );
}
