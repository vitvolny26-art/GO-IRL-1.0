/* global self, caches, fetch */

const offlineCache = "go-irl-offline-v1";
const offlineUrl = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(offlineCache).then((cache) => cache.add(offlineUrl)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("go-irl-offline-") && key !== offlineCache).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(fetch(event.request).catch(() => caches.match(offlineUrl)));
});
