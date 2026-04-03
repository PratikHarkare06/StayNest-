const CACHE_NAME = 'staynest-cache-v3';
const ASSETS_TO_CACHE = [
  '/',
  '/listings',
  '/css/style.css',
  '/css/rating.css',
  '/images/placeholder.jpg',
  '/JS/script.js',
  '/JS/toast.js',
  '/JS/wishlist.js',
  '/JS/lazyLoad.js',
  '/JS/infiniteScroll.js',
  '/JS/clusterMap.js',
  '/JS/booking.js',
  '/JS/map.js',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&display=swap'
];

// 1. Install Event (Prerender/Cache)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('StayNest Service Worker: Caching Core Assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. Activate Event (Cleanup)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('StayNest Service Worker: Removing Old Cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch Event (Cache-First or Network-Fallback)
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      // Fallback to Network
      return fetch(event.request).then((networkResponse) => {
        // We aren't doing dynamic caching here to prevent caching 404s/errors
        return networkResponse;
      }).catch(() => {
        // If entirely offline (no network) and heading to a page we know
        if (event.request.url.includes('/listings')) {
           return caches.match('/listings');
        }
      });
    })
  );
});
