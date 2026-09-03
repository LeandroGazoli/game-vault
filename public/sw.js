const CACHE_NAME = "gamevault-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/favicon.svg",
  "/icon.png",
  "/icon-192.png",
  "/icon-512.png",
  "/maskable-icon-512.png",
  "/apple-touch-icon.png",
  "/logo-mgl.png",
  "/logo-mgl-dark.png",
];

// Instalação do Service Worker & Precache de assets essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn("[SW] Falha parcial no precache:", err);
      });
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

// Interceptação de requisições
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Requisições não-GET (POST, mutations, auth) não são cacheadas
  if (request.method !== "GET") {
    return;
  }

  // IMPORTANTE: Só intercepta requisições de mesma origem (same origin).
  // CDNs externos (images.igdb.com, unsplash, googleusercontent, etc.)
  // devem ser geridos nativamente pelo navegador via HTTP Cache (CloudFront),
  // prevenindo o bug do Safari/WebKit iOS em que requisições no-cors opacas
  // falham e retornam status 408/offline.
  if (url.origin !== self.location.origin) {
    return;
  }

  // APIs do Next.js: Network First com fallback de cache
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
        .catch(() =>
          caches.match(request).then(
            (cached) =>
              cached ||
              new Response(JSON.stringify({ error: "offline" }), {
                status: 503,
                headers: { "Content-Type": "application/json" },
              })
          )
        )
    );
    return;
  }

  // Assets estáticos locais (CSS, JS, imagens locais da aplicação)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => new Response("", { status: 404 }));
      })
    );
    return;
  }

  // Navegação de páginas HTML (Next.js): Network First com fallback do cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match("/")))
    );
    return;
  }

  // Padrão: Network com fallback para Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached || new Response("", { status: 404 })))
  );
});

// ==========================================
// PUSH NOTIFICATIONS & CLIQUES EM NOTIFICAÇÃO
// ==========================================

self.addEventListener("push", (event) => {
  let data = {
    title: "MyGameList • Notificação",
    body: "Novo conteúdo e novidades disponíveis no site!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    url: "/",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/icon-192.png",
    badge: data.badge || "/icon-192.png",
    data: { url: data.url || "/" },
    vibrate: [100, 50, 100],
    tag: data.tag || "mgl-notification",
    renotify: true,
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});

