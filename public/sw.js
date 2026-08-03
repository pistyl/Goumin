self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Toujours passer par le réseau en développement et production basique pour éviter net::ERR_FAILED
  event.respondWith(fetch(event.request));
});
