/**
 * Utilitários para carregamento de imagens e renderização em Canvas HTML5.
 */

/**
 * Converte URLs externas para o proxy local caso necessário, evitando contaminação CORS (tainted canvas).
 */
export function getCanvasImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("data:") || url.startsWith("blob:")) {
    return url;
  }
  if (typeof window !== "undefined" && url.startsWith(window.location.origin)) {
    return url;
  }
  // Se for externa, passar pelo proxy seguro do app
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

/**
 * Carrega um objeto Image de forma assíncrona com crossOrigin anônimo.
 */
export function loadCanvasImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!url) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Se falhar via proxy ou direto, resolve com null sem estourar exceção
      resolve(null);
    };
    img.src = getCanvasImageUrl(url);
  });
}

/**
 * Desenha uma imagem simulando cover (object-fit: cover) dentro de uma região delimitada.
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number
) {
  const imgRatio = img.naturalWidth / img.naturalHeight;
  const targetRatio = w / h;

  let sx = 0;
  let sy = 0;
  let sWidth = img.naturalWidth;
  let sHeight = img.naturalHeight;

  if (imgRatio > targetRatio) {
    sWidth = img.naturalHeight * targetRatio;
    sx = (img.naturalWidth - sWidth) / 2;
  } else {
    sHeight = img.naturalWidth / targetRatio;
    sy = (img.naturalHeight - sHeight) / 2;
  }

  ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, w, h);
}
