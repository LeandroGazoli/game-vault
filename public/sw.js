// ============================================================
// GAMEVAULT / MYGAMELIST - SERVICE WORKER DE ALTA PERFORMANCE (v4)
// ============================================================

const SW_VERSION = "v4.7.3"; // Atualize este valor a cada deploy para invalidar caches antigos

const CACHE_NAMES = {
  static: `mgl-static-${SW_VERSION}`,
  assets: `mgl-assets-${SW_VERSION}`,
  images: `mgl-images-${SW_VERSION}`,
  pages: `mgl-pages-${SW_VERSION}`,
};

const CACHE_WHITELIST = Object.values(CACHE_NAMES);

// 1. APP SHELL MÍNIMO E ULTRA-LEVE (Menos de 60 KB total)
// Precache dos ativos essenciais para inicialização offline instantânea
const PRECACHE_ASSETS = [
  "/offline.html",
  "/favicon.svg",
  "/icon-192.png",
  "/icon-512.png",
];

// Instalação do Service Worker
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn("[SW] Falha parcial no precache do App Shell:", err);
      });
    }),
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
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (!CACHE_WHITELIST.includes(cacheName)) {
              console.log("[SW] Removendo cache obsoleto:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        return self.clients.claim();
      }),
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

/**
 * `respondWith` EXIGE um Response. `caches.match()` resolve para `undefined` quando não há
 * correspondência, e entregar isso derruba a requisição inteira com
 * "Failed to convert value to 'Response'" — foi o que quebrava navegação por link no site.
 *
 * Cuidado com o atalho `caches.match(req) || fallback`: `caches.match` devolve uma PROMISE,
 * que é sempre truthy, então o `||` nunca dispara. Só o await resolve isso.
 */
async function cacheOuEntao(request, fallback) {
  const cached = await caches.match(request);
  if (cached) return cached;
  return fallback();
}

/** Resposta de último recurso, para nunca rejeitar um FetchEvent. */
function respostaDeFalha(status = 504) {
  return new Response("", {
    status,
    statusText: "Sem rede e sem cache",
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
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

  // 1. Navegação de páginas HTML: Stale-While-Revalidate com entrega instantânea do App Shell (0ms)
  if (request.mode === "navigate") {
    // Rotas administrativas ou com token sensível ignoram o cache e vão direto para a rede
    if (url.pathname.startsWith("/admin") || url.pathname.startsWith("/api")) {
      event.respondWith(fetch(request));
      return;
    }

    event.respondWith(
      (async () => {
        try {
          const pagesCache = await caches.open(CACHE_NAMES.pages);

          // Tenta encontrar a página em cache: busca exata, sem query string (?source=pwa),
          // ou fallback da home ("/") para inicializações instantâneas do PWA
          const cachedResponse =
            (await pagesCache.match(request)) ||
            (await pagesCache.match(request, { ignoreSearch: true })) ||
            (await pagesCache.match("/")) ||
            (await caches.match(request)) ||
            (await caches.match("/"));

          // Dispara busca na rede em segundo plano para revalidar e atualizar o cache
          const networkFetchPromise = fetch(request)
            .then(async (networkResponse) => {
              if (
                networkResponse &&
                networkResponse.status === 200 &&
                networkResponse.type === "basic"
              ) {
                const clone = networkResponse.clone();
                try {
                  await pagesCache.put(request, clone);
                  // Se for a home ou o atalho do PWA (?source=pwa), armazena sob as duas chaves
                  if (url.pathname === "/" || url.search.includes("source=pwa")) {
                    await pagesCache.put("/", clone.clone());
                  }
                  limitCacheEntries(CACHE_NAMES.pages, 25);
                } catch {
                  // Silencia eventuais cotas de armazenamento
                }
              }
              return networkResponse;
            })
            .catch(async () => {
              // Se a rede falhar e não houver cache da página, entrega o fallback offline
              if (!cachedResponse) {
                const offlineFallback = await caches.match("/offline.html");
                return (
                  offlineFallback ||
                  new Response("Offline", {
                    status: 503,
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                  })
                );
              }
              return null;
            });

          // SE JÁ TEMOS A PÁGINA EM CACHE: Entrega IMEDIATAMENTE (0ms!)
          // Isso elimina 100% da tela branca na inicialização do PWA.
          if (cachedResponse) {
            event.waitUntil(networkFetchPromise);
            return cachedResponse;
          }

          // Se for a primeira inicialização absoluta (sem cache prévio), aguarda a rede
          const networkResponse = await networkFetchPromise;
          if (networkResponse) {
            return networkResponse;
          }

          const offlineFallback = await caches.match("/offline.html");
          return offlineFallback || respostaDeFalha(504);
        } catch {
          return respostaDeFalha(504);
        }
      })()
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
              caches
                .open(CACHE_NAMES.assets)
                .then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cacheOuEntao(request, () => respostaDeFalha(408)));
      }),
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

        return fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAMES.images).then((cache) => {
                cache.put(request, clone);
                limitCacheEntries(CACHE_NAMES.images, 50);
              });
            }
            return response;
          })
          .catch(() => respostaDeFalha());
      }),
    );
    return;
  }

  // 4. Rotas de API locais: Network First transparente sem inflar o Cache Storage
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(
        () =>
          new Response(JSON.stringify({ error: "offline" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );
    return;
  }

  // Padrão: Network First com fallback de cache.
  //
  // Aqui caem, entre outras coisas, as requisições RSC do Next (`?_rsc=...`): navegar por
  // um <Link> não tem `mode: "navigate"`, então NÃO passa pelo bloco 1. Era este ramo que
  // devolvia `undefined` e produzia o "Failed to convert value to 'Response'" ao abrir uma
  // página de jogo pelo catálogo.
  event.respondWith(
    fetch(request).catch(() => cacheOuEntao(request, () => respostaDeFalha()))
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
      }),
  );
});
