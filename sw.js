/* SignBridge service worker — installable PWA + offline.
   Cache-first with runtime caching so the app works with no network after first load.
   (Not used inside the native app — registration is guarded by !window.Capacitor.) */
const CACHE = 'signbridge-v1';
const CORE = [
  './', './index.html', './manifest.webmanifest',
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
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
