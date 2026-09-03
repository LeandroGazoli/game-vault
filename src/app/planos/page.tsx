import type { Metadata } from "next";
import PlanosClient from "./PlanosClient";
import JsonLd from "@/components/seo/JsonLd";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const metadata: Metadata = {
  title: "Planos PRO & VIP Fundador",
  description:
    "Evolua sua experiência no GameVault com os planos PRO e VIP Fundador. Insígnias exclusivas, temas personalizados, sem anúncios e suporte à comunidade gamer.",
  alternates: {
    canonical: "/planos",
  },
  openGraph: {
    title: "Planos PRO & VIP Fundador | GameVault",
    description:
      "Desbloqueie personalização avançada, insígnias, temas exclusivos e apoie o acervo GameVault.",
    url: `${SITE_URL}/planos`,
    siteName: "GameVault",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Planos GameVault PRO & VIP",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Planos PRO & VIP Fundador | GameVault",
    description: "Desbloqueie personalização avançada, insígnias e temas exclusivos no GameVault.",
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
        name: "Planos e Assinaturas",
        item: `${SITE_URL}/planos`,
      },
    ],
  },
];

export default function PlanosPage() {
  return (
    <>
      <JsonLd data={structuredData} />
      <PlanosClient />
    </>
  );
}
