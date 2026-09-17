import type { NextConfig } from "next";
import fs from "node:fs";
import path from "node:path";

/**
 * O SDK cliente do Firebase resolve pela condição "node" no bundle de servidor,
 * e esse build usa @grpc/grpc-js + protobufjs, que chamam `new Function` —
 * proibido no isolate V8 do workerd ("Code generation from strings disallowed").
 * Como componentes client são renderizados no servidor (SSR), esse build entrava
 * no worker e derrubava as páginas com HTTP 500.
 *
 * O build de browser usa WebChannel/fetch e funciona no workerd, então forçamos
 * a resolução para ele. O `exports` do pacote bloqueia deep imports, por isso o
 * alias precisa ser um caminho absoluto no disco.
 */
const FIREBASE_BROWSER_BUILDS: Record<string, string> = {
  "@firebase/firestore": "node_modules/@firebase/firestore/dist/index.esm2017.js",
  "@firebase/auth": "node_modules/@firebase/auth/dist/esm2017/index.js",
};

function firebaseBrowserAliases(): Record<string, string> {
  const aliases: Record<string, string> = {};
  for (const [pkg, relative] of Object.entries(FIREBASE_BROWSER_BUILDS)) {
    const absolute = path.resolve(process.cwd(), relative);
    if (fs.existsSync(absolute)) {
      aliases[pkg] = absolute;
    } else {
      // Falha ruidosa: um upgrade do firebase que mova o dist reintroduz o 500 em produção.
      throw new Error(
        `[next.config] Build de browser de ${pkg} não encontrado em ${relative}. ` +
          "Atualize FIREBASE_BROWSER_BUILDS após mudar a versão do firebase."
      );
    }
  }
  return aliases;
}

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // `static.cloudflareinsights.com` é o beacon do Cloudflare Web Analytics, injetado na
      // resposta pela própria borda — não tem como declarar em outro lugar. Sem ele aqui o
      // CSP bloqueia e não há métrica nenhuma.
      // `googleads.g.doubleclick.net` e `www.googleadservices.com` servem o script de
      // conversão do Google Ads que o gtag carrega em seguida.
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com https://www.googletagmanager.com https://pagead2.googlesyndication.com https://partner.googleadservices.com https://www.googleadservices.com https://adservice.google.com https://apis.google.com https://www.gstatic.com https://*.firebaseapp.com https://js.stripe.com https://*.adtrafficquality.google https://tpc.googlesyndication.com https://googleads.g.doubleclick.net https://static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: blob: https:",
      "media-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://*.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firestore.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com https://accounts.google.com https://api.stripe.com https://api.igdb.com https://id.twitch.tv https://api.mymemory.translated.net https://howlongtobeat.com https://*.google-analytics.com https://pagead2.googlesyndication.com https://*.adtrafficquality.google https://*.googlesyndication.com https://*.google.com https://*.doubleclick.net https://*.googleadservices.com https://cloudflareinsights.com https://static.cloudflareinsights.com",
      "frame-src 'self' https://*.firebaseapp.com https://*.google.com https://accounts.google.com https://checkout.stripe.com https://billing.stripe.com https://googleads.g.doubleclick.net https://*.doubleclick.net https://*.googlesyndication.com https://*.adtrafficquality.google https://www.youtube.com https://www.youtube-nocookie.com",
      "frame-ancestors 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self' https://accounts.google.com https://*.firebaseapp.com https://checkout.stripe.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: "/__/auth/:path*",
        destination: "https://gamevault-profile.firebaseapp.com/__/auth/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex, nocache",
          },
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
        ],
      },
      {
        source: "/api/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive, nosnippet, noimageindex, nocache",
          },
          {
            key: "Cache-Control",
            value: "no-store, max-age=0",
          },
        ],
      },
    ];
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.rawg.io",
      },
      {
        protocol: "https",
        hostname: "images.igdb.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "howlongtobeat.com",
      },
      {
        protocol: "https",
        hostname: "media.giphy.com",
      },
      {
        protocol: "https",
        hostname: "community.cloudflare.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "avatars.fastly.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "avatars.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "shared.cloudflare.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "cdn.akamai.steamstatic.com",
      },
      {
        protocol: "https",
        hostname: "media.steampowered.com",
      },
      {
        protocol: "https",
        hostname: "steamcommunity-a.akamaihd.net",
      },
    ],
  },
  // firebase-admin usa dependências nativas (gRPC) — nunca deve ser empacotado no bundle.
  serverExternalPackages: ["firebase-admin", "jose"],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve = config.resolve || {};
      config.resolve.alias = {
        ...(config.resolve.alias || {}),
        ...firebaseBrowserAliases(),
      };
    }
    return config;
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "canvas-confetti"],
  },
};

export default nextConfig;
