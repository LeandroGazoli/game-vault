import type { Metadata } from "next";
import SearchClient from "./SearchClient";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Buscar Jogos no Acervo | Catálogo GameVault",
  description:
    "Pesquise milhares de jogos por título, gênero ou plataforma. Encontre notas do Metacritic, tempos do HowLongToBeat e informações completas para PC, PlayStation, Xbox e Nintendo Switch.",
  alternates: {
    canonical: "/search",
  },
  openGraph: {
    title: "Buscar Jogos no Acervo | Catálogo GameVault",
    description:
      "Pesquise milhares de jogos por título, gênero ou plataforma com notas, tempos de zeramento e detalhes técnicos.",
    url: `${SITE_URL}/search`,
    siteName: "GameVault",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Buscar Jogos • GameVault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Buscar Jogos no Acervo | Catálogo GameVault",
    description: "Pesquise milhares de jogos por título, gênero ou plataforma no GameVault.",
    images: ["/og-image.jpg"],
  },
};

const structuredData = [
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
        name: "Busca de Jogos",
        item: `${SITE_URL}/search`,
      },
    ],
  },
];

export default function SearchPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <SearchClient />
    </>
  );
}
