import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getGameDetailsApi } from "@/lib/gameApi";
import { IgdbIndisponivelError } from "@/lib/igdbApi";
import { getGameUrl } from "@/lib/routes";

interface PageProps {
  params: Promise<{ id: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const fallbackSlug = isNaN(Number(id)) || Number(id) >= 9000000 ? id : undefined;
  const game = await getGameDetailsApi(id, fallbackSlug).catch(() => null);

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
  const fallbackSlug = isNaN(Number(id)) || Number(id) >= 9000000 ? id : undefined;

  let game: Awaited<ReturnType<typeof getGameDetailsApi>> = null;
  try {
    game = await getGameDetailsApi(id, fallbackSlug);
  } catch (erro) {
    if (erro instanceof IgdbIndisponivelError) {
      return (
        <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
          <h1 className="text-2xl font-black text-white">Ficha temporariamente indisponível</h1>
          <p className="text-sm text-gray-400">
            Não conseguimos carregar os dados deste jogo agora. Tente recarregar em instantes.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black"
          >
            Voltar ao catálogo
          </Link>
        </div>
      );
    }
    throw erro;
  }

  if (!game) {
    // Rede de segurança: verifica se é um jogo indie cadastrado na plataforma
    let indieRedirectUrl: string | null = null;
    try {
      const { fetchIndieBySlugServer } = await import("@/lib/serverData");
      const indie = await fetchIndieBySlugServer(id);
      if (indie) {
        indieRedirectUrl = `/indies/${indie.slug || indie.id}`;
      }
    } catch {}

    if (indieRedirectUrl) {
      permanentRedirect(indieRedirectUrl);
    }

    notFound();
  }

  // Redirecionamento 301 Permanente para a URL canônica com slug semântico
  permanentRedirect(getGameUrl(game));
}
