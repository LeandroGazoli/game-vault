"use client";

import { ADSENSE_PUB_ID } from "@/lib/adConfig";

/**
 * Tag oficial do AdSense.
 *
 * Usa `<script>` puro em vez de `next/script`: o componente do Next marca a tag com
 * `data-nscript`, e o AdSense reclama disso no console ("AdSense head tag doesn't support
 * data-nscript attribute"). O React 19 já promove `<script async src>` para o <head>
 * sozinho, então não se perde nada trocando.
 */
export default function GoogleAdScript() {
  if (!ADSENSE_PUB_ID || ADSENSE_PUB_ID === "ca-pub-0000000000000000") {
    return null;
  }

  return (
    <script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
      crossOrigin="anonymous"
    />
  );
}
