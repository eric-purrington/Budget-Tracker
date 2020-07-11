const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/db.js",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

var CACHE = "static-cache-v2";
const DATA_CACHE = "data-cache-v1";

self.addEventListener("install", event => {
    event.waitUntil(
      caches.open(CACHE).then(cache => cache.addAll(FILES_TO_CACHE))
        .then(self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    const currentCaches = [CACHE, DATA_CACHE];
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
      }).then(cachesToDelete => {
        return Promise.all(cachesToDelete.map(cacheToDelete => {
          return caches.delete(cacheToDelete);
        }));
      }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.url.includes("/api")) {
        event.respondWith(
            caches.open(DATA_CACHE).then(cache => {
                return fetch(event.request).then(response => {
                    if (response.status == 200) {
                        cache.put(event.request.url, response.clone());
                    }
                    return response;
                }).catch(err => {
                    return cache.match(event.request);
                });
            }).catch(err => console.log(err))
        )
        return;
    }
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});