"use client";

import Script from "next/script";
import { ADSENSE_PUB_ID } from "@/lib/adConfig";

export default function GoogleAdScript() {
  if (!ADSENSE_PUB_ID || ADSENSE_PUB_ID === "ca-pub-0000000000000000") {
    return null;
  }

  return (
    <Script
      id="google-adsense-script"
      async
      strategy="afterInteractive"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUB_ID}`}
      crossOrigin="anonymous"
    />
  );
}
