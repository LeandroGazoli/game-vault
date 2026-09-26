import { NextRequest, NextResponse } from "next/server";

// Domínios permitidos para proxy de imagem segura
const ALLOWED_HOSTS = [
  "images.igdb.com",
  "media.rawg.io",
  "lh3.googleusercontent.com",
  "avatars.steamstatic.com",
  "avatars.fastly.steamstatic.com",
  "community.cloudflare.steamstatic.com",
  "shared.cloudflare.steamstatic.com",
  "cdn.akamai.steamstatic.com",
  "media.steampowered.com",
  "steamcommunity-a.akamaihd.net",
  "howlongtobeat.com",
  "images.unsplash.com",
  "firebasestorage.googleapis.com",
];

const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("URL inválida", { status: 400 });
    }

    const parsed = new URL(imageUrl);
    if (parsed.protocol !== "https:") {
      return new NextResponse("Protocolo não permitido", { status: 400 });
    }
    const hostname = parsed.hostname.toLowerCase();

    const isAllowed = ALLOWED_HOSTS.some(
      (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`)
    );

    if (!isAllowed) {
      return new NextResponse("Host não permitido", { status: 403 });
    }

    const response = await fetch(imageUrl, {
      redirect: "error",
      headers: {
        "User-Agent": "GameVault-App/1.0 (ImageProxy)",
      },
    });

    if (!response.ok) {
      return new NextResponse("Falha ao buscar imagem externa", {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return new NextResponse("Resposta remota não é uma imagem", { status: 415 });
    }
    const contentLength = Number(response.headers.get("content-length") || "0");
    if (contentLength > MAX_IMAGE_SIZE_BYTES) {
      return new NextResponse("Imagem excede o tamanho máximo permitido", { status: 413 });
    }
    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_IMAGE_SIZE_BYTES) {
      return new NextResponse("Imagem excede o tamanho máximo permitido", { status: 413 });
    }

    return new NextResponse(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    });
  } catch (error) {
    console.error("[image-proxy] Erro ao carregar imagem:", error);
    return new NextResponse("Erro interno no proxy de imagem", { status: 500 });
  }
}
