const CACHE_NAME = "gamevault-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/calendar",
  "/rankings",
  "/profile",
  "/search",
  "/manifest.webmanifest",
  "/favicon.svg",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/maskable-icon-512.png",
  "/apple-touch-icon.png",
  "/logo.jpg"
];

// Instalação do Service Worker & Precache de assets essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativação e limpeza de caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptação de requisições com estratégias inteligentes
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Requisições não-GET (POST, mutations, auth) não são cacheadas
  if (request.method !== "GET") {
    return;
  }

  // APIs do Next.js e IGDB: Network First com fallback de cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Imagens do IGDB ou estáticos: Stale While Revalidate
  if (
    url.hostname.includes("images.igdb.com") ||
    url.hostname.includes("unsplash.com") ||
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached);

        return cached || networkFetch;
      })
    );
    return;
  }

  // Navegação de páginas HTML: Network First com fallback do cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Padrão: Cache First
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});
