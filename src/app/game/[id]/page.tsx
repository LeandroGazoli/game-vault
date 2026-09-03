import type { Metadata } from "next";
import { getGameDetailsIGDB } from "@/lib/igdbApi";
import GameDetailClient from "./GameDetailClient";
import JsonLd from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ id: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const game = await getGameDetailsIGDB(id).catch(() => null);

  if (!game) {
    return {
      title: "Jogo não encontrado | GameVault",
      description: "As informações deste título não foram encontradas no acervo do GameVault.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${game.name} - Avaliação, Duração & Detalhes | GameVault`;
  const cleanDescription = game.description_raw
    ? game.description_raw.slice(0, 160).replace(/\s+/g, " ").trim() + "..."
    : `Confira notas do Metacritic, tempo de conclusão no HowLongToBeat, plataformas e ficha técnica de ${game.name} no GameVault.`;

  const coverImage = game.background_image || (game.screenshots && game.screenshots[0]) || `${SITE_URL}/og-image.jpg`;
  const canonicalUrl = `${SITE_URL}/game/${id}`;

  return {
    title,
    description: cleanDescription,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description: cleanDescription,
      url: canonicalUrl,
      siteName: "GameVault",
      type: "website",
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: `Capa oficial de ${game.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: cleanDescription,
      images: [coverImage],
      creator: "@gamevault",
    },
  };
}

export default async function GameDetailPage({ params }: PageProps) {
  const { id } = await params;
  const game = await getGameDetailsIGDB(id).catch(() => null);

  const coverImage =
    game?.background_image ||
    (game?.screenshots && game.screenshots[0]) ||
    `${SITE_URL}/og-image.jpg`;

  const structuredData = game
    ? [
        {
          "@context": "https://schema.org",
          "@type": "VideoGame",
          name: game.name,
          description: game.description_raw || `Informações e detalhes sobre o jogo ${game.name} no acervo GameVault.`,
          image: coverImage,
          url: `${SITE_URL}/game/${id}`,
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
                  ratingCount: 50,
                },
              }
            : {}),
          author: game.developers && game.developers.length > 0
            ? {
                "@type": "Organization",
                name: game.developers[0],
              }
            : undefined,
          publisher: game.publishers && game.publishers.length > 0
            ? {
                "@type": "Organization",
                name: game.publishers[0],
              }
            : undefined,
        },
        {
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
              name: "Catálogo",
              item: `${SITE_URL}/search`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: game.name,
              item: `${SITE_URL}/game/${id}`,
            },
          ],
        },
      ]
    : [];

  return (
    <>
      {structuredData.length > 0 && <JsonLd data={structuredData} />}
      <GameDetailClient initialGame={game} id={id} />
    </>
  );
}
