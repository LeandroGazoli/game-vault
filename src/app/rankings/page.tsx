import type { Metadata } from "next";
import RankingsSection from "@/components/RankingsSection";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Rankings dos Melhores Jogos da História & Comunidade",
  description:
    "Descubra os jogos mais bem avaliados de todos os tempos, mais populares e hypados pela comunidade gamer com notas oficiais do Metacritic e tempos do HowLongToBeat.",
  alternates: {
    canonical: "/rankings",
  },
  openGraph: {
    title: "Rankings dos Melhores Jogos da História & Comunidade | GameVault",
    description:
      "Confira a lista definitiva dos melhores jogos avaliados com nota máxima e aclamação crítica.",
    url: `${SITE_URL}/rankings`,
    siteName: "GameVault",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Rankings de Jogos • GameVault",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rankings dos Melhores Jogos da História & Comunidade | GameVault",
    description: "Os melhores jogos da história reunidos em rankings dinâmicos e notas do Metacritic.",
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
        name: "Rankings",
        item: `${SITE_URL}/rankings`,
      },
    ],
  },
];

export default function RankingsPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <div className="py-2 space-y-6">
        <RankingsSection />
      </div>
    </>
  );
}
