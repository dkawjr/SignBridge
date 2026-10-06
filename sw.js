/* SignBridge service worker — installable PWA + offline.
   App shell (navigations/index.html) is NETWORK-FIRST so updates reach installed users,
   falling back to cache offline. Everything else is cache-first with runtime caching.
   (Not used inside the native app — registration is guarded by !window.Capacitor.) */
const CACHE = 'signbridge-v4-inline-videos';
const CORE = [
  './', './index.html', './manifest.webmanifest', './sign-videos.js', './sign-video-player.js', './PRIVACY.md',
  './model/model.json', './model/weights.bin', './model/labels.json',
  './model/meta.json', './model/letter_templates.json', './model/alphabet_svgs.json',
  './icons/icon-192.webp', './icons/icon-512.png', './icons/apple-touch-icon.png'
];
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(CORE.map(u => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Third-party streaming is never stored by this worker. Let the browser handle
  // media range requests, which must not receive a cached HTML fallback.
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || req.headers.has('range')) return;
  const isShell = req.mode === 'navigate' || new URL(req.url).pathname.endsWith('/index.html');
  if (isShell) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
        return res;
      }).catch(() => caches.match(req).then(h => h || caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => Response.error()))
  );
});
