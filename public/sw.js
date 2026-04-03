const CACHE_NAME = 'staynest-cache-v6';
const STATIC_ASSETS = [
  '/images/placeholder.jpg',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap'
];

// 1. Install — cache only truly static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('StayNest SW v6: Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Activate — nuke ALL old caches immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
        console.log('StayNest SW v6: Deleting old cache', k);
        return caches.delete(k);
      }))
    )
  );
  return self.clients.claim();
});

// 3. Fetch — NETWORK-FIRST for everything dynamic, cache-first only for images/fonts
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Skip chrome-extension, data, and non-http requests entirely
  if (!url.startsWith('http')) return;

  const isStaticAsset = (
    url.includes('/images/') ||
    url.includes('fonts.googleapis.com') ||
    url.includes('fonts.gstatic.com') ||
    url.includes('pexels.com') ||
    (url.includes('cdn.jsdelivr.net') && url.endsWith('.css')) ||
    (url.includes('cloudflare.com') && url.endsWith('.css'))
  );

  if (isStaticAsset) {
    // Cache-First for images and fonts
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((res) => {
          // Only cache successful same-origin or specific CDN responses
          if (res && res.status === 200 && res.type !== 'error') {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => {
              try { c.put(event.request, clone); } catch(e) { /* skip */ }
            });
          }
          return res;
        }).catch(() => new Response('', { status: 408 }));
      })
    );
  } else {
    // Network-First for ALL pages, JS, API calls — never serve stale HTML
    event.respondWith(
      fetch(event.request).then((res) => {
        return res;
      }).catch(() => caches.match(event.request))
    );
  }
});
