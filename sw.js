/* Lista de Reposición — Service Worker
   Estrategia: "red primero, con caché de respaldo".
   - Con internet: siempre baja la versión más nueva de los archivos (no queda nada viejo).
   - Sin internet (o conexión lenta, > 2,5 s): usa la copia guardada.
   El SW nunca toca LocalStorage, así que actualizar NO borra las cantidades. */

const VERSION = '1.0.0';
const CACHE = 'reposicion-' + VERSION;
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './catalog.js',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('reposicion-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fromCache(req) {
  return caches.match(req, { ignoreSearch: true }).then((r) => {
    if (r) return r;
    return req.mode === 'navigate' ? caches.match('./index.html') : undefined;
  });
}

function networkFirst(req) {
  return new Promise((resolve) => {
    let done = false;
    const finish = (res) => { if (!done && res) { done = true; resolve(res); } };

    const timer = setTimeout(() => { fromCache(req).then(finish); }, 2500);

    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        clearTimeout(timer);
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        finish(res);
      })
      .catch(() => {
        clearTimeout(timer);
        fromCache(req).then((r) => {
          if (r) finish(r);
          else finish(new Response('Sin conexión', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }));
        });
      });
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(networkFirst(req));
});
