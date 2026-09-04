// ============================================================
// GAMEVAULT / MYGAMELIST - SERVICE WORKER DE ALTA PERFORMANCE (v4)
// ============================================================

const SW_VERSION = "v4";

const CACHE_NAMES = {
  static: `mgl-static-${SW_VERSION}`,
  assets: `mgl-assets-${SW_VERSION}`,
  images: `mgl-images-${SW_VERSION}`,
};

const CACHE_WHITELIST = Object.values(CACHE_NAMES);

// 1. APP SHELL MÍNIMO E ULTRA-LEVE (Menos de 45 KB total)
// Evita baixar imagens pesadas (>500KB) e a rota raiz dinâmica durante o install
const PRECACHE_ASSETS = [
  "/offline.html",
  "/favicon.svg",
  "/icon-192.png",
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Falha parcial no precache do App Shell:", err);
      });
    })
  );
  // NOTA DE PERFORMANCE: NÃO chamamos self.skipWaiting() aqui!
  // Evita interrupção da execução JS da página atual e saturação de I/O em disco.
  // A nova versão aguardará até o usuário confirmar pelo toast ou fechar a aba.
});

// Mensageria: ativação controlada via botão do usuário ("Atualizar Agora")
self.addEventListener("message", (event) => {
  if (
    event.data === "SKIP_WAITING" ||
    (event.data && event.data.type === "SKIP_WAITING")
  ) {
    self.skipWaiting();
  }
});

// Ativação e limpeza atômica de caches obsoletos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!CACHE_WHITELIST.includes(cacheName)) {
            console.log("[SW] Removendo cache obsoleto:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Utilitário de controle de tamanho máximo do cache (LRU)
// Garante que o armazenamento do Cache Storage fique sempre <50 MB
async function limitCacheEntries(cacheName, maxItems = 50) {
  try {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
      await cache.delete(keys[0]);
      await limitCacheEntries(cacheName, maxItems);
    }
  } catch {
    // Silencia erros de concorrência com o cache
  }
}

// Interceptação inteligente de requisições
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Apenas requisições GET são cacheadas
  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  // CDNs externos (IGDB, Unsplash, Google Fonts, AdSense, Analytics)
  // são geridos nativamente pelo navegador via HTTP Cache (CloudFront),
  // prevenindo respostas opacas no-cors e inchaço do Cache Storage.
  if (url.origin !== self.location.origin) {
    return;
  }

  // 1. Navegação de páginas HTML: Network First com timeout de segurança (2500ms) e fallback offline
  if (request.mode === "navigate") {
    const fetchWithTimeout = new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Network timeout"));
      }, 2500);

      fetch(request)
        .then((res) => {
          clearTimeout(timeoutId);
          resolve(res);
        })
        .catch((err) => {
          clearTimeout(timeoutId);
          reject(err);
        });
    });

    event.respondWith(
      fetchWithTimeout.catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        const offlineFallback = await caches.match("/offline.html");
        return offlineFallback || new Response("Offline", {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      })
    );
    return;
  }

  // 2. Chunks estáticos do Next.js (_next/static/): Cache-First resiliente com tratamento de erros
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAMES.assets).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => {
            // Em caso de falha de rede ao baixar chunk, tenta qualquer correspondência em cache
            return caches.match(request) || new Response("", { status: 408 });
          });
      })
    );
    return;
  }

  // 3. Imagens e vetores locais: Cache-First com limite de tamanho LRU (máx 50)
  if (
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".ico")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;

        return fetch(request).then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAMES.images).then((cache) => {
              cache.put(request, clone);
              limitCacheEntries(CACHE_NAMES.images, 50);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // 4. Rotas de API locais: Network First transparente sem inflar o Cache Storage
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() =>
        new Response(JSON.stringify({ error: "offline" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        })
      )
    );
    return;
  }

  // Padrão: Network First com fallback de cache
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
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
    } catch {
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
