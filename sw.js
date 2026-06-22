// Athlyt — service worker (offline-first)
const CACHE = 'athlyt-v2';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icon.svg',
  './vendor/react.production.min.js',
  './vendor/react-dom.production.min.js',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS).catch(() => {})).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  // Navigation : réseau d'abord, fallback cache (l'app reste dispo hors-ligne)
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put('./index.html', copy)).catch(() => {});
        return res;
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Librairies vendor (figées) : cache d'abord
  if (sameOrigin && url.pathname.includes('/vendor/')) {
    e.respondWith(caches.match(req).then((c) => c || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((cc) => cc.put(req, copy)).catch(() => {});
      return res;
    })));
    return;
  }

  // Code de l'app (même origine) : réseau d'abord, fallback cache (sinon les MAJ ne passent jamais)
  if (sameOrigin && /\.(js|css|html|webmanifest|svg)(\?.*)?$/i.test(url.pathname)) {
    e.respondWith(
      fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Reste : cache d'abord, sinon réseau
  e.respondWith(caches.match(req).then((c) => c || fetch(req)));
});
