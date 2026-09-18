/* Service worker: rede primeiro, com cache de reserva para funcionar offline. */
const CACHE = 'cellshop-v1';
const BASE = ['./', 'index.html', 'style.css', 'products.js', 'script.js', 'version.js', 'logo-cell-shop.png', 'manifest.webmanifest'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(BASE); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    fetch(req).then(function (res) {
      const copia = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copia); });
      return res;
    }).catch(function () { return caches.match(req); })
  );
});
