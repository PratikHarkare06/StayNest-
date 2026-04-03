// Self-Destroying Service Worker
// This completely unregisters itself and clears ALL caches to break stale-cache loops.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => {
        console.log('StayNest SW: Deleting cache', key);
        return caches.delete(key);
      })))
      .then(() => {
        console.log('StayNest SW: All caches cleared. Unregistering self...');
        return self.registration.unregister();
      })
      .then(() => self.clients.matchAll())
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  );
});
