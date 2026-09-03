import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getGameDetailsIGDB } from "@/lib/igdbApi";
import { getGameUrl } from "@/lib/routes";

interface PageProps {
  params: Promise<{ id: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const game = await getGameDetailsIGDB(id).catch(() => null);

  if (!game) {
    return {
      title: "Jogo não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const canonicalUrl = `${SITE_URL}${getGameUrl(game)}`;

  return {
    title: `${game.name} - Avaliação, Duração & Detalhes`,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function GameRedirectPage({ params }: PageProps) {
  const { id } = await params;
  const game = await getGameDetailsIGDB(id).catch(() => null);

  if (!game) {
    notFound();
  }

  // Redirecionamento 301 Permanente para a URL canônica com slug semântico
  permanentRedirect(getGameUrl(game));
}
