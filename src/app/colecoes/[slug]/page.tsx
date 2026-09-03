import type { Metadata } from "next";
import { getCollectionBySlug } from "@/lib/collectionsData";
import CollectionDetailClient from "./CollectionDetailClient";
import JsonLd from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Coleção não encontrada",
      description: "A coleção temática selecionada não foi encontrada no acervo do MyGameList.",
      robots: { index: false, follow: false },
    };
  }

  const title = collection.title;
  const description = `${collection.subtitle} ${collection.description}`;
  const canonicalUrl = `${SITE_URL}/colecoes/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: "MyGameList",
      type: "website",
      images: [
        {
          url: collection.coverImage,
          width: 1200,
          height: 630,
          alt: collection.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [collection.coverImage],
      creator: "@mygamelist",
    },
  };
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  const structuredData = collection
    ? [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: collection.title,
          description: collection.description,
          url: `${SITE_URL}/colecoes/${slug}`,
          image: collection.coverImage,
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
              name: "Coleções",
              item: `${SITE_URL}/colecoes`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: collection.title,
              item: `${SITE_URL}/colecoes/${slug}`,
            },
          ],
        },
      ]
    : [];

  return (
    <>
      {structuredData.length > 0 && <JsonLd data={structuredData} />}
      <CollectionDetailClient slug={slug} />
    </>
  );
}
