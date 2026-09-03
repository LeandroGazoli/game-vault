import type { Metadata } from "next";
import { getCategoryBySlug } from "@/lib/categoriesData";
import CategoryDetailClient from "./CategoryDetailClient";
import JsonLd from "@/components/seo/JsonLd";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Categoria não encontrada",
      description: "A categoria selecionada não foi encontrada no acervo do GameVault.",
      robots: { index: false, follow: false },
    };
  }

  const title = `Jogos de ${category.name}`;
  const description = `${category.description} Explore os melhores títulos de ${category.name}, lançamentos, notas do Metacritic e tempos de zeramento no GameVault.`;
  const canonicalUrl = `${SITE_URL}/categorias/${slug}`;

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
      siteName: "GameVault",
      type: "website",
      images: [
        {
          url: category.coverImage,
          width: 1200,
          height: 630,
          alt: `Jogos da categoria ${category.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [category.coverImage],
      creator: "@gamevault",
    },
  };
}

export default async function CategoryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  const structuredData = category
    ? [
        {
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Jogos de ${category.name}`,
          description: category.description,
          url: `${SITE_URL}/categorias/${slug}`,
          image: category.coverImage,
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
              name: "Categorias",
              item: `${SITE_URL}/categorias`,
            },
            {
              "@type": "ListItem",
              position: 3,
              name: category.name,
              item: `${SITE_URL}/categorias/${slug}`,
            },
          ],
        },
      ]
    : [];

  return (
    <>
      {structuredData.length > 0 && <JsonLd data={structuredData} />}
      <CategoryDetailClient slug={slug} />
    </>
  );
}
