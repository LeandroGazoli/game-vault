import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getGameDetailsApi } from "@/lib/gameApi";
import { IgdbIndisponivelError } from "@/lib/igdbApi";
import GameDetailClient from "../GameDetailClient";
import JsonLd from "@/components/seo/JsonLd";
import { getGameUrl, slugify } from "@/lib/routes";

interface PageProps {
  params: Promise<{ id: string; slug: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mygameslist.com.br";

export const revalidate = 86400; // ISR: 24 horas em cache na CDN Edge

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id, slug } = await params;
  const game = await getGameDetailsApi(id, slug).catch(() => null);

  if (!game) {
    return {
      title: "Jogo não encontrado",
      description: "As informações deste título não foram encontradas no acervo do MyGameList.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${game.name} - Avaliação, Duração & Detalhes`;
  const cleanDescription = game.description_raw
    ? game.description_raw.slice(0, 160).replace(/\s+/g, " ").trim() + "..."
    : `Confira notas do Metacritic, tempo de conclusão no HowLongToBeat, plataformas e ficha técnica de ${game.name} no MyGameList.`;

  const coverImage =
    game.backdrop_image ||
    (game.artworks && game.artworks[0]) ||
    (game.screenshots && game.screenshots[0]) ||
    game.background_image ||
    `${SITE_URL}/og-image.jpg`;
  const canonicalUrl = `${SITE_URL}${getGameUrl(game)}`;

  return {
    title,
    description: cleanDescription,
    alternates: {
      canonical: canonicalUrl,
      types: {
        "text/markdown": canonicalUrl,
      },
    },
    openGraph: {
      title: `${title} | MyGameList`,
      description: cleanDescription,
      url: canonicalUrl,
      type: "website",
      images: [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: `${game.name} - Capa Oficial`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | MyGameList`,
      description: cleanDescription,
      images: [coverImage],
    },
  };
}

/**
 * Mostrado quando a base do IGDB não respondeu. Deliberadamente NÃO chama `notFound()`:
 * a ficha existe, só não deu para carregar agora, e um 404 aqui tiraria a página do índice
 * do Google por um problema passageiro.
 */
function FichaIndisponivel() {
  return (
    <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
      <h1 className="text-2xl font-black text-white">Ficha temporariamente indisponível</h1>
      <p className="text-sm text-gray-400">
        Não conseguimos carregar os dados deste jogo agora. É uma falha momentânea da nossa
        base de dados, não um jogo removido — tente recarregar em instantes.
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

export default async function GameSlugPage({ params }: PageProps) {
  const { id, slug } = await params;
  // Três desfechos possíveis, e cada um merece resposta diferente:
  //
  //   jogo existe        → renderiza
  //   IGDB diz que não   → notFound(), que é a verdade
  //   IGDB indisponível  → aviso de instabilidade, NUNCA 404 e NUNCA exceção
  //
  // O último caso já foi tratado das duas formas erradas. Engolir o erro (`.catch(() => null)`)
  // transformava instabilidade em "Página Não Encontrada" numa URL do nosso sitemap — convite
  // para o Google desindexar. Deixar a exceção subir derrubava a página inteira com "erro na
  // aplicação", o que é pior ainda para quem está lendo.
  let game: Awaited<ReturnType<typeof getGameDetailsApi>> = null;
  try {
    game = await getGameDetailsApi(id, slug);
  } catch (erro) {
    if (erro instanceof IgdbIndisponivelError) {
      console.error(`[game/${id}] IGDB indisponível — servindo aviso em vez de 404:`, erro.message);
      return <FichaIndisponivel />;
    }
    throw erro;
  }

  if (!game) {
    // Rede de segurança: verifica se é um jogo indie cadastrado na plataforma
    let indieRedirectUrl: string | null = null;
    try {
      const { fetchIndieBySlugServer } = await import("@/lib/serverData");
      const indie = await fetchIndieBySlugServer(slug);
      if (indie) {
        indieRedirectUrl = `/indies/${indie.slug || indie.id}`;
      }
    } catch {}

    if (indieRedirectUrl) {
      permanentRedirect(indieRedirectUrl);
    }

    notFound();
  }

  // 301 Permanent Redirect se o ID ou slug na URL divergir do canônico oficial (getGameUrl).
  // Ex: se veio de importação com ID sintético (/game/16256624/elden-ring),
  // redireciona automaticamente para o ID canônico oficial (/game/119133/elden-ring).
  const canonicalPath = getGameUrl(game);
  let decodedSlug = slug;
  try {
    decodedSlug = decodeURIComponent(slug);
  } catch {}
  const normalizedCurrentPath = `/game/${id}/${slugify(decodedSlug)}`;

  if (normalizedCurrentPath !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  const canonicalUrl = `${SITE_URL}${canonicalPath}`;

  const videoGameSchema = {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    name: game.name,
    description: game.description_raw || `Ficha técnica completa de ${game.name}.`,
    image: game.background_image || undefined,
    url: canonicalUrl,
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
            ratingCount: 1,
          },
        }
      : {}),
    ...(game.developers && game.developers.length > 0
      ? {
          author: game.developers.map((name) => ({ "@type": "Organization", name })),
        }
      : {}),
    ...(game.publishers && game.publishers.length > 0
      ? {
          publisher: game.publishers.map((name) => ({ "@type": "Organization", name })),
        }
      : {}),
  };

  const breadcrumbSchema = {
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
        name: "Catálogo de Jogos",
        item: `${SITE_URL}/search`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: game.name,
        item: canonicalUrl,
      },
    ],
  };

  return (
    <>
      <JsonLd data={[videoGameSchema, breadcrumbSchema]} />
      <GameDetailClient id={id} initialGame={game} />
    </>
  );
}
