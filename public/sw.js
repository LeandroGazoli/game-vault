// ============================================================
// GAMEVAULT / MYGAMELIST - SERVICE WORKER DE ALTA PERFORMANCE (v4)
// ============================================================

const SW_VERSION = "v4.14.0"; // Atualize este valor a cada deploy para invalidar caches antigos

const CACHE_NAMES = {
  static: `mgl-static-${SW_VERSION}`,
  assets: `mgl-assets-${SW_VERSION}`,
  images: `mgl-images-${SW_VERSION}`,
  pages: `mgl-pages-${SW_VERSION}`,
};

const CACHE_WHITELIST = Object.values(CACHE_NAMES);

// 1. APP SHELL MÍNIMO E ULTRA-LEVE (Menos de 60 KB total)
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/icon.svg",
];

// Instalação: baixa apenas o estritamente necessário para inicialização offline
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAMES.static)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// Ativação: invalida todos os caches com versões antigas imediatamente
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !CACHE_WHITELIST.includes(key))
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// Helpers para classificar requisições
function isImage(url, request) {
  return (
    request.destination === "image" ||
    /\.(png|jpg|jpeg|webp|svg|gif|avif|ico)(\?.*)?$/i.test(url.pathname) ||
    url.hostname.includes("images.igdb.com") ||
    url.hostname.includes("images.unsplash.com") ||
    url.hostname.includes("steamstatic.com") ||
    url.hostname.includes("googleusercontent.com")
  );
}

function isStaticAsset(url, request) {
  return (
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font" ||
    url.pathname.startsWith("/_next/static/") ||
    /\.(js|css|woff2?|ttf|otf)(\?.*)?$/i.test(url.pathname)
  );
}

function isHTMLNavigation(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" && request.headers.get("accept")?.includes("text/html"))
  );
}

// Interceptador de rede com estratégias especializadas por tipo de recurso
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Apenas intercepta GET de HTTP/HTTPS
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 1. Ignora requisições dinâmicas de API, autenticação e rotas internas do Next
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/data/") ||
    url.hostname.includes("firestore.googleapis.com") ||
    url.hostname.includes("identitytoolkit.googleapis.com") ||
    url.hostname.includes("securetoken.googleapis.com") ||
    url.hostname.includes("firebasestorage.googleapis.com")
  ) {
    return;
  }

  // 2. Assets estáticos versionados (JS, CSS, Fontes): Cache First com fallback de rede
  if (isStaticAsset(url, request)) {
    event.respondWith(
      caches.open(CACHE_NAMES.assets).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          return new Response("", { status: 408, statusText: "Offline" });
        }
      })
    );
    return;
  }

  // 3. Imagens (Capas de Jogos, Banners, Prints): Stale While Revalidate
  if (isImage(url, request)) {
    event.respondWith(
      caches.open(CACHE_NAMES.images).then(async (cache) => {
        const cached = await cache.match(request);
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && (response.status === 200 || response.type === "opaque")) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // 4. Páginas HTML / Navegação: Network First com Fallback Offline Robusto
  if (isHTMLNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAMES.pages).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          const rootCached = await caches.match("/");
          if (rootCached) return rootCached;

          return new Response(
            `<!DOCTYPE html>
            <html lang="pt-BR">
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <title>Game Vault — Offline</title>
              <style>
                body { margin: 0; background: #0b0d12; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center; padding: 20px; }
                h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
                p { color: #8892b0; font-size: 0.9rem; line-height: 1.5; }
                button { margin-top: 1rem; padding: 10px 20px; background: #10B981; color: #000; border: none; border-radius: 9999px; font-weight: bold; cursor: pointer; }
              </style>
            </head>
            <body>
              <div>
                <h1>Você está offline</h1>
                <p>Verifique sua conexão com a internet para carregar este conteúdo.</p>
                <button onclick="window.location.reload()">Tentar novamente</button>
              </div>
            </body>
            </html>`,
            { headers: { "Content-Type": "text/html; charset=utf-8" } }
          );
        })
    );
    return;
  }
});
