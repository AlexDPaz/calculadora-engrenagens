const CACHE_NAME = 'gear-calc-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styler/styler.css',
  './script/script.js',
  './manifest/manifest.json',
  './styler/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});