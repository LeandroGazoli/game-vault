import type { Metadata } from "next";
import ProfilePage from "../page";
import JsonLd from "@/components/seo/JsonLd";
import { getProfileUrl } from "@/lib/routes";

interface PageProps {
  params: Promise<{ username: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username);

  return {
    title: `${cleanUsername} - Perfil Gamer & Backlog`,
    description: `Confira o perfil e a biblioteca gamer de ${cleanUsername} no GameVault. Jogos zerados, lista de desejos e estatísticas de gameplay.`,
    alternates: {
      canonical: getProfileUrl(cleanUsername),
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `${cleanUsername} • Perfil Gamer no GameVault`,
      description: `Confira os jogos zerados, backlog e estatísticas de ${cleanUsername}.`,
      url: `${SITE_URL}${getProfileUrl(cleanUsername)}`,
      siteName: "GameVault",
      type: "profile",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Perfil de ${cleanUsername}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${cleanUsername} • Perfil Gamer no GameVault`,
      description: `Confira os jogos zerados, backlog e estatísticas de ${cleanUsername}.`,
      images: ["/og-image.jpg"],
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: cleanUsername,
        url: `${SITE_URL}${getProfileUrl(cleanUsername)}`,
      },
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
          name: "Perfis",
          item: `${SITE_URL}/rankings`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: cleanUsername,
          item: `${SITE_URL}${getProfileUrl(cleanUsername)}`,
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <ProfilePage />
    </>
  );
}
