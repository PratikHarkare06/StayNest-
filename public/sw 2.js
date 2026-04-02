const CACHE_NAME = 'staynest-cache-v1';
const urlsToCache = [
  '/listings',
  '/css/style.css',
  '/js/script.js',
  '/images/icons/icon-192.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
