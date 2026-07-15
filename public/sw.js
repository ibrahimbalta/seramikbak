// Service Worker for SeramikBak PWA installation
self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Simple pass-through fetch handler (required for Chromium install criteria)
  event.respondWith(
    fetch(event.request).catch(function() {
      // Fallback network failure logic if needed, currently direct pass-through
    })
  );
});
