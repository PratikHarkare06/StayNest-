const CACHE_NAME = 'staynest-cache-v5';
const STATIC_ASSETS = [
  '/images/placeholder.jpg',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap'
];

// JS/CSS files — always fetched fresh from network (Network-First)
const JS_CSS_PATTERNS = ['/JS/', '/js/', '/css/'];

// 1. Install — only cache truly static (image/font) assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('StayNest SW v5: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate — delete ALL old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('StayNest SW: Removing old cache', k);
        return caches.delete(k);
      }))
    )
  );
  return self.clients.claim();
});

// 3. Fetch — Network-First for JS/CSS, Cache-First for images/fonts
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;
  const isJSorCSS = JS_CSS_PATTERNS.some(p => url.includes(p));

  if (isJSorCSS) {
    // NETWORK-FIRST: always grab the latest file, update the cache too
    event.respondWith(
      fetch(event.request)
        .then((networkRes) => {
          const clone = networkRes.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return networkRes;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // CACHE-FIRST for images, fonts, etc.
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).catch(() => {
          if (url.includes('/listings')) return caches.match('/listings');
        });
      })
    );
  }
});
