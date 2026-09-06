// ShuleCore Service Worker
// Version tag - badilisha hii namba kila ukibadilisha faili muhimu (index.html, icons, n.k.)
// ili simu za watumiaji zipakue toleo jipya badala ya kubaki na cache ya zamani.
const CACHE_VERSION = "shulecore-v3";

const APP_SHELL = [
  "./index.html",
  "./manifest.json",
  "./icon-192-v3.png",
  "./icon-512-v3.png"
];

// INSTALL: hifadhi faili muhimu za app (app shell) kwenye cache
self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// ACTIVATE: futa cache za toleo la zamani (mfano shulecore-v2, shulepoa-v1, n.k.)
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(function (key) {
            return key !== CACHE_VERSION;
          })
          .map(function (key) {
            return caches.delete(key);
          })
      );
    })
  );
  self.clients.claim();
});

// FETCH: jaribu mtandao kwanza (ili data mpya - wanafunzi, malipo, n.k. - iwe sahihi),
// ukikosa mtandao, tumia cache (offline fallback) kwa app shell tu.
self.addEventListener("fetch", function (event) {
  // Firebase/API requests zisiguswe na cache - ziende mtandaoni moja kwa moja
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Hifadhi nakala mpya ya index.html/app shell kwenye cache kila ikipatikana
        const cloned = response.clone();
        caches.open(CACHE_VERSION).then(function (cache) {
          cache.put(event.request, cloned);
        });
        return response;
      })
      .catch(function () {
        // Hakuna mtandao - jaribu kutumia cache
        return caches.match(event.request).then(function (cached) {
          return cached || caches.match("./index.html");
        });
      })
  );
});
