// SeramikBak Showroom Kiosk Service Worker
// Version: 2.0.0
const CACHE_NAME = 'seramikbak-kiosk-v2';
const STATIC_ASSETS = [
  '/kiosk',
  '/',
  '/bayi',
  '/marka',
  '/outlet',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png',
  '/textures/calacatta_gold.jpg',
  '/textures/natural_oak.jpg',
  '/textures/concrete_light_grey.jpg',
  '/textures/vista_bej.jpg',
  '/textures/albatros_antrasit.jpg',
  '/textures/loft_beton.jpg',
  '/textures/teak_ahsap.jpg',
  '/textures/travertino_classico.jpg',
  '/textures/borneo_antrasit.jpg'
];

// Install Event: Pre-cache core Kiosk assets and textures
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW Kiosk] Pre-caching core 3D textures & kiosk pages...');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW Kiosk] Some static assets failed to pre-cache:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Smart Caching Strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests or browser extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // 1. Texture Images & Media (Cache-First / Stale-While-Revalidate)
  if (url.pathname.startsWith('/textures/') || url.hostname.includes('cloudinary.com') || request.destination === 'image') {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cachedResponse = await cache.match(request);
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(() => null);

        return cachedResponse || fetchPromise || new Response('', { status: 404, statusText: 'Offline texture unavailable' });
      })
    );
    return;
  }

  // 2. API Routes (Network-First with Cache Fallback for offline catalog)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          console.warn('[SW Kiosk] Network offline. Serving cached API response for:', url.pathname);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({ offline: true, warning: 'Çevrimdışı mod: İnternet bağlantısı kesildi.' }),
            { headers: { 'Content-Type': 'application/json' } }
          );
        })
    );
    return;
  }

  // 3. HTML Pages (Network-First, fallback to Cache / /kiosk)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Fallback to offline kiosk page if navigating
        return caches.match('/kiosk');
      })
  );
});
