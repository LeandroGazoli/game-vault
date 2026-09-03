import type { Metadata } from "next";
import ProfilePage from "../page";
import JsonLd from "@/components/seo/JsonLd";
import { getProfileUrl } from "@/lib/routes";
import { getUserProfileByUsername } from "@/lib/firebase";

interface PageProps {
  params: Promise<{ username: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username);
  const targetUser = await getUserProfileByUsername(cleanUsername);

  const displayName = targetUser?.displayName || cleanUsername;
  const isVip = targetUser?.plan === "vip";
  const isPro = targetUser?.plan === "pro";
  const planTag = isVip ? "👑 VIP" : isPro ? "⚡ PRO" : "";
  const title = `${displayName} (@${cleanUsername}) ${planTag} • Perfil Gamer no MyGameList`;

  const bio = targetUser?.bio || "";
  const favGame = targetUser?.favoriteGame ? `🎮 Jogo Favorito: ${targetUser.favoriteGame}` : "";
  const titles = targetUser?.customTitles && targetUser.customTitles.length > 0
    ? `🏆 ${targetUser.customTitles.join(" • ")}`
    : targetUser?.customTitle ? `🏆 ${targetUser.customTitle}` : "";

  const descriptionParts = [
    bio,
    favGame,
    titles,
    `Confira a biblioteca de jogos, conquistas e backlog de ${displayName} no MyGameList.`
  ].filter(Boolean);

  const description = descriptionParts.join(" | ");
  const ogImage = targetUser?.bannerURL || targetUser?.photoURL || "/og-image.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: getProfileUrl(cleanUsername),
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${getProfileUrl(cleanUsername)}`,
      siteName: "MyGameList",
      type: "profile",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `Perfil de ${displayName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { username } = await params;
  const cleanUsername = decodeURIComponent(username);
  const targetUser = await getUserProfileByUsername(cleanUsername);

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      mainEntity: {
        "@type": "Person",
        name: targetUser?.displayName || cleanUsername,
        alternateName: cleanUsername,
        url: `${SITE_URL}${getProfileUrl(cleanUsername)}`,
        ...(targetUser?.photoURL ? { image: targetUser.photoURL } : {}),
        ...(targetUser?.bio ? { description: targetUser.bio } : {}),
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
          name: targetUser?.displayName || cleanUsername,
          item: `${SITE_URL}${getProfileUrl(cleanUsername)}`,
        },
      ],
    },
  ];

  return (
    <>
      <JsonLd data={structuredData} />
      <ProfilePage targetUsername={cleanUsername} />
    </>
  );
}
