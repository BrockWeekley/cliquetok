/**
 * Basic Service Worker implementation.
 * Just caches index.html
 */
// When the SW is installed, it will populate the Browser's cache with some files.
// To check this, use the Developer Console / Application / cache.
this.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('v2').then(function(cache) {
      return cache.addAll([
        '/index.html',
        '/',
        '/manifest.json',
        '/index.html?pwa=true',
        'img/favicon.ico',
        'img/icon.png',
        'img/icons/manifest-icon-192.maskable.png',
        'img/icons/manifest-icon-512.maskable.png'
      ]);
    })
  );
});

// SW intercepts "fetch" events, and as a Proxy can intercept a network request.
// thus we can use the cache to return cached stuff instead of making the request.
this.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .catch(function() {
        // if CACHE MISSES, then let the request pass.
        return fetch(event.request).
        then(function(response) {
          // And cache this new response
          return caches.open('v1').then(function(cache) {
            cache.put(event.request, response.clone());
            return response;
          });
        }).catch(function() {
          // if fetch is in error, we can here provide a default resource file.
        });
      })
  );
});
